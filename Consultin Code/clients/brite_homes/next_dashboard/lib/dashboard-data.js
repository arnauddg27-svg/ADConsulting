/**
 * Brite Homes - Dashboard Data Layer (BigQuery)
 *
 * The dashboard reads simple raw rosters plus pre-computed marts. Heavy joins,
 * reconciliation, PM snapshots, and exception logic live in BigQuery views so
 * the UI stays fast and every KPI reconciles to the warehouse.
 */

import { createBigQueryClient, dashboardConfig, fullyQualifiedTable, rawTable } from "./bigquery.js";

const ACTIVE_CONSTRUCTION_TYPES = ["SFR Construction In Progress", "Awaiting CO", "On Hold", "POs Released"];
const CO_SCOPE_TYPE = "SFR Completed (not closed)";
const CONSTRUCTION_SCOPE_TYPES = [...ACTIVE_CONSTRUCTION_TYPES, CO_SCOPE_TYPE];
const CLOSED_JOB_TYPE = "SFR Completed & Closed";
const STALE_SOURCE_HOURS = 36;

function normalizeKey(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

const ACTIVE_CONSTRUCTION_TYPE_KEYS = new Set(ACTIVE_CONSTRUCTION_TYPES.map(normalizeKey));
const CONSTRUCTION_SCOPE_TYPE_KEYS = new Set(CONSTRUCTION_SCOPE_TYPES.map(normalizeKey));

function normalizedSqlExpression(field) {
  return `LOWER(REGEXP_REPLACE(TRIM(COALESCE(CAST(${field} AS STRING), '')), r'\\s+', ' '))`;
}

function sqlInNormalized(field, values) {
  return `${normalizedSqlExpression(field)} IN (${values.map((value) => sqlString(normalizeKey(value))).join(", ")})`;
}

function currentInventorySql(alias = "") {
  const prefix = alias ? `${alias}.` : "";
  return `(
    ${prefix}closed_date IS NULL
    AND ${prefix}closing_date IS NULL
    AND ${normalizedSqlExpression(`${prefix}job_type`)} != ${sqlString(normalizeKey(CLOSED_JOB_TYPE))}
    AND NOT REGEXP_CONTAINS(${normalizedSqlExpression(`${prefix}job_status`)}, r'\\bclosed\\b')
    AND NOT REGEXP_CONTAINS(${normalizedSqlExpression(`${prefix}current_stage`)}, r'\\bclosed\\b')
    AND NOT REGEXP_CONTAINS(${normalizedSqlExpression(`${prefix}address`)}, r'\\bclosed\\b')
  )`;
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlIn(field, values) {
  return `${field} IN (${values.map(sqlString).join(", ")})`;
}

function safeDashboardConfig() {
  try {
    return dashboardConfig();
  } catch (error) {
    return {
      clientName: "Brite Homes",
      projectId: null,
      dataset: null,
      rawDataset: null,
      configError: error.message,
    };
  }
}

function normalizeRow(row) {
  return JSON.parse(JSON.stringify(row));
}

async function queryRows(client, query) {
  const [rows] = await client.query({ query });
  return rows.map(normalizeRow);
}

async function queryFirstRow(client, query) {
  const rows = await queryRows(client, query);
  return rows[0] ?? {};
}

function optionalRows(client, label, query) {
  return queryRows(client, query).catch((error) => {
    console.error(`[dashboard-data] ${label}:`, error.message);
    return [];
  });
}

function optionalFirstRow(client, label, query) {
  return queryFirstRow(client, query).catch((error) => {
    console.error(`[dashboard-data] ${label}:`, error.message);
    return {};
  });
}

function safeNumber(v) {
  if (v == null || Number.isNaN(Number(v))) return 0;
  return Number(v);
}

function nullableNumber(v) {
  if (v == null || v === "" || Number.isNaN(Number(v))) return null;
  return Number(v);
}

function cleanFilterValue(value) {
  if (value === null || value === undefined) return null;
  const clean = String(value).trim();
  return clean || null;
}

function cleanFilterValues(values = []) {
  const keyed = new Map();
  for (const value of values) {
    const clean = cleanFilterValue(value);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!keyed.has(key)) keyed.set(key, clean);
  }
  return Array.from(keyed.values()).sort((a, b) => a.localeCompare(b));
}

function normalizeTemporalValue(v) {
  if (v == null) return null;
  if (typeof v === "object" && "value" in v) return normalizeTemporalValue(v.value);
  const text = String(v).trim();
  const maybeSerial = /^[0-9]+(\.[0-9]+)?$/.test(text) ? Number(text) : null;
  if (maybeSerial && maybeSerial > 20_000 && maybeSerial < 60_000) {
    const date = new Date(Date.UTC(1899, 11, 30) + maybeSerial * 86_400_000);
    return date.toISOString().slice(0, 10);
  }
  return v;
}

function latestTemporalValue(values = []) {
  const parsed = values
    .map(normalizeTemporalValue)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (!parsed.length) return null;
  return new Date(Math.max(...parsed.map((date) => date.getTime()))).toISOString();
}

function sourceAgeHours(value) {
  const normalized = normalizeTemporalValue(value);
  if (!normalized) return null;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, (Date.now() - date.getTime()) / 3_600_000);
}

function formatAge(ageHours) {
  if (ageHours === null || ageHours === undefined) return null;
  if (ageHours < 48) return `${Math.round(ageHours)} hours old`;
  return `${Math.round(ageHours / 24)} days old`;
}

function normalizeTemporalFields(row, fields) {
  const out = { ...row };
  for (const field of fields) out[field] = normalizeTemporalValue(row[field]);
  return out;
}

function toneFromCoverage(c) {
  if (c >= 0.85) return "good";
  if (c >= 0.35) return "watch";
  return "alert";
}

function groupBy(rows, keyFn, seedFn, applyFn) {
  const grouped = new Map();
  for (const row of rows) {
    const key = keyFn(row) || "(blank)";
    if (!grouped.has(key)) grouped.set(key, seedFn(key));
    applyFn(grouped.get(key), row);
  }
  return Array.from(grouped.values());
}

function buildUnavailableDashboard(message) {
  const config = safeDashboardConfig();
  return {
    sourceMode: "unavailable",
    dataFreshness: {
      displayMode: "unavailable",
      sourceLabel: "BigQuery Unavailable",
      martRefreshAt: null,
      pmSnapshotRefreshAt: null,
      warehouseRefreshAt: null,
      generatedAt: new Date().toISOString(),
    },
    errorMessage: message,
    config,
    summaries: {
      portfolio: { totalJobs: 0, activeConstruction: 0, coedNotClosed: 0, avgCompletion: 0, totalWip: 0 },
      financial: { totalLotCost: 0, totalBudget: 0, totalActual: 0 },
      sales: { totalContracts: 0, totalSalesValue: 0 },
      loans: { totalLoanAmount: 0, totalDrawn: 0, jobsWithLoans: 0 },
      propertyManagement: { totalUnits: 0, occupiedUnits: 0, vacantUnits: 0, occupancyRate: 0 },
      exceptions: { total: 0, p1: 0, p2: 0, affectedJobs: 0 },
      warehouse: { objects: 0, rows: 0, missingKeys: 0 },
      inventory: { totalJobs: 0 },
    },
    jobInventoryRows: [],
    fullInventoryRows: [],
    constructionRows: [],
    milestonesRoster: [],
    salesRoster: [],
    salesRosterAvailable: false,
    salesFull: [],
    listingAgentRows: [],
    loanRoster: [],
    jobFinancials: [],
    profitTracking: [],
    auditRoster: [],
    pmMaster: [],
    pmDelinquency: [],
    pmStatusBreakdown: [],
    pmProjectSummary: [],
    exceptionRows: [],
    exceptionDetailRows: [],
    exceptionSummary: [],
    projectExceptionSummary: [],
    crossDomainSummary: [],
    lifecycleSummary: [],
    warehouseObjects: [],
    warehouseQuality: [],
    filterOptions: { cities: [], communities: [], jobTypes: [], areaNames: [] },
    areaNameMap: {},
    qualityChecks: [],
    auditNotes: [message],
  };
}

function isClosedInventoryRow(row) {
  return Boolean(row?.closed_date || row?.closing_date) ||
    normalizeKey(row?.job_type) === normalizeKey(CLOSED_JOB_TYPE) ||
    normalizeKey(row?.job_status).includes("closed") ||
    normalizeKey(row?.current_stage).includes("closed") ||
    normalizeKey(row?.address).includes("closed");
}

function isCurrentInventoryRow(row) {
  return !isClosedInventoryRow(row);
}

function isConstructionScopeRow(row) {
  return isCurrentInventoryRow(row) && CONSTRUCTION_SCOPE_TYPE_KEYS.has(normalizeKey(row?.job_type));
}

function buildConstructionPortfolioSummary(rows = [], base = {}) {
  const activeRows = rows.filter((row) => ACTIVE_CONSTRUCTION_TYPE_KEYS.has(normalizeKey(row?.job_type)));
  const coRows = rows.filter((row) => normalizeKey(row?.job_type) === normalizeKey(CO_SCOPE_TYPE));
  const completionValues = rows.map((row) => nullableNumber(row.completion_pct)).filter((value) => value !== null);
  return {
    totalJobs: rows.length || safeNumber(base.construction_scope_jobs),
    activeConstruction: activeRows.length || safeNumber(base.active_construction),
    coedNotClosed: coRows.length || safeNumber(base.coed_not_closed),
    avgCompletion: completionValues.length ? completionValues.reduce((sum, value) => sum + value, 0) / completionValues.length : 0,
    totalWip: rows.reduce((sum, row) => sum + safeNumber(row.wip), 0),
  };
}

function buildFinancialSummary(rows = []) {
  return {
    totalLotCost: rows.reduce((sum, row) => sum + safeNumber(row.lot_cost), 0),
    totalBudget: rows.reduce((sum, row) => sum + safeNumber(row.original_budget), 0),
    totalActual: rows.reduce((sum, row) => sum + safeNumber(row.job_cost_amount), 0),
  };
}

function normalizeAuditRow(row) {
  const lotLand = safeNumber(row.lot_land);
  const permitting = safeNumber(row.permitting);
  const siteWork = safeNumber(row.cost_site_work);
  const vertical = safeNumber(row.cost_vertical);
  const options = safeNumber(row.cost_options);
  const closingCost = safeNumber(row.closing_cost);
  const financing = safeNumber(row.financing);
  const insurance = safeNumber(row.insurance);
  const warranty = safeNumber(row.warranty);
  const builderFee = safeNumber(row.builder_fee);
  const dirtTotal = safeNumber(row.dirt_total);
  const dumpsters = safeNumber(row.dumpsters);
  const envTotal = safeNumber(row.env_total);
  const utilitiesTotal = safeNumber(row.utilities_total);
  const monthlyInterest = safeNumber(row.monthly_interest);
  const salePrice = safeNumber(row.sale_price);
  const totalAp = safeNumber(row.total_ap);
  const auditDate = normalizeTemporalValue(row.audit_date || row._mart_refreshed_at);

  const constructionCosts = lotLand + permitting + siteWork + vertical + options +
    dirtTotal + dumpsters + envTotal + utilitiesTotal;
  const overhead = builderFee + insurance + closingCost + warranty;
  const otherExpenses = financing + monthlyInterest;
  const totalCost = constructionCosts + overhead + otherExpenses;
  const totalDirectCost = constructionCosts;
  const totalIndirectCost = overhead + otherExpenses;
  const netRevenue = salePrice > 0 ? salePrice : null;
  const grossMargin = salePrice > 0 ? salePrice - constructionCosts - overhead : null;
  const netProfit = salePrice > 0 && totalCost > 0 ? salePrice - totalCost : null;
  const netMargin = salePrice > 0 && netProfit !== null ? netProfit / salePrice : null;
  const hasJobKey = Boolean(row.job_id);
  const hasRevenue = salePrice > 0;
  const hasCost = totalCost > 0;
  const dataQualityFlag = !hasJobKey
    ? "missing job key"
    : !hasRevenue && !hasCost
      ? "missing revenue and cost"
      : !hasRevenue
        ? "missing revenue"
        : !hasCost
          ? "missing cost"
          : "ready";
  const plReadiness = dataQualityFlag === "ready" ? "ready" : hasJobKey && (hasRevenue || hasCost) ? "partial" : "blocked";
  const marginStatus = !hasRevenue
    ? "missing revenue"
    : !hasCost
      ? "missing cost"
      : netProfit < 0
        ? "loss"
        : netMargin < 0.08
          ? "at-risk"
          : netMargin < 0.12
            ? "watch"
            : "good";

  // Mart-first: the warehouse now owns the canonical P&L formula (see
  // scripts/create-marts.js → mart_audit_pl). For columns the mart provides,
  // prefer its value; fall back to JS-computed values only when the mart is
  // silent. This is what makes pl_source='sheet' rows (no audit_* line items
  // but populated summary P&L) render correctly.
  const prefer = (martValue, computed) => martValue == null ? computed : martValue;

  return {
    ...row,
    job_id: row.job_id,
    audit_date: auditDate,
    completion_pct: nullableNumber(row.completion_pct),
    sale_price: prefer(row.sale_price, salePrice),
    seller_credit: prefer(row.seller_credit, safeNumber(row.seller_credit)),
    net_revenue: prefer(row.net_revenue, netRevenue),
    lot_land: lotLand,
    permitting,
    site_work: siteWork,
    vertical,
    options,
    closing_cost: closingCost,
    financing,
    insurance,
    warranty,
    builder_fee: builderFee,
    dirt_total: dirtTotal,
    import_fill_dirt: safeNumber(row.import_fill_dirt),
    pad_build: safeNumber(row.pad_build),
    dumpsters,
    env_total: envTotal,
    gopher_tortoise_survey: safeNumber(row.gopher_tortoise_survey),
    tree_survey: safeNumber(row.tree_survey),
    utilities_total: utilitiesTotal,
    individual_well: safeNumber(row.individual_well),
    septic_system: safeNumber(row.septic_system),
    water_filtration_system: safeNumber(row.water_filtration_system),
    monthly_interest: monthlyInterest,
    total_ap: totalAp,
    actual_vertical: safeNumber(row.actual_vertical),
    actual_site_work: safeNumber(row.actual_site_work),
    // Cost rollups: mart wins (summary-sourced) → JS computed (line-item sum) → 0
    construction_costs: prefer(row.construction_costs, constructionCosts),
    total_direct_cost: prefer(row.total_direct_cost, totalDirectCost),
    overhead: prefer(row.overhead, overhead),
    total_indirect_cost: prefer(row.total_indirect_cost, totalIndirectCost),
    gross_margin: prefer(row.gross_margin, grossMargin),
    other_expenses: prefer(row.other_expenses, otherExpenses),
    total_cost: prefer(row.total_cost, totalCost),
    net_profit: prefer(row.net_profit, netProfit),
    net_margin: prefer(row.net_margin, netMargin),
    margin_status: prefer(row.margin_status, marginStatus),
    data_quality_flag: prefer(row.data_quality_flag, dataQualityFlag),
    pl_readiness: prefer(row.pl_readiness, plReadiness),
    budget_basis: null,
    budget_variance: null,
    est_margin: prefer(row.net_profit, netProfit),
    est_margin_pct: prefer(row.net_margin, netMargin),
  };
}

function buildPmStatusBreakdown(pmMaster) {
  const rows = groupBy(
    pmMaster,
    (r) => r.lease_status,
    (status) => ({ status, property_count: 0, portfolio_percent: 0 }),
    (bucket) => { bucket.property_count += 1; },
  );
  const total = pmMaster.length || 1;
  return rows
    .map((r) => ({ ...r, portfolio_percent: r.property_count / total }))
    .sort((a, b) => b.property_count - a.property_count);
}

function buildPmProjectSummary(pmMaster) {
  return groupBy(
    pmMaster,
    (r) => r.project_name || r.community,
    (project_name) => ({
      project_name,
      properties: 0,
      occupied_units: 0,
      vacant_units: 0,
      occupancy_rate: 0,
      market_rent: 0,
      actual_rent: 0,
      vacancy_loss: 0,
      total_receivable: 0,
      needs_review: 0,
    }),
    (bucket, row) => {
      bucket.properties += 1;
      bucket.occupied_units += row.occupied ? 1 : 0;
      bucket.vacant_units += row.is_vacant ? 1 : 0;
      bucket.market_rent += safeNumber(row.market_rent);
      bucket.actual_rent += safeNumber(row.actual_rent);
      bucket.total_receivable += safeNumber(row.amount_receivable);
      bucket.needs_review += row.needs_management_review ? 1 : 0;
    },
  )
    .map((row) => ({
      ...row,
      occupancy_rate: row.properties > 0 ? row.occupied_units / row.properties : 0,
      vacancy_loss: row.market_rent - row.actual_rent,
    }))
    .sort((a, b) => b.properties - a.properties);
}

function buildPmPortfolioSummary(pmMaster, base = {}) {
  if (safeNumber(base.total_units) > 0 || safeNumber(base.totalUnits) > 0) {
    return {
      properties: safeNumber(base.properties),
      totalUnits: safeNumber(base.total_units ?? base.totalUnits),
      occupiedUnits: safeNumber(base.occupied_units ?? base.occupiedUnits),
      vacantUnits: safeNumber(base.vacant_units ?? base.vacantUnits),
      occupancyRate: safeNumber(base.occupancy_rate ?? base.occupancyRate),
      marketRent: safeNumber(base.market_rent ?? base.marketRent),
      actualRent: safeNumber(base.actual_rent ?? base.actualRent),
      vacancyLoss: safeNumber(base.vacancy_loss ?? base.vacancyLoss),
      collectionRate: safeNumber(base.collection_rate ?? base.collectionRate),
      managementRevenue: safeNumber(base.property_management_revenue ?? base.managementRevenue),
      pastDue: safeNumber(base.past_due ?? base.pastDue),
      totalReceivable: safeNumber(base.total_receivable ?? base.totalReceivable),
      receivable0To30: safeNumber(base.receivable_0_30 ?? base.receivable0To30),
      receivable30Plus: safeNumber(base.receivable_30_plus ?? base.receivable30Plus),
      delinquentTenants: safeNumber(base.delinquent_tenants ?? base.delinquentTenants),
      avgReceivablePerDelinquentTenant: safeNumber(base.avg_receivable_per_delinquent_tenant ?? base.avgReceivablePerDelinquentTenant),
      totalDeposits: safeNumber(base.total_deposits ?? base.totalDeposits),
      snapshotAt: normalizeTemporalValue(base.snapshot_at ?? base._snapshot_at ?? base.snapshotAt),
    };
  }

  const totalUnits = pmMaster.length;
  const occupiedUnits = pmMaster.filter((row) => row.occupied || row.is_occupied).length;
  const vacantUnits = pmMaster.filter((row) => row.is_vacant).length || Math.max(totalUnits - occupiedUnits, 0);
  const marketRent = pmMaster.reduce((sum, row) => sum + safeNumber(row.market_rent), 0);
  const actualRent = pmMaster.reduce((sum, row) => sum + safeNumber(row.actual_rent || row.monthly_rent), 0);
  const totalReceivable = pmMaster.reduce((sum, row) => sum + safeNumber(row.amount_receivable), 0);
  const receivable0To30 = pmMaster.reduce((sum, row) => sum + safeNumber(row.receivable_0_30), 0);
  const receivable30Plus = pmMaster.reduce((sum, row) => sum + safeNumber(row.receivable_30_plus), 0);
  const pastDue = pmMaster.reduce((sum, row) => sum + safeNumber(row.past_due || row.amount_receivable), 0);
  const delinquentTenants = pmMaster.filter((row) => safeNumber(row.past_due || row.amount_receivable) > 0).length;
  return {
    properties: totalUnits,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate: totalUnits ? occupiedUnits / totalUnits : 0,
    marketRent,
    actualRent,
    vacancyLoss: Math.max(marketRent - actualRent, 0),
    collectionRate: marketRent ? actualRent / marketRent : 0,
    managementRevenue: actualRent * 0.06,
    pastDue,
    totalReceivable,
    receivable0To30,
    receivable30Plus,
    delinquentTenants,
    avgReceivablePerDelinquentTenant: delinquentTenants ? totalReceivable / delinquentTenants : 0,
    totalDeposits: pmMaster.reduce((sum, row) => sum + safeNumber(row.deposit), 0),
    snapshotAt: normalizeTemporalValue(pmMaster[0]?._snapshot_at || pmMaster[0]?.master_snapshot_at),
  };
}

export async function getDashboardData() {
  const config = safeDashboardConfig();
  if (config.configError) {
    return buildUnavailableDashboard(config.configError);
  }

  // Keep the raw source roster bounded for performance, then derive current/open
  // inventory in JavaScript so the dashboard can expose the full source-row
  // context and the exact number of closed rows excluded from current inventory.
  const sourceInventoryFilter = "TRUE";

  try {
    const client = createBigQueryClient();

    const martSummary = fullyQualifiedTable("mart_daily_summary");
    const martFilterQuality = fullyQualifiedTable("mart_filter_quality");
    const martAudit = fullyQualifiedTable("mart_audit_pl");
    const constructionT = rawTable("construction_milestones");
    const scheduleT = rawTable("schedule");
    const salesT = rawTable("sales");
    const salesFullT = rawTable("xlsx_sales_full");
    const listingAgentT = rawTable("listing_agent_inventory");
    const pmSummaryT = fullyQualifiedTable("property_management_portfolio_summary_snapshot");
    const pmUnitT = rawTable("property_management_master_snapshot");
    const pmDelinquencyT = rawTable("property_management_delinquency_snapshot");
    const exceptionQueueT = fullyQualifiedTable("actionable_exception_queue_snapshot");
    const exceptionDetailT = fullyQualifiedTable("fact_exception_conformed_snapshot");
    const exceptionSummaryT = fullyQualifiedTable("actionable_exception_summary_snapshot");
    const projectExceptionT = fullyQualifiedTable("project_exception_summary_snapshot");
    const warehouseObjectsT = fullyQualifiedTable("warehouse_object_health");
    const warehouseQualityT = fullyQualifiedTable("warehouse_data_quality_summary");

    const [
      combinedSummary,
      milestonesRosterResult,
      salesRosterResult,
      filterAndQualityResult,
      auditRosterResult,
      salesFullResult,
      listingAgentResult,
      pmPortfolioSummary,
      pmMasterResult,
      pmDelinquencyResult,
      exceptionRowsResult,
      exceptionDetailRowsResult,
      exceptionSummaryResult,
      projectExceptionSummaryResult,
      lifecycleSummaryResult,
      warehouseObjectsResult,
      warehouseQualityResult,
      warehouseInventoryResult,
    ] = await Promise.all([
      queryFirstRow(client, `SELECT * FROM ${martSummary}`),
      queryRows(client, `
        SELECT
          job_id,
          community,
          plan_name,
          superintendent,
          project_manager,
          company_name,
          division_name,
          construction_type,
          job_type,
          job_status,
          sales_status,
          current_stage,
          current_stage_code,
          completion_pct,
          address,
          city,
          state,
          county,
          elevation,
          lot,
          block,
          section,
          job_start,
          clear_lot_date,
          build_pad_date,
          completion_date,
          closed_date,
          closing_date,
          permit_issued_date,
          released_to_construction_date,
          underground_plumbing_date,
          pour_slab_date,
          block_house_date,
          frame_house_date,
          dry_in_roof_date,
          insulate_house_date,
          drywall_house_date,
          flooring_install_date,
          cabinet_install_date,
          hot_check_date,
          ac_startup_date,
          receive_co_date,
          start_to_completion_days,
          start_to_pad_days,
          block_to_insulation_days,
          insulation_to_flooring_days,
          flooring_to_hot_check_days,
          hot_check_to_completion_days,
          original_budget,
          job_cost_amount,
          variance_in_flight,
          wip,
          wip_without_lot,
          lot_cost,
          equity,
          lender,
          loan_number,
          SAFE_CAST(REGEXP_REPLACE(CAST(loan_amount AS STRING), r'[^0-9.-]', '') AS FLOAT64) AS loan_amount,
          interest_rate,
          total_drawn,
          loan_days_until_expiration
        FROM ${constructionT}
        WHERE ${sourceInventoryFilter}
        ORDER BY community, lot
        LIMIT 1500
      `),
      optionalRows(client, "sales roster", `
        SELECT
          contract_number AS job_id,
          contract_number,
          lot_id,
          lot_id AS lot,
          community,
          plan_name,
          buyer_name,
          sale_price,
          status,
          contract_date AS sold_date,
          projected_close AS scheduled_closing,
          contract_date,
          projected_close,
          _extracted_at
        FROM ${salesT}
        WHERE status IS NOT NULL
        ORDER BY contract_date DESC NULLS LAST
      `),
      queryRows(client, `SELECT * FROM ${martFilterQuality}`),
      optionalRows(client, "audit mart", `SELECT * FROM ${martAudit} ORDER BY community, lot`),
      optionalRows(client, "full sales", `
        SELECT
          job_no,
          company_name,
          division_name,
          area_name,
          project_name AS community,
          plan_name,
          buyer AS buyer_name,
          co_buyer,
          sales_status AS status,
          cancel_date,
          cancel_reason,
          SAFE_CAST(REGEXP_REPLACE(CAST(total AS STRING), r'[^0-9.-]', '') AS FLOAT64) AS sale_price,
          SAFE_CAST(REGEXP_REPLACE(CAST(base AS STRING), r'[^0-9.-]', '') AS FLOAT64) AS base_price,
          SAFE_CAST(REGEXP_REPLACE(CAST(lot_premium AS STRING), r'[^0-9.-]', '') AS FLOAT64) AS lot_premium,
          SAFE_CAST(REGEXP_REPLACE(CAST(change_orders AS STRING), r'[^0-9.-]', '') AS FLOAT64) AS change_orders,
          SAFE_CAST(REGEXP_REPLACE(CAST(total_deposits AS STRING), r'[^0-9.-]', '') AS FLOAT64) AS total_deposits,
          sold_date,
          accepted_date,
          written_date,
          scheduled_close_date AS scheduled_closing,
          projected_close_date,
          close_date,
          city,
          lot,
          address,
          job_type,
          job_status,
          superintendent,
          current_stage_of_construction AS current_stage,
          SAFE_CAST(REGEXP_REPLACE(CAST(net_profit_est AS STRING), r'[^0-9.-]', '') AS FLOAT64) AS net_profit_est,
          SAFE_CAST(REGEXP_REPLACE(CAST(net_margin_est AS STRING), r'[^0-9.-]', '') AS FLOAT64) AS net_margin_est,
          sales_agent,
          realtor,
          realtor_company,
          mortgage_company,
          loan_type,
          title_company,
          sale_source
        FROM ${salesFullT}
        WHERE job_no IS NOT NULL OR sales_status IS NOT NULL
        ORDER BY sold_date DESC
        LIMIT 1200
      `),
      optionalRows(client, "listing agent inventory", `
        SELECT
          source_row_number,
          job_id,
          address_number,
          site_address,
          owner_of_record,
          sale_mls,
          sale_listed_date,
          dom,
          current_price,
          starting_price,
          price_reduction,
          price_reduced_on_date,
          under_contract,
          effective_date,
          sold,
          closing_sold_date,
          sold_price,
          listed_as_rental,
          lease_mls,
          leased,
          leased_date,
          notes,
          tax_id,
          prop_description,
          model_number,
          signor,
          _loaded_at
        FROM ${listingAgentT}
        WHERE job_id IS NOT NULL OR site_address IS NOT NULL
        ORDER BY source_row_number
        LIMIT 2000
      `),
      optionalFirstRow(client, "PM portfolio summary", `SELECT * FROM ${pmSummaryT}`),
      optionalRows(client, "PM unit snapshot", `
        SELECT
          COALESCE(property_key, job_no) AS unit_id,
          COALESCE(NULLIF(property_address, ''), NULLIF(job_no, ''), NULLIF(property_key, '')) AS unit_label,
          REGEXP_REPLACE(COALESCE(property_address, property_key, job_no), r'\\|[0-9.]+$', '') AS property_label,
          property_key AS unit_key,
          job_no,
          project_name AS community,
          project_name,
          area_name,
          job_type,
          property_address AS address,
          property_address,
          city,
          state,
          zip,
          owner,
          bed_bath,
          sqft,
          status AS lease_status,
          status AS occupancy_status,
          is_occupied AS occupied,
          is_occupied,
          is_vacant,
          tenant AS tenant_name,
          tenant,
          lease_from,
          lease_to,
          move_in,
          move_out,
          market_rent,
          actual_rent,
          COALESCE(actual_rent, market_rent) AS monthly_rent,
          past_due,
          amount_receivable,
          receivable_0_30,
          receivable_30_plus,
          deposit,
          management_fee_percent,
          rent_to_market_ratio,
          amount_receivable AS delinquency_amount_receivable,
          receivable_0_30 AS delinquency_0_30,
          receivable_30_plus AS delinquency_30_plus,
          late_count AS delinquency_records,
          last_payment,
          payment_amount AS total_recent_payment_amount,
          late_count,
          CAST(NULL AS INT64) AS nsf_count,
          furthest_milestone AS construction_lifecycle_status,
          CAST(NULL AS FLOAT64) AS construction_completion_percentage,
          CAST(NULL AS STRING) AS construction_completion_bucket,
          furthest_milestone AS construction_current_stage,
          completion_date AS best_close_date,
          completion_date AS best_forecast_close_date,
          CAST(NULL AS INT64) AS actual_start_to_completion_days,
          CAST(NULL AS FLOAT64) AS estimated_gross_margin_ratio,
          FALSE AS construction_needs_data_review,
          job_no IS NULL AS missing_construction_match,
          market_rent IS NULL AS missing_market_rent,
          is_occupied AND actual_rent IS NULL AS missing_actual_rent_for_occupied_unit,
          COALESCE(amount_receivable, past_due, 0) > 0 AS has_receivable_balance,
          COALESCE(amount_receivable, past_due, 0) > 0 OR market_rent IS NULL OR (is_occupied AND actual_rent IS NULL) AS needs_management_review,
          _snapshot_at AS snapshot_reference_at,
          _snapshot_at AS master_snapshot_at,
          _snapshot_at
        FROM ${pmUnitT}
        ORDER BY needs_management_review DESC, amount_receivable DESC NULLS LAST, project_name, property_address
      `),
      optionalRows(client, "PM delinquency", `
        SELECT *
        FROM ${pmDelinquencyT}
        WHERE is_delinquent OR COALESCE(amount_receivable, 0) > 0
        ORDER BY amount_receivable DESC NULLS LAST
      `),
      optionalRows(client, "exception queue", `
        SELECT *
        FROM ${exceptionQueueT}
        ORDER BY severity_sort, metric_value DESC NULLS LAST, owner_group, exception_type
        LIMIT 500
      `),
      optionalRows(client, "exception detail snapshot", `
        SELECT *
        FROM ${exceptionDetailT}
        ORDER BY severity_sort, days_outstanding DESC NULLS LAST, exception_type
        LIMIT 1000
      `),
      optionalRows(client, "exception summary", `
        SELECT *
        FROM ${exceptionSummaryT}
        ORDER BY priority, exception_count DESC, owner_group
      `),
      optionalRows(client, "project exception summary", `
        SELECT *
        FROM ${projectExceptionT}
        ORDER BY high_exceptions DESC, exception_count DESC, project_name
        LIMIT 50
      `),
      optionalRows(client, "lifecycle summary", `
        SELECT
          m.job_id,
          COALESCE(s.community, m.community) AS community,
          m.city,
          m.job_type,
          COALESCE(s.plan_name, m.plan_name) AS plan_name,
          COALESCE(s.superintendent, m.superintendent) AS superintendent,
          COALESCE(s.current_stage, m.current_stage) AS current_stage,
          COALESCE(SAFE_CAST(s.start_date AS DATE), SAFE_CAST(m.job_start AS DATE), SAFE_CAST(m.released_to_construction_date AS DATE)) AS start_date,
          SAFE_CAST(s.stage_start_date AS DATE) AS stage_start_date,
          SAFE_CAST(s.target_close_date AS DATE) AS target_close_date,
          SAFE_CAST(s.actual_close_date AS DATE) AS actual_close_date,
          SAFE_CAST(m.job_start AS DATE) AS job_start,
          SAFE_CAST(m.released_to_construction_date AS DATE) AS released_to_construction_date,
          SAFE_CAST(m.receive_co_date AS DATE) AS receive_co_date,
          SAFE_CAST(m.closed_date AS DATE) AS closed_date,
          m.current_stage_code,
          m.completion_pct,
          DATE_DIFF(CURRENT_DATE(), SAFE_CAST(s.stage_start_date AS DATE), DAY) AS days_in_stage,
          DATE_DIFF(
            CURRENT_DATE(),
            COALESCE(SAFE_CAST(s.stage_start_date AS DATE), SAFE_CAST(m.released_to_construction_date AS DATE), SAFE_CAST(m.job_start AS DATE)),
            DAY
          ) AS days_since_last_change
        FROM ${constructionT} m
        LEFT JOIN ${scheduleT} s USING (job_id)
        WHERE ${currentInventorySql("m")}
          AND ${sqlInNormalized("m.job_type", CONSTRUCTION_SCOPE_TYPES)}
          AND m.job_id IS NOT NULL
          AND (
            COALESCE(s.current_stage, m.current_stage) IS NOT NULL
            OR SAFE_CAST(s.stage_start_date AS DATE) IS NOT NULL
            OR SAFE_CAST(m.released_to_construction_date AS DATE) IS NOT NULL
            OR SAFE_CAST(m.job_start AS DATE) IS NOT NULL
            OR SAFE_CAST(m.receive_co_date AS DATE) IS NOT NULL
          )
        QUALIFY ROW_NUMBER() OVER (
          PARTITION BY m.job_id
          ORDER BY SAFE_CAST(s.stage_start_date AS DATE) DESC NULLS LAST, SAFE_CAST(m.released_to_construction_date AS DATE) DESC NULLS LAST
        ) = 1
        ORDER BY days_since_last_change DESC NULLS LAST, community, job_id
        LIMIT 1500
      `),
      optionalRows(client, "warehouse object health", `
        SELECT *
        FROM ${warehouseObjectsT}
        ORDER BY warehouse_layer, object_name
      `),
      optionalRows(client, "warehouse data quality", `
        SELECT *
        FROM ${warehouseQualityT}
        ORDER BY CASE severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 4 END,
          warehouse_layer,
          check_name
      `),
      optionalRows(client, "warehouse inventory fallback", `
        SELECT
          'raw' AS warehouse_layer,
          table_id AS object_name,
          'TABLE' AS object_type,
          row_count,
          CAST(NULL AS INT64) AS distinct_business_keys,
          CAST(NULL AS INT64) AS missing_business_keys,
          TIMESTAMP_MILLIS(creation_time) AS creation_time,
          TIMESTAMP_MILLIS(last_modified_time) AS last_modified_time
        FROM \`${config.projectId}.${config.rawDataset}.__TABLES__\`
        UNION ALL
        SELECT
          'marts' AS warehouse_layer,
          table_id AS object_name,
          'TABLE' AS object_type,
          row_count,
          CAST(NULL AS INT64) AS distinct_business_keys,
          CAST(NULL AS INT64) AS missing_business_keys,
          TIMESTAMP_MILLIS(creation_time) AS creation_time,
          TIMESTAMP_MILLIS(last_modified_time) AS last_modified_time
        FROM \`${config.projectId}.${config.dataset}.__TABLES__\`
        ORDER BY warehouse_layer, object_name
      `),
    ]);

    const dateFields = [
      "job_start", "clear_lot_date", "build_pad_date", "completion_date", "closed_date", "closing_date",
      "permit_issued_date", "released_to_construction_date", "underground_plumbing_date", "pour_slab_date",
      "block_house_date", "frame_house_date", "dry_in_roof_date", "insulate_house_date", "drywall_house_date",
      "flooring_install_date", "cabinet_install_date", "hot_check_date", "ac_startup_date", "receive_co_date",
    ];

    const milestonesRoster = milestonesRosterResult.map((r) => {
      const out = { ...r };
      for (const field of dateFields) out[field] = normalizeTemporalValue(r[field]);
      out.job_type = cleanFilterValue(r.job_type);
      out.job_status = cleanFilterValue(r.job_status);
      out.sales_status = cleanFilterValue(r.sales_status);
      out.current_stage = cleanFilterValue(r.current_stage);
      out.community = cleanFilterValue(r.community);
      out.city = cleanFilterValue(r.city);
      out.current_stage_code = safeNumber(r.current_stage_code);
      out.completion_pct = nullableNumber(r.completion_pct);
      out.start_to_completion_days = nullableNumber(r.start_to_completion_days);
      out.original_budget = nullableNumber(r.original_budget);
      out.job_cost_amount = nullableNumber(r.job_cost_amount);
      out.variance_in_flight = nullableNumber(r.variance_in_flight);
      out.wip = nullableNumber(r.wip);
      out.wip_without_lot = nullableNumber(r.wip_without_lot);
      out.lot_cost = nullableNumber(r.lot_cost);
      out.equity = nullableNumber(r.equity);
      out.loan_amount = nullableNumber(r.loan_amount);
      out.total_drawn = nullableNumber(r.total_drawn);
      out.interest_rate = nullableNumber(r.interest_rate);
      out.loan_days_until_expiration = nullableNumber(r.loan_days_until_expiration);
      return out;
    });
    const fullInventoryRows = milestonesRoster;
    const jobInventoryRows = fullInventoryRows.filter(isCurrentInventoryRow);
    const constructionRows = milestonesRoster.filter(isConstructionScopeRow);

    const salesFull = salesFullResult.map((r) => ({
      ...normalizeTemporalFields(r, [
        "sold_date",
        "accepted_date",
        "written_date",
        "scheduled_closing",
        "projected_close_date",
        "close_date",
        "cancel_date",
      ]),
      job_id: r.job_no || r.job_id || r.contract_number,
      sale_price: nullableNumber(r.sale_price),
      base_price: nullableNumber(r.base_price),
      lot_premium: nullableNumber(r.lot_premium),
      change_orders: nullableNumber(r.change_orders),
      total_deposits: nullableNumber(r.total_deposits),
      net_profit_est: nullableNumber(r.net_profit_est),
      net_margin_est: nullableNumber(r.net_margin_est),
    }));
    const salesFullByJob = new Map(
      salesFull
        .filter((row) => row.job_id)
        .map((row) => [String(row.job_id).trim().toLowerCase(), row])
    );
    const salesRoster = salesRosterResult.map((r) => {
      const match = salesFullByJob.get(String(r.job_id || r.contract_number || "").trim().toLowerCase()) || {};
      return {
        ...match,
        ...normalizeTemporalFields(r, ["sold_date", "scheduled_closing", "contract_date", "projected_close", "_extracted_at"]),
        job_id: r.job_id || r.contract_number || match.job_id,
        area_name: r.area_name || match.area_name,
        city: r.city || match.city,
        address: r.address || match.address,
        job_type: r.job_type || match.job_type,
        sale_price: nullableNumber(r.sale_price ?? match.sale_price),
        base_price: nullableNumber(match.base_price),
        lot_premium: nullableNumber(match.lot_premium),
        change_orders: nullableNumber(match.change_orders),
        total_deposits: nullableNumber(match.total_deposits),
        net_profit_est: nullableNumber(match.net_profit_est),
        net_margin_est: nullableNumber(match.net_margin_est),
      };
    });

    const listingAgentRows = listingAgentResult.map((r) => ({
      ...normalizeTemporalFields(r, [
        "sale_listed_date",
        "price_reduced_on_date",
        "effective_date",
        "closing_sold_date",
        "leased_date",
        "_loaded_at",
      ]),
      dom: nullableNumber(r.dom),
      current_price: nullableNumber(r.current_price),
      starting_price: nullableNumber(r.starting_price),
      sold_price: nullableNumber(r.sold_price),
      under_contract: Boolean(r.under_contract),
      sold: Boolean(r.sold),
      listed_as_rental: Boolean(r.listed_as_rental),
      leased: Boolean(r.leased),
    }));

    const loanRoster = jobInventoryRows
      .filter((r) => safeNumber(r.loan_amount) > 0)
      .map((r) => ({
        ...r,
        draw_pct: safeNumber(r.loan_amount) > 0 ? safeNumber(r.total_drawn) / safeNumber(r.loan_amount) : null,
      }));

    const jobFinancials = constructionRows
      .filter((r) => safeNumber(r.wip) > 0 || safeNumber(r.lot_cost) > 0 || safeNumber(r.original_budget) > 0 || safeNumber(r.job_cost_amount) > 0);

    const auditRoster = auditRosterResult.map(normalizeAuditRow);
    const profitTracking = auditRoster
      .filter((r) => r.sale_price > 0 || r.total_cost > 0)
      .sort((a, b) => safeNumber(a.net_margin) - safeNumber(b.net_margin));

    const filterRows = filterAndQualityResult.filter((r) => r.category === "filter");
    const qualityRows = filterAndQualityResult.filter((r) => r.category === "quality");

    const filterValuesFor = (type) => cleanFilterValues(
      filterRows.filter((r) => r.filter_type === type).map((r) => r.filter_value)
    );

    const filterOptions = {
      cities: filterValuesFor("city"),
      jobTypes: cleanFilterValues(jobInventoryRows.map((row) => row.job_type)),
      areaNames: filterValuesFor("area_name"),
    };

    const areaNameMap = {};
    for (const r of filterRows.filter((row) => row.filter_type === "area_name")) {
      const areaName = cleanFilterValue(r.filter_value);
      if (!areaName) continue;
      areaNameMap[areaName] = (areaNameMap[areaName] || 0) + safeNumber(r.cnt);
    }

    const qualityChecks = qualityRows.map((r) => ({
      label: r.label,
      coverage: safeNumber(r.coverage),
      coveredRows: safeNumber(r.covered_rows),
      totalRows: safeNumber(r.total_rows),
      tone: toneFromCoverage(safeNumber(r.coverage)),
    }));

    const pmMaster = pmMasterResult.map((r) => ({
      ...normalizeTemporalFields(r, ["lease_from", "lease_to", "move_in", "move_out"]),
      unit_label: r.unit_label || r.address || r.property_address || r.job_no || r.unit_id,
      property_label: r.property_label || r.address || r.property_address || r.unit_label || r.unit_id,
      occupied: Boolean(r.occupied),
      is_occupied: Boolean(r.is_occupied),
      is_vacant: Boolean(r.is_vacant),
      market_rent: safeNumber(r.market_rent),
      actual_rent: safeNumber(r.actual_rent),
      monthly_rent: safeNumber(r.monthly_rent),
      amount_receivable: safeNumber(r.amount_receivable),
      receivable_0_30: safeNumber(r.receivable_0_30),
      receivable_30_plus: safeNumber(r.receivable_30_plus),
      past_due: safeNumber(r.past_due),
      deposit: safeNumber(r.deposit),
      needs_management_review: Boolean(r.needs_management_review),
    }));

    const pmDelinquency = pmDelinquencyResult.map((r) => {
      const { phone_numbers: _phoneNumbers, email: _email, emails: _emails, ...safeRow } = r;
      const daysPastDue =
        nullableNumber(safeRow.days_past_due) ??
        (safeNumber(safeRow.receivable_30_plus) > 0 ? 30 : safeNumber(safeRow.receivable_0_30) > 0 ? 15 : null);
      return {
        ...normalizeTemporalFields(safeRow, ["move_in", "last_payment", "_snapshot_at"]),
        unit_id: safeRow.unit_id || safeRow.delinquency_key || safeRow.property_key || safeRow.job_no,
        community: safeRow.community || safeRow.project_name,
        address: safeRow.address || safeRow.property_address,
        tenant_name: safeRow.tenant_name || safeRow.tenant,
        amount_due: safeNumber(safeRow.amount_due ?? safeRow.amount_receivable),
        days_past_due: daysPastDue,
        receivable_0_30: safeNumber(safeRow.receivable_0_30),
        receivable_30_plus: safeNumber(safeRow.receivable_30_plus),
        delinquency_0_30: safeNumber(safeRow.delinquency_0_30 ?? safeRow.receivable_0_30),
        delinquency_30_plus: safeNumber(safeRow.delinquency_30_plus ?? safeRow.receivable_30_plus),
      };
    });

    filterOptions.communities = cleanFilterValues([
      ...constructionRows.map((row) => row.community),
      ...salesRoster.map((row) => row.community),
      ...salesFull.map((row) => row.community),
      ...pmMaster.map((row) => row.community || row.project_name),
    ]);
    filterOptions.cities = cleanFilterValues([
      ...filterOptions.cities,
      ...constructionRows.map((row) => row.city),
      ...salesRoster.map((row) => row.city),
      ...salesFull.map((row) => row.city),
      ...pmMaster.map((row) => row.city),
    ]);
    filterOptions.areaNames = cleanFilterValues([
      ...filterOptions.areaNames,
      ...salesRoster.map((row) => row.area_name),
      ...salesFull.map((row) => row.area_name),
      ...pmMaster.map((row) => row.area_name),
    ]);
    filterOptions.jobTypes = cleanFilterValues([
      ...filterOptions.jobTypes,
      ...salesRoster.map((row) => row.job_type),
      ...salesFull.map((row) => row.job_type),
      ...pmMaster.map((row) => row.job_type),
    ]);

    const pmStatusBreakdown = buildPmStatusBreakdown(pmMaster);
    const pmProjectSummary = buildPmProjectSummary(pmMaster);
    const propertyManagementSummary = buildPmPortfolioSummary(pmMaster, pmPortfolioSummary);

    const exceptionRows = exceptionRowsResult.map((r) => ({
      ...r,
      days_outstanding: safeNumber(r.days_outstanding),
      metric_value: safeNumber(r.metric_value),
      severity_sort: safeNumber(r.severity_sort),
    }));

    const exceptionDetailRows = exceptionDetailRowsResult.map((r) => ({
      ...r,
      days_outstanding: safeNumber(r.days_outstanding),
      metric_value: safeNumber(r.metric_value),
      severity_sort: safeNumber(r.severity_sort),
    }));

    const exceptionSummary = exceptionSummaryResult.map((r) => ({
      ...r,
      exception_count: safeNumber(r.exception_count),
      affected_jobs: safeNumber(r.affected_jobs),
      affected_projects: safeNumber(r.affected_projects),
      total_metric_value: safeNumber(r.total_metric_value),
      max_days_outstanding: safeNumber(r.max_days_outstanding),
    }));

    const warehouseObjectsSource = warehouseObjectsResult.length ? warehouseObjectsResult : warehouseInventoryResult;
    const warehouseObjects = warehouseObjectsSource.map((r) => ({
      ...r,
      row_count: safeNumber(r.row_count),
      distinct_business_keys: safeNumber(r.distinct_business_keys),
      missing_business_keys: safeNumber(r.missing_business_keys),
    }));

    const warehouseQuality = warehouseQualityResult.map((r) => ({
      ...r,
      issue_count: safeNumber(r.issue_count),
      checked_count: safeNumber(r.checked_count),
    }));

    const lifecycleSummary = lifecycleSummaryResult
      .map((r) => ({
        ...normalizeTemporalFields(r, [
          "start_date",
          "stage_start_date",
          "target_close_date",
          "actual_close_date",
          "job_start",
          "released_to_construction_date",
          "receive_co_date",
          "closed_date",
        ]),
        current_stage_code: nullableNumber(r.current_stage_code),
        completion_pct: nullableNumber(r.completion_pct),
        days_in_stage: nullableNumber(r.days_in_stage),
        days_since_last_change: nullableNumber(r.days_since_last_change),
      }))
      .filter((row) =>
        row.job_id &&
        (row.current_stage ||
          row.start_date ||
          row.stage_start_date ||
          row.target_close_date ||
          row.actual_close_date ||
          row.released_to_construction_date ||
          row.receive_co_date ||
          nullableNumber(row.completion_pct) !== null)
      );

    const totalExceptions = exceptionRows.length;
    const p1Exceptions = exceptionRows.filter((r) => r.priority === "P1").length;
    const p2Exceptions = exceptionRows.filter((r) => r.priority === "P2").length;
    const affectedExceptionJobs = new Set(exceptionRows.map((r) => r.job_no).filter(Boolean)).size;
    const warehouseMissingKeys = warehouseObjects.reduce((sum, r) => sum + r.missing_business_keys, 0);
    const warehouseRows = warehouseObjects.reduce((sum, r) => sum + r.row_count, 0);
    const martSummaryObject = warehouseObjects.find((row) => String(row.object_name || "").toLowerCase() === "mart_daily_summary");
    const martRefreshAt = normalizeTemporalValue(combinedSummary._mart_refreshed_at || combinedSummary.mart_refreshed_at || martSummaryObject?.last_modified_time);
    const pmSnapshotRefreshAt = normalizeTemporalValue(propertyManagementSummary.snapshotAt);
    const martAgeHours = sourceAgeHours(martRefreshAt);
    const pmSnapshotAgeHours = sourceAgeHours(pmSnapshotRefreshAt);
    const dataFreshness = {
      displayMode: "snapshot",
      sourceLabel: "BigQuery Snapshot",
      martRefreshAt,
      pmSnapshotRefreshAt,
      warehouseRefreshAt: latestTemporalValue(warehouseObjects.map((row) => row.last_modified_time || row.creation_time)),
      generatedAt: new Date().toISOString(),
      martAgeHours,
      pmSnapshotAgeHours,
      martIsStale: martAgeHours !== null && martAgeHours > STALE_SOURCE_HOURS,
      pmSnapshotIsStale: pmSnapshotAgeHours !== null && pmSnapshotAgeHours > STALE_SOURCE_HOURS,
    };

    const auditNotes = [];
    auditNotes.push("Dashboard uses a BigQuery snapshot. Interactive filters re-scope loaded snapshot rows; they do not run per-click live warehouse queries.");
    auditNotes.push(`Current inventory excludes closed-date/status rows (${(fullInventoryRows.length - jobInventoryRows.length).toLocaleString("en-US")} excluded from ${fullInventoryRows.length.toLocaleString("en-US")} source inventory rows).`);
    auditNotes.push(`Construction views use normalized active build / CO job types (${CONSTRUCTION_SCOPE_TYPES.join(", ")}).`);
    if (dataFreshness.martIsStale) {
      auditNotes.push(`Freshness warning: mart source is ${formatAge(dataFreshness.martAgeHours)}. Refresh the warehouse pipeline before client review.`);
    } else if (dataFreshness.martRefreshAt) {
      auditNotes.push(`Mart summary refreshed ${dataFreshness.martRefreshAt}.`);
    }
    const superCoverage = qualityChecks.find((r) => r.label === "Superintendent assigned")?.coverage ?? 0;
    if (superCoverage > 0 && superCoverage < 0.5) {
      auditNotes.push(`Superintendent assignment is ${(superCoverage * 100).toFixed(0)}% populated, so workload views may show gaps.`);
    }
    if (p1Exceptions > 0) {
      auditNotes.push(`${p1Exceptions} P1 exceptions are in the warehouse action queue.`);
    }
    const highWarehouseChecks = warehouseQuality.filter((r) => r.severity === "HIGH" && r.issue_count > 0).length;
    if (highWarehouseChecks > 0) {
      auditNotes.push(`${highWarehouseChecks} high-severity warehouse quality checks need review.`);
    }
    if (dataFreshness.pmSnapshotIsStale) {
      auditNotes.push(`Freshness warning: PM source is ${formatAge(dataFreshness.pmSnapshotAgeHours)}. PM KPIs may lag current operations.`);
    } else if (dataFreshness.pmSnapshotRefreshAt) {
      auditNotes.push(`Property management uses the snapshot-backed PM source refreshed ${dataFreshness.pmSnapshotRefreshAt}.`);
    }

    return {
      sourceMode: "snapshot",
      dataFreshness,
      errorMessage: null,
      config,
      summaries: {
        inventory: {
          totalJobs: jobInventoryRows.length,
          sourceRows: fullInventoryRows.length,
          closedExcluded: fullInventoryRows.length - jobInventoryRows.length,
        },
        portfolio: buildConstructionPortfolioSummary(constructionRows, combinedSummary),
        financial: buildFinancialSummary(jobFinancials),
        sales: {
          totalContracts: safeNumber(combinedSummary.total_contracts) || salesRoster.length,
          totalSalesValue: safeNumber(combinedSummary.total_sales_value) || salesRoster.reduce((sum, row) => sum + safeNumber(row.sale_price), 0),
        },
        loans: {
          totalLoanAmount: loanRoster.reduce((sum, row) => sum + safeNumber(row.loan_amount), 0),
          totalDrawn: loanRoster.reduce((sum, row) => sum + safeNumber(row.total_drawn), 0),
          jobsWithLoans: loanRoster.length,
        },
        propertyManagement: propertyManagementSummary,
        exceptions: {
          total: totalExceptions,
          p1: p1Exceptions,
          p2: p2Exceptions,
          affectedJobs: affectedExceptionJobs,
          metricValue: exceptionRows.reduce((sum, row) => sum + safeNumber(row.metric_value), 0),
        },
        warehouse: {
          objects: warehouseObjects.length,
          rows: warehouseRows,
          missingKeys: warehouseMissingKeys,
          qualityIssues: warehouseQuality.reduce((sum, row) => sum + safeNumber(row.issue_count), 0),
        },
      },
      jobInventoryRows,
      fullInventoryRows,
      constructionRows,
      milestonesRoster,
      salesRoster,
      salesRosterAvailable: salesRosterResult.length > 0,
      salesFull,
      listingAgentRows,
      loanRoster,
      jobFinancials,
      profitTracking,
      auditRoster,
      pmMaster,
      pmDelinquency,
      pmStatusBreakdown,
      pmProjectSummary,
      exceptionRows,
      exceptionDetailRows,
      exceptionSummary,
      projectExceptionSummary: projectExceptionSummaryResult,
      crossDomainSummary: [],
      lifecycleSummary,
      warehouseObjects,
      warehouseQuality,
      filterOptions,
      areaNameMap,
      qualityChecks,
      auditNotes,
    };
  } catch (error) {
    console.error("[dashboard-data] BigQuery error:", error.message);
    console.error("[dashboard-data] Stack:", error.stack);
    return buildUnavailableDashboard(`BigQuery snapshot load failed: ${error.message}`);
  }
}
