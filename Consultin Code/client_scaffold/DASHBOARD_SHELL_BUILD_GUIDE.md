# Dashboard Shell Build Guide -- Per Client

This document describes the step-by-step process for building `dashboard-shell.js` and its supporting data layer for each new client. The shell is not one-size-fits-all -- it is **derived from the client's KPI assessment** and only renders what the warehouse can actually support.

---

## Prerequisites

Before building the shell, you must have completed:

1. **Warehouse Audit** -- table profiling with row counts, column completeness, and type checks
2. **KPI Assessment** -- `clients/{client}/kpi_assessment.md` exists with each KPI scored as `ready`, `partial`, or `blocked`
3. **BigQuery Connection** -- `.env.local` configured with service account credentials, project ID, and dataset names
4. **Schema Type Check** -- All columns used in queries have verified types (see "Gotcha: Google Sheets Type Propagation" below)
5. **XLSX Import** (if applicable) -- `import_xlsx_to_bq.js` configured and run for any xlsx-sourced tables

---

## Architecture Overview

```
page.js (server component, revalidate = 86400)
  +-- getDashboardData()        <- lib/dashboard-data.js (BigQuery queries)
       +-- createBigQueryClient() <- lib/bigquery.js (connection + table helpers)

DashboardShell (client component, "use client")
  |-- SECTIONS[] / ALL_TABS[]    <- lifecycle-based nav (7 sections, 12 tabs)
  |-- Collapsible sidebar        <- sections collapse/expand, tabs nested inside
  |-- Global filters             <- City, Job Type, Entity dropdowns + Community chip
  |-- Tab components             <- wrapper components that compose base tabs
  |-- SpreadsheetTable           <- reusable table (frozen cols, sticky headers, column filters)
  |-- DrillDownTable             <- sticky side drawer for chart drill-downs
  |-- Pro Forma Settings         <- localStorage-persisted defaults (Audits + Sales tabs)
  +-- RailNav + ShellBar         <- chrome (client name from env)
```

Three files change per client:
| File | What changes |
|------|-------------|
| `lib/bigquery.js` | Only env var defaults (project/dataset names) |
| `lib/dashboard-data.js` | Complete rewrite -- queries, field names, return shape |
| `components/dashboard-shell.js` | Complete rewrite -- tabs, KPIs, panels, drawer logic |

Two files are mostly the same across clients:
| File | Purpose |
|------|---------|
| `app/globals.css` | Design system -- component styles are reusable but may grow per-client |
| `components/theme-toggle.js` | Dark/light toggle -- no client-specific logic |

---

## Step 1: Determine Tabs from KPI Assessment

The navigation follows the **real estate development lifecycle**. There are 7 collapsible sections with 12 total tabs. Each section maps to a phase in the lifecycle.

Open `clients/{client}/kpi_assessment.md`. Map KPI domains to sections and tabs:

| Section | Tab ID | Tab Label | Include when |
|---------|--------|-----------|-------------|
| **Land** | `land` | Dashboard | Land acquisition tables exist (`land_acquisition_active`, etc.) |
| **Permitting** | `permitting` | Dashboard | Milestones roster has permitting-phase jobs |
| **Loans** | `loans` | Dashboard | Loan data available (LN-xx KPIs `ready` or `partial`) |
| **Construction** | `constructionDash` | Dashboard | Always -- aggregates headline KPIs + analytics |
| **Construction** | `constructionPipeline` | Pipeline | CP-01 + completion_pct available |
| **Construction** | `constructionCycle` | Cycle Time | CP-05, CP-06 milestone dates available |
| **Construction** | `constructionCost` | Cost Metrics | Budget/actual cost data available |
| **Sales** | `salesDash` | Dashboard | Sale price + cost data available for margin calculation |
| **Sales** | `salesPipeline` | Pipeline | xlsx_sales_full or equivalent sales roster exists |
| **Property Mgmt** | `pmDash` | Dashboard | pm_master table exists |
| **Property Mgmt** | `pmPipeline` | Pipeline | pm_master table exists (roster sub-view) |
| **Audits** | `audits` | P&L Audits | Per-job cost breakdown tables exist (audit_costs, etc.) |

### Decision: How many tabs?

- **12 tabs across 7 sections**: Full-featured (Brite Homes current state)
- **8-9 tabs across 5 sections**: Typical for builders with decent data but no land/PM tables
- **4-5 tabs across 3 sections**: Minimal -- Construction + Sales + one strong domain

### Output: Write the SECTIONS/TABS array

```js
const SECTIONS = [
  {
    label: "Land",
    tabs: [
      { id: "land", label: "Dashboard", title: "Land acquisition", desc: "Acquisition pipeline, lot pricing trends, and deal flow by city." },
    ],
  },
  {
    label: "Permitting",
    tabs: [
      { id: "permitting", label: "Dashboard", title: "Permitting pipeline", desc: "Permit status tracking, cycle times, and environmental issues." },
    ],
  },
  {
    label: "Loans",
    tabs: [
      { id: "loans", label: "Dashboard", title: "Loan management", desc: "Construction loan exposure, draw status, lender concentration, and expiration alerts." },
    ],
  },
  {
    label: "Construction",
    tabs: [
      { id: "constructionDash", label: "Dashboard", title: "Construction overview", desc: "Active jobs, completion distribution, superintendent scorecard, and stall alerts." },
      { id: "constructionPipeline", label: "Pipeline", title: "Construction pipeline", desc: "Full spreadsheet view of all active construction jobs with milestone dates." },
      { id: "constructionCycle", label: "Cycle Time", title: "Cycle time analysis", desc: "Phase-by-phase velocity, milestone tracker, and cycle time trends." },
      { id: "constructionCost", label: "Cost Metrics", title: "Budget & cost tracking", desc: "Budget vs actual analysis, variance tracking, and cost breakdowns." },
    ],
  },
  {
    label: "Sales",
    tabs: [
      { id: "salesDash", label: "Dashboard", title: "Sales & profit", desc: "Revenue, margins, community scorecard, and per-job profit & loss." },
      { id: "salesPipeline", label: "Pipeline", title: "Sales pipeline", desc: "Full sales contract roster with buyer details, pricing, and status." },
    ],
  },
  {
    label: "Property Mgmt",
    tabs: [
      { id: "pmDash", label: "Dashboard", title: "Property management", desc: "Occupancy, rent roll, collections, and delinquency tracking." },
      { id: "pmPipeline", label: "Pipeline", title: "Property roster", desc: "Full property roster with tenant details and delinquency tracking." },
    ],
  },
  {
    label: "Audits",
    tabs: [
      { id: "audits", label: "P&L Audits", title: "Construction audits", desc: "Per-job P&L breakdown — costs, margins, and investor-facing audit cards." },
    ],
  },
];

const ALL_TABS = SECTIONS.flatMap((s) => s.tabs);
```

Rules:
- `id`: camelCase, no spaces -- used for tab switching state
- `label`: short name shown in the sidebar
- `title`: appears as h2 in the tab header
- `desc`: one-line description below the title
- Sections render as **collapsible headers** in the sidebar; tabs are nested buttons within each section

---

## Step 2: Build the Data Layer (`dashboard-data.js`)

### 2a: Identify source tables

Check the warehouse audit to find which BigQuery tables contain the data for each tab. There are two patterns:

**Pattern A: Raw Tables (Google Sheet / XLSX -> BigQuery)**
```js
const cm = rawTable("construction_milestones");
const salesFullT = rawTable("xlsx_sales_full");
const pmMasterT = rawTable("pm_master");
const landActiveT = rawTable("land_acquisition_active");
const landClosedT = rawTable("land_acquisition_closed");
const subdivisionT = rawTable("subdivision_pipeline");
```
Use `rawTable()` from `bigquery.js`. This queries `{project}.{raw_dataset}.{table}`.

**Pattern B: Mart Tables (pre-computed, refreshed daily)**
```js
const martSummary = fullyQualifiedTable("mart_daily_summary");
const martAudit = fullyQualifiedTable("mart_audit_pl");
const martFilterQuality = fullyQualifiedTable("mart_filter_quality");
const exceptionT = fullyQualifiedTable("mart_exception_center");
```
Use `fullyQualifiedTable()` from `bigquery.js`. This queries `{project}.{marts_dataset}.{table}`.

**When to use marts vs raw tables:**
- Use **marts** for: multi-table JOINs, aggregate summaries, UNION ALL queries, anything with >3 SAFE_CASTs
- Use **raw tables** for: simple SELECT of a single table with few transformations
- Rule of thumb: if the query is >10 lines of SQL, it should be a mart

### 2b: Mart Architecture (Best Practice)

Heavy queries should be pre-computed in BigQuery mart tables and refreshed daily via `scripts/create-marts.js`. This keeps dashboard page loads fast (simple flat reads) while BigQuery does the heavy lifting on a schedule.

**Current mart tables (Brite Homes):**

| Mart | Source | What it does | Rows |
|------|--------|-------------|------|
| `mart_daily_summary` | construction_milestones + sales | Pre-aggregated KPIs (counts, sums, averages) | 1 |
| `mart_audit_pl` | 8 audit tables + milestones + sales | Pre-joined per-job P&L breakdown | ~384 |
| `mart_filter_quality` | construction_milestones | Filter options + data quality checks | ~44 |
| `mart_exception_center` | various | Stalled job alerts | varies |

**To refresh marts:**
```bash
cd next_dashboard && NODE_PATH=./node_modules node ../scripts/create-marts.js
```

**To add a new mart:**
1. Write the SQL in `scripts/create-marts.js` using `createOrReplace(tableName, query)`
2. Update `dashboard-data.js` to read from the mart: `SELECT * FROM ${fullyQualifiedTable("mart_name")}`
3. Test the build: `npx next build`

### 2c: Write queries per tab

For each tab, write 2-5 BigQuery queries. After optimization, Brite Homes uses **13 parallel queries** (down from 25+):

```
Pre-computed Marts (3 queries — simple flat reads):
  -> combinedSummary (queryFirstRow) -- reads mart_daily_summary
  -> filterAndQuality (queryRows) -- reads mart_filter_quality
  -> auditRoster (queryRows) -- reads mart_audit_pl

Rosters (2 queries — single table reads):
  -> milestonesRoster (queryRows) -- main construction table
  -> salesRoster (queryRows) -- basic sales contracts

Client-Side Derived (0 queries — computed from existing data):
  -> loanRoster -- filtered from milestonesRoster (loan_amount > 0)
  -> jobFinancials -- filtered from milestonesRoster (wip > 0 || lot_cost > 0)
  -> profitTracking -- JOIN of milestonesRoster + salesRoster done in JS

Land Acquisition (4 queries):
  -> landActive, landClosed, landCancelled, subdivisionPipeline

Full-Data Pipelines (1 query):
  -> salesFull (queryRows) -- xlsx sales data (pricing, buyer, agent, mortgage)

Property Management (2 queries):
  -> pmMaster, pmDelinquency

Support (2 queries):
  -> exceptionRows (queryRows) -- exception center alerts
  -> permittingPipeline (queryRows) -- cd2_permitting
```

### 2c: Use Promise.all for all queries

All queries run in parallel. **If any single query in the main Promise.all fails, the entire dashboard shows zeros.** This is the most common failure mode.

For optional/risky queries (audit tables, PM tables, land acquisition tables, xlsx_sales_full), use `.catch()` to prevent cascade:

```js
const [result1, result2, ...] = await Promise.all([
  queryFirstRow(client, `SELECT ...`),       // core -- no catch
  queryRows(client, `SELECT ...`),           // core -- no catch
  queryRows(client, `SELECT ... audit ...`)  // optional -- add catch
    .catch((err) => { console.error("[dashboard-data] audit query error:", err.message); return []; }),
  queryRows(client, `SELECT ... land_acquisition_active ...`)  // optional -- add catch
    .catch((err) => { console.error("[dashboard-data] land query error:", err.message); return []; }),
]);
```

### 2d: Return a flat object

The return shape must match what `dashboard-shell.js` expects:

```js
return {
  sourceMode: "live",
  errorMessage: null,
  config,
  summaries: {
    portfolio: { totalJobs, activeConstruction, avgCompletion, totalWip },
    financial: { totalLotCost, totalBudget, totalActual },
    sales: { totalContracts, totalSalesValue },
    loans: { totalLoanAmount, totalDrawn, jobsWithLoans },
  },
  // Per-tab detail arrays
  milestonesRoster: [...],
  salesRoster: [...],
  salesFull: [...],
  loanRoster: [...],
  jobFinancials: [...],
  profitTracking: [...],
  auditRoster: [...],
  pmMaster: [...],
  pmDelinquency: [...],
  exceptionRows: [...],
  // Land acquisition arrays
  landActive: [...],
  landClosed: [...],
  landCancelled: [...],
  subdivisionPipeline: [...],
  // Filter + quality
  filterOptions: { cities: [], jobTypes: [], areaNames: [] },
  areaNameMap: {},
  qualityChecks: [...],
  auditNotes: [...],
};
```

### 2e: Build the fallback

Always implement `buildUnavailableDashboard()` that returns the same shape with all zeros/empty arrays. The catch block calls this when BigQuery is unreachable.

### 2f: Normalize data before returning

After `Promise.all`, normalize each roster:
- Date fields: `normalizeTemporalValue()` to unwrap `{value: "date"}` objects
- Numeric fields: `safeNumber()` to convert strings/nulls to numbers
- Computed fields: derive `est_margin`, `est_margin_pct`, `total_cost`, `construction_costs`, `overhead`, `netProfit` etc. in the data layer (not the shell)

---

## Step 3: Build the Shell (`dashboard-shell.js`)

### 3a: Copy the reusable scaffold

These components are the same for every client -- copy them verbatim:

```
"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ThemeToggle from "./theme-toggle";

// Formatting helpers (copy all of them):
safeNumber(), formatWholeNumber(), formatCompactCurrency(),
formatCurrency(), formatPercent(), formatDate(), daysSince()

// Reusable sub-components (copy all):
KpiCard, RankedBars, DonutChart, DonutLegend, Panel,
SpreadsheetTable, DrillDownTable, FilterBar, FilterDropdown
```

### 3b: Build the Global Filter System

The shell maintains a single `filters` state that affects all tabs:

```js
const [filters, setFilters] = useState({ city: null, jobType: null, areaName: null, community: null });
```

- **City, Job Type, Entity**: dropdown selects from `filterOptions`
- **Community**: rendered as a chip (not dropdown) because 50+ communities. Set by clicking chart bars.
- **Client-side filtering**: `useMemo` filters all rosters when filters change, recomputes summary KPIs

Every chart bar, donut segment, table row, and KPI card can set filters via `setFilters()` or `onBarClick()`. Toggle behavior: clicking the same value again deselects it.

### 3c: Build each Tab component

Tabs in the lifecycle-based nav are **wrapper components** that compose one or more base tab components. Each tab receives `{ data, setFilters }` where `data` is the filtered view.

#### Tab Component Map

| Tab ID | Wrapper Component | Wraps / Queries |
|--------|-------------------|-----------------|
| `land` | **LandAcquisitionTab** | Standalone. Queries `land_acquisition_active`, `land_acquisition_closed`, `land_acquisition_cancelled`, `subdivision_pipeline` |
| `permitting` | **PermittingTab** | Filters `milestonesRoster` for permitting-phase jobs |
| `loans` | **LoansDashboardTab** | Extracted from old ClosingsTab (loan-specific KPIs and tables) |
| `constructionDash` | **ConstructionDashTab** | Wraps `OverviewTab` + `AnalyticsTab` together |
| `constructionPipeline` | **ConstructionPipelineTab** | Wraps `PipelineTab` with `defaultView="construction"` |
| `constructionCycle` | **ConstructionCycleTab** | Wraps `ConstructionTab` with `showSection="cycle"` |
| `constructionCost` | **ConstructionCostTab** | Wraps `ConstructionTab` with `showSection="cost"` |
| `salesDash` | **SalesDashTab** | Wraps `FinancialTab` (revenue, margins, community scorecard, per-job P&L) |
| `salesPipeline` | **SalesPipelineTab** | Wraps `PipelineTab` with `defaultView="sales"` |
| `pmDash` | **PMDashTab** | Wraps `PropertyMgmtTab` with `defaultView="dashboard"` |
| `pmPipeline` | **PMPipelineTab** | Wraps `PropertyMgmtTab` with `defaultView="roster"` |
| `audits` | **AuditsTab** | Per-job pro forma with cost breakdown and configurable defaults |

#### LandAcquisitionTab -- land section

- KPI cards: Active Deals, Closed Deals, Cancelled Deals, Subdivision Lots
- Queries 4 BigQuery tables: `land_acquisition_active` (2 rows, 45 cols), `land_acquisition_closed` (789 rows, 52 cols), `land_acquisition_cancelled` (202 rows, 53 cols), `subdivision_pipeline` (63 rows, 46 cols)
- Also references `land_sales_active` (2 rows, 31 cols) and `land_sales_closed` (62 rows, 31 cols)
- Pipeline views via SpreadsheetTable

#### PermittingTab -- permitting section

- Filters the milestones roster to show only permitting-phase jobs
- Permit status tracking, cycle times, environmental issues

#### LoansDashboardTab -- loans section

- Extracted from the old ClosingsTab -- all loan-specific logic lives here
- Lender Concentration table (per-lender totals + draw rate)
- Construction Loans table
- Expiring Loans alert
- Loan exposure KPIs

#### ConstructionDashTab -- construction overview + analytics

- Combines what was previously OverviewTab + AnalyticsTab into a single view
- KPI cards: Total Jobs, Active Construction, CO'ed Not Closed, Avg Completion, Total WIP
- Completion histogram, Job Type donut, Cycle Time by Phase bar chart
- **Charts and KPIs only — no tables** (tables belong on Pipeline tabs)
- Chart clicks set cross-filters (stage, community); drill-down drawer for detail

#### ConstructionPipelineTab -- construction pipeline

- Wraps PipelineTab with `defaultView="construction"`
- SpreadsheetTable with 34 columns (all milestones, financials, loans, stuck days)
- Frozen first 2 columns, per-column filters

#### ConstructionCycleTab -- cycle time analysis

- Wraps ConstructionTab with `showSection="cycle"`
- Phase-by-phase velocity (Start->Slab, Slab->Frame, etc. -- 7 phases)
- Milestone tracker with date columns

#### ConstructionCostTab -- budget and cost tracking

- Wraps ConstructionTab with `showSection="cost"`
- Budget vs Actual table (from audit_in_construction -- site work + vertical overruns)
- Variance tracking and cost breakdowns

#### SalesDashTab -- sales and profit

- Wraps FinancialTab
- 4 KPI cards: Revenue, Cost, Gross Margin, At-Risk
- Community Scorecard (margin + avg cycle time per community)
- Highest WIP ranked bars
- Per-job P&L table (clickable rows -> inline pro forma audit card)
- Pro forma settings persist in localStorage (shared with Audits tab)

#### SalesPipelineTab -- sales pipeline

- Wraps PipelineTab with `defaultView="sales"`
- SpreadsheetTable with 33 columns from xlsx_sales_full (pricing, buyer, agent, mortgage, dates)

#### PMDashTab -- property management dashboard

- Wraps PropertyMgmtTab with `defaultView="dashboard"`
- 8 KPI cards (properties, occupancy rate, vacancy loss, past due, market rent, actual rent, receivable, deposits)
- Occupancy donut, by-city breakdown, delinquent tenants alert

#### PMPipelineTab -- property management roster

- Wraps PropertyMgmtTab with `defaultView="roster"`
- Full SpreadsheetTable (15 columns with filters)

#### AuditsTab -- per-job pro forma

- Filtered to active job types only
- Per-job pro forma card with full cost breakdown:
  - Lot, Permitting, Site Work, Vertical, Options, Dirt, Dumpsters, Env, Utilities
  - Closing, Financing, Insurance, Warranty, Builder Fee
  - Gross Margin -> Commissions, Contingency -> Net Profit
- Configurable defaults via gear icon (see Pro Forma Settings below)
- Click-to-edit inline values (per-job overrides)
- Plan x market defaults populate the Sale Price column with ~ indicator

### KPI Card Rules

- 4-5 cards per tab (grid-template-columns: repeat(4, 1fr) or repeat(5, 1fr))
- `label`: uppercase noun phrase ("Total WIP", "Active Jobs")
- `value`: formatted number -- use the right formatter
- `sub`: optional context line ("12 communities", "Without lot: $20M")
- `tone`: optional -- "good", "watch", "alert" for color coding
- `onClick`: makes the card clickable (triggers drill-down or filter)
- `active`: highlights the card when its drill-down is open

### Panel Rules

- Use `<div className="panels-row">` for 2-column layout
- Use `<div className="panels-row single">` for full-width charts
- Use `<div className="panels-row triple">` for 3-column layout
- Every panel has `kicker` (10px uppercase) + `title` (14px bold) + optional `note`

### Dashboard vs Pipeline Content Rule

**Hard rule — applies to ALL sections (Land, Permitting, Loans, Construction, Sales, Property Mgmt, Audits):**

- **Dashboard tabs** contain ONLY charts, KPI cards, and visual summaries (DonutChart, RankedBars, AreaChart, MultiLineChart, Histogram, StackedCycleBar, SparklineCards, CycleTimePipeline, CrossTab). **Never put CompactTable or SpreadsheetTable on a Dashboard tab.**
- **Pipeline tabs** contain SpreadsheetTable (spreadsheet-style with fixed rows, frozen columns, sticky headers, per-column filters) for easy data navigation.
- **Exception:** Construction Pipeline uses a kanban board (PipelineBoard) — this is the only pipeline tab that is not spreadsheet-style.

Cross-filtering on dashboard tabs:
- Chart clicks (donut segments, bar clicks) set page-level filters (city, community, stage)
- Breadcrumb bar shows active filters with per-dimension clear
- Toggle behavior: clicking the same value deselects it

Drill-through on pipeline tabs:
- Row clicks open a side drawer with job-level details

### SpreadsheetTable Component

Full-featured spreadsheet-style table for **pipeline tabs only**. Used by ConstructionPipelineTab, SalesPipelineTab, PMPipelineTab, LandAcquisitionTab, and any tab that needs a roster view. **Never use on Dashboard tabs.**

```jsx
<SpreadsheetTable
  rows={data}
  columns={columnDefinitions}
  title="Construction Pipeline"
  note="Active jobs with milestone and financial data"
  maxRows={50}        // initial visible rows
  frozenCols={2}      // frozen left columns (scroll independently)
/>
```

Column definition format:
```js
{ label: "Job ID", key: "job_id", width: "100px", mono: true, fontSize: 10 }
{ label: "WIP", width: "70px", align: "right", render: (r) => formatCompactCurrency(r.wip) }
{ label: "Variance", width: "70px", align: "right", danger: (r) => r.variance < 0, render: (r) => ... }
```

Features:
- Frozen first N columns (horizontal scroll doesn't affect them)
- Sticky header row
- Per-column filter dropdowns (auto-generated from distinct values)
- Single-row formatting (conditional styling per row)
- "Show all" toggle for rows beyond maxRows
- Row alert highlighting (via `_alert` flag on row data)

### Pro Forma Settings

localStorage-based configurable defaults for audit P&L cards. Shared between SalesDashTab and AuditsTab.

```js
// Stored under a client-specific key, e.g. "brite_proforma_defaults"
{
  contingency: 0.03,        // 3%
  propertyTaxes: 2500,
  sellerCredit: 5000,
  cogs: 0.02,               // 2%
  commissionPct: 0.06,      // 6%
  warranty: 1500,
  // Plan x Market default prices
  planPrices: {
    "Plan A": { "City1": 350000, "City2": 380000 },
    "Plan B": { "City1": 420000, "City2": 450000 },
  }
}
```

- Opened via gear icon on the Audits tab or Sales Dashboard tab
- Plan x Market: dropdown selectors for all plans and cities
- Defaults populate the Sale Price column with a `~` indicator (estimated)
- Per-job overrides via click-to-edit inline values
- All settings persist in localStorage across page reloads

### Visualization Mapping

| KPI Assessment Chart Type | Shell Component | Allowed On |
|---------------------------|----------------|------------|
| Horizontal bar | `<RankedBars>` (collapsible, show top 6) | Dashboard tabs |
| Donut / Pie | `<DonutChart>` + `<DonutLegend>` (clickable segments) | Dashboard tabs |
| Histogram | Custom histogram bars (inline JSX) | Dashboard tabs |
| Phase bar chart | Custom vertical bars (inline JSX) | Dashboard tabs |
| Gauge | `<KpiCard>` with a percentage value | Dashboard tabs |
| Table / Roster | `SpreadsheetTable` (frozen cols, sticky headers) | **Pipeline tabs only** |
| Alert table | `compact-table` with danger styling | **Pipeline tabs only** |

### 3d: Build the DrillDownTable

The drill-down drawer is a sticky side panel (not a slide-in overlay) that shows filtered rows when the user clicks a chart element. It sits alongside the charts in a `analytics-layout` flexbox:

```jsx
function DrillDownTable({ drill, setFilters, onClose }) {
  // Shows address, community, completion %, WIP for each matching job
  // Clickable rows set community filter
  // "Show all" toggle for 20+ items
}
```

Each tab manages its own `drillDown` state, which can be a string key (e.g., "total", "active") or an object (e.g., `{ type: "stage", value: "Framing" }`).

### 3e: Wire up the Main Shell

The sidebar uses **collapsible section headers**. Each section can be expanded/collapsed to reveal its tabs.

```jsx
export default function DashboardShell({ dashboard }) {
  const [activeTab, setActiveTab] = useState("land");
  const [filters, setFilters] = useState({ city: null, jobType: null, areaName: null, community: null });
  const [expandedSections, setExpandedSections] = useState(() =>
    // Auto-expand the section containing the active tab
    SECTIONS.reduce((acc, s) => ({ ...acc, [s.label]: s.tabs.some(t => t.id === "land") }), {})
  );

  // Client-side filtering — useMemo recomputes all rosters when filters change
  const filtered = useMemo(() => {
    const matchJob = (r) => {
      if (filters.city && r.city !== filters.city) return false;
      if (filters.jobType && r.job_type !== filters.jobType) return false;
      if (filters.areaName && r.company_name !== filters.areaName) return false;
      if (filters.community && r.community !== filters.community) return false;
      return true;
    };
    const roster = dashboard.milestonesRoster.filter(matchJob);
    // ... filter all other rosters similarly
    // Recompute summary KPIs from filtered roster
    return { roster, financials, loans, sales, land, ..., summaries };
  }, [dashboard, filters]);

  return (
    <div className="shell">
      <div className="shell-bar">...</div>      {/* Brand + config chips + theme toggle */}
      <FilterBar ... />                          {/* Global filters */}
      <nav className="rail">                     {/* Collapsible sidebar navigation */}
        {SECTIONS.map(section => (
          <div className="rail-section" key={section.label}>
            <button
              className="rail-section-label"
              onClick={() => toggleSection(section.label)}
            >
              {section.label}
              <span className={expandedSections[section.label] ? "chevron-up" : "chevron-down"} />
            </button>
            {expandedSections[section.label] && section.tabs.map(tab => (
              <button
                key={tab.id}
                className={`rail-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ))}
        <div className="rail-stats">...</div>    {/* 3-4 headline stats */}
      </nav>
      <main className="main-content">
        {activeTab === "land" && <LandAcquisitionTab data={filtered} setFilters={setFilters} />}
        {activeTab === "permitting" && <PermittingTab data={filtered} setFilters={setFilters} />}
        {activeTab === "loans" && <LoansDashboardTab data={filtered} setFilters={setFilters} />}
        {activeTab === "constructionDash" && <ConstructionDashTab data={filtered} setFilters={setFilters} />}
        {activeTab === "constructionPipeline" && <ConstructionPipelineTab data={filtered} setFilters={setFilters} />}
        {activeTab === "constructionCycle" && <ConstructionCycleTab data={filtered} setFilters={setFilters} />}
        {activeTab === "constructionCost" && <ConstructionCostTab data={filtered} setFilters={setFilters} />}
        {activeTab === "salesDash" && <SalesDashTab data={filtered} setFilters={setFilters} />}
        {activeTab === "salesPipeline" && <SalesPipelineTab data={filtered} setFilters={setFilters} />}
        {activeTab === "pmDash" && <PMDashTab data={filtered} setFilters={setFilters} />}
        {activeTab === "pmPipeline" && <PMPipelineTab data={filtered} setFilters={setFilters} />}
        {activeTab === "audits" && <AuditsTab data={filtered} setFilters={setFilters} />}
      </main>
    </div>
  );
}
```

### Rail Stats Rules

Pick 3-4 stats that summarize the entire portfolio at a glance:
- **Total Jobs** -- always include
- **Active** -- in-construction count
- **WIP** -- total dollar exposure (use formatCompactCurrency)
- **Loans** -- total loan exposure (if loan data exists)

---

## Step 4: Configure Environment

### `.env.local`

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT=project-id
BIGQUERY_PROJECT_ID=project-id
BIGQUERY_RAW_DATASET={client}_raw
BIGQUERY_MARTS_DATASET={client}_marts
DASHBOARD_CLIENT_NAME=Client Name
```

### `lib/bigquery.js` defaults

Update the fallback values in `dashboardConfig()` to match the new client:

```js
const martsDataset = process.env.BIGQUERY_MARTS_DATASET || "{client}_marts";
```

---

## Step 5: Test & Debug

### Quick validation (run from next_dashboard/):

```bash
# 1. Verify tables exist
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node -e "
const {BigQuery} = require('@google-cloud/bigquery');
const bq = new BigQuery({projectId:'project-id'});
bq.dataset('client_raw').getTables().then(([t]) => t.forEach(x => console.log(x.id)));
"

# 2. Verify a single query returns data
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node -e "
const {BigQuery} = require('@google-cloud/bigquery');
const bq = new BigQuery({projectId:'project-id'});
bq.query({query: 'SELECT COUNT(*) AS n FROM \`project.dataset.table\`'})
  .then(([r]) => console.log(r));
"

# 3. Start dev server and check for errors in terminal
./node_modules/.bin/next dev -p 3001
# Then hit http://localhost:3001 and watch terminal output
```

### Check rendered KPIs from command line:

```bash
curl -s http://localhost:3001/ | grep -o 'kpi-value">[^<]*' | head -8
```

---

## BigQuery Warehouse Best Practices

### Query Optimization Hierarchy

Follow this order when optimizing dashboard queries:

1. **Eliminate dead queries** -- If a query result is never rendered, delete it
2. **Derive client-side** -- If you already fetch both sides of a JOIN, do the join in JS
3. **Merge queries** -- Combine queries that scan the same table (use UNION ALL with discriminator column)
4. **Move to marts** -- Pre-compute multi-table JOINs and aggregations into mart tables
5. **Remove unused columns** -- Only SELECT columns that are actually rendered in the UI
6. **Fix schema types** -- Proper FLOAT64/DATE columns eliminate SAFE_CAST overhead

### Mart Table Best Practices

| Do | Don't |
|----|-------|
| Use marts for multi-table JOINs (3+ tables) | Put all queries in marts (simple reads are fine as-is) |
| Refresh marts on a schedule matching revalidation (daily) | Refresh marts more frequently than the dashboard revalidates |
| Include `_mart_refreshed_at` timestamp in every mart | Forget to track when data was last refreshed |
| Use `CREATE OR REPLACE TABLE` for idempotent rebuilds | Use INSERT/UPDATE (risks duplicates) |
| Keep mart SQL in `scripts/create-marts.js` | Scatter mart definitions across multiple files |
| Test mart freshness in the dashboard (show last refresh time) | Assume marts are always fresh |

### Table Lifecycle

```
Google Sheets → BigQuery (raw)     → Mart Tables (aggregated)  → Dashboard
               brite_homes_raw/      brite_homes_marts/          Next.js
               20 tables             4 tables                    14 queries
               ↑ synced by pipeline  ↑ refreshed by cron         ↑ reads at revalidation
```

**When to delete a table:**
- Not referenced in any query in `dashboard-data.js`
- Data is duplicated in another table with better quality
- It's an external/Google Sheets linked table AND a native copy exists
- It was a one-time import (xlsx_*) that's been superseded

**External table rule:** Never keep external (Google Sheets linked) tables in production. They re-read the entire sheet over the network on every query. Always convert to native BigQuery tables via the import pipeline.

### Optimization Metrics (Brite Homes Reference)

| Metric | Before Optimization | After 3 Passes |
|--------|-------------------|----------------|
| BigQuery queries per load | ~25 | 14 |
| Tables (raw + marts) | ~66 | 24 |
| External/Sheets tables | 16+ | 0 |
| Multi-table JOINs at query time | 3 (8-table, 2-table, 7-way UNION) | 0 (all in marts) |
| SAFE_CAST operations | ~50+ | ~26 |
| Estimated bytes scanned/load | ~15 MB | ~4 MB |

### Cost Control

- BigQuery free tier: **1 TB scanned/month**, **10 GB storage**
- At 14 queries/load × daily revalidation = 14 queries/day = ~420/month
- With ~4 MB scanned per load = ~120 MB/month total (well within free tier)
- Monitor costs at: `console.cloud.google.com/billing`
- Set a budget alert at $5/month to catch unexpected spikes

---

## Gotchas & Common Failures

### 1. Google Sheets Type Propagation

When data is loaded from Google Sheets into BigQuery, numeric columns often arrive as STRING. This causes:

```
Error: No matching signature for function COALESCE
  Argument types: STRING, INT64
```

**Fix:** Wrap all potentially-string columns with `SAFE_CAST`:

```sql
-- Bad:
COALESCE(insurance_cost, 0)

-- Good:
COALESCE(SAFE_CAST(insurance_cost AS FLOAT64), 0)
```

**Prevention:** After loading sheets, run a schema check:
```bash
node -e "
const {BigQuery} = require('@google-cloud/bigquery');
const bq = new BigQuery({projectId:'...'});
bq.dataset('raw').table('tablename').getMetadata()
  .then(([m]) => m.schema.fields.forEach(f => console.log(f.name, '->', f.type)));
"
```

### 2. Promise.all Cascade Failure

All queries run in `Promise.all`. If ANY single query fails (wrong table name, type mismatch, missing column), ALL data returns as zeros. The error is caught silently.

**Fix:** Always add `console.error` in the catch block to see the actual error:

```js
} catch (error) {
  console.error("[dashboard-data] BigQuery error:", error.message);
  return buildUnavailableDashboard(...);
}
```

**Mitigation:** Use `.catch()` on individual queries for optional tables (audit, PM, land acquisition, xlsx_sales_full) so they degrade gracefully without taking down the main dashboard.

### 3. BigQuery Temporal Values

BigQuery returns dates as `{ value: "2024-03-15" }` objects, not plain strings. The `normalizeTemporalValue()` helper unwraps these. Always use `formatDate()` which handles both formats.

### 4. Next.js Server vs Client Boundary

- `dashboard-data.js` runs on the **server** (Node.js) -- it can use BigQuery, env vars, filesystem
- `dashboard-shell.js` runs on the **client** (browser) -- it only receives the serialized data prop
- The `page.js` server component bridges them: calls `getDashboardData()` and passes result to `<DashboardShell>`
- All BigQuery data must be JSON-serializable (no BigInt, no Date objects, no circular refs)

### 5. Module Caching

`bigquery.js` caches the BigQuery client in a module-level variable. If env vars change, you must restart the dev server. Hot reload does NOT pick up env changes.

### 6. Dollar-Sign Strings

Audit tables imported from sheets often store dollar values as `"$12,345.67"`. Strip before casting:
```sql
SAFE_CAST(REPLACE(REPLACE(REPLACE(field, '$', ''), ',', ''), ' ', '') AS FLOAT64)
```

### 7. XLSX Column Names

When importing xlsx files, column names get sanitized: spaces become `_`, special chars stripped. The original sheet may have "Lot / Land" but BigQuery gets `Lot___Land`. Always check actual column names after import:
```bash
node -e "bq.dataset('raw').table('audit_costs').getMetadata().then(([m]) => m.schema.fields.forEach(f => console.log(f.name)))"
```

### 8. localStorage Pro Forma Settings

The Audits and Sales Dashboard tabs share configurable defaults (contingency, commission %, plan x market pricing, cost defaults) stored in `localStorage` under a client-specific key (e.g., `brite_proforma_defaults`). These persist across page reloads but not across browsers. The gear icon opens the settings panel.

---

## Reference: Brite Homes Implementation

| Aspect | Brite Homes Value |
|--------|-------------------|
| BigQuery project | `atomic-venture-404412` |
| Datasets | `brite_homes_raw` / `brite_homes_marts` |
| Sections | Land (1), Permitting (1), Loans (1), Construction (4), Sales (2), Property Mgmt (2), Audits (1) |
| Total | **7 sections, 12 tabs** |
| Tab IDs | `land`, `permitting`, `loans`, `constructionDash`, `constructionPipeline`, `constructionCycle`, `constructionCost`, `salesDash`, `salesPipeline`, `pmDash`, `pmPipeline`, `audits` |
| Primary table | `construction_milestones` (1,260 rows, 62 cols) |
| Land tables | `land_acquisition_active` (2 rows, 45 cols), `land_acquisition_closed` (789 rows, 52 cols), `land_acquisition_cancelled` (202 rows, 53 cols), `subdivision_pipeline` (63 rows, 46 cols), `land_sales_active` (2 rows, 31 cols), `land_sales_closed` (62 rows, 31 cols) |
| Sales tables | `sales` (1,260 rows, 12 cols), `xlsx_sales_full` (1,084 rows, 111 cols) |
| Audit tables | `audit_costs` (384 rows), `audit_dirt`, `audit_dumpsters`, `audit_env`, `audit_utilities`, `audit_last_interest`, `audit_total_ap`, `audit_bbg_ap`, `audit_vertical_sitework_actual`, `audit_in_construction` (51 rows) |
| PM tables | `pm_master` (132 rows, 33 cols), `pm_delinquency` (23 rows, 29 cols), `pm_rent_roll` (132 rows, 32 cols) |
| Other tables | `schedule` (1,260 rows, 12 cols), `job_cost` (1,260 rows, 11 cols) |
| Total BigQuery tables | **20+** |
| Total queries | 13 parallel BigQuery queries |
| Data revalidation | ISR, once per day (revalidate = 86400) |
| Global filters | City, Job Type, Entity (dropdowns), Community (chip) |
| Pro forma key | `brite_proforma_defaults` (localStorage) |
| KPIs blocked | Vendor Scorecard (0 PO data), Cancellation (no cancel dates in basic sales) |
| Key type gotcha | `audit_costs.Insurance_Builder_s_Risk` is STRING, needs SAFE_CAST |
| Key type gotcha | `construction_milestones.loan_amount` is STRING, needs SAFE_CAST |
| Key type gotcha | `audit_in_construction` stores all values as `$`-formatted strings |
| Stale data filter | `(closed_date IS NULL OR SAFE_CAST(closed_date AS DATE) >= '2022-01-01')` |
| Active Construction def | SFR Construction In Progress + Awaiting CO + On Hold + POs Released |

### Brite Homes Data Source Map

| Tab ID | Tab Label | Data Sources | Key Queries |
|--------|-----------|-------------|-------------|
| `land` | Land Dashboard | `land_acquisition_active`, `land_acquisition_closed`, `land_acquisition_cancelled`, `subdivision_pipeline` | Acquisition pipeline, lot pricing, deal flow |
| `permitting` | Permitting Dashboard | `construction_milestones` (filtered) | Permit status, cycle times |
| `loans` | Loans Dashboard | `construction_milestones` (loans), `schedule` | Lender concentration, draw rates, expiring loans |
| `constructionDash` | Construction Dashboard | `construction_milestones` | Portfolio summary, histogram, donut, cycle time, superintendent, stalls |
| `constructionPipeline` | Construction Pipeline | `construction_milestones` | SpreadsheetTable (34 cols) |
| `constructionCycle` | Cycle Time | `construction_milestones` | Phase-by-phase velocity, milestone tracker |
| `constructionCost` | Cost Metrics | `construction_milestones`, `audit_in_construction` | Budget vs actual, variance tracking |
| `salesDash` | Sales Dashboard | `construction_milestones` + `sales` (JOIN) + `audit_costs` (JOIN) | Profit tracking with margin calc, community scorecard |
| `salesPipeline` | Sales Pipeline | `xlsx_sales_full` | SpreadsheetTable (33 cols) |
| `pmDash` | PM Dashboard | `pm_master`, `pm_delinquency` | KPIs, occupancy donut, delinquency |
| `pmPipeline` | PM Roster | `pm_master` | SpreadsheetTable (15 cols) |
| `audits` | P&L Audits | 10-table JOIN: milestones + all audit_* + sales | Per-job cost breakdown + computed P&L |

---

## Checklist: New Client Shell Build

```
[ ] Warehouse audit complete (table profiles with row counts + column completeness)
[ ] KPI assessment scored (ready/partial/blocked per KPI)
[ ] BigQuery schema types verified for all numeric columns
[ ] XLSX import script configured (if client provides xlsx data)
[ ] SECTIONS/TABS array defined (7 lifecycle sections, 12 tabs max)
[ ] Tab wrapper components created (composing base tabs with props)
[ ] dashboard-data.js rewritten with client-specific queries
[ ] .catch() on individual queries for optional tables (audit, PM, land, xlsx)
[ ] dashboard-shell.js rewritten with client-specific tabs
[ ] Collapsible sidebar navigation working (expand/collapse sections)
[ ] Global filters wired up (City, Job Type, Entity, Community)
[ ] SpreadsheetTable configured for pipeline tabs only (frozen cols, sticky headers, column filters)
[ ] Dashboard tabs verified: charts and KPIs only — NO CompactTable or SpreadsheetTable
[ ] Pro forma settings configured (if audit data available) -- plan x market pricing + cost defaults
[ ] .env.local updated with client credentials and dataset names
[ ] bigquery.js defaults updated
[ ] revalidate = 86400 set in page.js (NOT force-dynamic)
[ ] Dev server tested -- KPI values appear (not zeros)
[ ] Error logging confirmed in catch block
[ ] Drill-down drawer works on Construction Dashboard tab
[ ] Clickable chart bars set global filters correctly
[ ] SpreadsheetTable: frozen cols, sticky headers, column filters all work
[ ] Rail stats show meaningful headline numbers
[ ] Shell bar shows correct client name
[ ] Dark and light themes both work
```
