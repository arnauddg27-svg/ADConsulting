#!/usr/bin/env node
/**
 * Create pre-computed mart tables in BigQuery.
 * Run daily via cron or manually: node scripts/create-marts.js
 *
 * Marts move heavy JOINs and aggregations out of the dashboard's
 * real-time query path. The dashboard reads flat mart tables instead.
 */

const { BigQuery } = require("@google-cloud/bigquery");

const PROJECT_ID = "atomic-venture-404412";
const RAW_DATASET = "brite_homes_raw";
const MARTS_DATASET = "brite_homes_marts";
const DEFAULT_KEY_FILE = "/Users/arnauddurand/.config/ad-consulting/brite-homes-sa-key.json";
const KEY_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_KEY_FILE;

const bq = new BigQuery({ projectId: PROJECT_ID, keyFilename: KEY_FILE });
const raw = (t) => `\`${PROJECT_ID}.${RAW_DATASET}.${t}\``;
const mart = (t) => `\`${PROJECT_ID}.${MARTS_DATASET}.${t}\``;
const normalized = (field) => `LOWER(REGEXP_REPLACE(TRIM(COALESCE(CAST(${field} AS STRING), '')), r'\\s+', ' '))`;
const currentInventoryWhere = (alias = "") => {
  const prefix = alias ? `${alias}.` : "";
  return `(
    ${prefix}closed_date IS NULL
    AND ${prefix}closing_date IS NULL
    AND ${normalized(`${prefix}job_type`)} != 'sfr completed & closed'
    AND NOT REGEXP_CONTAINS(${normalized(`${prefix}job_status`)}, r'\\bclosed\\b')
    AND NOT REGEXP_CONTAINS(${normalized(`${prefix}current_stage`)}, r'\\bclosed\\b')
    AND NOT REGEXP_CONTAINS(${normalized(`${prefix}address`)}, r'\\bclosed\\b')
  )`;
};

async function createOrReplace(tableName, query) {
  const dest = `${PROJECT_ID}.${MARTS_DATASET}.${tableName}`;
  console.log(`  Creating ${dest}...`);
  const start = Date.now();
  await bq.query({
    query: `CREATE OR REPLACE TABLE \`${dest}\` AS\n${query}`,
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const [meta] = await bq.dataset(MARTS_DATASET).table(tableName).getMetadata();
  console.log(`  ✓ ${tableName}: ${meta.numRows} rows, ${((parseInt(meta.numBytes || 0) / 1024 / 1024).toFixed(2))} MB (${elapsed}s)`);
}

async function run() {
  console.log("=== Building Brite Homes Mart Tables ===\n");

  // ── MART 1: mart_audit_pl ──────────────────────────────────────────
  // Joins 8 stale audit_* tables + milestones + latest sale + the freshly-loaded
  // audit_pl_summary (from Investor Audits / BPOF Audits Google Sheets).
  // Summary values are authoritative — they're the team's own formulas computed
  // in the spreadsheets they trust. The computed (line-item-sum) values exist
  // as a fallback for jobs not yet in summary.
  //
  // Column resolution order (COALESCEd in audit_final CTE):
  //   sale_price    : summary.sale_price  → sales.sale_price
  //   total_cost    : summary.total_cost  → SUM of line items
  //   net_profit    : summary.net_profit  → sale_price - total_cost
  //   net_margin    : summary.net_margin  → net_profit / sale_price
  //
  // pl_source column tells you which path each row took ('sheet' | 'computed').
  // Keep the computed-path logic in sync with lib/dashboard-data.js:271-325.
  console.log("[1/3] mart_audit_pl (audit JOIN + summary COALESCE + P&L rollups)");
  await createOrReplace("mart_audit_pl", `
    WITH latest_sale AS (
      SELECT *, ROW_NUMBER() OVER (
        PARTITION BY community, lot_id
        ORDER BY contract_date DESC NULLS LAST, contract_number DESC
      ) AS rn
      FROM ${raw("sales")}
      WHERE sale_price IS NOT NULL AND SAFE_CAST(sale_price AS FLOAT64) > 0
    ),
    -- ─────────────────────────────────────────────────────────────────
    -- audit_summary_dedup: one row per job_id from the Google Sheet
    -- summaries. If a job appears in both Investor Audits and BPOF Audits
    -- (shouldn't happen but be defensive), prefer the row with the most
    -- populated P&L columns.
    -- ─────────────────────────────────────────────────────────────────
    audit_summary_dedup AS (
      SELECT * EXCEPT (rn) FROM (
        SELECT *,
          ROW_NUMBER() OVER (
            PARTITION BY job_id
            ORDER BY
              CASE WHEN net_profit IS NOT NULL THEN 1 ELSE 0 END DESC,
              CASE WHEN sale_price IS NOT NULL THEN 1 ELSE 0 END DESC,
              _source_row
          ) AS rn
        FROM ${raw("audit_pl_summary")}
      ) WHERE rn = 1
    ),
    -- ─────────────────────────────────────────────────────────────────
    -- audit_base: the original 8-table JOIN. Costs are cast to FLOAT64
    -- with NULL preserved (NULL means "no audit data"); rollups below
    -- treat NULL as 0 via IFNULL, matching JS safeNumber() exactly.
    -- ─────────────────────────────────────────────────────────────────
    audit_base AS (
      SELECT
        m.job_id,
        m.community,
        m.plan_name,
        m.address,
        m.city,
        m.lot,
        m.job_type,
        m.current_stage,
        SAFE_CAST(m.completion_pct AS FLOAT64) AS completion_pct,
        -- Sale: prefer summary (operator-curated) over sales-contract table
        COALESCE(sm.sale_price, SAFE_CAST(s.sale_price AS FLOAT64)) AS sale_price,
        s.buyer_name,
        s.status AS sale_status,
        -- ── Summary-only fields (NULL for jobs not in summary) ──
        sm.net_profit AS _sm_net_profit,
        sm.net_margin AS _sm_net_margin,
        sm.total_cost AS _sm_total_cost,
        sm.total_direct_cost AS _sm_total_direct_cost,
        sm.total_indirect_cost AS _sm_total_indirect_cost,
        sm.proceeds AS proceeds,
        sm.cost_to_sale AS cost_to_sale,
        sm.seller_credit AS seller_credit,
        sm.amount_drawn AS amount_drawn,
        sm.loan_amount AS sheet_loan_amount,
        sm.lender AS sheet_lender,
        sm.loan_closing_date AS loan_closing_date,
        sm.last_interest_payment_date AS last_interest_payment_date,
        sm.completion_date AS sheet_completion_date,
        sm.bgh_total AS bgh_total,
        sm.bgh_margin AS bgh_margin,
        sm.contingency AS contingency,
        sm.correction AS correction,
        sm.financing_left AS financing_left,
        sm.total_financing AS total_financing,
        sm.current_vertical_budget AS current_vertical_budget,
        sm.vertical_difference AS vertical_difference,
        sm.total_vertical AS total_vertical,
        sm.vertical_cost_left AS vertical_cost_left,
        sm.budgeted_permitting AS budgeted_permitting,
        sm.permitting_left AS permitting_left,
        sm.permitting_total AS permitting_total,
        sm.builder_fee_pct AS builder_fee_pct,
        sm.area_name AS sheet_area_name,
        sm.notes AS sheet_notes,
        sm._source_sheet AS pl_source_sheet,
        CASE WHEN sm.job_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_summary,
        -- Cost line items: prefer the freshly-imported summary value (sm.*)
        -- over the stale 3/17 audit_* upload. For jobs in BOTH, summary wins;
        -- for sheet-only jobs (no audit_costs row), summary is the only source.
        COALESCE(sm.lot_land, SAFE_CAST(c.Lot___Land AS FLOAT64)) AS lot_land,
        COALESCE(sm.permitting, SAFE_CAST(c.Permitting AS FLOAT64)) AS permitting,
        COALESCE(sm.site_work, SAFE_CAST(c.Site_Work AS FLOAT64)) AS cost_site_work,
        COALESCE(sm.vertical, SAFE_CAST(c.Vertical AS FLOAT64)) AS cost_vertical,
        COALESCE(sm.options, SAFE_CAST(c.Options AS FLOAT64)) AS cost_options,
        COALESCE(sm.closing_cost, SAFE_CAST(c.Closing_Cost AS FLOAT64)) AS closing_cost,
        COALESCE(sm.financing, SAFE_CAST(c.Financing AS FLOAT64)) AS financing,
        COALESCE(sm.insurance_builder_risk, SAFE_CAST(c.Insurance_Builder_s_Risk AS FLOAT64)) AS insurance,
        SAFE_CAST(c.Warranty AS FLOAT64) AS warranty,  -- no sheet equivalent (Audits tab has no Warranty column)
        -- Dirt (total stays FLOAT64; line items individually too)
        COALESCE(SAFE_CAST(d.Import_Fill_Dirt AS FLOAT64), 0)
          + COALESCE(SAFE_CAST(d.Pad_Build AS FLOAT64), 0) AS dirt_total,
        SAFE_CAST(d.Import_Fill_Dirt AS FLOAT64) AS import_fill_dirt,
        SAFE_CAST(d.Pad_Build AS FLOAT64) AS pad_build,
        -- Dumpsters
        SAFE_CAST(du.Dumpsters___Portable_Toilets AS FLOAT64) AS dumpsters,
        -- Env
        COALESCE(SAFE_CAST(e.Gopher_Tortoise_Survey AS FLOAT64), 0)
          + COALESCE(SAFE_CAST(e.Tree_Survey AS FLOAT64), 0) AS env_total,
        SAFE_CAST(e.Gopher_Tortoise_Survey AS FLOAT64) AS gopher_tortoise_survey,
        SAFE_CAST(e.Tree_Survey AS FLOAT64) AS tree_survey,
        -- Utilities
        COALESCE(SAFE_CAST(u.Individual_Well AS FLOAT64), 0)
          + COALESCE(SAFE_CAST(u.Septic_System AS FLOAT64), 0)
          + COALESCE(SAFE_CAST(u.Water_Filtration_System AS FLOAT64), 0) AS utilities_total,
        SAFE_CAST(u.Individual_Well AS FLOAT64) AS individual_well,
        SAFE_CAST(u.Septic_System AS FLOAT64) AS septic_system,
        SAFE_CAST(u.Water_Filtration_System AS FLOAT64) AS water_filtration_system,
        -- Interest (placeholder until Phase B brings in monthly interest from loan tracker)
        CAST(0 AS FLOAT64) AS monthly_interest,
        -- AP & Builder Fee. builder_fee prefers the sheet-imported value
        -- (audit_pl_summary.builder_fee from the Audits tab "Builder Fee" col),
        -- falling back to the stale audit_bbg_ap.AP_to_BBG raw table.
        SAFE_CAST(ap.Total_AP AS FLOAT64) AS total_ap,
        COALESCE(sm.builder_fee, SAFE_CAST(bbg.AP_to_BBG AS FLOAT64)) AS builder_fee,
        -- Actuals
        SAFE_CAST(va.Vertical AS FLOAT64) AS actual_vertical,
        SAFE_CAST(va.Site_Work AS FLOAT64) AS actual_site_work,
        -- Metadata
        CURRENT_TIMESTAMP() AS _mart_refreshed_at
      FROM ${raw("construction_milestones")} m
      LEFT JOIN ${raw("audit_costs")} c ON m.job_id = c.Row_Labels
      LEFT JOIN ${raw("audit_dirt")} d ON m.job_id = d.Row_Labels
      LEFT JOIN ${raw("audit_dumpsters")} du ON m.job_id = du.Row_Labels
      LEFT JOIN ${raw("audit_env")} e ON m.job_id = e.Row_Labels
      LEFT JOIN ${raw("audit_utilities")} u ON m.job_id = u.Row_Labels
      LEFT JOIN ${raw("audit_total_ap")} ap ON m.job_id = ap.Job_No
      LEFT JOIN ${raw("audit_bbg_ap")} bbg ON m.job_id = bbg.Job_No
      LEFT JOIN ${raw("audit_vertical_sitework_actual")} va ON m.job_id = va.Project____Job
      LEFT JOIN latest_sale s ON m.community = s.community AND m.lot = s.lot_id AND s.rn = 1
      LEFT JOIN audit_summary_dedup sm ON m.job_id = sm.job_id
      WHERE (c.Row_Labels IS NOT NULL OR sm.job_id IS NOT NULL)
        AND (m.closed_date IS NULL OR SAFE_CAST(m.closed_date AS DATE) >= '2022-01-01')
    ),
    -- ─────────────────────────────────────────────────────────────────
    -- audit_rollups: sum line items into the three cost buckets.
    -- Each addend is IFNULL(x, 0) — exact parity with safeNumber() in JS.
    -- ─────────────────────────────────────────────────────────────────
    audit_rollups AS (
      SELECT
        *,
        IFNULL(lot_land, 0)
          + IFNULL(permitting, 0)
          + IFNULL(cost_site_work, 0)
          + IFNULL(cost_vertical, 0)
          + IFNULL(cost_options, 0)
          + IFNULL(dirt_total, 0)
          + IFNULL(dumpsters, 0)
          + IFNULL(env_total, 0)
          + IFNULL(utilities_total, 0)
          AS construction_costs,
        IFNULL(builder_fee, 0)
          + IFNULL(insurance, 0)
          + IFNULL(closing_cost, 0)
          + IFNULL(warranty, 0)
          AS overhead,
        IFNULL(financing, 0)
          + IFNULL(monthly_interest, 0)
          AS other_expenses
      FROM audit_base
    ),
    -- ─────────────────────────────────────────────────────────────────
    -- audit_totals: derive computed totals from the three buckets. These
    -- are FALLBACKS — when audit_pl_summary has its own total_cost etc.,
    -- the COALESCE in audit_final prefers those.
    -- ─────────────────────────────────────────────────────────────────
    audit_totals AS (
      SELECT
        *,
        construction_costs AS _computed_total_direct_cost,
        (overhead + other_expenses) AS _computed_total_indirect_cost,
        (construction_costs + overhead + other_expenses) AS _computed_total_cost
      FROM audit_rollups
    ),
    -- ─────────────────────────────────────────────────────────────────
    -- audit_margins: computed P&L derivations (fallbacks). NULL when
    -- inputs missing — same gating as JS:
    --   net_revenue       = sale_price > 0 ? sale_price : NULL
    --   gross_margin      = sale_price > 0 ? sale_price - construction - overhead : NULL
    --   _computed_net_profit = sale_price > 0 AND total > 0 ? sale_price - total : NULL
    -- ─────────────────────────────────────────────────────────────────
    audit_margins AS (
      SELECT
        *,
        CASE WHEN sale_price > 0 THEN sale_price ELSE NULL END AS net_revenue,
        CASE WHEN sale_price > 0
          THEN sale_price - construction_costs - overhead
          ELSE NULL END AS gross_margin,
        CASE WHEN sale_price > 0 AND _computed_total_cost > 0
          THEN sale_price - _computed_total_cost
          ELSE NULL END AS _computed_net_profit
      FROM audit_totals
    ),
    -- ─────────────────────────────────────────────────────────────────
    -- audit_final: COALESCE summary (sheet) values over computed ones.
    -- pl_source tags each row so consumers can tell which path it took.
    -- ─────────────────────────────────────────────────────────────────
    audit_final AS (
      SELECT
        * EXCEPT (
          _sm_net_profit, _sm_net_margin, _sm_total_cost,
          _sm_total_direct_cost, _sm_total_indirect_cost,
          _computed_total_cost, _computed_total_direct_cost, _computed_total_indirect_cost,
          _computed_net_profit
        ),
        COALESCE(_sm_total_cost, _computed_total_cost) AS total_cost,
        COALESCE(_sm_total_direct_cost, _computed_total_direct_cost) AS total_direct_cost,
        COALESCE(_sm_total_indirect_cost, _computed_total_indirect_cost) AS total_indirect_cost,
        COALESCE(_sm_net_profit, _computed_net_profit) AS net_profit,
        COALESCE(
          _sm_net_margin,
          CASE WHEN sale_price > 0 AND _computed_net_profit IS NOT NULL
            THEN _computed_net_profit / sale_price ELSE NULL END
        ) AS net_margin,
        CASE WHEN has_summary THEN 'sheet' ELSE 'computed' END AS pl_source
      FROM audit_margins
    ),
    -- ─────────────────────────────────────────────────────────────────
    -- audit_pl_estimated_final: replicates the "Summary" tab's
    -- "Estimated, final accounting P&L" formula. The Audits-tab Net Profit
    -- only deducts the contract-side Total Cost; the Summary tab deducts
    -- an ADDITIONAL bundle of post-close costs (property taxes, commissions,
    -- warranty, COGS-closing) that the operations team applies as policy.
    --
    -- For job 00241-000042: Audits net_profit=$16,002 (sale - total_cost),
    -- but the operator's expected final is $12,852 (after post-close costs).
    --
    -- Policy constants are encoded HERE in SQL because they're identical
    -- across both Investor Audits and BPOF Audits books (verified 2026-05-28).
    -- If the operations team changes a constant, update this CTE.
    --
    -- The estimate uses the Audits-tab Sales Price (contract value), NOT
    -- any manual Sales Price override in the Summary tab — capturing those
    -- overrides would require scraping the Summary tab per job (TODO P5).
    -- ─────────────────────────────────────────────────────────────────
    audit_pl_estimated_final AS (
      SELECT
        *,
        -- Policy constants (flat-dollar)
        CAST(1000.0 AS FLOAT64) AS property_taxes_on_hud_est,    -- HUD line item, paid at closing
        CAST(1500.0 AS FLOAT64) AS cogs_closing_costs_est,        -- COGS-side closing fees (distinct from Closing Cost)
        CAST(500.0 AS FLOAT64) AS warranty_coverage_est,          -- 2-10 home warranty
        -- Commission policy (percent-of-sale)
        IFNULL(sale_price, 0) * 0.02 AS cogs_commission_internal_est,
        IFNULL(sale_price, 0) * 0.03 AS cogs_commission_external_est
      FROM audit_final
    ),
    audit_pl_estimated_totals AS (
      SELECT
        *,
        -- Total Other Expenses (matches Summary tab row 27 formula)
        (property_taxes_on_hud_est
          + IFNULL(seller_credit, 0)
          + cogs_closing_costs_est
          + cogs_commission_internal_est
          + cogs_commission_external_est
          + warranty_coverage_est
          + IFNULL(total_financing, 0)
        ) AS total_other_expenses_est,
        -- "Gross construction" matches Summary tab row 17 (direct construction costs)
        -- Note: uses permitting_total (rolled) not permitting (line item); total_vertical (rolled) not cost_vertical (line item).
        -- Line item columns (cost_site_work, cost_options) come from the line-item line via audit_base's COALESCE.
        -- Contingency is INTENTIONALLY excluded — Summary tab hardcodes it to $0 even when Audits shows a value.
        (IFNULL(lot_land, 0)
          + IFNULL(permitting_total, 0)
          + IFNULL(cost_site_work, 0)
          + IFNULL(total_vertical, 0)
          + IFNULL(cost_options, 0)
          + IFNULL(builder_fee, 0)
          + IFNULL(insurance, 0)
          + IFNULL(closing_cost, 0)
        ) AS construction_costs_summary_est
      FROM audit_pl_estimated_final
    )
    SELECT
      *,
      -- ─── Estimated-final Net Profit (matches Summary tab semantics) ───
      -- Net Profit = Sales Price - Construction Costs (Summary def) - Total Other Expenses
      -- For sold/contracted jobs, prefer this over net_profit for the operator's mental model.
      CASE WHEN sale_price > 0
        THEN sale_price - construction_costs_summary_est - total_other_expenses_est
        ELSE NULL END AS net_profit_estimated_final,
      CASE WHEN sale_price > 0
        THEN (sale_price - construction_costs_summary_est - total_other_expenses_est) / sale_price
        ELSE NULL END AS net_margin_estimated_final,
      -- margin_status: traffic light based on FINAL net_profit/net_margin.
      -- Uses the Audits-tab Net Profit (contract-side). For an "operator's final" view,
      -- consumers should switch to net_margin_estimated_final and re-bucket.
      CASE
        WHEN sale_price IS NULL OR sale_price <= 0 THEN 'missing revenue'
        WHEN total_cost IS NULL OR total_cost <= 0 THEN 'missing cost'
        WHEN net_profit < 0 THEN 'loss'
        WHEN net_margin < 0.08 THEN 'at-risk'
        WHEN net_margin < 0.12 THEN 'watch'
        ELSE 'good'
      END AS margin_status,
      -- data_quality_flag: which inputs are missing.
      CASE
        WHEN job_id IS NULL OR job_id = '' THEN 'missing job key'
        WHEN (sale_price IS NULL OR sale_price <= 0)
          AND (total_cost IS NULL OR total_cost <= 0) THEN 'missing revenue and cost'
        WHEN sale_price IS NULL OR sale_price <= 0 THEN 'missing revenue'
        WHEN total_cost IS NULL OR total_cost <= 0 THEN 'missing cost'
        ELSE 'ready'
      END AS data_quality_flag,
      -- pl_readiness: roll-up.
      CASE
        WHEN job_id IS NULL OR job_id = '' THEN 'blocked'
        WHEN sale_price > 0 AND total_cost > 0 THEN 'ready'
        WHEN sale_price > 0 OR total_cost > 0 THEN 'partial'
        ELSE 'blocked'
      END AS pl_readiness
    FROM audit_pl_estimated_totals
    ORDER BY community, lot
  `);

  // ── MART 2: mart_daily_summary ─────────────────────────────────────
  // Pre-aggregated KPIs snapshot. Eliminates the combined summary query.
  console.log("\n[2/3] mart_daily_summary (pre-aggregated KPIs)");
  await createOrReplace("mart_daily_summary", `
    WITH p AS (
      SELECT
        COUNT(DISTINCT job_id) AS total_jobs,
        COUNT(DISTINCT job_id) AS total_inventory_jobs,
        COUNTIF(job_type IN ('SFR Construction In Progress', 'Awaiting CO', 'On Hold', 'POs Released', 'SFR Completed (not closed)')) AS construction_scope_jobs,
        COUNTIF(job_type IN ('SFR Construction In Progress', 'Awaiting CO', 'On Hold', 'POs Released')) AS active_construction,
        COUNTIF(job_type = 'SFR Completed (not closed)') AS coed_not_closed,
        AVG(SAFE_CAST(completion_pct AS FLOAT64)) AS avg_completion,
        SUM(COALESCE(SAFE_CAST(wip AS FLOAT64), 0)) AS total_wip,
        SUM(COALESCE(SAFE_CAST(lot_cost AS FLOAT64), 0)) AS total_lot_cost,
        SUM(COALESCE(SAFE_CAST(original_budget AS FLOAT64), 0)) AS total_budget,
        SUM(COALESCE(SAFE_CAST(job_cost_amount AS FLOAT64), 0)) AS total_actual,
        SUM(COALESCE(SAFE_CAST(loan_amount AS FLOAT64), 0)) AS total_loan_amount,
        SUM(COALESCE(SAFE_CAST(total_drawn AS FLOAT64), 0)) AS total_drawn,
        COUNTIF(loan_amount IS NOT NULL AND SAFE_CAST(loan_amount AS FLOAT64) > 0) AS jobs_with_loans
      FROM ${raw("construction_milestones")}
      WHERE ${currentInventoryWhere()}
    ),
    s AS (
      SELECT
        COUNT(*) AS total_contracts,
        SUM(COALESCE(SAFE_CAST(sale_price AS FLOAT64), 0)) AS total_sales_value
      FROM ${raw("sales")}
      WHERE status IS NOT NULL
    )
    SELECT p.*, s.*, CURRENT_TIMESTAMP() AS _mart_refreshed_at
    FROM p, s
  `);

  // ── MART 3: mart_filter_quality ────────────────────────────────────
  // Pre-computed filter options + data quality checks.
  // Eliminates the 7-way UNION ALL query on milestones.
  console.log("\n[3/3] mart_filter_quality (filter options + quality checks)");
  await createOrReplace("mart_filter_quality", `
    SELECT 'filter' AS category, 'city' AS filter_type, city AS filter_value, COUNT(*) AS cnt,
      CAST(NULL AS FLOAT64) AS coverage, CAST(NULL AS INT64) AS covered_rows,
      CAST(NULL AS INT64) AS total_rows, CAST(NULL AS STRING) AS label
    FROM ${raw("construction_milestones")}
    WHERE city IS NOT NULL AND ${currentInventoryWhere()}
    GROUP BY city
    UNION ALL
    SELECT 'filter', 'job_type', job_type, COUNT(*), NULL, NULL, NULL, NULL
    FROM ${raw("construction_milestones")}
    WHERE job_type IS NOT NULL AND ${currentInventoryWhere()}
    GROUP BY job_type
    UNION ALL
    SELECT 'filter', 'area_name', company_name, COUNT(*), NULL, NULL, NULL, NULL
    FROM ${raw("construction_milestones")}
    WHERE company_name IS NOT NULL AND ${currentInventoryWhere()}
    GROUP BY company_name
    UNION ALL
    SELECT 'quality', NULL, NULL, NULL,
      SAFE_DIVIDE(COUNTIF(completion_pct IS NOT NULL), COUNT(*)),
      COUNTIF(completion_pct IS NOT NULL), COUNT(*), 'Completion %'
    FROM ${raw("construction_milestones")}
    WHERE ${currentInventoryWhere()}
    UNION ALL
    SELECT 'quality', NULL, NULL, NULL,
      SAFE_DIVIDE(COUNTIF(wip IS NOT NULL), COUNT(*)),
      COUNTIF(wip IS NOT NULL), COUNT(*), 'WIP populated'
    FROM ${raw("construction_milestones")}
    WHERE ${currentInventoryWhere()}
    UNION ALL
    SELECT 'quality', NULL, NULL, NULL,
      SAFE_DIVIDE(COUNTIF(lot_cost IS NOT NULL), COUNT(*)),
      COUNTIF(lot_cost IS NOT NULL), COUNT(*), 'Lot cost populated'
    FROM ${raw("construction_milestones")}
    WHERE ${currentInventoryWhere()}
    UNION ALL
    SELECT 'quality', NULL, NULL, NULL,
      SAFE_DIVIDE(COUNTIF(superintendent IS NOT NULL), COUNT(*)),
      COUNTIF(superintendent IS NOT NULL), COUNT(*), 'Superintendent assigned'
    FROM ${raw("construction_milestones")}
    WHERE ${currentInventoryWhere()}
  `);

  console.log("\n=== All marts created successfully ===");
  console.log("Run this script daily (e.g. via cron at 6am) to keep marts fresh.");
  console.log("Dashboard queries should now read from mart tables instead of raw JOINs.");
}

run().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
