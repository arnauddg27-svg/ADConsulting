# Dashboard & KPI Reference

**Canonical source of truth** — 2026-04-23

This document consolidates the dashboard architecture, the KPI catalogue, and the data model for builder operations platforms. It reflects what is actually implemented today in:

- **Sample dashboard** — `src/components/demo/sunshine/` (Sunshine Homes sample at `/demo`)
- **Client dashboards** — `clients/brite_homes/`, `clients/fsp/` (per-client Next.js apps)
- **KPI validation** — `config/kpi_thresholds.yaml` + `scripts/daily-quality-check.js` (105-KPI nightly check)
- **Canonical BigQuery schema** — `sql/canonical_schema.sql`

When the older docs (`KPI_GUIDE.md`, `KPI_LIST.md`, `KPI_MASTER_REFERENCE.md`, `DASHBOARD_SHELL_BUILD_GUIDE.md`, `DASHBOARD_DESIGN_SYSTEM.md`, `DATA_DASHBOARD_PLAYBOOK.md`) conflict with this one, **this one wins**. Older docs remain for historical reference and deeper narrative.

---

## 1. The three KPI layers

Builder operations platforms run **three layers** of KPIs. Keep them separated — they serve different audiences.

### Layer A — Dashboard KPIs (what the builder sees)

~45 metrics rendered in the dashboard UI. Grouped by lifecycle tab. Computed in the client app from warehouse data.

**Implementation:** `src/lib/sunshine-homes-data.ts` (sample) or `clients/{client}/lib/dashboard-data.js` (per-client) — see the `getXKPIs` functions.

### Layer B — Validation KPIs (what ops monitors nightly)

**105 thresholded metrics** checked every morning against each client warehouse. Produces PASS / WARNING / FAIL categories.

**Implementation:** `config/kpi_thresholds.yaml` (definitions) + `scripts/daily-quality-check.js` (runner). Reports land in `reports/{client}/quality-{date}.json`.

### Layer C — Per-client KPI assessment (what the engagement sells)

Manual markdown file produced during discovery, scoring each Layer-A KPI as `ready`, `partial`, or `blocked` based on the client's data availability.

**Implementation:** `clients/{client}/kpi_assessment.md`.

---

## 2. Layer A — Dashboard KPI catalogue

Organized by dashboard tab (lifecycle phase). Each row lists what's in the sample (`getXKPIs` in `sunshine-homes-data.ts`) and the UI surface.

### 2.1 Land (Land Acquisition)

| KPI | UI | Data source |
|---|---|---|
| Active deals | KPI card | `landDeals.status === "under-contract"` |
| Closed acquisitions | KPI card | `landDeals.status === "closed"` |
| Cancel rate | KPI card | `cancelled / (cancelled + closed + under-contract)` |
| Acquisition by city | Ranked bars | groupBy city → sum acres or count |
| Lot price trend | Multi-line | `avgLotPrice` over time × city |
| Pipeline Year × City | Cross-tab | `buildCrossTab(landDeals, "year", "city")` |
| Subdivision pipeline | Table | `subdivisions` array |
| Under-contract distribution | Donut | groupBy dealType |

### 2.2 Permitting

| KPI | UI | Data source |
|---|---|---|
| In permitting | KPI card | `permits.status === "in-review"` |
| Avg permitting days | KPI card | `avg(permits.daysInReview)` |
| Stuck permits (>90d) | KPI card (alert) | `permits.daysInReview > 90` |
| Permits by stage | Donut | groupBy status |
| Permits by city | Ranked bars | groupBy city |
| Permitting cycle by city | Compact table | avg per city |
| Environmental issues | Compact table | `gopher_tortoise`, `tree_survey` flags |
| Year × City starts | Cross-tab | `buildCrossTab(permits, "year", "city")` |

### 2.3 Loans & Draws

| KPI | UI | Data source |
|---|---|---|
| Loan exposure summary | KPI cards (3) | sum loanAmount / totalDrawn |
| Draw % by job | Progress bars + table | `drawPct` per loan |
| Loans approaching expiration | Alert table | `daysUntilExpiration ≤ 90` |
| Lender distribution | Donut / ranked bars | groupBy lender |
| Interest rate distribution | Histogram | `interestRate` buckets |
| Lender count | KPI card | distinct(lender) |
| Total drawn vs exposure | KPI cards | sum totalDrawn / sum loanAmount |

### 2.4 Construction — Dashboard tab

| KPI | UI | Data source |
|---|---|---|
| Total jobs | KPI card | `jobs.length` |
| Active jobs | KPI card | `stage !== "Closing"` |
| Avg completion | KPI card | `avg(completionPct)` |
| Total WIP | KPI card | `sum(wipBalance)` |
| Jobs by stage | Donut | groupBy stage |
| Jobs by community | Ranked bars | groupBy community |
| Completion distribution | Histogram | completionPct 5-bucket |

### 2.5 Construction — Pipeline tab

Full roster: 25–30 column spreadsheet of every job. Sortable, frozen header, click-to-drill.

### 2.6 Construction — Cycle Time tab

| KPI | UI | Data source |
|---|---|---|
| Avg total cycle | KPI card | `getCycleTimeByCity` |
| Phase cycle times | Stacked bar | `avgPhaseDays` |
| Stacked cycle by city | Stacked horizontal bar | `getCycleTimeByCity` |
| Cycle time trendline | Area chart | `getCycleTimeTrend` |
| Completion trendline | Multi-line | `getCompletionTrendlines` |
| Milestone sparklines by city | Sparkline cards | `getMilestoneSparklines` |
| Stage outliers | Flagged table | `getStageOutliers` |

### 2.7 Construction — Cost Metrics tab

| KPI | UI | Data source |
|---|---|---|
| Total budget vs actual | KPI card | `sum(originalBudget)` vs `sum(actualCostToDate)` |
| Variance by job | Bar (pos/neg) | `actualCost − budget` |
| Budget vs actual by job | Table | per-job breakdown |
| Margin by community | Bar | avg `marginPct` per community |
| Margin by plan | Bar | avg `marginPct` per plan |
| Cost category variance | Stacked | `getCostCategoryVariance` |

### 2.8 Sales — Dashboard & Pipeline

| KPI | UI | Data source |
|---|---|---|
| Sales by status | Donut | groupBy status |
| Sales pipeline value | KPI card | sum(salePrice) where status ∈ {active, pending} |
| Sales by community | Bar | groupBy community |
| Sales by plan | Table / bar | `getSalesByPlan` |
| Top agents | Ranked table | groupBy agent |
| Sales by city | Donut | groupBy city |
| Sales trendline | Line | by contract/close date |
| Entity × Year homes sold | Cross-tab | `buildCrossTab(sales, "year", "entity")` |
| Avg price by city | Multi-line | trend by city |
| Homes under contract trend | Bar | groupBy contract month |

### 2.9 Property Management

| KPI | UI | Data source |
|---|---|---|
| Portfolio summary | 4 KPI cards | total units / leased / monthlyRent / vacant |
| Occupancy by status | Donut | groupBy occupancy |
| Delinquency | KPI card + table | `delinquentAmount > 0` |
| Revenue by city | Ranked bars | groupBy city, sum monthlyRent |
| Property roster | Spreadsheet | full `propertyUnits` table |
| Rent histogram | Histogram | monthlyRent 5-bucket |

### 2.10 Audits (P&L)

| KPI | UI | Data source |
|---|---|---|
| Audit roster count | KPI card | `auditJobs.length` |
| Per-job Pro Forma | Drawer card | `auditJobs.find(...)` |
| Net margin distribution | KPI card + donut | margin bands 0–10 / 10–15 / 15–20 / 20+ |
| Fee histogram | Histogram | `builderFeePct` 5-bucket |
| Cost breakdown by category | Stacked bar | `getAuditCostBreakdown` |
| Audit roster | Table | full `auditJobs` |

---

## 3. Layer B — Validation KPI catalogue (105 KPIs)

Domain counts:

| Domain | Count | SQL target |
|---|---|---|
| Construction | 25 | `{dataset}.jobs` |
| Cost & Margin | 20 | `{dataset}.jobs` |
| Sales | 15 | `{dataset}.sales` |
| Loans | 10 | `{dataset}.loans` |
| Permits | 10 | `{dataset}.permits` |
| Land | 8 | `{dataset}.land_deals` + `subdivisions` |
| Property Management | 7 | `{dataset}.property_units` |
| Audits / P&L | 10 | `{dataset}.audit_jobs` |
| **Total** | **105** | |

### How the validation runs

```
scripts/daily-quality-check.js \
  --client brite_homes \       # optional — single client
  --domain construction \       # optional — single domain
  --severity warning            # optional — only WARNING + FAIL

# For each KPI:
#   1. Substitute `dataset_placeholder` with client dataset (from clients.yaml)
#   2. Run SQL in BigQuery
#   3. Compare result to min/max band
#   4. Categorize: PASS | WARNING | FAIL | ERROR
# Writes reports/{client}/quality-{YYYY-MM-DD}.json
```

### Severity bands

| Band | Meaning |
|---|---|
| **PASS** | Value inside [min, max] |
| **WARNING** | Value outside band but severity field is `warning` (soft alert) |
| **FAIL** | Value outside band and severity is `error` (action required) |
| **ERROR** | SQL query errored (schema drift, missing table) |

### Threshold calibration

Thresholds target Sun Belt production builders doing **50–500 homes/year**. Defaults:

- Cycle time: 90–300 days (warning), 120–200 typical
- Gross margin: 8%–25%
- Net margin (audit): 9%–16% typical, 4%–20% acceptable
- WIP per job: $150K–$600K
- Loan LTC: 50%–85%
- Permit review: < 30 days healthy, > 60 days FAIL

Adjust thresholds per client by overriding `kpi_thresholds.yaml` entries in `clients/{client}/kpi_overrides.yaml` (supported but optional).

---

## 4. Data model (canonical schema)

All client warehouses conform to a **canonical schema** defined in `sql/canonical_schema.sql`. Every table carries `_client_id` (multi-tenant) and `_loaded_at`.

### 4.1 Fact tables (8)

| Table | Grain | Key fields |
|---|---|---|
| `jobs` | 1 row per construction job | `job_id`, `job_code`, `stage`, `completion_pct`, milestone dates, `contract_value`, `original_budget`, `actual_cost_to_date` |
| `sales` | 1 row per sale contract | `sale_id`, `job_code`, `buyer`, `sale_price`, `contract_date`, `closing_date`, `status` |
| `loans` | 1 row per construction loan | `loan_id`, `job_code`, `lender`, `loan_amount`, `total_drawn`, `draw_pct`, `interest_rate`, `expiration_date` |
| `land_deals` | 1 row per land acquisition | `deal_id`, `city`, `contract_price`, `closing_date`, `deal_status`, `deal_type` |
| `permits` | 1 row per permit application | `permit_id`, `job_code`, `permit_type`, `submitted_date`, `approved_date`, `days_in_review`, `status` |
| `property_units` | 1 row per rental unit | `unit_id`, `address`, `occupancy`, `monthly_rent`, `market_rent`, `tenant`, `lease_start`, `lease_end` |
| `subdivisions` | 1 row per subdivision phase | `subdivision_id`, `project_name`, `total_lots`, `lots_sold`, `projected_profit`, `profit_margin_pct` |
| `audit_jobs` | 1 row per per-job P&L audit | `audit_id`, `job_code`, `sale_price`, `total_direct_cost`, `total_indirect_cost`, `contingency`, `builder_fee`, `net_profit`, `net_margin` |

### 4.2 Dimension tables (4)

`dim_communities`, `dim_plans`, `dim_stages`, `dim_entities` — lookup tables with `_client_id`.

### 4.3 KPI views (17)

Pre-computed BigQuery views in `{dataset}_marts`. Examples: `vw_construction_kpis`, `vw_sales_kpis`, `vw_loan_exposure`, `vw_audit_pnl_summary`. Clients' dashboards query these views — never raw fact tables — so KPI logic is defined once.

### 4.4 Recent data model refinements (Sunshine sample)

These apply to how sample data is generated. Production warehouse data is the source of truth for real clients, but the realism expectations below hold:

- **Per-community cost profiles** — each community has a distinct margin posture and plan mix (Emerald Bay premium, Riverview secondary). Aggregate community-level bars should show variance, not flat totals.
- **Spend shape (front / balanced / back)** — 20% of jobs spend front-loaded (over-linear early, plateaus late), 20% back-loaded, 60% balanced. All shapes converge to ~0.97–1.03× estimated cost at 100% completion.
- **Stage-aware loan LTC** — loans cap LTC by construction stage: Permit 60% → Closing 78%. Earlier in lifecycle, less principal committed.
- **Monotonic milestone offsets** — permit < foundation < framing < MEP < drywall < finishes < CO < closing enforced in code (not just by convention).
- **Subdivision margins 14.5–28.5%** — not bunched in the 22–26% band; reflects real variance between projects.
- **PM rent scales with sqft** ($1.15–$1.50/sqft, realistic Sun Belt 2024–2026).

---

## 5. Dashboard shell architecture

### 5.1 Shared primitives (`src/components/demo/sunshine/`)

| Component | Purpose |
|---|---|
| `SunshineDashboard.tsx` | Top-level orchestrator — filters, active tab, drawer state, fullpage toggle |
| `ShellBar.tsx` | Top bar: client name, day/night mode, sample-data pill, fullpage toggle |
| `RailNav.tsx` | Left collapsible sidebar — 7 sections, 12 tabs |
| `FilterBar.tsx` | Global filters: City, Entity, Community, Time period |
| `SHBreadcrumb.tsx` | Shows active filters as chips, with clear/clear-all |
| `SHDataContextStrip.tsx` | "Showing N rows of X · as of YYYY-MM-DD" |
| `SHDrawer.tsx` | Right-side drill-down panel (all categories + Pro Forma) |

### 5.2 Reusable chart components

| Component | Use |
|---|---|
| `SHKpiCard` | Headline KPI with optional delta, sparkline, progress |
| `SHDonut` | Donut chart with click-to-filter |
| `SHRankedBars` | Horizontal ranked bar chart |
| `SHHistogram` | Bucketed distribution |
| `SHCrossTab` | Row × column grid with intensity |
| `SHAreaChart` | Time-series area with tooltip |
| `SHMultiLineChart` | Multi-series time series |
| `SHStackedCycleBar` | Stacked phase-duration bar by city |
| `SHSparklineCards` | Mini-sparkline card grid |
| `SHSpreadsheetTable` | Full data roster (frozen cols, sticky headers, column filters) |

All chart clicks drill into `SHDrawer` with a typed `detail` object. Categories: `job`, `community`, `stage`, `plan`, `lender`, `loan`, `sale`, `permit`, `unit`, `property`, `city`, `entity`, `cycle-time-cohort`, `audit`, etc.

### 5.3 Lifecycle nav (7 sections × 12 tabs)

```
Land           → Dashboard
Permitting     → Dashboard
Loans          → Dashboard
Construction   → Dashboard, Pipeline, Cycle Time, Cost Metrics
Sales          → Dashboard, Pipeline
Property Mgmt  → Dashboard, Pipeline
Audits         → P&L Audits
```

Exclude tabs for domains a client doesn't support (see `clients/{client}/kpi_assessment.md`).

### 5.4 Per-client file structure

```
clients/{client}/
  lib/
    bigquery.js          # Env-var defaults only
    dashboard-data.js    # REWRITE per client — queries, field mapping, return shape
  components/
    dashboard-shell.js   # REWRITE per client — tabs, KPIs, panels
  app/
    page.js              # getDashboardData() caller, revalidate = 86400
    globals.css          # Mostly shared, occasional client tweaks
  kpi_assessment.md      # Which KPIs are ready/partial/blocked
  kpi_overrides.yaml     # (optional) threshold overrides for validation
```

Three files change per client (`bigquery.js` defaults, `dashboard-data.js`, `dashboard-shell.js`). The rest is shared.

---

## 6. Build sequence for a new client

1. **Warehouse audit** — profile tables, row counts, column completeness
2. **KPI assessment** — score every Layer-A KPI (ready / partial / blocked)
3. **Ingest to canonical schema** — land raw in `{dataset}_raw`, transform to `{dataset}_marts` following `sql/canonical_schema.sql`
4. **Wire BigQuery connection** — `.env.local` + service account
5. **Register client** — add to `config/clients.yaml` and run `scripts/scaffold-client.js`
6. **First nightly run** — enable `daily-quality-check.js` — expect most PASS, some ERROR while schema shakes out
7. **Build dashboard-data.js** — one query per tab, returning the shape the shell expects
8. **Build dashboard-shell.js** — copy from `clients/brite_homes/` and prune tabs for blocked domains
9. **Smoke test** — load every tab, click every drill-down, verify drawers populate
10. **Client review** — screenshare, calibrate thresholds, adjust copy

---

## 7. Design system (essentials)

Full tokens in `src/components/demo/sunshine/sunshine-tokens.css`. Key variables:

```css
--sh-accent: #24c18d           /* Emerald primary */
--sh-danger: #f46a6a
--sh-warning: #efb562
--sh-bg-shell: #06111d
--sh-bg-surface-raised: #0b1a2b
--sh-text-primary: #f8fafc
--sh-text-muted: #94a3b8
--sh-border: rgba(255,255,255,0.08)
--sh-bar-height: 56px
--sh-rail-width: 220px
--sh-filter-height: 54px
```

### Day / night

Dashboard supports `data-sh-mode="day" | "night"`. Light mode swaps surfaces and text tokens; charts keep the same accents.

### Fullpage mode

`.sh-shell-fullpage` flips the shell to `position: fixed; inset: 20px; z-index: 120` with backdrop at 110 and exit-FAB at 130. Parent section must NOT have an explicit `z-index` (that would trap fullpage inside a stacking context below the site header).

---

## 8. What a dashboard should *not* do

A few invariants worth writing down. Easy to violate by accident.

- **Never display NaN, Infinity, or "N/A%"** — `fmtPct` guards these; never bypass it.
- **Never show blank drill-downs** — if a record isn't found, drawer shows a "Not Found / may have been filtered out" fallback row. Already implemented in `SHDrawer`.
- **Never divide by zero** — KPI functions (`getConstructionKPIs`, `getSalesKPIs`, etc.) are expected to guard. Every `X / Y` should have a paired `Y > 0 ? ... : 0`.
- **Never mutate filters inside chart click handlers** — use the `onXClick` props that bubble up to `SunshineDashboard` state.
- **Never hard-code communities, cities, stages, or lenders** — derive from the data.
- **Never expose raw fact tables to the UI** — always query a KPI view. Logic lives once, not in every dashboard file.

---

## 9. Where things live (cheat sheet)

| Topic | Path |
|---|---|
| Sample dashboard code | `src/components/demo/sunshine/` |
| Sample data + KPIs | `src/lib/sunshine-homes-data.ts` |
| Client dashboards | `Consultin Code/clients/{client}/` |
| Canonical schema | `Consultin Code/sql/canonical_schema.sql` |
| Validation KPIs | `Consultin Code/config/kpi_thresholds.yaml` |
| Client registry | `Consultin Code/config/clients.yaml` |
| Nightly QC script | `Consultin Code/scripts/daily-quality-check.js` |
| Daily sync | `Consultin Code/scripts/daily-sync.js` |
| Scaffold new client | `Consultin Code/scripts/scaffold-client.js` |
| Client onboarding | `Consultin Code/docs/CLIENT_ONBOARDING_GUIDE.md` |
| Legacy KPI narrative | `Consultin Code/docs/KPI_GUIDE.md`, `KPI_LIST.md`, `KPI_MASTER_REFERENCE.md` |
| Legacy shell narrative | `Consultin Code/docs/DASHBOARD_SHELL_BUILD_GUIDE.md`, `DASHBOARD_DESIGN_SYSTEM.md`, `DATA_DASHBOARD_PLAYBOOK.md` |

---

*Last updated 2026-04-23. When this document and any legacy doc conflict, trust this one.*
