# Client Onboarding Guide

End-to-end process for auditing a client's data warehouse and building their dashboard. Every client gets a fully isolated Next.js 15 app — no shared runtime code between clients.

---

## Folder Structure

```
client_scaffold/
  clients/
    brite_homes/
      .env                    <- BigQuery credentials
      bigquery.yaml           <- dataset schema + thresholds
      kpi_assessment.md       <- audit results (ready/partial/blocked)
      raw_transforms.sql      <- source -> raw table DDL
      next_dashboard/         <- STANDALONE Next.js 15 app
        .env.local
        app/
          page.js             <- Server component (fetches data, uses revalidate = 86400)
          layout.js           <- Root layout with theme support
          globals.css         <- Full design system (~550 lines)
        lib/
          bigquery.js         <- BQ client config (module-cached)
          dashboard-data.js   <- BigQuery queries (~560 lines)
        components/
          dashboard-shell.js  <- Main UI (~2100 lines)
          theme-toggle.js     <- Dark/light toggle
        import_xlsx_to_bq.js  <- XLSX -> BigQuery import script
    fsp/
      .env
      bigquery.yaml
      next_dashboard/         <- STANDALONE Next.js app (separate code)
  switch-client.sh            <- launches the correct client app
  CLIENT_ONBOARDING_GUIDE.md  <- this file
  DASHBOARD_SHELL_BUILD_GUIDE.md <- shell build reference
```

**Rule**: Each client's `next_dashboard/` is a self-contained app with its own dashboard-data.js, dashboard-shell.js, globals.css, and package.json. Never write one client's code into another client's folder.

---

## Phase 1: Connect & Discover

### 1a: Set up BigQuery credentials

Create `clients/{client}/.env`:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT=project-id
BIGQUERY_PROJECT_ID=project-id
BIGQUERY_RAW_DATASET={client}_raw
BIGQUERY_MARTS_DATASET={client}_marts
DASHBOARD_CLIENT_NAME=Client Name
```

### 1b: List all available tables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node -e "
const {BigQuery} = require('@google-cloud/bigquery');
const bq = new BigQuery({projectId:'project-id'});
bq.dataset('client_raw').getTables().then(([t]) => t.forEach(x => console.log(x.id)));
"
```

### 1c: Profile each table

For every table, run a column-level audit:

```sql
-- Row count
SELECT COUNT(*) AS total_rows FROM `project.dataset.table`;

-- Column completeness (run per column)
SELECT
  COUNT(*) AS total,
  COUNTIF(column IS NOT NULL) AS populated,
  ROUND(COUNTIF(column IS NOT NULL) / COUNT(*) * 100, 1) AS pct
FROM `project.dataset.table`;

-- Distinct values for categorical columns
SELECT column, COUNT(*) AS cnt
FROM `project.dataset.table`
WHERE column IS NOT NULL
GROUP BY column
ORDER BY cnt DESC;
```

Key things to check per column:
- **Completeness**: What % of rows have a non-null, non-empty value?
- **Type**: Is it actually the type it claims? (Google Sheets sources often store numbers as STRING)
- **Cardinality**: How many distinct values? (Helps decide if it's useful for grouping/filtering)
- **Distribution**: Are values clustered or spread? (A field that's 95% one value isn't useful for charts)

### 1d: Document schema in bigquery.yaml

```yaml
client:
  name: "Client Name"
  slug: "client_slug"
  erp_system: "csv"        # or: buildertrend, cmic, newstar, etc.

stack:
  type: "google"
  warehouse: "bigquery"

bigquery:
  project_id: "project-id"
  raw_dataset: "client_raw"
  staging_dataset: "client_staging"
  marts_dataset: "client_marts"
  location: "US"

thresholds:
  schedule_delay_days: 14
  cost_variance_pct: 0.10
  stale_update_days: 7
  vendor_variance_pct: 0.15
```

---

## Phase 2: KPI Assessment

Cross-reference the column-level audit against each KPI domain below. Score every KPI as `ready`, `partial`, or `blocked`.

### Scoring Rules

| Score | Meaning | Action |
|-------|---------|--------|
| **ready** | Required fields meet minimum completeness threshold | Build the visualization |
| **partial** | Fields exist but below threshold, or key fields missing | Build with caveat banner |
| **blocked** | Fields missing, empty, or <5% populated | Do not build — note what's needed |

### Domain 1: Construction Progress & Milestones

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| CP-01: Jobs by Stage | `current_stage`, `job_id` | stage >= 60% | Horizontal bar |
| CP-02: Completion % Distribution | `completion_pct`, `job_id` | pct >= 50% | Histogram (5 buckets) |
| CP-03: Milestone Tracker | 5+ milestone date fields | each >= 40% | Compact table |
| CP-04: Avg Cycle Time | `start_to_completion_days` | >= 50% | Bar by community |
| CP-05: Phase Cycle Times | 3+ phase duration fields | each >= 35% | Vertical bar chart |
| CP-06: Jobs by Type | `job_type`, `job_id` | type >= 90% | Donut + legend (clickable) |
| CP-07: Super Workload | `superintendent`, `job_type` | super >= 50% | Performance table |
| CP-08: PM Workload | `project_manager`, `job_type` | pm >= 40% | Ranked bar |
| CP-09: Overdue Lots | `closing_date`, `closed_date` | each >= 40% | Alert table |
| CP-10: Stage Outliers / Stalls | `current_stage` + milestone dates | stage >= 60% | Stall alert table (>60 days) |

### Domain 2: Financial / Job Profitability

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| FP-01: Budget vs Actual | `original_budget`, `job_cost_amount` | both >= 30% | Bar chart |
| FP-02: Variance by Job | `variance_in_flight` | >= 30% | Pos/neg bar |
| FP-03: WIP Summary | `wip`, `community` | wip >= 50% | KPI + ranked bar |
| FP-04: WIP Without Lot | `wip_without_lot` | >= 50% | KPI card |
| FP-05: Lot Cost Summary | `lot_cost`, `community` | lot_cost >= 80% | KPI + bar |
| FP-06: Equity Position | `equity` | >= 30% | KPI + table |
| FP-07: Margin by Community | sale_price + cost fields + `community` | cost fields populated | Community scorecard |
| FP-08: Margin by Plan | sale_price + cost fields + `plan_name` | cost fields populated | Bar |

### Domain 3: Loan & Draw Tracking

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| LN-01: Loan Exposure | `loan_amount`, `total_drawn` | both >= 20% | KPI cards |
| LN-02: Draw % by Job | `loan_amount`, `total_drawn`, `job_id` | both >= 20% | Progress bars |
| LN-03: Expiring Loans | `loan_days_until_expiration` | >= 15% | Alert table |
| LN-04: Lender Distribution | `lender`, `loan_amount` | lender >= 20% | Concentration table |
| LN-05: Interest Rate Dist. | `interest_rate` | >= 20% | Histogram |

### Domain 4: Sales & Closings

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| SL-01: Sales by Status | `status` | >= 60% | Bar |
| SL-02: Pipeline Value | `sale_price`, `status` | price >= 50% | KPI card |
| SL-03: Sales by Community | `community`, `sale_price` | community >= 90% | Bar |
| SL-04: Closing Pipeline | `projected_close`, `sale_price` | projected >= 40% | Timeline |
| SL-05: Sales by Plan | `plan_name`, `sale_price` | plan >= 60% | Bar |
| SL-06: Absorption Rate | `contract_date` | >= 40% | Line |
| SL-07: Cancellation Rate | `cancellation_date`, `status` | status >= 60% | KPI |

### Domain 5: Geographic / Portfolio

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| GE-01: Jobs by County | `county`, `job_id` | county >= 90% | Bar |
| GE-02: Jobs by City | `city`, `job_id` | city >= 90% | Bar |
| GE-03: Jobs by Entity | `company_name`, `job_id` | >= 90% | Bar |
| GE-04: Community Summary | `community`, `job_type`, `wip` | community >= 90% | Summary table |

### Domain 6: Vendor Scorecard

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| VN-01: PO Value by Vendor | `vendor_name`, `po_amount` | both >= 80% | Bar |
| VN-02: Vendor Variance | `po_amount`, `invoiced_amount` | both >= 70% | Bar |
| VN-03: Open PO Count | `vendor_name`, `status` | both >= 70% | Table |
| VN-04: Vendor Ranking | `vendor_name`, `total_po_value` | both >= 70% | Ranked bar |

> Requires PO-level data from ERP. If no vendor/PO table exists, block entire domain.

### Domain 7: Exception Center

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| EX-01: By Severity | `severity`, `exception_type` | both >= 90% | Bar |
| EX-02: By Type | `exception_type`, `affected_entity` | type >= 90% | Bar |
| EX-03: Aging | `days_outstanding`, `severity` | days >= 80% | Table |
| EX-04: High-Priority Queue | `severity = 'HIGH'` rows | rows exist | Filtered table |

### Domain 8: Land Acquisition

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| LA-01: Active Deals | `land_acquisition_active.*` | table exists | KPI card |
| LA-02: Closed Acquisitions | `land_acquisition_closed.*` | table exists | KPI card |
| LA-03: Cancel Rate | `land_acquisition_cancelled.*` | table exists | KPI card |
| LA-04: Deals by City | `city` | >= 80% | Ranked bars |
| LA-05: Acquisition by City Breakdown | `city`, pricing fields | >= 80% | Summary table |
| LA-06: Subdivision Pipeline Count | `subdivision_pipeline.*` | table exists | KPI card |
| LA-07: Lot Price Trends | pricing + date fields | >= 40% | Table |
| LA-08: Year x City Cross-Tab | year + city fields | >= 40% | Cross-tab table |

> Requires land acquisition tables (active, closed, cancelled) and/or subdivision pipeline. If no land data exists, omit LAND section entirely.

### Domain 9: Permitting

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| PT-01: Jobs in Permitting | `job_type = 'Permitting'` or permitting table | >= 10 jobs | KPI card |
| PT-02: Avg Days in Permitting | milestone date deltas | dates >= 40% | KPI card |
| PT-03: Stuck >90d Count | permitting duration calc | dates >= 40% | KPI card (alert tone) |
| PT-04: Permits by Stage | `status` or stage field | >= 60% | SVG donut chart |
| PT-05: Permits by City | `city` | >= 80% | Ranked bars |
| PT-06: Environmental Issues | `env_issues` or audit_env table | table exists | KPI card |
| PT-07: Cycle Time by City | `city` + date fields | >= 40% | Table |
| PT-08: Year x City Starts | year + city fields | >= 40% | Cross-tab table |

> Permitting data can come from milestones (filtered by type), a dedicated permitting table, or an external import (e.g., cd2_permitting). If no permitting data exists, omit PERMITTING section.

### Domain 10: Per-Job P&L Audits

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| PL-01: Pro Forma Card | Audit cost tables + sale price | audit rows exist | Inline expandable card |
| PL-02: Configurable Defaults | Plan names, cities, cost categories | plan/city populated | Settings gear (localStorage) |
| PL-03: Cost Breakdown | lot, permitting, site work, vertical, options, closing, financing, insurance, warranty | audit_costs populated | Line-item P&L |

> Requires per-job cost breakdown tables (audit_costs, audit_dirt, audit_dumpsters, audit_env, audit_utilities, etc.). If no audit tables exist, block this domain.

### Domain 11: Property Management

| KPI | Required Fields | Min Threshold | Chart Type |
|-----|----------------|---------------|------------|
| PM-01: Portfolio KPIs | `status`, `market_rent`, `rent`, `deposit` | each >= 70% | 8 KPI cards |
| PM-02: Occupancy Rate | `status` (Occupied/Vacant) | >= 70% | Donut chart |
| PM-03: By-City Breakdown | `city`, `market_rent` | city >= 90% | Summary table |
| PM-04: Delinquency | `amount_receivable`, `tenant_name` | receivable populated | Alert table |
| PM-05: Rent Roll | Full lease/tenant fields | each >= 60% | Spreadsheet table |

> Requires pm_master + pm_delinquency tables. Import via import_xlsx_to_bq.js from xlsx.

### Output: kpi_assessment.md

Write the results as a markdown file at `clients/{client}/kpi_assessment.md`. For each domain, list every KPI with its score and rationale. End with:

1. **Ship** — which KPIs to build
2. **Ship with caveat** — partial KPIs to include with data quality warnings
3. **Block** — what NOT to build and what data is needed
4. **Recommended tabs** — which dashboard pages the data supports

---

## Phase 3: Build the Dashboard

### 3a: Scaffold the app

```bash
mkdir -p clients/{client}/next_dashboard/{app,lib,components}
```

Copy boilerplate from any existing client:
- `package.json`, `next.config.mjs`, `jsconfig.json`
- `lib/bigquery.js` (generic — reads env vars)
- `components/theme-toggle.js` (no client logic)
- `.env.local` <- copy from `clients/{client}/.env`

```bash
cd clients/{client}/next_dashboard && npm install
```

### 3b: Determine tab structure from assessment

Map ready/partial KPI domains to the multi-section layout:

```
CONSTRUCTION (up to 4 tabs)
  Dashboard   <- always include (aggregates headline KPIs, job status, community breakdown)
  Pipeline    <- include if CP-01 + completion_pct available (kanban board with phase swim lanes)
  Cycle Time  <- include if CP-02, CP-03, CP-05 phase duration data available
  Cost Metrics <- include if FP-01..FP-06 cost/budget data available

SALES (1-2 tabs)
  Dashboard   <- include if sale_price + cost data available for margin calc
  Pipeline    <- include if any SL-xx is ready/partial (sales pipeline and closings tracker)

LOANS (1 tab)
  Dashboard   <- include if any LN-xx is ready/partial (loan portfolio, draws, expirations)

AUDITS (1 tab)
  P&L Audits  <- include if audit cost tables exist (per-job pro forma cards)

PROPERTY MGMT (1-2 tabs)
  Dashboard   <- include if pm_master table exists (dashboard + roster + delinquency)
  Pipeline    <- include if PM pipeline data available
```

Omit sections/tabs with no supporting data.

### 3c: Write dashboard-data.js

This is the server-side data layer. Pattern:

```js
export async function getDashboardData() {
  const client = createBigQueryClient();
  const [result1, result2, ...] = await Promise.all([
    queryFirstRow(client, `SELECT ... FROM ${rawTable("table")}`),
    queryRows(client, `SELECT ... FROM ${rawTable("table")}`),
  ]);
  return { summaries: {...}, roster: [...], ... };
}
```

Rules:
- All queries run in parallel via `Promise.all`
- Wrap numeric columns from Google Sheets sources with `SAFE_CAST(col AS FLOAT64)`
- Normalize BigQuery temporal values with `normalizeTemporalValue()` (unwraps `{value: "date"}` objects)
- Always implement `buildUnavailableDashboard()` fallback with matching return shape
- Always `console.error` in the catch block — silent failures are the #1 debugging obstacle
- Use `.catch()` on individual queries that may not exist (e.g., audit tables, PM tables) to prevent cascade failures
- For dollar values stored as strings with `$` and `,` (e.g., audit_in_construction), use `REPLACE()` chains before `SAFE_CAST`

### 3d: Write dashboard-shell.js

The shell is a single `"use client"` component that contains all tab components. Pattern per tab:

```jsx
function TabName({ data, setFilters }) {
  return (
    <>
      <div className="kpi-row">        {/* 4-5 KPI cards -- always first */}
      <div className="panels-row">      {/* 2-col charts/bars */}
      <div className="panels-row single"> {/* full-width table */}
    </>
  );
}
```

Key UI components available:
- `KpiCard` — clickable KPI cards with label/value/sub/tone
- `RankedBars` — collapsible ranked bar chart (show top 6, expandable)
- `DonutChart` + `DonutLegend` — SVG-based donut chart with stroke-dasharray animation and clickable legend
- `SpreadsheetTable` — full-featured table (frozen columns, sticky headers, column filters, drag-to-reorder)
- `DrillDownTable` — sticky side drawer for chart drill-downs
- `FilterBar` + `FilterDropdown` — global filter controls (City, Job Type, Entity, Community chip)

### 3e: Write globals.css

Copy from the nearest existing client's CSS. The design system is standardized:

| Token | Value |
|-------|-------|
| `--rail-width` | 140px |
| `--max-width` | 1920px |
| KPI row | 4-col grid, 10px gap |
| Panels row | 2-col grid, 12px gap |
| `.panels-row.triple` | 3-col grid |
| Table font | 11px, 8px column gap |
| Border radius | 8px cards, 5px tabs |

### 3f: Write app/layout.js and app/page.js

```jsx
// layout.js — update metadata title/description per client
export const metadata = { title: "Client -- Builder Ops Console" };

// page.js — uses ISR revalidation (not force-dynamic)
import { getDashboardData } from "../lib/dashboard-data.js";
import DashboardShell from "../components/dashboard-shell.js";
export const revalidate = 86400; // re-query BigQuery once every 24 hours
export default async function Home() {
  const dashboard = await getDashboardData();
  return <DashboardShell dashboard={dashboard} />;
}
```

### 3g: XLSX Import Script (if needed)

If the client provides data via xlsx files that need to be loaded into BigQuery, create `import_xlsx_to_bq.js`:

```js
const SHEETS = [
  { sheet: "SheetName", table: "bq_table_name",
    stringCols: ["Job_No", "Address", ...],  // prevent numeric parsing
    dropCols: ["InternalID", ...],           // exclude unneeded columns
    skipRows: 0 },                           // header row offset
];
```

The script:
- Reads xlsx sheets and sanitizes column names (`[^a-zA-Z0-9_]` -> `_`)
- Forces specified columns to STRING type (prevents job IDs becoming numbers)
- Drops internal ID columns
- Uses NDJSON load API for reliable BigQuery table creation
- Overwrites the target table on each run (WRITE_TRUNCATE)

---

## Phase 4: Test & Validate

### Quick checks

```bash
# Launch
cd clients/{client}/next_dashboard && npx next dev -p 3001

# Verify KPIs render (not zeros)
curl -s http://localhost:3001/ | grep -o 'kpi-value">[^<]*' | head -8

# Check for BigQuery errors in terminal output
# Look for: [dashboard-data] BigQuery error:
# Look for: [dashboard-data] audit query error:
# Look for: [dashboard-data] PM master error:
```

### Validation checklist

```
[ ] Server starts without errors
[ ] KPI values appear (not all zeros)
[ ] All tabs render without blank screens
[ ] Dropdown filters (City, Job Type, Entity) show options and filter correctly
[ ] Community chip filter works (click bar -> chip appears -> clears)
[ ] Dark and light themes both work
[ ] SpreadsheetTable: frozen columns scroll independently, column filters work, drag-to-reorder works
[ ] Construction > Dashboard: histogram bars are clickable, donut segments filter globally, side drawer appears
[ ] Sales > Dashboard: per-job P&L table rows are clickable (inline audit card)
[ ] Construction > Pipeline: sub-view switcher works (Construction/Inventory/Sales/Loan pipelines)
[ ] Construction > Cycle Time: budget vs actual table loads
[ ] Loans > Dashboard: lender concentration table populates
[ ] Audits tab: pro forma defaults gear opens, plan x market dropdowns populate, values persist after reload
[ ] PM tab: sub-view switcher works (Dashboard/Roster/Delinquency)
[ ] No console errors in browser DevTools
[ ] Test at 1440px, 1024px, and 768px widths
```

---

## Common Gotchas

### 1. Google Sheets -> BigQuery Type Mismatch

Sheets data arrives as STRING even for numbers. Causes `No matching signature for function COALESCE` errors.

**Fix**: `SAFE_CAST(column AS FLOAT64)` on all numeric columns from sheet-sourced tables.

**Prevention**: Check column types first:
```bash
node -e "
const {BigQuery} = require('@google-cloud/bigquery');
const bq = new BigQuery({projectId:'...'});
bq.dataset('raw').table('table').getMetadata()
  .then(([m]) => m.schema.fields.forEach(f => console.log(f.name, '->', f.type)));
"
```

### 2. Promise.all Cascade Failure

One bad query in `Promise.all` -> entire dashboard returns zeros. The catch block fires but the error is easy to miss.

**Fix**: Always log the error: `console.error("[dashboard-data]", error.message)`

**Mitigation for optional tables**: Use `.catch()` on individual queries that may fail (audit tables, PM tables, xlsx_sales_full). This prevents one missing table from taking down the entire dashboard.

### 3. BigQuery Date Objects

BigQuery returns `{ value: "2024-03-15" }` not `"2024-03-15"`. Use `normalizeTemporalValue()` in the data layer and `formatDate()` in the shell.

### 4. completion_pct Scale

Stored as 0-1 decimals (not 0-100). `formatPercent(0.85)` -> `"85.0%"`. The shell's `formatPercent()` auto-detects: if value <= 1, multiplies by 100.

### 5. Module-Level BigQuery Client Cache

`bigquery.js` caches the client instance. Changing `.env.local` requires a full server restart — hot reload won't pick it up.

### 6. Client Isolation

Each client's `next_dashboard/` is independent. If you need to update shared logic (e.g. bigquery.js), update it in each client's copy. Small duplication prevents cross-client contamination.

### 7. Dollar-Sign Strings in Audit Tables

Some audit tables (e.g., `audit_in_construction`) store dollar values as strings like `"$12,345.67"`. Must strip `$` and `,` before casting:
```sql
SAFE_CAST(REPLACE(REPLACE(REPLACE(field, '$', ''), ',', ''), ' ', '') AS FLOAT64)
```

### 8. Stale Data Filter

Exclude pre-2022 closed jobs from all queries to prevent stale historical data from skewing KPIs:
```sql
WHERE (closed_date IS NULL OR SAFE_CAST(closed_date AS DATE) >= '2022-01-01')
```

### 9. Data Revalidation

`page.js` uses `export const revalidate = 86400` (ISR) instead of `force-dynamic`. BigQuery data refreshes once per day. Do NOT use `force-dynamic` — it re-queries BigQuery on every page load.

---

## Launching a Client

```bash
# From client_scaffold/
./switch-client.sh brite_homes        # default port 3001
./switch-client.sh fsp 3002           # custom port
```

The script:
1. Checks the client directory exists
2. Kills any process on the port
3. Installs deps if `node_modules/` is missing
4. Runs `next dev` on the specified port
