"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  {
    label: "Jobs",
    tabs: [
      { id: "jobSummary", label: "Job Summary" },
    ],
  },
  {
    label: "Loans",
    tabs: [
      { id: "loansDash", label: "Dashboard" },
      { id: "loansPipeline", label: "Pipeline" },
    ],
  },
  {
    label: "Construction",
    tabs: [
      { id: "constructionDash", label: "Dashboard" },
      { id: "constructionPipeline", label: "Pipeline" },
      { id: "constructionCycle", label: "Cycle Time" },
      { id: "constructionCost", label: "Cost Metrics" },
    ],
  },
  {
    label: "Sales",
    tabs: [
      { id: "salesDash", label: "Dashboard" },
      { id: "salesPipeline", label: "Pipeline" },
    ],
  },
  {
    label: "Property Mgmt",
    tabs: [
      { id: "pmDash", label: "Dashboard" },
      { id: "pmPipeline", label: "Pipeline" },
    ],
  },
  {
    label: "Assurance",
    tabs: [
      { id: "audits", label: "P&L Audit" },
      { id: "exceptions", label: "Exceptions" },
      { id: "warehouse", label: "Warehouse Health" },
    ],
  },
];

const ACTIVE_CONSTRUCTION_TYPES = ["SFR Construction In Progress", "Awaiting CO", "On Hold", "POs Released"];
const CO_SCOPE_TYPE = "SFR Completed (not closed)";
const CONSTRUCTION_SCOPE_TYPES = [...ACTIVE_CONSTRUCTION_TYPES, CO_SCOPE_TYPE];
const ACTIVE_CONSTRUCTION_TYPE_KEYS = new Set(ACTIVE_CONSTRUCTION_TYPES.map((value) => String(value).trim().replace(/\s+/g, " ").toLowerCase()));
const CHART_COLORS = ["var(--accent)", "var(--color-accent)", "var(--warning)", "var(--danger)", "#7c3aed", "#14b8a6", "#64748b"];
const EMPTY_FILTERS = { city: null, community: null, areaName: null, jobType: null, year: null, quarter: null, month: null };
const MONTH_LABELS = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

const FILTER_DIMENSIONS = {
  city: ["city", "city_name", "job_city", "project_city"],
  community: ["community", "project_name", "subdivision", "subdivision_name"],
  areaName: ["area_name", "area", "region_name", "company_name", "division_name"],
  jobType: ["job_type", "product_type", "construction_type"],
};

const DATE_FILTER_FIELDS = [
  "job_start",
  "start_date",
  "completion_date",
  "closed_date",
  "closing_date",
  "contract_date",
  "sold_date",
  "accepted_date",
  "written_date",
  "scheduled_closing",
  "projected_close",
  "projected_close_date",
  "close_date",
  "cancel_date",
  "_extracted_at",
  "permit_submitted",
  "permit_issued_date",
  "permit_approved_date",
  "submitted_date",
  "issued_date",
  "approved_date",
  "stage_start_date",
  "target_close_date",
  "actual_close_date",
  "released_to_construction_date",
  "receive_co_date",
  "sale_listed_date",
  "price_reduced_on_date",
  "effective_date",
  "closing_sold_date",
  "leased_date",
  "_loaded_at",
  "_snapshot_at",
  "master_snapshot_at",
  "snapshot_reference_at",
  "creation_time",
  "last_modified_time",
  "lease_from",
  "lease_to",
  "move_in",
  "move_out",
  "last_payment",
  "audit_date",
  "_mart_refreshed_at",
  "snapshot_at",
  "snapshotAt",
];

const COMMON_SNAPSHOT_DATE_FIELDS = [
  "_extracted_at",
  "_loaded_at",
  "_mart_refreshed_at",
  "_snapshot_at",
  "snapshot_at",
  "snapshotAt",
  "master_snapshot_at",
  "snapshot_reference_at",
];

const CONSTRUCTION_DATE_FIELDS = [
  "job_start",
  "start_date",
  "stage_start_date",
  "released_to_construction_date",
  "receive_co_date",
  "completion_date",
  "closed_date",
  "closing_date",
  "target_close_date",
  "actual_close_date",
  "permit_issued_date",
  "clear_lot_date",
  "build_pad_date",
  "underground_plumbing_date",
  "pour_slab_date",
  "block_house_date",
  "frame_house_date",
  "dry_in_roof_date",
  "insulate_house_date",
  "drywall_house_date",
  "flooring_install_date",
  "cabinet_install_date",
  "hot_check_date",
  "ac_startup_date",
  ...COMMON_SNAPSHOT_DATE_FIELDS,
];

const SALES_DATE_FIELDS = [
  "contract_date",
  "sold_date",
  "accepted_date",
  "written_date",
  "scheduled_closing",
  "projected_close",
  "projected_close_date",
  "close_date",
  "cancel_date",
  ...COMMON_SNAPSHOT_DATE_FIELDS,
];

const LISTING_DATE_FIELDS = [
  "sale_listed_date",
  "price_reduced_on_date",
  "effective_date",
  "closing_sold_date",
  "leased_date",
  ...COMMON_SNAPSHOT_DATE_FIELDS,
];

const PM_DATE_FIELDS = [
  "lease_from",
  "lease_to",
  "move_in",
  "move_out",
  "last_payment",
  ...COMMON_SNAPSHOT_DATE_FIELDS,
];

const AUDIT_DATE_FIELDS = ["audit_date", ...COMMON_SNAPSHOT_DATE_FIELDS];
const WAREHOUSE_DATE_FIELDS = ["creation_time", "last_modified_time", "checked_at", ...COMMON_SNAPSHOT_DATE_FIELDS];
const EXCEPTION_DATE_FIELDS = ["created_at", "detected_at", "resolved_at", "first_seen_at", "last_seen_at", ...COMMON_SNAPSHOT_DATE_FIELDS];

const DOMAIN_DATE_FILTER_FIELDS = {
  inventory: CONSTRUCTION_DATE_FIELDS,
  construction: CONSTRUCTION_DATE_FIELDS,
  constructionLifecycle: CONSTRUCTION_DATE_FIELDS,
  financials: CONSTRUCTION_DATE_FIELDS,
  loans: CONSTRUCTION_DATE_FIELDS,
  sales: SALES_DATE_FIELDS,
  listings: LISTING_DATE_FIELDS,
  propertyManagement: PM_DATE_FIELDS,
  audits: AUDIT_DATE_FIELDS,
  exceptions: EXCEPTION_DATE_FIELDS,
  warehouse: WAREHOUSE_DATE_FIELDS,
  none: [],
};

const DEFAULT_DRILL_COLUMNS = [
  { key: "job_id", label: "Job" },
  { key: "job_no", label: "Job No" },
  { key: "unit_id", label: "Unit" },
  { key: "community", label: "Community" },
  { key: "project_name", label: "Project" },
  { key: "city", label: "City" },
  { key: "area_name", label: "Area" },
  { key: "job_type", label: "Job Type" },
  { key: "status", label: "Status" },
  { key: "current_stage", label: "Stage" },
  { key: "completion_pct", label: "Completion", format: "percent" },
  { key: "sale_price", label: "Sale Price", format: "currency" },
  { key: "net_revenue", label: "Net Revenue", format: "currency" },
  { key: "total_cost", label: "Total Cost", format: "currency" },
  { key: "net_profit", label: "Net Profit", format: "currency" },
  { key: "net_margin", label: "Margin", format: "percent" },
  { key: "margin_status", label: "Margin Status" },
  { key: "wip", label: "WIP", format: "currency" },
  { key: "loan_amount", label: "Loan", format: "currency" },
  { key: "total_drawn", label: "Drawn", format: "currency" },
  { key: "past_due", label: "Past Due", format: "currency" },
  { key: "priority", label: "Priority" },
];

function safeNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function formatWholeNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(safeNumber(value));
}

function formatCompactCurrency(value) {
  const numeric = safeNumber(value);
  if (Math.abs(numeric) >= 1_000_000) return `$${(numeric / 1_000_000).toFixed(1)}M`;
  if (Math.abs(numeric) >= 1_000) return `$${(numeric / 1_000).toFixed(0)}K`;
  return formatCurrency(numeric);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safeNumber(value));
}

function formatPercent(value) {
  const numeric = safeNumber(value);
  const normalized = Math.abs(numeric) > 1.2 ? numeric / 100 : numeric;
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(normalized);
}

function formatNullablePercent(value) {
  return nullableNumber(value) === null ? "-" : formatPercent(value);
}

function dateForDisplay(value) {
  if (!value) return null;
  const raw = typeof value === "object" && "value" in value ? value.value : value;
  if (raw === null || raw === undefined || raw === "") return null;
  const text = String(raw).trim();
  const dateOnlyMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric > 20_000 && numeric < 60_000) {
    const utcDate = new Date(Date.UTC(1899, 11, 30) + numeric * 86_400_000);
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = dateForDisplay(value);
  const raw = typeof value === "object" && value && "value" in value ? value.value : value;
  if (!date) return raw ? String(raw) : "-";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function daysSince(value) {
  const date = dateForDisplay(value);
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

function optionValue(value) {
  return value || "__all";
}

function firstPresent(row, keys) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function datePartsFromValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  let date = null;
  if (Number.isFinite(numeric)) {
    if (numeric >= 1900 && numeric <= 2100 && Number.isInteger(numeric)) {
      return { year: String(numeric), quarter: null, month: null };
    }
    if (numeric > 20_000 && numeric < 60_000) {
      date = new Date(Date.UTC(1899, 11, 30) + numeric * 86_400_000);
    }
  }
  if (!date) date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const monthIndex = date.getUTCMonth();
  return {
    year: String(date.getUTCFullYear()),
    quarter: `Q${Math.floor(monthIndex / 3) + 1}`,
    month: String(monthIndex + 1).padStart(2, "0"),
  };
}

function rowPeriodValues(row, period, dateFields = DATE_FILTER_FIELDS) {
  return Array.from(
    new Set(
      dateFields
        .map((field) => datePartsFromValue(row?.[field])?.[period])
        .filter((value) => value && (period !== "year" || (Number(value) >= 2000 && Number(value) <= 2100)))
    )
  );
}

function hasDimensionValue(row, dimension, dateFields = DATE_FILTER_FIELDS) {
  if (dimension === "year" || dimension === "quarter" || dimension === "month") return rowPeriodValues(row, dimension, dateFields).length > 0;
  if (dimension === "city" && firstPresent(row, FILTER_DIMENSIONS.city) === null) {
    return firstPresent(row, FILTER_DIMENSIONS.community) !== null;
  }
  return firstPresent(row, FILTER_DIMENSIONS[dimension] || []) !== null;
}

function matchesDashboardDimension(row, dimension, filterValue, dateFields = DATE_FILTER_FIELDS) {
  if (dimension === "year" || dimension === "quarter" || dimension === "month") return rowPeriodValues(row, dimension, dateFields).includes(String(filterValue));
  const rowValue = firstPresent(row, FILTER_DIMENSIONS[dimension]);
  if (rowValue !== null) return normalizeText(rowValue) === normalizeText(filterValue);
  if (dimension === "city") {
    const communityValue = firstPresent(row, FILTER_DIMENSIONS.community);
    return communityValue !== null && normalizeText(communityValue).includes(normalizeText(filterValue));
  }
  return false;
}

function filterRowsByDashboardFilters(rows = [], filters = {}, dateFields = DATE_FILTER_FIELDS) {
  const activeDimensions = [...Object.keys(FILTER_DIMENSIONS), "year", "quarter", "month"].filter((dimension) => filters[dimension]);
  if (!activeDimensions.length || !rows.length) return rows;

  const applicableDimensions = activeDimensions.filter((dimension) =>
    rows.some((row) => hasDimensionValue(row, dimension, dateFields))
  );
  if (!applicableDimensions.length) return rows;

  return rows.filter((row) =>
    applicableDimensions.every((dimension) => {
      return matchesDashboardDimension(row, dimension, filters[dimension], dateFields);
    })
  );
}

function collectFilterPeriods(dashboard) {
  const collections = [
    { key: "jobInventoryRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.inventory },
    { key: "constructionRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.construction },
    { key: "salesRoster", dateFields: DOMAIN_DATE_FILTER_FIELDS.sales },
    { key: "loanRoster", dateFields: DOMAIN_DATE_FILTER_FIELDS.loans },
    { key: "jobFinancials", dateFields: DOMAIN_DATE_FILTER_FIELDS.financials },
    { key: "auditRoster", dateFields: DOMAIN_DATE_FILTER_FIELDS.audits },
    { key: "pmMaster", dateFields: DOMAIN_DATE_FILTER_FIELDS.propertyManagement },
    { key: "pmDelinquency", dateFields: DOMAIN_DATE_FILTER_FIELDS.propertyManagement },
    { key: "exceptionRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.exceptions },
    { key: "exceptionDetailRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.exceptions },
    { key: "listingAgentRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.listings },
  ];
  const years = new Set();
  const quarters = new Set();
  const months = new Set();
  for (const { key, dateFields } of collections) {
    for (const row of dashboard[key] || []) {
      for (const year of rowPeriodValues(row, "year", dateFields)) years.add(year);
      for (const quarter of rowPeriodValues(row, "quarter", dateFields)) quarters.add(quarter);
      for (const month of rowPeriodValues(row, "month", dateFields)) months.add(month);
    }
  }
  return {
    years: Array.from(years).sort((a, b) => Number(b) - Number(a)),
    quarters: Array.from(quarters).sort(),
    months: Array.from(months).sort(),
  };
}

function cleanFilterValues(values = [], sortMode = "alpha") {
  const seen = new Map();
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const cleanValue = String(value).trim();
    if (!cleanValue) continue;
    const key = normalizeText(cleanValue);
    if (!seen.has(key)) seen.set(key, cleanValue);
  }
  const sorted = Array.from(seen.values());
  if (sortMode === "numericDesc") return sorted.sort((a, b) => Number(b) - Number(a));
  if (sortMode === "numericAsc") return sorted.sort((a, b) => Number(a) - Number(b));
  return sorted.sort((a, b) => a.localeCompare(b));
}

function buildDashboardFilterOptions(dashboard) {
  const periods = collectFilterPeriods(dashboard);
  const options = {
    ...(dashboard.filterOptions || {}),
    ...periods,
  };
  return {
    cities: cleanFilterValues(options.cities),
    communities: cleanFilterValues(options.communities),
    areaNames: cleanFilterValues(options.areaNames),
    jobTypes: cleanFilterValues(options.jobTypes),
    years: cleanFilterValues(options.years, "numericDesc"),
    quarters: cleanFilterValues(options.quarters),
    months: cleanFilterValues(options.months, "numericAsc"),
  };
}

function buildBreakdown(rows, key, fallback = "(none)") {
  const counts = new Map();
  for (const row of rows) {
    const value = row?.[key] || fallback;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function groupRows(rows, key, valueKey = null) {
  const groups = new Map();
  for (const row of rows) {
    const label = row?.[key] || "(none)";
    const current = groups.get(label) || { label, count: 0, value: 0, rows: [] };
    current.count += 1;
    current.value += valueKey ? safeNumber(row?.[valueKey]) : 1;
    current.rows.push(row);
    groups.set(label, current);
  }
  return Array.from(groups.values()).sort((a, b) => b.value - a.value);
}

function topSegments(rows, key, { valueKey = null, limit = 5, fallback = "(none)" } = {}) {
  const groups = groupRows(
    rows.map((row) => ({ ...row, [key]: row?.[key] || fallback })),
    key,
    valueKey,
  );
  const top = groups.slice(0, limit).map((group, index) => ({
    label: group.label,
    value: group.value,
    color: CHART_COLORS[index % CHART_COLORS.length],
    rows: group.rows,
  }));
  const otherGroups = groups.slice(limit);
  if (otherGroups.length) {
    top.push({
      label: "Other",
      value: otherGroups.reduce((sum, group) => sum + safeNumber(group.value), 0),
      color: CHART_COLORS[CHART_COLORS.length - 1],
      rows: otherGroups.flatMap((group) => group.rows),
    });
  }
  return top;
}

function sumRows(rows, key) {
  return rows.reduce((sum, row) => sum + safeNumber(row?.[key]), 0);
}

function averageRows(rows, key) {
  const values = rows.map((row) => nullableNumber(row?.[key])).filter((value) => value !== null);
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function weightedMargin(rows) {
  const revenue = rows.reduce((sum, row) => sum + safeNumber(row?.net_revenue ?? row?.sale_price), 0);
  if (!revenue) return null;
  return rows.reduce((sum, row) => sum + safeNumber(row?.net_profit), 0) / revenue;
}

function auditMarginBand(row) {
  const margin = nullableNumber(row?.net_margin);
  if (margin === null) return "Missing revenue";
  if (margin < 0) return "Loss";
  if (margin < 0.08) return "At-risk <8%";
  if (margin < 0.12) return "Watch 8-12%";
  if (margin < 0.2) return "Target 12-20%";
  return "Strong 20%+";
}

function buildAuditCostCategories(rows) {
  const categories = [
    { label: "Lot / land", keys: ["lot_land"] },
    { label: "Permitting", keys: ["permitting"] },
    { label: "Site work", keys: ["site_work"] },
    { label: "Vertical", keys: ["vertical"] },
    { label: "Options", keys: ["options"] },
    { label: "Dirt / pad", keys: ["dirt_total"] },
    { label: "Utilities", keys: ["utilities_total"] },
    { label: "Environmental", keys: ["env_total"] },
    { label: "Dumpsters", keys: ["dumpsters"] },
    { label: "Builder fee", keys: ["builder_fee"] },
    { label: "Closing / warranty", keys: ["closing_cost", "warranty"] },
    { label: "Financing / interest", keys: ["financing", "monthly_interest"] },
    { label: "Insurance", keys: ["insurance"] },
  ];
  return categories
    .map((category) => {
      const categoryRows = rows.filter((row) => category.keys.some((key) => safeNumber(row?.[key]) > 0));
      const value = categoryRows.reduce(
        (sum, row) => sum + category.keys.reduce((inner, key) => inner + safeNumber(row?.[key]), 0),
        0,
      );
      return { ...category, value, count: categoryRows.length, rows: categoryRows };
    })
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value);
}

function buildMarginBuckets(rows) {
  const definitions = [
    { label: "Loss", color: "var(--danger)", match: (row) => nullableNumber(row.net_margin) !== null && safeNumber(row.net_margin) < 0 },
    { label: "At-risk <8%", color: "var(--warning)", match: (row) => nullableNumber(row.net_margin) !== null && safeNumber(row.net_margin) >= 0 && safeNumber(row.net_margin) < 0.08 },
    { label: "Watch 8-12%", color: "#f59e0b", match: (row) => nullableNumber(row.net_margin) !== null && safeNumber(row.net_margin) >= 0.08 && safeNumber(row.net_margin) < 0.12 },
    { label: "Target 12-20%", color: "var(--color-accent)", match: (row) => nullableNumber(row.net_margin) !== null && safeNumber(row.net_margin) >= 0.12 && safeNumber(row.net_margin) < 0.2 },
    { label: "Strong 20%+", color: "var(--accent)", match: (row) => nullableNumber(row.net_margin) !== null && safeNumber(row.net_margin) >= 0.2 },
  ];
  return definitions.map((bucket) => {
    const bucketRows = rows.filter(bucket.match);
    return { ...bucket, count: bucketRows.length, rows: bucketRows };
  });
}

function rowsWithValue(rows, key) {
  return rows.filter((row) => row?.[key] !== null && row?.[key] !== undefined && row?.[key] !== "");
}

function rowsByPredicate(rows, predicate) {
  return rows.filter((row) => {
    try {
      return predicate(row);
    } catch {
      return false;
    }
  });
}

function activeConstructionRows(rows) {
  return rows.filter((row) => {
    const jobType = normalizeText(row?.job_type);
    return ACTIVE_CONSTRUCTION_TYPE_KEYS.has(jobType);
  });
}

function coedNotClosedRows(rows) {
  return rows.filter((row) => normalizeText(row?.job_type) === normalizeText(CO_SCOPE_TYPE));
}

function averageCompletion(rows) {
  const values = rows.map((row) => nullableNumber(row?.completion_pct)).filter((value) => value !== null);
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function derivePortfolioSummary(rows) {
  return {
    totalJobs: rows.length,
    activeConstruction: activeConstructionRows(rows).length,
    coedNotClosed: coedNotClosedRows(rows).length,
    avgCompletion: averageCompletion(rows),
    totalWip: rows.reduce((sum, row) => sum + safeNumber(row?.wip), 0),
  };
}

function deriveSalesSummary(rows) {
  return {
    totalContracts: rows.length,
    totalSalesValue: rows.reduce((sum, row) => sum + safeNumber(row?.sale_price), 0),
  };
}

function salesKpiRows(data) {
  if (data?.salesRosterAvailable || (data?.salesRoster || []).length) return data.salesRoster || [];
  return data?.salesFull || [];
}

function deriveLoansSummary(rows) {
  return {
    totalLoanAmount: rows.reduce((sum, row) => sum + safeNumber(row?.loan_amount), 0),
    totalDrawn: rows.reduce((sum, row) => sum + safeNumber(row?.total_drawn), 0),
    jobsWithLoans: rows.length,
  };
}

function derivePmSummary(rows, base = {}) {
  const totalUnits = rows.length;
  const occupiedRows = rows.filter((row) => row?.occupied || row?.is_occupied || normalizeText(row?.status).includes("current"));
  const vacantRows = rows.filter((row) => row?.is_vacant || normalizeText(row?.status).includes("vacant"));
  const marketRent = rows.reduce((sum, row) => sum + safeNumber(row?.market_rent), 0);
  const actualRent = rows.reduce((sum, row) => sum + safeNumber(row?.actual_rent || row?.monthly_rent), 0);
  const pastDue = rows.reduce((sum, row) => sum + safeNumber(row?.past_due), 0);
  const totalReceivable = rows.reduce((sum, row) => sum + safeNumber(row?.amount_receivable), 0);
  const delinquentTenants = rows.filter((row) => safeNumber(row?.past_due || row?.amount_receivable) > 0).length;

  return {
    ...base,
    totalUnits,
    occupiedUnits: occupiedRows.length,
    vacantUnits: vacantRows.length || Math.max(totalUnits - occupiedRows.length, 0),
    occupancyRate: totalUnits ? occupiedRows.length / totalUnits : 0,
    marketRent,
    actualRent,
    vacancyLoss: Math.max(marketRent - actualRent, 0),
    collectionRate: marketRent ? actualRent / marketRent : 0,
    pastDue,
    totalReceivable,
    delinquentTenants,
    avgReceivablePerDelinquentTenant: delinquentTenants ? totalReceivable / delinquentTenants : 0,
    totalDeposits: rows.reduce((sum, row) => sum + safeNumber(row?.deposit), 0),
  };
}

function deriveExceptionsSummary(rows) {
  return {
    total: rows.length,
    p1: rows.filter((row) => row?.priority === "P1").length,
    p2: rows.filter((row) => row?.priority === "P2").length,
    affectedJobs: new Set(rows.map((row) => row?.job_no || row?.job_id).filter(Boolean)).size,
    metricValue: rows.reduce((sum, row) => sum + safeNumber(row?.metric_value), 0),
  };
}

function buildPmStatusBreakdown(rows) {
  const groups = new Map();
  for (const row of rows) {
    const label = firstPresent(row, ["lease_status", "occupancy_status", "status"]) || "(none)";
    const current = groups.get(label) || { label, count: 0, rows: [] };
    current.count += 1;
    current.rows.push(row);
    groups.set(label, current);
  }
  const total = rows.length || 1;
  return Array.from(groups.values()).map((group) => ({
    status: group.label,
    count: group.count,
    pct: group.count / total,
    rows: group.rows,
  })).sort((a, b) => b.count - a.count);
}

function buildPmProjectSummary(rows) {
  return groupRows(rows, "project_name").map((group) => ({
    project_name: group.label,
    total_units: group.count,
    occupied_units: group.rows.filter((row) => row?.occupied || row?.is_occupied).length,
    market_rent: group.rows.reduce((sum, row) => sum + safeNumber(row?.market_rent), 0),
    actual_rent: group.rows.reduce((sum, row) => sum + safeNumber(row?.actual_rent || row?.monthly_rent), 0),
    past_due: group.rows.reduce((sum, row) => sum + safeNumber(row?.past_due), 0),
    rows: group.rows,
  }));
}

function applyDashboardFilters(dashboard, filters) {
  const hasActiveFilters = Boolean(filters.city || filters.community || filters.areaName || filters.jobType || filters.year || filters.quarter || filters.month);
  const filtered = { ...dashboard, activeFilters: filters, isFiltered: hasActiveFilters };
  const rowCollections = [
    { key: "jobInventoryRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.inventory },
    { key: "fullInventoryRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.inventory },
    { key: "constructionRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.construction },
    { key: "milestonesRoster", dateFields: DOMAIN_DATE_FILTER_FIELDS.inventory },
    { key: "salesRoster", dateFields: DOMAIN_DATE_FILTER_FIELDS.sales },
    { key: "salesFull", dateFields: DOMAIN_DATE_FILTER_FIELDS.sales },
    { key: "loanRoster", dateFields: DOMAIN_DATE_FILTER_FIELDS.loans },
    { key: "jobFinancials", dateFields: DOMAIN_DATE_FILTER_FIELDS.financials },
    { key: "profitTracking", dateFields: DOMAIN_DATE_FILTER_FIELDS.audits },
    { key: "auditRoster", dateFields: DOMAIN_DATE_FILTER_FIELDS.audits },
    { key: "pmMaster", dateFields: DOMAIN_DATE_FILTER_FIELDS.propertyManagement },
    { key: "pmDelinquency", dateFields: DOMAIN_DATE_FILTER_FIELDS.propertyManagement },
    { key: "exceptionRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.exceptions },
    { key: "exceptionDetailRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.exceptions },
    { key: "listingAgentRows", dateFields: DOMAIN_DATE_FILTER_FIELDS.listings },
    { key: "crossDomainSummary", dateFields: DOMAIN_DATE_FILTER_FIELDS.none },
    { key: "lifecycleSummary", dateFields: DOMAIN_DATE_FILTER_FIELDS.constructionLifecycle },
    { key: "warehouseObjects", dateFields: DOMAIN_DATE_FILTER_FIELDS.warehouse },
    { key: "warehouseQuality", dateFields: DOMAIN_DATE_FILTER_FIELDS.warehouse },
  ];

  for (const { key, dateFields } of rowCollections) {
    filtered[key] = filterRowsByDashboardFilters(dashboard[key] || [], filters, dateFields);
  }

  filtered.pmStatusBreakdown = buildPmStatusBreakdown(filtered.pmMaster || []);
  filtered.pmProjectSummary = buildPmProjectSummary(filtered.pmMaster || []);

  if (hasActiveFilters) {
    filtered.summaries = {
      ...dashboard.summaries,
      inventory: {
        totalJobs: filtered.jobInventoryRows?.length || 0,
        sourceRows: filtered.fullInventoryRows?.length || dashboard.summaries?.inventory?.sourceRows || 0,
        closedExcluded: Math.max((filtered.fullInventoryRows?.length || 0) - (filtered.jobInventoryRows?.length || 0), 0),
      },
      portfolio: derivePortfolioSummary(filtered.constructionRows || []),
      sales: deriveSalesSummary(salesKpiRows(filtered)),
      loans: deriveLoansSummary(filtered.loanRoster || []),
      propertyManagement: derivePmSummary(filtered.pmMaster || [], dashboard.summaries?.propertyManagement || {}),
      exceptions: deriveExceptionsSummary(filtered.exceptionRows || []),
    };
  } else {
    filtered.summaries = dashboard.summaries;
  }

  return filtered;
}

function valueForColumn(row, column) {
  if (column.getValue) return column.getValue(row);
  return row?.[column.key];
}

function formatCell(value, format) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (format === "currency") return formatCurrency(value);
  if (format === "compactCurrency") return formatCompactCurrency(value);
  if (format === "percent") return formatPercent(value);
  if (format === "number") return formatWholeNumber(value);
  if (format === "date") return formatDate(value);
  return String(value);
}

function rowLabel(row) {
  return row?.job_id || row?.job_no || row?.unit_label || row?.property_label || row?.unit_id || row?.permit_id || row?.project_name || row?.community || "row";
}

function compactKey(value) {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

function jobKeyForRow(row) {
  return compactKey(firstPresent(row, [
    "job_id",
    "job_no",
    "contract_number",
    "lot_id",
    "job",
    "job_number",
  ]));
}

function addressKeyForRow(row) {
  const address = firstPresent(row, [
    "address",
    "site_address",
    "property_address",
    "property_label",
    "unit_label",
  ]);
  return compactKey(address).replace(/closed|leased|potentiallease/g, "");
}

function shortAddress(value) {
  const text = String(value ?? "").replace(/\*+/g, " ").replace(/\s+/g, " ").trim();
  return text || "-";
}

function searchTextForJob(job) {
  return [
    job.jobId,
    job.address,
    job.community,
    job.city,
    job.jobType,
    job.stage,
    job.buyer,
    job.tenant,
    job.saleStatus,
    job.pmStatus,
    job.saleMls,
    job.leaseMls,
    job.lender,
  ].filter(Boolean).join(" ").toLowerCase();
}

function listingLabel(row) {
  if (!row) return "-";
  const saleMls = row.sale_mls;
  const leaseMls = row.lease_mls;
  const sold = row.sold || row.closing_sold_date;
  const leased = row.leased || row.leased_date;
  const pieces = [];
  if (saleMls) pieces.push(sold ? "Sale sold" : row.under_contract ? "Sale under contract" : "Sale listed");
  if (row.listed_as_rental || leaseMls) pieces.push(leased ? "Rental leased" : "Rental listed");
  return pieces.length ? pieces.join(" / ") : "-";
}

function sourceRowSignature(row = {}) {
  const keys = [
    "job_id",
    "job_no",
    "contract_number",
    "lot_id",
    "address",
    "site_address",
    "property_address",
    "community",
    "city",
    "job_type",
    "current_stage",
    "stage_start_date",
    "days_since_last_change",
    "completion_pct",
    "wip",
    "loan_amount",
    "lender",
    "buyer_name",
    "status",
    "sale_price",
    "sold_date",
    "scheduled_closing",
    "lease_status",
    "tenant_name",
    "market_rent",
    "actual_rent",
    "past_due",
    "pl_readiness",
    "net_revenue",
    "total_cost",
    "net_margin",
    "exception_type",
    "owner_group",
    "metric_value",
    "days_outstanding",
  ];
  return keys.map((key) => `${key}:${normalizeText(row?.[key])}`).join("|");
}

function uniqueSourceRows(rows = []) {
  const seen = new Set();
  return rows.filter((row) => {
    const signature = sourceRowSignature(row);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function makeJobRecord(row = {}, source = "generic") {
  const jobId = firstPresent(row, ["job_id", "job_no", "contract_number", "lot_id", "job"]) || "-";
  const address = shortAddress(firstPresent(row, ["address", "site_address", "property_address", "property_label", "unit_label"]));
  const isBuildSource = ["inventory", "construction", "lifecycle", "financials", "loans"].includes(source);
  const isSalesSource = source === "sales";
  const isPmSource = source === "pm";
  const isListingSource = source === "listings";
  return {
    key: jobKeyForRow(row) || addressKeyForRow(row) || compactKey(`${jobId}-${address}`),
    jobId,
    address,
    community: firstPresent(row, ["community", "project_name", "subdivision"]) || "-",
    city: firstPresent(row, ["city", "project_city"]) || "-",
    jobType: firstPresent(row, ["job_type", "construction_type", "product_type"]) || "-",
    stage: isBuildSource ? firstPresent(row, ["current_stage", "construction_current_stage", "job_status"]) || "-" : "-",
    completion: isBuildSource ? firstPresent(row, ["completion_pct", "construction_completion_percentage"]) : undefined,
    wip: isBuildSource ? firstPresent(row, ["wip", "wip_without_lot"]) : undefined,
    loanAmount: isBuildSource ? firstPresent(row, ["loan_amount"]) : undefined,
    lender: firstPresent(row, ["lender", "mortgage_company"]),
    salePrice: isSalesSource || isListingSource ? firstPresent(row, ["sale_price", "sold_price", "current_price"]) : undefined,
    buyer: isSalesSource ? firstPresent(row, ["buyer_name", "buyer"]) : undefined,
    tenant: isPmSource ? firstPresent(row, ["tenant_name", "tenant"]) : undefined,
    pmStatus: isPmSource ? firstPresent(row, ["lease_status", "occupancy_status", "tenant_status", "status"]) : undefined,
    saleStatus: isSalesSource ? firstPresent(row, ["status", "sales_status"]) : undefined,
    saleMls: isListingSource ? row.sale_mls : undefined,
    leaseMls: isListingSource ? row.lease_mls : undefined,
    sources: {
      inventory: [],
      construction: [],
      lifecycle: [],
      financials: [],
      loans: [],
      sales: [],
      listings: [],
      pm: [],
      audits: [],
      exceptions: [],
    },
  };
}

function mergeJobRecord(target, row = {}, source = "generic") {
  const candidate = makeJobRecord(row, source);
  for (const key of ["jobId", "address", "community", "city", "jobType", "stage", "completion", "wip", "loanAmount", "lender", "salePrice", "buyer", "tenant", "pmStatus", "saleStatus", "saleMls", "leaseMls"]) {
    const current = target[key];
    const next = candidate[key];
    if ((current === undefined || current === null || current === "" || current === "-") && next !== undefined && next !== null && next !== "" && next !== "-") {
      target[key] = next;
    }
  }
}

function buildJobSummaryIndex(data) {
  const byKey = new Map();
  const addressToKey = new Map();

  const ensure = (row, source) => {
    const jobKey = jobKeyForRow(row);
    const addressKey = addressKeyForRow(row);
    const key = jobKey || addressToKey.get(addressKey) || addressKey;
    if (!key) return null;
    if (!byKey.has(key)) byKey.set(key, makeJobRecord(row, source));
    const record = byKey.get(key);
    mergeJobRecord(record, row, source);
    if (addressKey) addressToKey.set(addressKey, key);
    return record;
  };

  const addRows = (source, rows = []) => {
    for (const row of rows) {
      const record = ensure(row, source);
      if (record) record.sources[source].push(row);
    }
  };

  addRows("inventory", data.jobInventoryRows || data.milestonesRoster || []);
  addRows("construction", data.constructionRows || []);
  addRows("lifecycle", data.lifecycleSummary || []);
  addRows("financials", data.jobFinancials || []);
  addRows("loans", data.loanRoster || []);
  addRows("sales", [...(data.salesRoster || []), ...(data.salesFull || [])]);
  addRows("listings", data.listingAgentRows || []);
  addRows("pm", [...(data.pmMaster || []), ...(data.pmDelinquency || [])]);
  addRows("audits", [...(data.auditRoster || []), ...(data.profitTracking || [])]);
  addRows("exceptions", [...(data.exceptionRows || []), ...(data.exceptionDetailRows || [])]);

  const jobs = Array.from(byKey.values())
    .map((job) => {
      const sources = Object.fromEntries(Object.entries(job.sources).map(([source, rows]) => [source, uniqueSourceRows(rows)]));
      return {
        ...job,
        sources,
        searchText: searchTextForJob(job),
        sourceCount: uniqueSourceRows(Object.values(sources).flat()).length,
        exceptionCount: sources.exceptions.length,
      };
    })
    .sort((a, b) => {
      const aInventory = a.sources.inventory.length ? 0 : 1;
      const bInventory = b.sources.inventory.length ? 0 : 1;
      return aInventory - bInventory || String(a.jobId).localeCompare(String(b.jobId));
    });

  return { byKey, jobs };
}

function testIdFromLabel(prefix, label) {
  return `${prefix}-${normalizeText(label).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function KpiCard({ label, value, sub, tone = "default", onClick }) {
  const className = `kpi-card${onClick ? " kpi-card-clickable" : ""}${tone !== "default" ? ` kpi-${tone}` : ""}`;
  return (
    <button type="button" className={className} data-testid={testIdFromLabel("kpi", label)} onClick={onClick} disabled={!onClick}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </button>
  );
}

function Panel({ kicker, title, note, children, className = "" }) {
  return (
    <Card className={`panel ${className}`}>
      <CardHeader className="panel-header">
        {kicker ? <div className="panel-kicker">{kicker}</div> : null}
        <CardTitle className="panel-title">{title}</CardTitle>
        {note ? <CardDescription className="panel-note">{note}</CardDescription> : null}
      </CardHeader>
      <CardContent className="panel-content">{children}</CardContent>
    </Card>
  );
}

function RankedBars({ items, labelKey = "label", valueKey = "value", formatter = formatWholeNumber, onSelect }) {
  const maxValue = Math.max(...items.map((item) => safeNumber(item[valueKey])), 1);
  if (!items.length) return <div className="empty-state">No rows match this scope.</div>;
  return (
    <div className="ranked-bars">
      {items.slice(0, 12).map((item) => {
        const label = item[labelKey];
        const value = safeNumber(item[valueKey]);
        return (
          <button
            type="button"
            className="ranked-bar"
            key={label}
            onClick={() => onSelect?.(item)}
            disabled={!onSelect}
          >
            <span className="bar-label">{label}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${Math.max(2, (value / maxValue) * 100)}%` }} />
            </span>
            <span className="bar-value">{formatter(value, item)}</span>
          </button>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, onSelect }) {
  const total = segments.reduce((sum, segment) => sum + safeNumber(segment.value), 0) || 1;
  let offset = 0;
  return (
    <div className="donut-block">
      <svg className="donut-svg" viewBox="0 0 42 42" aria-hidden="true">
        <circle className="donut-bg" cx="21" cy="21" r="15.9155" />
        {segments.map((segment) => {
          const fraction = safeNumber(segment.value) / total;
          const dash = `${fraction * 100} ${100 - fraction * 100}`;
          const strokeDashoffset = 25 - offset * 100;
          offset += fraction;
          return (
            <circle
              key={segment.label}
              className="donut-segment"
              cx="21"
              cy="21"
              r="15.9155"
              stroke={segment.color}
              strokeDasharray={dash}
              strokeDashoffset={strokeDashoffset}
              onClick={() => onSelect?.(segment)}
            />
          );
        })}
        <text x="21" y="20.5" textAnchor="middle" className="donut-total">{formatWholeNumber(total)}</text>
        <text x="21" y="25.5" textAnchor="middle" className="donut-caption">rows</text>
      </svg>
      <DonutLegend segments={segments} onSelect={onSelect} />
    </div>
  );
}

function DonutLegend({ segments, onSelect }) {
  return (
    <div className="donut-legend">
      {segments.map((segment) => (
        <button
          type="button"
          className="donut-legend-row"
          key={segment.label}
          onClick={() => onSelect?.(segment)}
          disabled={!onSelect}
        >
          <span className="donut-swatch" style={{ background: segment.color }} />
          <span className="donut-label">{segment.label}</span>
          <span className="donut-value">{formatWholeNumber(segment.value)}</span>
        </button>
      ))}
    </div>
  );
}

function Histogram({ buckets, onSelect }) {
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1);
  return (
    <div className="histogram">
      {buckets.map((bucket) => (
        <button
          type="button"
          className="histogram-bar"
          key={bucket.label}
          onClick={() => onSelect?.(bucket)}
          disabled={!onSelect}
        >
          <span className="histogram-fill" style={{ height: `${Math.max(4, (bucket.count / max) * 100)}%`, background: bucket.color }} />
          <span className="histogram-count">{formatWholeNumber(bucket.count)}</span>
          <span className="histogram-label">{bucket.label}</span>
        </button>
      ))}
    </div>
  );
}

function SpreadsheetTable({ title, note, rows, columns, onRowClick, maxRows = 250, kicker = "Pipeline" }) {
  const [columnFilters, setColumnFilters] = useState({});
  const [page, setPage] = useState(0);
  const visibleRows = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, value]) => value);
    if (!activeFilters.length) return rows;
    return rows.filter((row) =>
      activeFilters.every(([key, value]) => {
        const column = columns.find((item) => item.key === key);
        const raw = valueForColumn(row, column || { key });
        return normalizeText(raw).includes(normalizeText(value));
      })
    );
  }, [columnFilters, columns, rows]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / maxRows));
  const safePage = Math.min(page, totalPages - 1);
  const startRow = safePage * maxRows;
  const displayedRows = visibleRows.slice(startRow, startRow + maxRows);
  const firstVisible = visibleRows.length ? startRow + 1 : 0;
  const lastVisible = Math.min(startRow + displayedRows.length, visibleRows.length);

  return (
    <section className="spreadsheet-panel">
      <div className="spreadsheet-toolbar">
        <div>
          <div className="panel-kicker">{kicker}</div>
          <div className="panel-title">{title}</div>
          {note ? <div className="panel-note">{note}</div> : null}
        </div>
        <div className="spreadsheet-actions">
          <div className="spreadsheet-count">
            {formatWholeNumber(firstVisible)}-{formatWholeNumber(lastVisible)} of {formatWholeNumber(visibleRows.length)}
          </div>
          {visibleRows.length > maxRows ? (
            <div className="spreadsheet-pager" aria-label={`${title} pagination`}>
              <button type="button" onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0}>Prev</button>
              <span>{safePage + 1}/{totalPages}</span>
              <button type="button" onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))} disabled={safePage >= totalPages - 1}>Next</button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="spreadsheet-wrap">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={column.key} className={index === 0 ? "frozen-col" : ""} title={column.label}>
                  {column.label}
                </th>
              ))}
            </tr>
            <tr className="spreadsheet-filters">
              {columns.map((column, index) => (
                <th key={`${column.key}-filter`} className={index === 0 ? "frozen-col" : ""}>
                  <input
                    aria-label={`Filter ${column.label}`}
                    value={columnFilters[column.key] || ""}
                    onChange={(event) => {
                      setPage(0);
                      setColumnFilters((current) => ({ ...current, [column.key]: event.target.value }));
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row, rowIndex) => (
              <tr key={`${rowLabel(row)}-${rowIndex}`} onClick={() => onRowClick?.(row)} className={onRowClick ? "interactive-row" : ""}>
                {columns.map((column, columnIndex) => {
                  const raw = valueForColumn(row, column);
                  const value = formatCell(raw, column.format);
                  return (
                    <td
                      key={column.key}
                      className={`${column.align === "right" ? "text-right" : ""} ${columnIndex === 0 ? "frozen-col" : ""}`}
                      title={value}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!displayedRows.length ? (
              <tr>
                <td colSpan={columns.length} className="empty-cell">No rows match this scope.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DrilldownDrawer({ drilldown, onClose }) {
  if (!drilldown) return null;
  const rows = drilldown.rows || [];
  const columns = (drilldown.columns || DEFAULT_DRILL_COLUMNS).filter((column) =>
    rows.length ? rows.some((row) => valueForColumn(row, column) !== undefined && valueForColumn(row, column) !== null && valueForColumn(row, column) !== "") : true
  ).slice(0, 10);
  const filters = drilldown.filters || {};
  const filterText = Object.entries(filters).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(" | ") || "All";

  return (
    <div className="drawer-backdrop">
      <aside className="drawer-overlay" aria-label="Drilldown rows">
        <button type="button" className="drawer-close" onClick={onClose}>Close</button>
        <div className="drawer-kicker">{drilldown.domain}</div>
        <h3>{drilldown.metric}</h3>
        <div className="drawer-meta-grid">
          <div><span>Date basis</span><strong>{drilldown.dateBasis || "Source row basis"}</strong></div>
          <div><span>Filters</span><strong>{filterText}</strong></div>
          <div><span>Row scope</span><strong>{drilldown.rowScope || "Scoped source rows"}</strong></div>
          <div><span>Rows</span><strong>{formatWholeNumber(rows.length)}</strong></div>
        </div>
        {drilldown.note ? <p className="drawer-note">{drilldown.note}</p> : null}
        <SpreadsheetTable
          title="Scoped Rows"
          note={rows.length ? "Exact rows backing the selected metric." : "No source rows match this metric and filter scope."}
          rows={rows}
          columns={columns.length ? columns : DEFAULT_DRILL_COLUMNS.slice(0, 6)}
          maxRows={500}
        />
      </aside>
    </div>
  );
}

function FilterBar({ filters, setFilters, filterOptions }) {
  const hasActiveFilters = Boolean(filters.city || filters.community || filters.areaName || filters.jobType || filters.year || filters.quarter || filters.month);
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value === "__all" ? null : value }));
  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const clearFilter = (key) => setFilters((current) => ({ ...current, [key]: null }));

  const options = [
    { key: "city", label: "City", values: filterOptions?.cities || [] },
    { key: "community", label: "Community", values: filterOptions?.communities || [] },
    { key: "areaName", label: "Entity", values: filterOptions?.areaNames || [] },
    { key: "jobType", label: "Job Type", values: filterOptions?.jobTypes || [] },
    { key: "year", label: "Year", values: filterOptions?.years || [] },
    { key: "quarter", label: "Quarter", values: filterOptions?.quarters || [] },
    { key: "month", label: "Month", values: filterOptions?.months || [] },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-bar-inner">
        {options.map((option) => (
          <label className="filter-dropdown" key={option.key}>
            <span className="filter-dropdown-label">{option.label}</span>
            <select
              className={`filter-select ${filters[option.key] ? "active" : ""}`}
              value={optionValue(filters[option.key])}
              onChange={(event) => updateFilter(option.key, event.target.value)}
            >
              <option value="__all">All</option>
              {option.values.map((value) => <option key={value} value={value}>{option.key === "month" ? MONTH_LABELS[value] || value : value}</option>)}
            </select>
          </label>
        ))}
      </div>
      {hasActiveFilters ? (
        <div className="filter-actions">
          <div className="filter-chips">
            {options.filter((option) => filters[option.key]).map((option) => (
              <button type="button" className="filter-chip" key={option.key} onClick={() => clearFilter(option.key)}>
                <span>{option.label}</span>
                <strong>{option.key === "month" ? MONTH_LABELS[filters[option.key]] || filters[option.key] : filters[option.key]}</strong>
                <em>Clear</em>
              </button>
            ))}
          </div>
          <button type="button" className="filter-clear" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : null}
    </div>
  );
}

function MobileNav({ sections, activeTab, setActiveTab }) {
  return (
    <nav className="mobile-nav" aria-label="Dashboard sections">
      {sections.map((section) => (
        <div className="mobile-nav-section" key={section.label}>
          <div className="mobile-nav-label">{section.label}</div>
          <div className="mobile-nav-tabs">
            {section.tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`mobile-nav-tab ${activeTab === tab.id ? "active" : ""}`}
                aria-label={`${section.label} ${tab.label}`}
                data-testid={`mobile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function QualityScore({ qualityChecks }) {
  if (!qualityChecks?.length) return null;
  const average = qualityChecks.reduce((sum, check) => sum + safeNumber(check.coverage), 0) / qualityChecks.length;
  const tone = average >= 0.9 ? "good" : average >= 0.65 ? "watch" : "alert";
  return (
    <section className="quality-strip">
      <div>
        <div className="panel-kicker">Data Quality</div>
        <div className={`quality-score text-${tone === "good" ? "accent" : tone === "watch" ? "warning" : "danger"}`}>{formatPercent(average)}</div>
      </div>
      <div className="quality-checks">
        {qualityChecks.slice(0, 5).map((check) => (
          <div className="quality-check" key={check.label}>
            <span>{check.label}</span>
            <strong>{formatPercent(check.coverage)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function DataContextStrip({ data, dashboard }) {
  const freshness = dashboard.dataFreshness || {};
  const staleSources = [
    freshness.martIsStale ? "Mart stale" : null,
    freshness.pmSnapshotIsStale ? "PM stale" : null,
  ].filter(Boolean);
  const items = [
    { label: "Open Inventory", shown: data.jobInventoryRows?.length ?? 0, total: dashboard.jobInventoryRows?.length ?? 0 },
    { label: "Source Rows", shown: data.fullInventoryRows?.length ?? data.milestonesRoster?.length ?? 0, total: dashboard.fullInventoryRows?.length ?? dashboard.milestonesRoster?.length ?? 0 },
    { label: "Build/CO", shown: data.constructionRows?.length || 0, total: dashboard.constructionRows?.length || 0 },
    { label: "Sales", shown: salesKpiRows(data).length, total: salesKpiRows(dashboard).length },
    { label: "PM Units", shown: data.pmMaster?.length || 0, total: dashboard.pmMaster?.length || 0 },
    { label: "Exceptions", shown: data.exceptionRows?.length || 0, total: dashboard.exceptionRows?.length || 0 },
  ];
  const martAsOf = freshness.martRefreshAt;
  const pmAsOf = freshness.pmSnapshotRefreshAt || data.summaries?.propertyManagement?.snapshotAt;
  return (
    <section className="data-context-strip">
      <span>{freshness.sourceLabel || "BigQuery Snapshot"}</span>
      {staleSources.length ? <span className="text-warning">{staleSources.join(" / ")}</span> : null}
      {martAsOf ? <span>Mart {formatDate(martAsOf)}</span> : null}
      {pmAsOf ? <span>PM {formatDate(pmAsOf)}</span> : null}
      {items.map((item) => (
        <strong key={item.label}>{item.label}: {formatWholeNumber(item.shown)} of {formatWholeNumber(item.total)}</strong>
      ))}
    </section>
  );
}

function AuditNotes({ notes }) {
  if (!notes?.length) return null;
  return (
    <details className="audit-notes">
      <summary>
        <span>Snapshot notes</span>
        <strong>{notes.length} caveats</strong>
      </summary>
      <div className="audit-notes-body">
        {notes.map((note, index) => <p key={`${note}-${index}`}>{note}</p>)}
      </div>
    </details>
  );
}

function openRows(openDrilldown, filters, payload) {
  openDrilldown({ ...payload, filters });
}

function DetailField({ label, value, format }) {
  return (
    <div className="job-detail-field">
      <span>{label}</span>
      <strong>{formatCell(value, format)}</strong>
    </div>
  );
}

function SourceTable({ title, note, rows, columns, openDrilldown, filters }) {
  if (!rows.length) return null;
  return (
    <SpreadsheetTable
      title={title}
      note={note}
      rows={rows}
      columns={columns}
      maxRows={50}
      kicker="Source Rows"
      onRowClick={(row) => openRows(openDrilldown, filters, {
        domain: "Job Summary",
        metric: `${title} - ${rowLabel(row)}`,
        dateBasis: "Matched job source row",
        rowScope: "Single source row",
        rows: [row],
      })}
    />
  );
}

function JobSummaryTab({ data, filters, openDrilldown }) {
  const index = useMemo(() => buildJobSummaryIndex(data), [data]);
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState("");

  const matches = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return index.jobs.slice(0, 40);
    return index.jobs.filter((job) => job.searchText.includes(q)).slice(0, 40);
  }, [index.jobs, query]);

  const selectedFromKey = index.byKey.get(selectedKey);
  const selectedJob = selectedFromKey && matches.some((job) => job.key === selectedKey)
    ? selectedFromKey
    : matches[0] || null;
  const selectedListing = selectedJob?.sources.listings?.[0];
  const selectedPm = selectedJob?.sources.pm?.[0];
  const selectedAudit = selectedJob?.sources.audits?.[0];
  const selectedLifecycle = selectedJob?.sources.lifecycle?.[0];
  const selectedInventory = selectedJob?.sources.inventory?.[0] || selectedJob?.sources.construction?.[0];
  const constructionSourceRows = selectedJob ? uniqueSourceRows([...selectedJob.sources.inventory, ...selectedJob.sources.construction]) : [];
  const financialSourceRows = selectedJob ? uniqueSourceRows([...selectedJob.sources.financials, ...selectedJob.sources.inventory]) : [];
  const salesListingSourceRows = selectedJob ? uniqueSourceRows([...selectedJob.sources.sales, ...selectedJob.sources.listings]) : [];
  const selectedSourceCount = selectedJob ? uniqueSourceRows(Object.values(selectedJob.sources).flat()).length : 0;
  const selectedExceptionCount = selectedJob ? selectedJob.sources.exceptions.length : 0;
  const listedState = listingLabel(selectedListing);
  const hasSelected = Boolean(selectedJob);

  const inventoryColumns = [
    { key: "job_id", label: "Job" },
    { key: "address", label: "Address" },
    { key: "community", label: "Community" },
    { key: "job_type", label: "Job Type" },
    { key: "current_stage", label: "Stage" },
    { key: "completion_pct", label: "Completion", format: "percent" },
    { key: "wip", label: "WIP", format: "currency" },
    { key: "loan_amount", label: "Loan", format: "currency" },
    { key: "lender", label: "Lender" },
  ];
  const lifecycleColumns = [
    { key: "job_id", label: "Job" },
    { key: "current_stage", label: "Stage" },
    { key: "stage_start_date", label: "Stage Start", format: "date" },
    { key: "days_since_last_change", label: "Days Since Move", format: "number" },
    { key: "target_close_date", label: "Target Close", format: "date" },
    { key: "completion_pct", label: "Completion", format: "percent" },
  ];
  const salesColumns = [
    { key: "job_id", label: "Job" },
    { key: "buyer_name", label: "Buyer" },
    { key: "status", label: "Status" },
    { key: "sale_price", label: "Sale Price", format: "currency" },
    { key: "sold_date", label: "Sold Date", format: "date" },
    { key: "scheduled_closing", label: "Projected Close", format: "date" },
    { key: "mortgage_company", label: "Mortgage" },
  ];
  const listingColumns = [
    { key: "job_id", label: "Job" },
    { key: "site_address", label: "Listing Address" },
    { key: "sale_mls", label: "Sale MLS" },
    { key: "sale_listed_date", label: "Sale Live", format: "date" },
    { key: "dom", label: "DOM", format: "number" },
    { key: "current_price", label: "Price", format: "currency" },
    { key: "lease_mls", label: "Lease MLS" },
    { key: "listed_as_rental", label: "Rental", format: "boolean" },
  ];
  const pmColumns = [
    { key: "job_no", label: "Job" },
    { key: "property_address", label: "Property" },
    { key: "lease_status", label: "PM Status" },
    { key: "tenant_name", label: "Tenant" },
    { key: "market_rent", label: "Market Rent", format: "currency" },
    { key: "actual_rent", label: "Actual Rent", format: "currency" },
    { key: "past_due", label: "Past Due", format: "currency" },
    { key: "lease_to", label: "Lease To", format: "date" },
  ];
  const auditColumns = [
    { key: "job_id", label: "Job" },
    { key: "pl_readiness", label: "P&L Readiness" },
    { key: "net_revenue", label: "Revenue", format: "currency" },
    { key: "total_cost", label: "Total Cost", format: "currency" },
    { key: "net_profit", label: "Net Profit", format: "currency" },
    { key: "net_margin", label: "Margin", format: "percent" },
    { key: "data_quality_flag", label: "Data Quality" },
  ];
  const exceptionColumns = [
    { key: "priority", label: "Priority" },
    { key: "exception_type", label: "Exception" },
    { key: "owner_group", label: "Owner" },
    { key: "job_no", label: "Job" },
    { key: "metric_value", label: "Metric", format: "number" },
    { key: "days_outstanding", label: "Days", format: "number" },
  ];

  const selectTopMatch = () => {
    if (matches[0]) setSelectedKey(matches[0].key);
  };

  return (
    <>
      <div className="tab-header job-summary-header">
        <div>
          <div className="kicker">Job Summary</div>
          <h2>Single Job Lookup</h2>
          <p className="description">Search by job number, address, buyer, tenant, MLS, community, or lender to see every matched source row in one place.</p>
        </div>
        <div className="job-summary-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") selectTopMatch();
            }}
            placeholder="Search job, address, buyer, tenant, MLS..."
            aria-label="Search jobs"
          />
          <button type="button" onClick={selectTopMatch} disabled={!matches.length}>Open</button>
        </div>
      </div>

      <div className="job-summary-grid">
        <aside className="job-results-panel">
          <div className="job-results-head">
            <span>{formatWholeNumber(matches.length)} matches</span>
            <strong>{formatWholeNumber(index.jobs.length)} searchable records</strong>
          </div>
          <div className="job-results-list">
            {matches.map((job) => (
              <button
                type="button"
                key={job.key}
                className={`job-result ${selectedJob?.key === job.key ? "active" : ""}`}
                onClick={() => setSelectedKey(job.key)}
              >
                <strong>{job.jobId}</strong>
                <span>{job.address}</span>
                <em>{job.city} | {job.jobType}</em>
              </button>
            ))}
            {!matches.length ? <div className="empty-state">No matching jobs found.</div> : null}
          </div>
        </aside>

        <section className="job-summary-main">
          {hasSelected ? (
            <>
              <div className="job-hero">
                <div>
                  <div className="panel-kicker">Selected Job</div>
                  <h3>{selectedJob.jobId}</h3>
                  <p>{selectedJob.address}</p>
                </div>
                <div className="job-hero-meta">
                  <span>{selectedJob.city}</span>
                  <span>{selectedJob.community}</span>
                  <span>{selectedJob.jobType}</span>
                </div>
              </div>

              <div className="kpi-row job-kpis">
                <KpiCard label="Completion" value={formatCell(selectedJob.completion, "percent")} sub={selectedJob.stage} onClick={() => openRows(openDrilldown, filters, { domain: "Job Summary", metric: `${selectedJob.jobId} construction`, rowScope: "Construction/inventory source rows", rows: constructionSourceRows })} />
                <KpiCard label="WIP" value={formatCell(selectedJob.wip, "compactCurrency")} sub="Current inventory WIP" onClick={() => openRows(openDrilldown, filters, { domain: "Job Summary", metric: `${selectedJob.jobId} WIP`, rowScope: "Financial source rows", rows: financialSourceRows })} />
                <KpiCard label="Loan" value={formatCell(selectedJob.loanAmount, "compactCurrency")} sub={selectedJob.lender || "Lender not populated"} onClick={() => openRows(openDrilldown, filters, { domain: "Job Summary", metric: `${selectedJob.jobId} loan`, rowScope: "Loan rows", rows: selectedJob.sources.loans })} />
                <KpiCard label="Sale / Listing" value={listedState} sub={selectedJob.salePrice ? formatCurrency(selectedJob.salePrice) : "No sale price"} onClick={() => openRows(openDrilldown, filters, { domain: "Job Summary", metric: `${selectedJob.jobId} sales and listings`, rowScope: "Sales + listing rows", rows: salesListingSourceRows })} />
                <KpiCard label="PM Status" value={selectedJob.pmStatus || "-"} sub={selectedJob.sources.pm.length ? selectedJob.tenant || "No tenant on PM rows" : "No PM rows matched"} onClick={() => openRows(openDrilldown, filters, { domain: "Job Summary", metric: `${selectedJob.jobId} property management`, rowScope: "PM rows", rows: selectedJob.sources.pm })} />
                <KpiCard label="Exceptions" value={formatWholeNumber(selectedExceptionCount)} tone={selectedExceptionCount ? "warning" : "default"} sub={`${formatWholeNumber(selectedSourceCount)} total source rows`} onClick={() => openRows(openDrilldown, filters, { domain: "Job Summary", metric: `${selectedJob.jobId} exceptions`, rowScope: "Exception rows", rows: selectedJob.sources.exceptions })} />
              </div>

              <div className="panels-row">
                <Panel kicker="Construction" title="Current Build Status" note="Inventory, milestone, and lifecycle fields">
                  <div className="job-detail-grid">
                    <DetailField label="Stage" value={selectedJob.stage} />
                    <DetailField label="Days Since Last Milestone" value={selectedLifecycle?.days_since_last_change} format="number" />
                    <DetailField label="Stage Start" value={selectedLifecycle?.stage_start_date} format="date" />
                    <DetailField label="Released" value={selectedInventory?.released_to_construction_date} format="date" />
                    <DetailField label="CO Received" value={selectedInventory?.receive_co_date} format="date" />
                    <DetailField label="Superintendent" value={selectedInventory?.superintendent || selectedLifecycle?.superintendent} />
                  </div>
                </Panel>
                <Panel kicker="Financial" title="Cost, Loan, and P&L" note="Sparse fields show as blank when not available">
                  <div className="job-detail-grid">
                    <DetailField label="WIP" value={selectedJob.wip} format="currency" />
                    <DetailField label="Loan Amount" value={selectedJob.loanAmount} format="currency" />
                    <DetailField label="Drawn" value={selectedInventory?.total_drawn} format="currency" />
                    <DetailField label="Net Revenue" value={selectedAudit?.net_revenue} format="currency" />
                    <DetailField label="Total Cost" value={selectedAudit?.total_cost} format="currency" />
                    <DetailField label="Net Margin" value={selectedAudit?.net_margin} format="percent" />
                  </div>
                </Panel>
              </div>

              <div className="panels-row">
                <Panel kicker="Sales / Listing" title="Market Activity" note="Sales rows plus listing-agent feed">
                  <div className="job-detail-grid">
                    <DetailField label="Buyer" value={selectedJob.buyer} />
                    <DetailField label="Sales Status" value={selectedJob.saleStatus} />
                    <DetailField label="Sale Price" value={selectedJob.salePrice} format="currency" />
                    <DetailField label="Sale MLS" value={selectedListing?.sale_mls} />
                    <DetailField label="Sale Live Date" value={selectedListing?.sale_listed_date} format="date" />
                    <DetailField label="DOM" value={selectedListing?.dom} format="number" />
                    <DetailField label="Lease MLS" value={selectedListing?.lease_mls} />
                  </div>
                </Panel>
                <Panel kicker="Property Management" title="Rental Status" note="Snapshot-backed PM rows">
                  <div className="job-detail-grid">
                    <DetailField label="PM Status" value={selectedPm?.lease_status || selectedPm?.occupancy_status || selectedJob.pmStatus} />
                    <DetailField label="Tenant" value={selectedPm?.tenant_name || selectedJob.tenant} />
                    <DetailField label="Market Rent" value={selectedPm?.market_rent} format="currency" />
                    <DetailField label="Actual Rent" value={selectedPm?.actual_rent || selectedPm?.monthly_rent} format="currency" />
                    <DetailField label="Past Due" value={selectedPm?.past_due || selectedPm?.amount_receivable} format="currency" />
                    <DetailField label="Lease To" value={selectedPm?.lease_to} format="date" />
                  </div>
                </Panel>
              </div>

              <SourceTable title="Construction Source Rows" note="Inventory and construction rows matched to this job." rows={constructionSourceRows} columns={inventoryColumns} openDrilldown={openDrilldown} filters={filters} />
              <SourceTable title="Lifecycle Rows" note="Schedule/milestone timing rows for this job." rows={selectedJob.sources.lifecycle} columns={lifecycleColumns} openDrilldown={openDrilldown} filters={filters} />
              <SourceTable title="Sales Rows" note="Sales roster rows matched by job id." rows={selectedJob.sources.sales} columns={salesColumns} openDrilldown={openDrilldown} filters={filters} />
              <SourceTable title="Listing Agent Rows" note="Listing sheet rows matched by job id or address." rows={selectedJob.sources.listings} columns={listingColumns} openDrilldown={openDrilldown} filters={filters} />
              <SourceTable title="Property Management Rows" note="PM snapshot and delinquency rows matched to this job." rows={selectedJob.sources.pm} columns={pmColumns} openDrilldown={openDrilldown} filters={filters} />
              <SourceTable title="P&L Audit Rows" note="Audit mart rows for this job." rows={selectedJob.sources.audits} columns={auditColumns} openDrilldown={openDrilldown} filters={filters} />
              <SourceTable title="Exception Rows" note="Warehouse exception rows for this job." rows={selectedJob.sources.exceptions} columns={exceptionColumns} openDrilldown={openDrilldown} filters={filters} />
            </>
          ) : (
            <div className="empty-state job-empty">Search for a job to see the full operational summary.</div>
          )}
        </section>
      </div>
    </>
  );
}

function ConstructionDashTab({ data, filters, openDrilldown }) {
  const jobs = data.constructionRows || [];
  const p = data.summaries?.portfolio || derivePortfolioSummary(jobs);
  const activeRows = activeConstructionRows(jobs);
  const coRows = coedNotClosedRows(jobs);
  const wipRows = jobs.filter((row) => safeNumber(row.wip) > 0).sort((a, b) => safeNumber(b.wip) - safeNumber(a.wip));
  const completionRows = jobs.filter((row) => nullableNumber(row.completion_pct) !== null);
  const missingCompletionRows = jobs.filter((row) => nullableNumber(row.completion_pct) === null);
  const cycleRows = rowsWithValue(jobs, "start_to_completion_days");
  const avgCycleDays = averageRows(cycleRows, "start_to_completion_days");
  const budgetRows = rowsWithValue(jobs, "original_budget");

  const buckets = [
    { label: "0-24%", min: 0, max: 0.249, color: "var(--danger)" },
    { label: "25-49%", min: 0.25, max: 0.499, color: "var(--warning)" },
    { label: "50-74%", min: 0.5, max: 0.749, color: "var(--color-accent)" },
    { label: "75-99%", min: 0.75, max: 0.999, color: "var(--accent)" },
    { label: "100%", min: 1, max: 100, color: "var(--accent)" },
  ].map((bucket) => {
    const rows = jobs.filter((row) => {
      const completion = nullableNumber(row.completion_pct);
      if (completion === null) return false;
      return completion >= bucket.min && completion <= bucket.max;
    });
    return { ...bucket, count: rows.length, rows };
  });

  const typeSegments = topSegments(jobs, "job_type", { limit: 5 });

  const communityBars = groupRows(jobs, "community").slice(0, 10);
  const superintendentBars = groupRows(activeRows, "superintendent").slice(0, 10);

  return (
    <>
      <div className="tab-header">
        <div className="kicker">Construction Dashboard</div>
        <h2>Active Build / CO Scope</h2>
        <p className="description">Construction KPIs use active build and CO-not-closed rows only. Date filters use construction milestone, stage, CO, and closeout dates.</p>
      </div>
      <div className="kpi-row">
        <KpiCard label="Build / CO Rows" value={formatWholeNumber(p.totalJobs)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Build / CO Rows", dateBasis: "Current job_type", rowScope: CONSTRUCTION_SCOPE_TYPES.join(", "), rows: jobs })} />
        <KpiCard label="Active Construction" value={formatWholeNumber(p.activeConstruction)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Active Construction", dateBasis: "Current job_type", rowScope: ACTIVE_CONSTRUCTION_TYPES.join(", "), rows: activeRows })} />
        <KpiCard label="CO'ed Not Closed" value={formatWholeNumber(p.coedNotClosed)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "CO'ed Not Closed", dateBasis: "Current job_type", rowScope: "SFR Completed (not closed)", rows: coRows })} />
        <KpiCard label="Avg Milestone Completion" value={formatPercent(p.avgCompletion)} sub={`${formatWholeNumber(completionRows.length)} rows with completion_pct`} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Avg Milestone Completion", dateBasis: "Current completion_pct", rowScope: "Rows with populated completion_pct", rows: completionRows, note: "Completion percentage is partial and depends on source field population. Drilldown rows include the current stage label." })} />
        <KpiCard label="WIP" value={formatCompactCurrency(p.totalWip)} sub="Current WIP; cost coverage partial" onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "WIP", dateBasis: "Current cost ledger", rowScope: "Rows with WIP greater than zero", rows: wipRows, note: "WIP and budget/actual are partial until cost source coverage is complete." })} />
        <KpiCard label="Avg Cycle Days" value={formatWholeNumber(avgCycleDays)} sub="start_to_completion_days rows" onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Avg Cycle Days", dateBasis: "start_to_completion_days", rowScope: "Rows with cycle-time values", rows: cycleRows })} />
        <KpiCard label="Budget Rows" value={formatWholeNumber(budgetRows.length)} sub="original_budget populated" onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Budget Rows", dateBasis: "Cost source fields", rowScope: "Rows with original_budget populated", rows: budgetRows })} />
        <KpiCard label="Missing Completion" value={formatWholeNumber(missingCompletionRows.length)} tone={missingCompletionRows.length ? "warning" : "default"} sub="completion_pct missing" onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Missing Completion", dateBasis: "completion_pct", rowScope: "Rows without completion_pct", rows: missingCompletionRows, note: "These rows are excluded from average milestone completion until the source is populated." })} />
      </div>

      <div className="panels-row">
        <Panel kicker="Distribution" title="Completion Histogram" note="Click a bucket for source rows">
          <Histogram buckets={buckets} onSelect={(bucket) => openRows(openDrilldown, filters, { domain: "Construction", metric: `Completion ${bucket.label}`, dateBasis: "Current completion_pct", rowScope: bucket.label, rows: bucket.rows })} />
        </Panel>
        <Panel kicker="Mix" title="Jobs by Type" note="Click a segment for exact job rows">
          <DonutChart segments={typeSegments} onSelect={(segment) => openRows(openDrilldown, filters, { domain: "Construction", metric: `Job Type: ${segment.label}`, dateBasis: "Current job_type", rowScope: segment.label, rows: segment.rows })} />
        </Panel>
      </div>

      <div className="panels-row">
        <Panel kicker="Roster" title="Top Communities" note="Filtered by global controls where fields exist">
          <RankedBars items={communityBars} labelKey="label" valueKey="count" onSelect={(item) => openRows(openDrilldown, filters, { domain: "Construction", metric: `Community: ${item.label}`, dateBasis: "Current community", rowScope: item.label, rows: item.rows })} />
        </Panel>
        <Panel kicker="Assignment" title="Superintendent Workload" note="Partial KPI: superintendent assignment has source gaps">
          <RankedBars items={superintendentBars} labelKey="label" valueKey="count" onSelect={(item) => openRows(openDrilldown, filters, { domain: "Construction", metric: `Superintendent: ${item.label}`, dateBasis: "Current assignment", rowScope: item.label, rows: item.rows, note: "Superintendent assignment is a partial KPI until source population improves." })} />
        </Panel>
      </div>
    </>
  );
}

function ConstructionPipelineTab({ data, filters, openDrilldown }) {
  const columns = [
    { key: "job_id", label: "Job" },
    { key: "address", label: "Address" },
    { key: "community", label: "Community" },
    { key: "city", label: "City" },
    { key: "company_name", label: "Company" },
    { key: "division_name", label: "Division" },
    { key: "job_type", label: "Job Type" },
    { key: "job_status", label: "Job Status" },
    { key: "current_stage", label: "Stage" },
    { key: "current_stage_code", label: "Stage Code", format: "number", align: "right" },
    { key: "completion_pct", label: "Completion", format: "percent", align: "right" },
    { key: "superintendent", label: "Super" },
    { key: "project_manager", label: "PM" },
    { key: "plan_name", label: "Plan" },
    { key: "lot", label: "Lot" },
    { key: "block", label: "Block" },
    { key: "section", label: "Section" },
    { key: "job_start", label: "Start", format: "date" },
    { key: "permit_issued_date", label: "Permit", format: "date" },
    { key: "released_to_construction_date", label: "Released", format: "date" },
    { key: "receive_co_date", label: "CO", format: "date" },
    { key: "closed_date", label: "Closed", format: "date" },
    { key: "start_to_completion_days", label: "Cycle Days", format: "number", align: "right" },
    { key: "original_budget", label: "Budget", format: "currency", align: "right" },
    { key: "job_cost_amount", label: "Actual", format: "currency", align: "right" },
    { key: "variance_in_flight", label: "Variance", format: "currency", align: "right" },
    { key: "lot_cost", label: "Lot Cost", format: "currency", align: "right" },
    { key: "wip_without_lot", label: "WIP ex Lot", format: "currency", align: "right" },
    { key: "wip", label: "WIP", format: "currency", align: "right" },
    { key: "lender", label: "Lender" },
  ];
  return (
    <SpreadsheetTable
      title="Construction Pipeline"
      note="Active build / CO scope only. Lot, permitting-only, closed, and PM rows are excluded."
      rows={data.constructionRows || []}
      columns={columns}
      maxRows={700}
      onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Construction", metric: `Job ${rowLabel(row)}`, dateBasis: "Current construction row", rowScope: "Pipeline row", rows: [row] })}
    />
  );
}

function ConstructionCycleTab({ data, filters, openDrilldown }) {
  const rows = (data.lifecycleSummary || []).filter((row) =>
    row.job_id &&
    (row.current_stage ||
      row.stage_start_date ||
      row.start_date ||
      row.target_close_date ||
      row.actual_close_date ||
      row.released_to_construction_date ||
      row.receive_co_date ||
      nullableNumber(row.completion_pct) !== null)
  );
  const stale = rows.filter((row) => safeNumber(row.days_in_stage) > 45 || safeNumber(row.days_since_last_change) > 30);
  const scheduledToClose = rows.filter((row) => {
    const date = dateForDisplay(row.target_close_date);
    if (!date) return false;
    const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
    return days >= 0 && days <= 30;
  });
  const avgDaysInStage = averageRows(rows, "days_in_stage");
  const columns = [
    { key: "job_id", label: "Job" },
    { key: "community", label: "Community" },
    { key: "city", label: "City" },
    { key: "job_type", label: "Job Type" },
    { key: "plan_name", label: "Plan" },
    { key: "superintendent", label: "Super" },
    { key: "current_stage", label: "Stage" },
    { key: "start_date", label: "Start", format: "date" },
    { key: "stage_start_date", label: "Stage Start", format: "date" },
    { key: "target_close_date", label: "Target Close", format: "date" },
    { key: "actual_close_date", label: "Actual Close", format: "date" },
    { key: "completion_pct", label: "Completion", format: "percent", align: "right" },
    { key: "days_in_stage", label: "Days in Stage", format: "number", align: "right" },
    { key: "days_since_last_change", label: "Idle Days", format: "number", align: "right" },
  ];
  return (
    <>
      <div className="kpi-row">
        <KpiCard label="Lifecycle Rows" value={formatWholeNumber(rows.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Lifecycle Rows", dateBasis: "Lifecycle mart", rowScope: "All lifecycle summary rows", rows })} />
        <KpiCard label="Stale Jobs" value={formatWholeNumber(stale.length)} tone={stale.length ? "danger" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Stale Jobs", dateBasis: "Lifecycle mart", rowScope: "Days in stage > 45 or idle > 30", rows: stale })} />
        <KpiCard label="Avg Days in Stage" value={formatWholeNumber(avgDaysInStage)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Avg Days in Stage", dateBasis: "stage_start_date", rowScope: "Rows with days in stage", rows })} />
        <KpiCard label="Target Close 30d" value={formatWholeNumber(scheduledToClose.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Target Close 30 Days", dateBasis: "target_close_date", rowScope: "Target close date within next 30 days", rows: scheduledToClose })} />
      </div>
      <SpreadsheetTable title="Construction Lifecycle" note={rows.length ? "Job-level lifecycle rows from schedule and milestone sources." : "No lifecycle rows have usable schedule or milestone dates in this snapshot."} rows={rows} columns={columns} onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Construction", metric: `Lifecycle ${rowLabel(row)}`, dateBasis: "Lifecycle mart", rowScope: "Lifecycle row", rows: [row] })} />
    </>
  );
}

function ConstructionCostTab({ data, filters, openDrilldown }) {
  const rows = (data.jobFinancials || [])
    .map((row) => ({
      ...row,
      budget_variance_actual: nullableNumber(row.job_cost_amount) !== null && nullableNumber(row.original_budget) !== null
        ? safeNumber(row.job_cost_amount) - safeNumber(row.original_budget)
        : null,
    }))
    .sort((a, b) => safeNumber(b.budget_variance_actual ?? b.variance_in_flight) - safeNumber(a.budget_variance_actual ?? a.variance_in_flight));
  const comparableRows = rows.filter((row) => nullableNumber(row.original_budget) !== null && nullableNumber(row.job_cost_amount) !== null);
  const overBudget = comparableRows.filter((row) => safeNumber(row.job_cost_amount) > safeNumber(row.original_budget));
  const underBudget = comparableRows.filter((row) => safeNumber(row.job_cost_amount) <= safeNumber(row.original_budget));
  const withLotCost = rows.filter((row) => safeNumber(row.lot_cost) > 0);
  const totalBudget = sumRows(rows, "original_budget");
  const totalActual = sumRows(rows, "job_cost_amount");
  const totalVariance = comparableRows.reduce((sum, row) => sum + safeNumber(row.budget_variance_actual), 0);
  const totalWip = sumRows(rows, "wip");
  const columns = [
    { key: "job_id", label: "Job" },
    { key: "community", label: "Community" },
    { key: "city", label: "City" },
    { key: "job_type", label: "Job Type" },
    { key: "current_stage", label: "Stage" },
    { key: "completion_pct", label: "Completion", format: "percent", align: "right" },
    { key: "original_budget", label: "Budget", format: "currency", align: "right" },
    { key: "job_cost_amount", label: "Cost to Date", format: "currency", align: "right" },
    { key: "budget_variance_actual", label: "Cost-Budget Var.", format: "currency", align: "right" },
    { key: "variance_in_flight", label: "Variance in Flight", format: "currency", align: "right" },
    { key: "lot_cost", label: "Lot Cost", format: "currency", align: "right" },
    { key: "wip_without_lot", label: "WIP ex Lot", format: "currency", align: "right" },
    { key: "wip", label: "WIP", format: "currency", align: "right" },
    { key: "job_start", label: "Start", format: "date" },
    { key: "closed_date", label: "Closed", format: "date" },
  ];
  return (
    <>
      <div className="kpi-row">
        <KpiCard label="Financial Rows" value={formatWholeNumber(rows.length)} sub="Sparse budget/actual coverage" onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Financial Rows", dateBasis: "Cost ledger", rowScope: "Rows with WIP, budget, actual, or lot cost", rows, note: "Budget/actual is partial until cost source coverage improves." })} />
        <KpiCard label="Comparable Rows" value={formatWholeNumber(comparableRows.length)} sub="Budget and actual both populated" onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Comparable Budget Rows", dateBasis: "Cost ledger", rowScope: "Rows with both original_budget and job_cost_amount", rows: comparableRows })} />
        <KpiCard label="Over Budget" value={formatWholeNumber(overBudget.length)} tone={overBudget.length ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Over Budget", dateBasis: "Actual cost > original budget", rowScope: "Rows where actual cost exceeds budget", rows: overBudget })} />
        <KpiCard label="Under Budget" value={formatWholeNumber(underBudget.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Under Budget", dateBasis: "Actual cost <= original budget", rowScope: "Rows where actual cost is less than or equal to budget", rows: underBudget })} />
        <KpiCard label="Budget" value={formatCompactCurrency(totalBudget)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Budget", dateBasis: "original_budget", rowScope: "Rows with original_budget", rows: rows.filter((row) => safeNumber(row.original_budget) > 0) })} />
        <KpiCard label="Cost to Date" value={formatCompactCurrency(totalActual)} sub="job_cost_amount source" onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Cost to Date", dateBasis: "job_cost_amount", rowScope: "Rows with job_cost_amount", rows: rows.filter((row) => safeNumber(row.job_cost_amount) > 0), note: "This is the populated job_cost_amount source, not a paid-cash actual unless the warehouse source is updated to that basis." })} />
        <KpiCard label="Cost vs Budget" value={formatCompactCurrency(totalVariance)} tone={totalVariance > 0 ? "warning" : "default"} sub="Cost to date minus budget" onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Cost vs Budget Variance", dateBasis: "job_cost_amount - original_budget", rowScope: "Rows with comparable budget and actual values", rows: comparableRows })} />
        <KpiCard label="WIP" value={formatCompactCurrency(totalWip)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "WIP", dateBasis: "wip", rowScope: "Rows with WIP", rows: rows.filter((row) => safeNumber(row.wip) > 0) })} />
        <KpiCard label="Lot Cost Rows" value={formatWholeNumber(withLotCost.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Construction", metric: "Lot Cost Rows", dateBasis: "lot_cost", rowScope: "Rows with lot cost", rows: withLotCost })} />
      </div>
      <SpreadsheetTable title="Construction Cost Metrics" note="Partial KPI: Over Budget means job_cost_amount exceeds original_budget when both fields exist." rows={rows} columns={columns} maxRows={700} onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Construction", metric: `Cost row ${rowLabel(row)}`, dateBasis: "Cost ledger", rowScope: "Budget/actual row", rows: [row] })} />
    </>
  );
}

function LoansDashboardTab({ data, filters, openDrilldown }) {
  const loans = data.loanRoster || [];
  const summary = data.summaries?.loans || deriveLoansSummary(loans);
  const expiring = loans.filter((row) => safeNumber(row.loan_days_until_expiration) > 0 && safeNumber(row.loan_days_until_expiration) <= 30);
  const lenderBars = groupRows(loans, "lender", "loan_amount").slice(0, 10);
  const drawnRows = loans.filter((row) => safeNumber(row.total_drawn) > 0);
  const undrawn = safeNumber(summary.totalLoanAmount) - safeNumber(summary.totalDrawn);
  const utilization = safeNumber(summary.totalLoanAmount) > 0 ? safeNumber(summary.totalDrawn) / safeNumber(summary.totalLoanAmount) : 0;
  return (
    <>
      <div className="tab-header">
        <div className="kicker">Loans Dashboard</div>
        <h2>Loan Exposure</h2>
        <p className="description">Loan coverage is partial and limited to populated construction source fields.</p>
      </div>
      <div className="kpi-row">
        <KpiCard label="Loan Exposure" value={formatCompactCurrency(summary.totalLoanAmount)} onClick={() => openRows(openDrilldown, filters, { domain: "Loans", metric: "Loan Exposure", dateBasis: "Current construction row", rowScope: "Rows with loan_amount", rows: loans, note: "Loan coverage is partial until all lender sources are loaded." })} />
        <KpiCard label="Drawn" value={formatCompactCurrency(summary.totalDrawn)} onClick={() => openRows(openDrilldown, filters, { domain: "Loans", metric: "Drawn", dateBasis: "Current construction row", rowScope: "Rows with total_drawn", rows: drawnRows })} />
        <KpiCard label="Undrawn" value={formatCompactCurrency(undrawn)} onClick={() => openRows(openDrilldown, filters, { domain: "Loans", metric: "Undrawn", dateBasis: "Loan amount less drawn", rowScope: "Rows with loan_amount", rows: loans })} />
        <KpiCard label="Utilization" value={formatPercent(utilization)} onClick={() => openRows(openDrilldown, filters, { domain: "Loans", metric: "Utilization", dateBasis: "Drawn / loan amount", rowScope: "Rows with loan_amount", rows: loans })} />
        <KpiCard label="Jobs With Loans" value={formatWholeNumber(summary.jobsWithLoans)} onClick={() => openRows(openDrilldown, filters, { domain: "Loans", metric: "Jobs With Loans", dateBasis: "Current construction row", rowScope: "Rows with loan_amount > 0", rows: loans })} />
        <KpiCard label="Expiring 30 Days" value={formatWholeNumber(expiring.length)} tone={expiring.length ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Loans", metric: "Expiring 30 Days", dateBasis: "Loan expiration", rowScope: "Loan days until expiration between 1 and 30", rows: expiring })} />
      </div>
      <div className="panels-row single">
        <Panel kicker="Lenders" title="Exposure by Lender" note="Click lender bar for scoped loans">
          <RankedBars items={lenderBars} labelKey="label" valueKey="value" formatter={formatCompactCurrency} onSelect={(item) => openRows(openDrilldown, filters, { domain: "Loans", metric: `Lender: ${item.label}`, dateBasis: "Current lender", rowScope: item.label, rows: item.rows })} />
        </Panel>
      </div>
    </>
  );
}

function LoansPipelineTab({ data, filters, openDrilldown }) {
  const columns = [
    { key: "job_id", label: "Job" },
    { key: "community", label: "Community" },
    { key: "city", label: "City" },
    { key: "job_type", label: "Job Type" },
    { key: "current_stage", label: "Stage" },
    { key: "lender", label: "Lender" },
    { key: "loan_number", label: "Loan No" },
    { key: "loan_amount", label: "Loan", format: "currency", align: "right" },
    { key: "total_drawn", label: "Drawn", format: "currency", align: "right" },
    { key: "draw_pct", label: "Draw %", format: "percent", align: "right" },
    { key: "interest_rate", label: "Rate", format: "percent", align: "right" },
    { key: "loan_days_until_expiration", label: "Days Left", format: "number", align: "right" },
    { key: "wip", label: "WIP", format: "currency", align: "right" },
    { key: "closed_date", label: "Closed", format: "date" },
  ];
  return (
    <SpreadsheetTable
      title="Loan Pipeline"
      note="Partial roster from populated loan fields."
      rows={data.loanRoster || []}
      columns={columns}
      onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Loans", metric: `Loan ${rowLabel(row)}`, dateBasis: "Current construction row", rowScope: "Loan row", rows: [row] })}
    />
  );
}

function SalesDashboardTab({ data, filters, openDrilldown }) {
  const salesRows = salesKpiRows(data).filter(Boolean);
  const summary = data.summaries?.sales || deriveSalesSummary(salesRows);
  const closedRows = salesRows.filter((row) => normalizeText(row.status).includes("closed"));
  const soldRows = salesRows.filter((row) => normalizeText(row.status).includes("sold"));
  const cancelledRows = salesRows.filter((row) => normalizeText(row.status).includes("cancel") || row.cancel_date);
  const pendingRows = salesRows.filter((row) => {
    const status = normalizeText(row.status);
    return !status.includes("closed") && !status.includes("sold") && !status.includes("cancel");
  });
  const pricedRows = salesRows.filter((row) => safeNumber(row.sale_price) > 0);
  const depositRows = salesRows.filter((row) => safeNumber(row.total_deposits) > 0);
  const marginRows = salesRows.filter((row) => nullableNumber(row.net_margin_est) !== null || nullableNumber(row.net_profit_est) !== null);
  const avgSalePrice = pricedRows.length ? sumRows(pricedRows, "sale_price") / pricedRows.length : 0;
  const upcomingRows = salesRows.filter((row) => {
    const value = row.scheduled_closing || row.projected_close || row.close_date;
    const date = dateForDisplay(value);
    if (!date) return false;
    const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
    return days >= 0 && days <= 45;
  });
  const statusSegments = topSegments(salesRows, "status", { limit: 5 });
  const communityBars = groupRows(salesRows, "community", "sale_price").slice(0, 10);
  const planBars = groupRows(salesRows, "plan_name", "sale_price").slice(0, 10);

  return (
    <>
      <div className="tab-header">
        <div className="kicker">Sales Dashboard</div>
        <h2>Sales Dashboard</h2>
        <p className="description">Sales KPIs use sales source rows only. P&L and margin audit rows live in the P&L Audit tab.</p>
      </div>
      <div className="kpi-row">
        <KpiCard label="Contracts" value={formatWholeNumber(summary.totalContracts)} sub="Sales source rows" onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Contracts", dateBasis: "Sales source rows", rowScope: "All sales rows", rows: salesRows })} />
        <KpiCard label="Sales Value" value={formatCompactCurrency(summary.totalSalesValue)} sub="sale_price total" onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Sales Value", dateBasis: "Sales source rows", rowScope: "Rows with sale_price", rows: salesRows.filter((row) => safeNumber(row.sale_price) > 0) })} />
        <KpiCard label="Closed" value={formatWholeNumber(closedRows.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Closed Sales", dateBasis: "Sales status", rowScope: "Status contains closed", rows: closedRows })} />
        <KpiCard label="Sold" value={formatWholeNumber(soldRows.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Sold Sales", dateBasis: "Sales status", rowScope: "Status contains sold", rows: soldRows })} />
        <KpiCard label="Open Contracts" value={formatWholeNumber(pendingRows.length)} sub="Not closed/sold/cancelled" onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Open Sales", dateBasis: "Sales status", rowScope: "Rows not marked closed, sold, or cancelled", rows: pendingRows })} />
        <KpiCard label="Next 45-Day Closings" value={formatWholeNumber(upcomingRows.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Next 45-Day Closings", dateBasis: "Scheduled or projected close", rowScope: "Close date within next 45 days", rows: upcomingRows })} />
        <KpiCard label="Avg Sale Price" value={formatCompactCurrency(avgSalePrice)} onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Average Sale Price", dateBasis: "sale_price", rowScope: "Rows with sale price", rows: pricedRows })} />
        <KpiCard label="Deposits" value={formatCompactCurrency(sumRows(depositRows, "total_deposits"))} onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Deposits", dateBasis: "total_deposits", rowScope: "Rows with total deposits", rows: depositRows })} />
        <KpiCard label="Margin Estimate Rows" value={formatWholeNumber(marginRows.length)} sub="Sales source estimates" onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Margin Estimate Rows", dateBasis: "Sales estimate fields", rowScope: "Rows with estimated margin or profit", rows: marginRows })} />
        <KpiCard label="Cancelled" value={formatWholeNumber(cancelledRows.length)} tone={cancelledRows.length ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Sales", metric: "Cancelled Sales", dateBasis: "cancel_date or status", rowScope: "Rows with cancel status/date", rows: cancelledRows })} />
      </div>
      <div className="panels-row">
        <Panel kicker="Status" title="Sales Status Mix" note="Click a segment for sales rows">
          <DonutChart segments={statusSegments} onSelect={(segment) => openRows(openDrilldown, filters, { domain: "Sales", metric: `Status: ${segment.label}`, dateBasis: "Sales status", rowScope: segment.label, rows: segment.rows })} />
        </Panel>
        <Panel kicker="Value" title="Sales by Community" note="Sales value by scoped community">
          <RankedBars items={communityBars} labelKey="label" valueKey="value" formatter={formatCompactCurrency} onSelect={(item) => openRows(openDrilldown, filters, { domain: "Sales", metric: `Community: ${item.label}`, dateBasis: "Sales community", rowScope: item.label, rows: item.rows })} />
        </Panel>
      </div>
      <div className="panels-row single">
        <Panel kicker="Plans" title="Sales by Plan" note="Top plans by sales value">
          <RankedBars items={planBars} labelKey="label" valueKey="value" formatter={formatCompactCurrency} onSelect={(item) => openRows(openDrilldown, filters, { domain: "Sales", metric: `Plan: ${item.label}`, dateBasis: "Sales plan", rowScope: item.label, rows: item.rows })} />
        </Panel>
      </div>
    </>
  );
}

function SalesPipelineTab({ data, filters, openDrilldown }) {
  const rows = salesKpiRows(data).filter(Boolean);
  const columns = [
    { key: "job_id", label: "Job" },
    { key: "buyer_name", label: "Buyer" },
    { key: "co_buyer", label: "Co-Buyer" },
    { key: "community", label: "Community" },
    { key: "city", label: "City" },
    { key: "address", label: "Address" },
    { key: "plan_name", label: "Plan" },
    { key: "status", label: "Status" },
    { key: "sale_price", label: "Sale Price", format: "currency", align: "right" },
    { key: "base_price", label: "Base", format: "currency", align: "right" },
    { key: "lot_premium", label: "Lot Premium", format: "currency", align: "right" },
    { key: "change_orders", label: "Change Orders", format: "currency", align: "right" },
    { key: "total_deposits", label: "Deposits", format: "currency", align: "right" },
    { key: "sold_date", label: "Sold", format: "date" },
    { key: "accepted_date", label: "Accepted", format: "date" },
    { key: "written_date", label: "Written", format: "date" },
    { key: "scheduled_closing", label: "Close", format: "date" },
    { key: "projected_close_date", label: "Projected", format: "date" },
    { key: "close_date", label: "Closed", format: "date" },
    { key: "cancel_date", label: "Cancel", format: "date" },
    { key: "cancel_reason", label: "Cancel Reason" },
    { key: "job_type", label: "Job Type" },
    { key: "job_status", label: "Job Status" },
    { key: "current_stage", label: "Stage" },
    { key: "superintendent", label: "Super" },
    { key: "sales_agent", label: "Sales Agent" },
    { key: "realtor_company", label: "Realtor Co" },
    { key: "mortgage_company", label: "Mortgage Co" },
    { key: "loan_type", label: "Loan Type" },
    { key: "title_company", label: "Title Co" },
    { key: "sale_source", label: "Source" },
    { key: "net_profit_est", label: "Profit Est", format: "currency", align: "right" },
    { key: "net_margin_est", label: "Margin Est", format: "percent", align: "right" },
  ];
  return (
    <SpreadsheetTable
      title="Sales Pipeline"
      note={`${formatWholeNumber(rows.length)} sales KPI rows. This reconciles to the Sales Dashboard contract count.`}
      rows={rows}
      columns={columns}
      maxRows={700}
      onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Sales", metric: `Sale ${rowLabel(row)}`, dateBasis: "Sales source row", rowScope: "Sales row", rows: [row] })}
    />
  );
}

function PMDashboardTab({ data, filters, openDrilldown }) {
  const pm = data.summaries?.propertyManagement || {};
  const units = data.pmMaster || [];
  const delinquent = units.filter((row) => safeNumber(row.past_due || row.amount_receivable) > 0);
  const reviewRows = units.filter((row) => row.needs_management_review);
  const statusSegments = topSegments(
    units.map((row) => ({ ...row, pm_status_label: firstPresent(row, ["lease_status", "occupancy_status", "status"]) || "(none)" })),
    "pm_status_label",
    { limit: 5 },
  );
  const projectBars = (data.pmProjectSummary || []).slice(0, 10).map((item) => ({ ...item, label: item.project_name, value: item.total_units, rows: item.rows || units.filter((row) => row.project_name === item.project_name) }));

  return (
    <>
      <div className="tab-header">
        <div className="kicker">Property Management</div>
        <h2>Portfolio Snapshot</h2>
        <p className="description">Uses BigQuery PM snapshot marts. Snapshot: {pm.snapshotAt ? formatDate(pm.snapshotAt) : "latest load"}.</p>
      </div>
      <div className="kpi-row">
        <KpiCard label="Units" value={formatWholeNumber(pm.totalUnits)} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Units", dateBasis: "PM snapshot", rowScope: "All PM unit rows", rows: units })} />
        <KpiCard label="Occupied" value={formatWholeNumber(pm.occupiedUnits)} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Occupied Units", dateBasis: "PM snapshot status", rowScope: "Occupied unit rows", rows: units.filter((row) => row.occupied || row.is_occupied) })} />
        <KpiCard label="Vacant" value={formatWholeNumber(pm.vacantUnits)} tone={pm.vacantUnits ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Vacant Units", dateBasis: "PM snapshot status", rowScope: "Vacant unit rows", rows: units.filter((row) => row.is_vacant || normalizeText(row.status).includes("vacant")) })} />
        <KpiCard label="Occupancy" value={formatPercent(pm.occupancyRate)} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Occupancy", dateBasis: "PM snapshot status", rowScope: "Rows in occupancy denominator", rows: units })} />
        <KpiCard label="Past Due" value={formatCompactCurrency(pm.pastDue)} tone={pm.pastDue ? "danger" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Past Due", dateBasis: "PM snapshot receivables", rowScope: "Rows with past_due or receivable", rows: delinquent })} />
        <KpiCard label="Market Rent" value={formatCompactCurrency(pm.marketRent)} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Market Rent", dateBasis: "PM snapshot rent", rowScope: "Rows with market rent", rows: units.filter((row) => safeNumber(row.market_rent) > 0) })} />
        <KpiCard label="Actual Rent" value={formatCompactCurrency(pm.actualRent)} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Actual Rent", dateBasis: "PM snapshot rent", rowScope: "Rows with actual rent", rows: units.filter((row) => safeNumber(row.actual_rent) > 0) })} />
        <KpiCard label="Vacancy Loss" value={formatCompactCurrency(pm.vacancyLoss)} tone={pm.vacancyLoss ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Vacancy Loss", dateBasis: "Market less actual rent", rowScope: "Rows in rent denominator", rows: units })} />
        <KpiCard label="Collection Rate" value={formatPercent(pm.collectionRate)} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Collection Rate", dateBasis: "Actual rent / market rent", rowScope: "Rows in rent denominator", rows: units })} />
        <KpiCard label="Receivables" value={formatCompactCurrency(pm.totalReceivable)} tone={pm.totalReceivable ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Receivables", dateBasis: "PM snapshot receivable", rowScope: "Rows with amount receivable", rows: units.filter((row) => safeNumber(row.amount_receivable) > 0) })} />
        <KpiCard label="Deposits" value={formatCompactCurrency(pm.totalDeposits)} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Deposits", dateBasis: "PM snapshot deposit", rowScope: "Rows with deposit", rows: units.filter((row) => safeNumber(row.deposit) > 0) })} />
        <KpiCard label="Delinquent Tenants" value={formatWholeNumber(pm.delinquentTenants)} tone={pm.delinquentTenants ? "danger" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Delinquent Tenants", dateBasis: "PM snapshot receivables", rowScope: "Rows with receivable balance", rows: delinquent })} />
        <KpiCard label="Review Queue" value={formatWholeNumber(reviewRows.length)} tone={reviewRows.length ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Property Management", metric: "Review Queue", dateBasis: "PM review flags", rowScope: "Rows flagged for management review", rows: reviewRows })} />
      </div>
      <div className="panels-row">
        <Panel kicker="Status" title="Occupancy Status" note="Click a segment for unit rows">
          <DonutChart segments={statusSegments} onSelect={(segment) => openRows(openDrilldown, filters, { domain: "Property Management", metric: `PM Status: ${segment.label}`, dateBasis: "PM snapshot status", rowScope: segment.label, rows: segment.rows })} />
        </Panel>
        <Panel kicker="Projects" title="Units by Project" note="Click project for roster">
          <RankedBars items={projectBars} labelKey="label" valueKey="value" onSelect={(item) => openRows(openDrilldown, filters, { domain: "Property Management", metric: `Project: ${item.label}`, dateBasis: "PM snapshot project", rowScope: item.label, rows: item.rows })} />
        </Panel>
      </div>
      <div className="panels-row single">
        <Panel kicker="Review" title="Management Review Queue" note="Rows flagged by the PM mart">
          <RankedBars items={groupRows(reviewRows, "project_name").slice(0, 10)} labelKey="label" valueKey="count" onSelect={(item) => openRows(openDrilldown, filters, { domain: "Property Management", metric: `Review: ${item.label}`, dateBasis: "PM snapshot review flag", rowScope: item.label, rows: item.rows })} />
        </Panel>
      </div>
    </>
  );
}

function PMPipelineTab({ data, filters, openDrilldown }) {
  const columns = [
    { key: "unit_label", label: "Unit" },
    { key: "job_no", label: "Job" },
    { key: "project_name", label: "Project" },
    { key: "area_name", label: "Area" },
    { key: "city", label: "City" },
    { key: "address", label: "Address" },
    { key: "lease_status", label: "Status" },
    { key: "bed_bath", label: "Bed/Bath" },
    { key: "sqft", label: "Sq Ft", format: "number", align: "right" },
    { key: "tenant_name", label: "Tenant" },
    { key: "lease_from", label: "Lease From", format: "date" },
    { key: "lease_to", label: "Lease To", format: "date" },
    { key: "move_in", label: "Move In", format: "date" },
    { key: "move_out", label: "Move Out", format: "date" },
    { key: "market_rent", label: "Market Rent", format: "currency", align: "right" },
    { key: "actual_rent", label: "Actual Rent", format: "currency", align: "right" },
    { key: "monthly_rent", label: "Monthly Rent", format: "currency", align: "right" },
    { key: "past_due", label: "Past Due", format: "currency", align: "right" },
    { key: "amount_receivable", label: "Receivable", format: "currency", align: "right" },
    { key: "receivable_0_30", label: "0-30", format: "currency", align: "right" },
    { key: "receivable_30_plus", label: "30+", format: "currency", align: "right" },
    { key: "deposit", label: "Deposit", format: "currency", align: "right" },
    { key: "last_payment", label: "Last Payment", format: "date" },
    { key: "late_count", label: "Late Count", format: "number", align: "right" },
    { key: "management_fee_percent", label: "PM Fee", format: "percent", align: "right" },
    { key: "needs_management_review", label: "Review" },
  ];
  return (
    <SpreadsheetTable
      title="Property Management Pipeline"
      note="Snapshot-backed PM roster."
      rows={data.pmMaster || []}
      columns={columns}
      maxRows={500}
      onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Property Management", metric: `Unit ${rowLabel(row)}`, dateBasis: "PM snapshot", rowScope: "PM unit row", rows: [row] })}
    />
  );
}

function AuditsTab({ data, filters, openDrilldown }) {
  const rows = data.auditRoster || [];
  const revenueRows = rows.filter((row) => safeNumber(row.net_revenue ?? row.sale_price) > 0);
  const costRows = rows.filter((row) => safeNumber(row.total_cost) > 0);
  const marginRows = rows.filter((row) => safeNumber(row.net_revenue ?? row.sale_price) > 0 && safeNumber(row.total_cost) > 0 && nullableNumber(row.net_margin) !== null);
  const readyRows = rows.filter((row) => row.pl_readiness === "ready");
  const partialRows = rows.filter((row) => row.pl_readiness === "partial");
  const missingRevenueRows = rows.filter((row) => row.data_quality_flag === "missing revenue");
  const atRiskRows = marginRows.filter((row) => ["loss", "at-risk", "watch"].includes(row.margin_status));
  const lossRows = marginRows.filter((row) => row.margin_status === "loss");
  const profitableRows = marginRows.filter((row) => safeNumber(row.net_profit) > 0);
  const weightedNetMargin = weightedMargin(marginRows);
  const simpleAvgMargin = averageRows(marginRows, "net_margin");
  const latestAuditDate = rows
    .map((row) => dateForDisplay(row.audit_date || row._mart_refreshed_at))
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const closeoutRows = rows.filter((row) => {
    const completion = nullableNumber(row.completion_pct);
    const stage = normalizeText(row.current_stage);
    const nearComplete = completion !== null && completion >= 0.95;
    const closeoutStage = stage.includes("receive co") || stage.includes("close") || stage.includes("homeowner");
    return (nearComplete || closeoutStage) && (row.margin_status !== "good" || row.data_quality_flag !== "ready");
  });
  const marginBuckets = buildMarginBuckets(marginRows);
  const costCategoryItems = buildAuditCostCategories(rows).slice(0, 12);
  const riskByCommunity = groupRows(atRiskRows, "community", "total_cost").slice(0, 10);
  const readinessItems = [
    { label: "Ready", value: readyRows.length, rows: readyRows },
    { label: "Partial", value: partialRows.length, rows: partialRows },
    { label: "Missing revenue", value: missingRevenueRows.length, rows: missingRevenueRows },
  ].filter((item) => item.value > 0);
  const marginStatusItems = groupRows(rows, "margin_status").slice(0, 8);
  const detailColumns = [
    { key: "job_id", label: "Job" },
    { key: "community", label: "Community" },
    { key: "plan_name", label: "Plan" },
    { key: "job_type", label: "Job Type" },
    { key: "current_stage", label: "Stage" },
    { key: "sale_price", label: "Sale Price", format: "currency", align: "right" },
    { key: "seller_credit", label: "Seller Credit", format: "currency", align: "right" },
    { key: "net_revenue", label: "Net Revenue", format: "currency", align: "right" },
    { key: "total_direct_cost", label: "Direct Cost", format: "currency", align: "right" },
    { key: "total_indirect_cost", label: "Indirect Cost", format: "currency", align: "right" },
    { key: "total_cost", label: "Total Cost", format: "currency", align: "right" },
    { key: "net_profit", label: "Net Profit", format: "currency", align: "right" },
    { key: "net_margin", label: "Net Margin", format: "percent", align: "right" },
    { key: "margin_status", label: "Margin Status" },
    { key: "data_quality_flag", label: "Data Quality" },
    { key: "audit_date", label: "Audit Date", format: "date" },
  ];
  const columns = [
    { key: "job_id", label: "Job" },
    { key: "community", label: "Community" },
    { key: "city", label: "City" },
    { key: "plan_name", label: "Plan" },
    { key: "job_type", label: "Job Type" },
    { key: "current_stage", label: "Job Status" },
    { key: "sale_status", label: "Sales Status" },
    { key: "completion_pct", label: "Completion", format: "percent", align: "right" },
    { key: "net_revenue", label: "Net Revenue", format: "currency", align: "right" },
    { key: "budget_basis", label: "Budget Basis", format: "currency", align: "right" },
    { key: "total_direct_cost", label: "Direct Cost", format: "currency", align: "right" },
    { key: "total_indirect_cost", label: "Indirect Cost", format: "currency", align: "right" },
    { key: "total_cost", label: "Total Cost", format: "currency", align: "right" },
    { key: "budget_variance", label: "Budget Var.", format: "currency", align: "right" },
    { key: "net_profit", label: "Net Profit", format: "currency", align: "right" },
    { key: "net_margin", label: "Net Margin", format: "percent", align: "right" },
    { key: "margin_status", label: "Margin Status" },
    { key: "data_quality_flag", label: "Data Quality" },
    { key: "audit_date", label: "Audit Date", format: "date" },
  ];
  return (
    <>
      <div className="tab-header">
        <div className="kicker">P&L Audit</div>
        <h2>P&L Audits</h2>
        <p className="description">
          Per-job revenue, cost, variance, and margin review. Audit KPIs use `mart_audit_pl` rows, separate from sales pipeline rows.
          {latestAuditDate ? ` Latest audit basis: ${formatDate(latestAuditDate)}.` : ""}
        </p>
      </div>
      <div className="kpi-row">
        <KpiCard label="Audit Rows" value={formatWholeNumber(rows.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Audit Rows", dateBasis: "Audit mart", rowScope: "All audit rows", rows })} />
        <KpiCard label="Ready P&L Rows" value={formatWholeNumber(readyRows.length)} sub={`${formatWholeNumber(partialRows.length)} partial`} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Ready P&L Rows", dateBasis: "Audit mart", rowScope: "Rows with revenue and cost", rows: readyRows, columns: detailColumns })} />
        <KpiCard label="Net Revenue" value={formatCompactCurrency(sumRows(revenueRows, "net_revenue"))} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Net Revenue", dateBasis: "Audit sale_price", rowScope: "Rows with revenue", rows: revenueRows, columns: detailColumns })} />
        <KpiCard label="Total Cost" value={formatCompactCurrency(sumRows(costRows, "total_cost"))} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Total Cost", dateBasis: "Audit cost fields", rowScope: "Rows with total_cost", rows: costRows, columns: detailColumns })} />
        <KpiCard label="Net Profit" value={formatCompactCurrency(sumRows(marginRows, "net_profit"))} tone={sumRows(marginRows, "net_profit") < 0 ? "danger" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Net Profit", dateBasis: "Audit calculation", rowScope: "Rows with revenue and cost", rows: marginRows, columns: detailColumns })} />
        <KpiCard label="Weighted Margin" value={formatNullablePercent(weightedNetMargin)} sub={`${formatWholeNumber(marginRows.length)} margin rows`} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Weighted Margin", dateBasis: "Audit calculation", rowScope: "Rows with revenue and cost", rows: marginRows, note: "Weighted margin is SUM(net_profit) / SUM(net_revenue). Rows missing revenue are excluded.", columns: detailColumns })} />
        <KpiCard label="Average Job Margin" value={formatNullablePercent(simpleAvgMargin)} sub="Simple average" onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Average Job Margin", dateBasis: "Audit calculation", rowScope: "Rows with margin calculation", rows: marginRows, columns: detailColumns })} />
        <KpiCard label="At-Risk Jobs" value={formatWholeNumber(atRiskRows.length)} tone={atRiskRows.length ? "warning" : "default"} sub={`${formatWholeNumber(lossRows.length)} losses`} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "At-Risk Jobs", dateBasis: "Audit margin status", rowScope: "Loss, at-risk, and watch rows", rows: atRiskRows, columns: detailColumns })} />
        <KpiCard label="Missing Revenue" value={formatWholeNumber(missingRevenueRows.length)} tone={missingRevenueRows.length ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Missing Revenue", dateBasis: "Audit data quality", rowScope: "Rows excluded from margin averages because revenue is missing", rows: missingRevenueRows, note: "These rows can support cost audit review, but they are excluded from margin KPIs until revenue is populated.", columns: detailColumns })} />
        <KpiCard label="Closeout Review" value={formatWholeNumber(closeoutRows.length)} tone={closeoutRows.length ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Audit", metric: "Closeout Review", dateBasis: "Completion/stage and audit status", rowScope: "Near-complete or closeout rows with P&L caveats", rows: closeoutRows, columns: detailColumns })} />
      </div>
      <div className="dashboard-grid">
        <Panel kicker="Margin" title="Margin Distribution" note="Rows missing revenue are excluded from margin bands.">
          <Histogram buckets={marginBuckets} onSelect={(bucket) => openRows(openDrilldown, filters, { domain: "Audit", metric: `Margin ${bucket.label}`, dateBasis: "Audit net_margin", rowScope: bucket.label, rows: bucket.rows, columns: detailColumns })} />
        </Panel>
        <Panel kicker="Cost" title="Cost Breakdown" note="Category spend from normalized audit rows.">
          <RankedBars items={costCategoryItems} formatter={formatCompactCurrency} onSelect={(item) => openRows(openDrilldown, filters, { domain: "Audit", metric: `Cost Category: ${item.label}`, dateBasis: "Audit cost categories", rowScope: item.label, rows: item.rows, columns: detailColumns })} />
        </Panel>
        <Panel kicker="Risk" title="At-Risk Cost by Community" note="Loss, at-risk, and watch rows by total cost exposure.">
          <RankedBars items={riskByCommunity} formatter={formatCompactCurrency} onSelect={(item) => openRows(openDrilldown, filters, { domain: "Audit", metric: `At-Risk Community: ${item.label}`, dateBasis: "Audit margin status", rowScope: item.label, rows: item.rows, columns: detailColumns })} />
        </Panel>
        <Panel kicker="Readiness" title="P&L Data Readiness" note="Readiness is based on job key, revenue, and cost availability.">
          <RankedBars items={readinessItems} formatter={formatWholeNumber} onSelect={(item) => openRows(openDrilldown, filters, { domain: "Audit", metric: `Readiness: ${item.label}`, dateBasis: "Audit data quality", rowScope: item.label, rows: item.rows, columns: detailColumns })} />
        </Panel>
        <Panel kicker="Status" title="Margin Status Mix" note="Finance review labels derived in the data layer.">
          <DonutChart segments={marginStatusItems.map((item, index) => ({ ...item, color: CHART_COLORS[index % CHART_COLORS.length] }))} onSelect={(item) => openRows(openDrilldown, filters, { domain: "Audit", metric: `Margin Status: ${item.label}`, dateBasis: "Audit margin status", rowScope: item.label, rows: item.rows, columns: detailColumns })} />
        </Panel>
      </div>
      <SpreadsheetTable title="Closeout Review" note="Completed or near-complete rows with missing revenue, loss, at-risk, or watch status." rows={closeoutRows} columns={columns} maxRows={250} onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Audit", metric: `Closeout ${rowLabel(row)}`, dateBasis: "Audit mart", rowScope: "Closeout review row", rows: [row], columns: detailColumns, note: "Use this drawer as the per-job P&L review surface: revenue, cost, budget, margin, and data-quality fields are shown from the same mart row." })} />
      <SpreadsheetTable title="P&L Audit Roster" note="Audit rows, not sales-contract rows. Missing revenue shows as '-' in margin fields and is excluded from weighted margin." rows={rows} columns={columns} maxRows={700} onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Audit", metric: `P&L Audit - ${rowLabel(row)}`, dateBasis: "Audit mart", rowScope: "Audit row", rows: [row], columns: detailColumns, note: "Job detail: revenue, direct cost, indirect cost, total cost, margin, status, and data-quality fields from mart_audit_pl." })} />
    </>
  );
}

function ExceptionsTab({ data, filters, openDrilldown }) {
  const rows = data.exceptionRows || [];
  const detailRows = data.exceptionDetailRows || [];
  const p1 = rows.filter((row) => row.priority === "P1");
  const p2 = rows.filter((row) => row.priority === "P2");
  const p3 = rows.filter((row) => row.priority === "P3");
  const aged = rows.filter((row) => safeNumber(row.days_outstanding) > 30);
  const summaryBars = groupRows(rows, "exception_type").slice(0, 10);
  const columns = [
    { key: "priority", label: "Priority" },
    { key: "exception_type", label: "Type" },
    { key: "owner_group", label: "Owner" },
    { key: "job_no", label: "Job" },
    { key: "project_name", label: "Project" },
    { key: "metric_value", label: "Metric", format: "number", align: "right" },
    { key: "days_outstanding", label: "Days", format: "number", align: "right" },
  ];
  const detailColumns = [
    { key: "priority", label: "Priority" },
    { key: "exception_type", label: "Type" },
    { key: "source_domain", label: "Domain" },
    { key: "job_no", label: "Job" },
    { key: "project_name", label: "Project" },
    { key: "city", label: "City" },
    { key: "metric_value", label: "Metric", format: "number", align: "right" },
    { key: "days_outstanding", label: "Days", format: "number", align: "right" },
    { key: "recommended_action", label: "Action" },
  ];
  return (
    <>
      <div className="tab-header">
        <div className="kicker">Exceptions</div>
        <h2>Action Queue</h2>
        <p className="description">Preserves BigQuery exception queue snapshots.</p>
      </div>
      <div className="kpi-row">
        <KpiCard label="Exceptions" value={formatWholeNumber(rows.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Exceptions", metric: "Exceptions", dateBasis: "Exception snapshot", rowScope: "All exception rows", rows })} />
        <KpiCard label="P1" value={formatWholeNumber(p1.length)} tone={p1.length ? "danger" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Exceptions", metric: "P1 Exceptions", dateBasis: "Exception snapshot", rowScope: "priority = P1", rows: p1 })} />
        <KpiCard label="P2" value={formatWholeNumber(p2.length)} tone={p2.length ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Exceptions", metric: "P2 Exceptions", dateBasis: "Exception snapshot", rowScope: "priority = P2", rows: p2 })} />
        <KpiCard label="P3" value={formatWholeNumber(p3.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Exceptions", metric: "P3 Exceptions", dateBasis: "Exception snapshot", rowScope: "priority = P3", rows: p3 })} />
        <KpiCard label="Aged 30+ Days" value={formatWholeNumber(aged.length)} tone={aged.length ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Exceptions", metric: "Aged Exceptions", dateBasis: "days_outstanding", rowScope: "days_outstanding > 30", rows: aged })} />
        <KpiCard label="Affected Jobs" value={formatWholeNumber(data.summaries?.exceptions?.affectedJobs)} onClick={() => openRows(openDrilldown, filters, { domain: "Exceptions", metric: "Affected Jobs", dateBasis: "Exception job key", rowScope: "Rows with job identifiers", rows: rows.filter((row) => row.job_no || row.job_id) })} />
        <KpiCard label="Metric Exposure" value={formatWholeNumber(data.summaries?.exceptions?.metricValue)} onClick={() => openRows(openDrilldown, filters, { domain: "Exceptions", metric: "Metric Exposure", dateBasis: "metric_value", rowScope: "Rows with metric value", rows: rows.filter((row) => safeNumber(row.metric_value) !== 0) })} />
        <KpiCard label="Detail Rows" value={formatWholeNumber(detailRows.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Exceptions", metric: "Exception Detail Rows", dateBasis: "Fact exception snapshot", rowScope: "All conformed exception detail rows", rows: detailRows })} />
      </div>
      <div className="panels-row single">
        <Panel kicker="Types" title="Exceptions by Type" note="Click type for queue rows">
          <RankedBars items={summaryBars} labelKey="label" valueKey="count" onSelect={(item) => openRows(openDrilldown, filters, { domain: "Exceptions", metric: `Exception Type: ${item.label}`, dateBasis: "Exception snapshot", rowScope: item.label, rows: item.rows })} />
        </Panel>
      </div>
      <SpreadsheetTable title="Exception Queue" note="Actionable exception queue snapshot." rows={rows} columns={columns} onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Exceptions", metric: `Exception ${rowLabel(row)}`, dateBasis: "Exception snapshot", rowScope: "Exception row", rows: [row] })} />
      <SpreadsheetTable title="Exception Detail Rows" note="Conformed exception fact snapshot for deeper QA." rows={detailRows} columns={detailColumns} maxRows={700} onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Exceptions", metric: `Exception detail ${rowLabel(row)}`, dateBasis: "Fact exception snapshot", rowScope: "Exception detail row", rows: [row] })} />
    </>
  );
}

function WarehouseHealthTab({ data, filters, openDrilldown }) {
  const objects = data.warehouseObjects || [];
  const quality = data.warehouseQuality || [];
  const summary = data.summaries?.warehouse || {};
  const high = quality.filter((row) => row.severity === "HIGH" && safeNumber(row.issue_count) > 0);
  const rawObjects = objects.filter((row) => normalizeText(row.warehouse_layer).includes("raw"));
  const martObjects = objects.filter((row) => normalizeText(row.warehouse_layer).includes("mart"));
  const populatedObjects = objects.filter((row) => safeNumber(row.row_count) > 0);
  const objectColumns = [
    { key: "warehouse_layer", label: "Layer" },
    { key: "object_name", label: "Object" },
    { key: "object_type", label: "Type" },
    { key: "row_count", label: "Rows", format: "number", align: "right" },
    { key: "distinct_business_keys", label: "Keys", format: "number", align: "right" },
    { key: "missing_business_keys", label: "Missing Keys", format: "number", align: "right" },
    { key: "creation_time", label: "Created", format: "date" },
    { key: "last_modified_time", label: "Modified", format: "date" },
  ];
  const qualityColumns = [
    { key: "severity", label: "Severity" },
    { key: "check_name", label: "Check" },
    { key: "object_name", label: "Object" },
    { key: "issue_count", label: "Issues", format: "number", align: "right" },
    { key: "checked_count", label: "Checked", format: "number", align: "right" },
  ];
  return (
    <>
      <div className="tab-header">
        <div className="kicker">Warehouse Health</div>
        <h2>Data Warehouse Audit</h2>
        <p className="description">Preserves warehouse object health and quality queries.</p>
      </div>
      <div className="kpi-row">
        <KpiCard label="Objects" value={formatWholeNumber(summary.objects || objects.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Warehouse", metric: "Objects", dateBasis: "Warehouse health snapshot", rowScope: "Warehouse object rows", rows: objects })} />
        <KpiCard label="Rows" value={formatWholeNumber(summary.rows)} onClick={() => openRows(openDrilldown, filters, { domain: "Warehouse", metric: "Warehouse Rows", dateBasis: "Warehouse health snapshot", rowScope: "Object row counts", rows: objects })} />
        <KpiCard label="Raw Objects" value={formatWholeNumber(rawObjects.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Warehouse", metric: "Raw Objects", dateBasis: "Information schema", rowScope: "Raw dataset objects", rows: rawObjects })} />
        <KpiCard label="Mart Objects" value={formatWholeNumber(martObjects.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Warehouse", metric: "Mart Objects", dateBasis: "Information schema", rowScope: "Mart dataset objects", rows: martObjects })} />
        <KpiCard label="Populated Objects" value={formatWholeNumber(populatedObjects.length)} onClick={() => openRows(openDrilldown, filters, { domain: "Warehouse", metric: "Populated Objects", dateBasis: "Information schema", rowScope: "Objects with row_count > 0", rows: populatedObjects })} />
        <KpiCard label="Missing Keys" value={formatWholeNumber(summary.missingKeys)} tone={summary.missingKeys ? "warning" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Warehouse", metric: "Missing Keys", dateBasis: "Warehouse health snapshot", rowScope: "Objects with missing keys", rows: objects.filter((row) => safeNumber(row.missing_business_keys) > 0) })} />
        <KpiCard label="High Checks" value={formatWholeNumber(high.length)} tone={high.length ? "danger" : "default"} onClick={() => openRows(openDrilldown, filters, { domain: "Warehouse", metric: "High Quality Checks", dateBasis: "Warehouse quality snapshot", rowScope: "HIGH severity checks with issues", rows: high })} />
      </div>
      <SpreadsheetTable title="Warehouse Objects" note="Object health snapshot." rows={objects} columns={objectColumns} onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Warehouse", metric: row.object_name || "Warehouse object", dateBasis: "Warehouse health snapshot", rowScope: "Warehouse object row", rows: [row] })} />
      <SpreadsheetTable title="Warehouse Quality Checks" note="Quality checks by severity." rows={quality} columns={qualityColumns} onRowClick={(row) => openRows(openDrilldown, filters, { domain: "Warehouse", metric: row.check_name || "Quality check", dateBasis: "Warehouse quality snapshot", rowScope: "Quality check row", rows: [row] })} />
    </>
  );
}

function DashboardShell({ dashboard }) {
  const [activeTab, setActiveTab] = useState("constructionDash");
  const [theme, setTheme] = useState("dark");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [isFullPage, setIsFullPage] = useState(false);
  const [drilldown, setDrilldown] = useState(null);
  const filtered = useMemo(() => applyDashboardFilters(dashboard, filters), [dashboard, filters]);
  const filterOptions = useMemo(() => buildDashboardFilterOptions(dashboard), [dashboard]);
  const portfolio = filtered.summaries?.portfolio || {};
  const inventory = filtered.summaries?.inventory || {};
  const pm = filtered.summaries?.propertyManagement || {};
  const exceptions = filtered.summaries?.exceptions || {};
  const sourceLabel = dashboard.dataFreshness?.sourceLabel || (dashboard.sourceMode === "snapshot" ? "BigQuery Snapshot" : "Unavailable");

  const openDrilldown = (payload) => {
    setDrilldown(payload);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "jobSummary":
        return <JobSummaryTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "loansDash":
        return <LoansDashboardTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "loansPipeline":
        return <LoansPipelineTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "constructionDash":
        return <ConstructionDashTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "constructionPipeline":
        return <ConstructionPipelineTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "constructionCycle":
        return <ConstructionCycleTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "constructionCost":
        return <ConstructionCostTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "salesDash":
        return <SalesDashboardTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "salesPipeline":
        return <SalesPipelineTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "pmDash":
        return <PMDashboardTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "pmPipeline":
        return <PMPipelineTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "audits":
        return <AuditsTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "exceptions":
        return <ExceptionsTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      case "warehouse":
        return <WarehouseHealthTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
      default:
        return <JobSummaryTab data={filtered} filters={filters} openDrilldown={openDrilldown} />;
    }
  };

  return (
    <div className={`shell ${isFullPage ? "shell-fullpage" : ""}`} data-theme={theme}>
      <header className="shell-bar">
        <div className="brand">Brite Homes <span>Operations Warehouse</span></div>
        <div className="config-chips">
          <span className="chip">{sourceLabel}</span>
          <span className="chip">Project {dashboard.config?.projectId || "not set"}</span>
          <a href="/ask" className="theme-toggle" style={{ textDecoration: "none" }}>Ask the Data</a>
          <button type="button" className="theme-toggle" onClick={() => setIsFullPage((current) => !current)}>{isFullPage ? "Exit Full Page" : "Full Page"}</button>
          <button type="button" className="theme-toggle" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}>{theme === "dark" ? "Light" : "Dark"}</button>
        </div>
      </header>

      <FilterBar filters={filters} setFilters={setFilters} filterOptions={filterOptions} />
      <MobileNav sections={SECTIONS} activeTab={activeTab} setActiveTab={setActiveTab} />

      <aside className="rail">
        <nav className="rail-tabs">
          {SECTIONS.map((section) => (
            <div className="rail-section" key={section.label}>
              <div className="rail-section-label">{section.label}</div>
              {section.tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  className={`rail-tab ${activeTab === tab.id ? "active" : ""}`}
                  aria-label={`${section.label} ${tab.label}`}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="rail-stats">
          <div className="rail-stat"><span>Open Inv.</span><span className="value">{formatWholeNumber(inventory.totalJobs ?? filtered.jobInventoryRows?.length ?? 0)}</span></div>
          <div className="rail-stat"><span>Build/CO</span><span className="value">{formatWholeNumber(portfolio.totalJobs ?? filtered.constructionRows?.length ?? 0)}</span></div>
          <div className="rail-stat"><span>Active</span><span className="value">{formatWholeNumber(portfolio.activeConstruction)}</span></div>
          <div className="rail-stat"><span>PM Units</span><span className="value">{formatWholeNumber(pm.totalUnits)}</span></div>
          <div className="rail-stat"><span>Exceptions</span><span className="value">{formatWholeNumber(exceptions.total)} {exceptions.p1 ? <span className="badge">P1 {formatWholeNumber(exceptions.p1)}</span> : null}</span></div>
        </div>
      </aside>

      <main className="main-content">
        {dashboard.errorMessage ? <div className="error-banner">{dashboard.errorMessage}</div> : null}
        <DataContextStrip data={filtered} dashboard={dashboard} />
        <QualityScore qualityChecks={dashboard.qualityChecks || []} />
        <AuditNotes notes={dashboard.auditNotes || []} />
        {renderTab()}
      </main>
      <DrilldownDrawer drilldown={drilldown} onClose={() => setDrilldown(null)} />
    </div>
  );
}

export default DashboardShell;
