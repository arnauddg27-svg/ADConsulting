# AD Consulting — Data & Dashboard Operational Framework

> Version 3.0 · March 2026
> Cross-client operational framework for data organization, KPI design, dashboard development, and reporting governance.
> This document is the single source of truth for all client engagements.

---

## Table of Contents

1. [Framework Overview & Principles](#1-framework-overview--principles)
2. [Client Discovery & Assessment](#2-client-discovery--assessment)
3. [Data Architecture (Multi-Client)](#3-data-architecture-multi-client)
4. [Source-to-Model Mapping](#4-source-to-model-mapping)
5. [Naming Conventions & Standards](#5-naming-conventions--standards)
6. [Formatting & Visual Standards](#6-formatting--visual-standards)
7. [KPI Framework](#7-kpi-framework)
8. [Dashboard Architecture](#8-dashboard-architecture)
9. [Data Validation & Quality Assurance](#9-data-validation--quality-assurance)
10. [Security & Access Control](#10-security--access-control)
11. [Governance & Maintenance](#11-governance--maintenance)
12. [Client Onboarding Process](#12-client-onboarding-process)
13. [Phased Rollout Framework](#13-phased-rollout-framework)
14. [Templates & Decision Tools](#14-templates--decision-tools)
15. [Appendices](#15-appendices)

---

## 1. Framework Overview & Principles

This document defines a **repeatable, scalable framework** for delivering data dashboards to production home builders and adjacent real estate operators. It is not a one-off build guide for a single client. Every engagement follows the same methodology, adapted to the client's data ecosystem, ERP system, and operational maturity.

The framework is designed so that a new client can be onboarded in 10 business days, from initial data discovery to deployed dashboard, using standardized processes, templates, and architecture patterns.

### 1.1 Core Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **Client Isolation** | Each client dashboard is a fully isolated application. No runtime code, data, or credentials are shared between clients. One client's deployment failure or data issue never impacts another. |
| 2 | **Data-Dependent Design** | Every KPI, section, tab, and chart is built only when the underlying data supports it. Never build a dashboard element assuming future data availability. Never show bad data. |
| 3 | **Modular Architecture** | Sections, tabs, KPI cards, and panels are plug-and-play modules. A dashboard can have 2 sections or 7 sections. Adding or removing a module requires no structural changes to other modules. |
| 4 | **Standardized Visuals** | All clients share the same design system: color palette, typography, layout grid, component library. Only data and queries differ between clients. The visual layer is global. |
| 5 | **Documented Everything** | Every decision, mapping, transformation, and assessment is documented. The documentation is the product just as much as the dashboard itself. A new developer can pick up any client engagement by reading the docs. |

### 1.2 Technology Stack

**One stack for every client.** No decision trees. The client's source systems (BuilderTrend, Hyphen, Sage, whatever) don't matter — Fivetran extracts from the ERP into BigQuery, dbt transforms raw → staging → marts, and the Next.js dashboard reads from BigQuery. The rest is identical every time.

| Layer | Technology | Role | Typical Cost |
|-------|-----------|------|-------------|
| **Ingestion** | Fivetran or custom Node.js/Python scripts | Source-to-warehouse extraction | Fivetran: $500-2K/mo; Scripts: $0 |
| **Warehouse** | Google BigQuery | Storage, querying, scheduled marts | Free tier (1 TB scans/mo, 10 GB storage) |
| **Modeling** | SQL mart scripts (BigQuery Scheduled Queries) | Raw → staging → mart transformations | Included with BigQuery |
| **Application** | Next.js (React 19) | Server-rendered dashboard with ISR | $0 (Vercel free tier) |
| **Hosting** | Vercel | Static + SSR deployment | Free tier covers most dashboards |
| **Source Control** | Git | Version control per client | Free |
| **Authentication** | Google Cloud IAM | Service account per client project | Included with BigQuery |

**Client handoff model:**
1. GCP project → transferred to their account → BigQuery
2. Vercel project → transferred to their account → Next.js dashboard
3. Custom domain pointed at Vercel
4. You walk away with a support retainer

Two accounts for the client to own (GCP + Vercel), both potentially free. Clean, simple, no ongoing hosting burden on the consultant.

### 1.3 Supported ERP Systems

Production home builders typically use one of these ERP systems. Data extraction methods vary by system:

| ERP System | Approx. Market Share | Data Extraction Method | Output Format |
|------------|---------------------|----------------------|---------------|
| **BuildPro (BRIX)** | ~25% of production builders | Google Sheets sync, manual export | XLSX, Google Sheets |
| **BuilderTrend** | ~20% | API (REST), CSV export | JSON, CSV |
| **CoConstruct** | ~15% | API, CSV export | JSON, CSV |
| **Sage 300 CRE** | ~10% (larger builders) | ODBC connection, SQL export | CSV, XLSX |
| **Procore** | ~10% | REST API, Webhooks | JSON |
| **Foundation Software** | ~8% | Fivetran connector or SQL export | CSV, XLSX |
| **Newstar (ECI)** | ~5% | FTP export, manual | CSV, XLSX |
| **Custom/Legacy** | ~7% | Manual export, Google Sheets | XLSX, Google Sheets |

### 1.4 Data Extraction Approach Per Source Type

```
ERP/Source → [Export Method] → Staging (Google Sheets / XLSX / API) → [ETL Script] → Warehouse Raw → [Mart Queries] → Warehouse Marts → Dashboard
```

| Source Type | Extraction Method | Ingestion Script | Notes |
|-------------|-------------------|-----------------|-------|
| **Google Sheets** | Direct external table link OR scheduled XLSX export | `import_sheets_to_bq.js` | External tables refresh automatically but can be fragile; periodic export is more reliable |
| **REST API** | Node.js extraction script fetches JSON, transforms, loads | `import_api_to_bq.js` | Store raw API responses in JSON for debugging; transform to flat table on load |
| **XLSX files** | Manual or automated export from ERP, then script import | `import_xlsx_to_bq.js` | Use WRITE_TRUNCATE for full refresh on each import |
| **SQL/ODBC** | Scheduled query export from ERP database to CSV | `import_csv_to_bq.js` | Client IT or controller typically schedules the export |
| **CSV files** | Manual export from ERP or third-party system | `import_csv_to_bq.js` | Validate headers before import; CSV encoding varies |

### 1.5 Client Isolation Principle

**RULE: Each client dashboard is a fully isolated application. Never share runtime code between clients.**

```
client_scaffold/
├── clients/
│   ├── {client_a}/
│   │   ├── .env                          # Warehouse credentials
│   │   ├── kpi_assessment.md             # Client-specific KPI audit
│   │   ├── bigquery.yaml                 # Schema documentation
│   │   └── next_dashboard/               # STANDALONE Next.js app
│   │       ├── app/                      # page.js, layout.js, globals.css
│   │       ├── components/               # dashboard-shell.js, theme-toggle.js
│   │       ├── lib/                      # bigquery.js, dashboard-data.js
│   │       └── package.json              # Independent dependencies
│   ├── {client_b}/
│   │   └── next_dashboard/               # Separate isolated app
│   └── demo_{client_c}/
│       └── next_dashboard/               # Demo app (static data, no live connection)
├── DATA_DASHBOARD_PLAYBOOK.md            # THIS DOCUMENT
├── KPI_MASTER_REFERENCE.md               # Cross-client KPI definitions
├── DASHBOARD_DESIGN_SYSTEM.md            # Visual specification
├── DASHBOARD_SHELL_BUILD_GUIDE.md        # Build process guide
└── CLIENT_ONBOARDING_GUIDE.md            # Onboarding workflow
```

**Why isolation:**
- Prevents accidental data leaks between clients
- Each client can have different warehouse projects, schemas, and KPI configurations
- Independent deployment — updating one client does not affect others
- Simplifies security audits (one app = one client's data)
- Allows per-client tech stack variations if needed

---

## 2. Client Discovery & Assessment

Before building anything, run a structured discovery process. This phase determines what is possible, what is practical, and what to build first.

### 2.1 Discovery Questionnaire

Use the following questions during the initial client meeting. Not every question applies to every client — skip those that are clearly irrelevant to the engagement scope.

**Operational Profile:**

| # | Question | Why It Matters |
|---|----------|---------------|
| 1 | What ERP system do you use for construction management? | Determines extraction method, data format, and expected schema |
| 2 | How many active jobs/projects do you currently have? | Sizes the data volume and determines dashboard complexity |
| 3 | How many communities/subdivisions are you building in? | Determines geographic/portfolio analysis depth |
| 4 | How many closings do you average per month? | Sizes sales pipeline and velocity metrics |
| 5 | Who manages your data day-to-day? (Controller, office manager, PM?) | Identifies data quality owner and refresh point of contact |
| 6 | What financial reports do you currently run? | Reveals which metrics they already track and expect to see |
| 7 | What are your biggest operational blind spots? | Prioritizes which dashboard sections to build first |
| 8 | What decisions would you make differently with better data? | Validates business value and KPI relevance |

**Data Depth:**

| # | Question | Why It Matters |
|---|----------|---------------|
| 9 | Do you have historical data? How far back? | Enables trend analysis and year-over-year comparison |
| 10 | Do you track construction milestones (slab, frame, drywall, CO)? | Core requirement for construction progress section |
| 11 | Do you have separate lot cost vs. construction cost tracking? | Determines financial KPI granularity |
| 12 | Do you have loan/draw tracking? | Activates LOANS section |
| 13 | Do you track sales contracts separately from closings? | Activates SALES pipeline view |
| 14 | Do you have a property management portfolio? | Activates PROPERTY MGMT section |
| 15 | Do you track land acquisition deals (under contract, closed, cancelled)? | Activates LAND section |
| 16 | Do you have permitting data (dates, status, jurisdiction)? | Activates PERMITTING section |
| 17 | Do you have vendor/subcontractor cost breakdowns? | Activates vendor scorecard and audit sections |
| 18 | Do you track budgets per job? | Enables budget vs. actual analysis |

**Technical Environment:**

| # | Question | Why It Matters |
|---|----------|---------------|
| 19 | Do you already have a data warehouse or BI tool? | Determines if we build from scratch or integrate |
| 20 | Do you have a Google Cloud account? | Determines hosting and warehouse setup effort |
| 21 | How are your data exports currently delivered? (Shared drive, email, FTP?) | Determines ingestion pipeline design |
| 22 | Who needs access to the dashboard? How many users? | Determines access control and authentication needs |

### 2.2 Data Ecosystem Assessment

After the discovery questionnaire, conduct a hands-on audit of the client's data. Use this checklist:

**Source Systems Inventory:**

| Assessment Item | What to Document | How to Evaluate |
|-----------------|-----------------|-----------------|
| Source systems list | Every system that produces data relevant to the dashboard | Ask client to list all systems; verify by reviewing exports |
| Data formats | API, XLSX, Google Sheets, CSV, SQL, manual entry | Request sample export from each system |
| Refresh cadence | Real-time, daily, weekly, monthly, manual/ad-hoc | Ask who triggers exports and how often |
| Data ownership | Who enters data, who validates it, who exports it | Interview the controller or office manager |
| Historical depth | How many months or years of data are available | Check earliest dates in sample exports |
| Volume | Number of jobs, sales records, properties, transactions | Count rows in sample exports |
| Integration points | Which systems share data with each other | Ask about any automated syncs or manual transfers |

**Data Format Assessment:**

For each source system, document:

```
Source: {system_name}
Format: {XLSX / CSV / Google Sheets / API / SQL}
Delivery: {shared drive / email / API endpoint / Google Sheets URL}
Frequency: {daily / weekly / monthly / on-demand}
Owner: {role who triggers or manages the export}
Sample rows: {number of rows in most recent export}
Column count: {number of columns}
Known issues: {any data quality concerns noted by the client}
```

### 2.3 Warehouse Assessment

For clients who already have a data warehouse or BI tool, assess the existing setup:

| Assessment Area | Questions to Answer | How to Evaluate |
|----------------|--------------------|--------------------|
| Current technology | What warehouse platform? What version? | Direct inspection or client interview |
| Schema organization | How are tables organized? By department, source, domain? | Query `INFORMATION_SCHEMA` or equivalent |
| Table relationships | Are foreign keys documented? Any ERD available? | Check documentation or infer from JOIN patterns |
| Data freshness | When was each table last updated? | Query `MAX(_extracted_at)` or metadata timestamps |
| Query performance | How long do typical queries take? | Run sample queries and measure |
| Access patterns | Who runs queries? How often? Through what tools? | Review audit logs or ask stakeholders |
| Existing reports | What dashboards or reports already exist? | Request screenshots or access |

### 2.4 Assessment Output

The discovery and assessment phase produces the following deliverables:

**Client Data Profile:**

```markdown
# Client Data Profile: {client}

## Overview
- ERP System: {system}
- Active Jobs: {count}
- Communities: {count}
- Data History: {months/years}
- Data Owner: {role}

## Source Systems
| System | Format | Refresh | Tables/Sheets | Row Volume |
|--------|--------|---------|---------------|------------|
| {system_1} | XLSX | Weekly | 3 sheets | ~1,200 rows |
| {system_2} | Google Sheets | Real-time | 5 sheets | ~500 rows |

## Data Quality Summary
- Overall completeness: {percentage}
- Critical field gaps: {list}
- Known issues: {list}

## Recommended Phase
- Start with: Phase {N} ({name})
- Reason: {justification}
- Estimated build time: {days}
```

**Source-to-Warehouse Mapping:** A table mapping each source file/sheet/API to its target warehouse table (see Section 4 for the mapping methodology).

**Data Quality Scorecard:** A per-field completeness and validity assessment (see Section 9 for the scoring methodology).

**Recommended Implementation Phase:** Based on the data maturity model (see Section 13), recommend which phase to start with and which sections to activate.

---

## 3. Data Architecture (Multi-Client)

### 3.1 Layer Model

Data flows through four distinct layers. Each layer has specific rules about what belongs there. The architecture is the same regardless of the warehouse technology — only naming conventions change.

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: RAW                                               │
│  Storage: {client}_raw                                      │
│  Tables imported directly from source — no transformations   │
│  Examples: construction_milestones, sales, job_cost          │
│  Rules: Read-only after import. Never modify raw data.       │
│         WRITE_TRUNCATE on each import (full refresh).        │
│         Preserve original column names where possible.       │
│         All columns stored as STRING if type uncertain.      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: CLEANED                                            │
│  Optional intermediate (same dataset or separate)            │
│  Type-cast columns, standardized names, deduped records      │
│  Usually handled inline in dashboard queries via SAFE_CAST   │
│  For complex clients: create views in the warehouse          │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: MARTS                                              │
│  Storage: {client}_marts                                     │
│  Pre-computed aggregations for heavy queries                  │
│  Examples: mart_daily_summary, mart_audit_pl                 │
│  Rules: Refresh daily via scheduled query or script.          │
│         Include _mart_refreshed_at timestamp.                │
│         Use CREATE OR REPLACE TABLE (or equivalent).         │
│         Only build marts for queries joining 3+ tables.      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4: DASHBOARD-FACING                                   │
│  The getDashboardData() function in lib/dashboard-data.js    │
│  Queries raw + marts, normalizes, returns flat JSON object   │
│  Rules: One function, one Promise.all, one return shape.     │
│         Client-side filtering and aggregation in shell.js.   │
│         Revalidate every 86400 seconds (daily ISR).          │
└─────────────────────────────────────────────────────────────┘
```

**Layer 1 adapts to the client's source format:**

| Source Format | Ingestion Pattern | Notes |
|---------------|-------------------|-------|
| Google Sheets | External table link OR periodic XLSX export + load | External tables auto-refresh but are fragile; export is more reliable for production |
| REST API | Node.js script fetches → transforms → loads JSON as rows | Store raw API response for debugging |
| XLSX files | Import script reads XLSX → converts to rows → loads with WRITE_TRUNCATE | Full refresh each time, no incremental |
| SQL/ODBC | Scheduled export from source DB → CSV → load script | Client IT manages the export schedule |
| CSV files | Import script reads CSV → validates headers → loads | Check encoding (UTF-8 vs. Windows-1252) |
| Manual entry | Client enters data in Google Sheets → external table or periodic export | Least reliable; validate aggressively |

### 3.2 Warehouse Configuration

Every client uses the same BigQuery configuration:

| Layer | BigQuery Implementation |
|-------|------------------------|
| **Raw** | Dataset: `{client}_raw` |
| **Cleaned** | Views in `{client}_raw` or inline `SAFE_CAST` |
| **Marts** | Dataset: `{client}_marts` |
| **Dashboard** | Node.js `@google-cloud/bigquery` SDK |
| **Scheduling** | BigQuery Scheduled Queries (Console > Scheduled Queries > Daily at 6 AM) |
| **Auth** | Service Account JSON key (one per client project) |
| **Cost Model** | Pay-per-scan (1 TB free/mo, 10 GB storage free) |

### 3.3 Table Categories

Every table in a client's warehouse falls into one of these categories. Not every client will have every category — build only what the data supports.

| Category | Naming Pattern | Examples | When to Create | Refresh |
|----------|---------------|----------|----------------|---------|
| **Core roster** | `construction_milestones` | Job-level data with milestone dates | Always (core requirement) | Per import |
| **Financial** | `job_cost`, `sales`, `schedule` | Cost, revenue, timeline data | When client tracks costs or sales | Per import |
| **Audit breakdown** | `audit_*` | `audit_costs`, `audit_dirt`, `audit_utilities` | When client has line-item cost categories | Per import |
| **External import** | `xlsx_*` or `cd2_*` | `xlsx_sales_full`, `cd2_permitting` | When data comes from secondary system | Per import |
| **Land** | `land_acquisition_*`, `subdivision_pipeline` | Active/closed/cancelled deals | When client tracks land deals | Per import |
| **Property Mgmt** | `pm_*` | `pm_master`, `pm_delinquency`, `pm_rent_roll` | When client has rental portfolio | Per import |
| **Mart (computed)** | `mart_*` | `mart_daily_summary`, `mart_audit_pl` | When queries join 3+ tables or aggregate heavily | Daily scheduled |

**Decision criteria for creating each category:**
- **Core roster**: Create for every client. This is the minimum viable dataset.
- **Financial**: Create when the client tracks job costs, sales prices, or budgets in their ERP.
- **Audit breakdown**: Create only when the client has separate cost category exports (e.g., dirt, utilities, structural).
- **External import**: Create when data comes from a system other than the primary ERP.
- **Land**: Create only when the client actively acquires land and tracks deals.
- **Property Mgmt**: Create only when the client has a rental or property management operation.
- **Mart**: Create only when performance requires it (queries joining 3+ tables or taking >3 seconds).

### 3.4 Calculated Fields

Calculated fields should be computed in the **data layer** (`dashboard-data.js`), not in the shell component. This keeps the shell focused on rendering.

**Standard calculated fields:**

| Field | Formula | Layer | Notes |
|-------|---------|-------|-------|
| `total_cost` | `lot_cost + wip` (if `job_cost_amount` unavailable) | Data layer | Cost hierarchy varies by ERP — see below |
| `est_margin` | `sale_price - total_cost - defaults.contingency - defaults.financing` | Data layer | Contingency and financing are client-defined defaults |
| `est_margin_pct` | `est_margin / sale_price` | Data layer | Guard against division by zero |
| `net_profit` | `sale_price - total_cost - other_expenses` | Data layer | Only available when full cost breakdown exists |
| `cycle_days` | `DATEDIFF(co_date, start_date)` | Data layer | Only for completed jobs (both dates non-null) |
| `days_stuck` | `DATEDIFF(TODAY, last_milestone_date)` | Data layer | Only for active jobs |
| `draw_pct` | `total_drawn / loan_amount` | Data layer | Only when loan data exists |
| `completion_pct` | Raw from ERP (0-100 or 0-1 scale, auto-detected) | Data layer | Scale detection: if MAX > 1, assume 0-100; else 0-1 |
| `occupancy_rate` | `COUNT(status='Leased') / COUNT(*)` | Shell (filtered) | Only in Property Management section |
| `absorption_rate` | `sales_last_90_days / available_inventory` | Shell (filtered) | Only when sales and inventory data both exist |

**Cost hierarchy (when multiple cost fields exist):**

```
IF job_cost_amount > 0 → use job_cost_amount (most complete cost field)
ELSE IF (lot_cost + wip) > 0 → use (lot_cost + wip) (common proxy)
ELSE → total_cost = 0 (no cost data available)
```

**Client-specific variations to expect:**
- Some ERPs store `completion_pct` as 0-100 integers; others use 0.0-1.0 floats. Auto-detect by checking the max value.
- Some clients track `original_budget` separately from `job_cost_amount`; others do not have budget data at all.
- Some clients have no separate lot cost — everything is in a single cost column.
- Date formats vary: `MM/DD/YYYY`, `YYYY-MM-DD`, `M/D/YY`, Google Sheets serial numbers.

### 3.5 Date Handling

Dates from Google Sheets, XLSX, and API sources are inconsistent. Apply these normalization rules across all clients:

| Rule | Implementation | Applies To |
|------|---------------|------------|
| **Always normalize** | Use `normalizeTemporalValue(v)` helper to unwrap warehouse-specific date objects (e.g., BigQuery `{value: "date"}` wrappers) | All date fields |
| **Store as STRING in raw** | Source dates are unreliable — keep as string in raw layer, parse in queries or data layer | All raw tables |
| **Detect format** | Auto-detect format on import: check for `YYYY-MM-DD`, `MM/DD/YYYY`, `M/D/YY`, serial numbers | Per source |
| **Format consistently** | Display as `MMM D, YY` (e.g., "Mar 17, 26") using `formatDate()` | All date columns in dashboard |
| **Filter by recency** | Exclude old closed jobs from active queries. Default: `WHERE NOT (job_type LIKE '%Closed%' AND EXTRACT(YEAR FROM date_field) < {current_year - 4})` | Per client — adjust the cutoff year based on client preference |
| **Handle nulls** | Missing dates display as `-`, never "Invalid Date" or blank | All date displays |
| **Timezone** | All dates are treated as local to the client's primary operating timezone. No UTC conversion unless multi-timezone client. | Per client |

### 3.6 Mart Architecture

Marts are pre-computed tables that replace expensive multi-table JOINs. Build a mart when:
- A query joins 3+ tables
- The same aggregation runs on every page load
- Query execution time exceeds 3 seconds

**When NOT to build a mart:**
- The query touches a single table with simple filters
- The dataset is small enough that joins execute in under 1 second
- The data changes more frequently than the mart refresh cycle

**Standard mart patterns:**

| Mart | Purpose | Typical Source Tables | Refresh |
|------|---------|----------------------|---------|
| `mart_daily_summary` | Portfolio KPIs (counts, totals, averages) | milestones, sales | Daily |
| `mart_audit_pl` | Pre-joined P&L per job | milestones + audit tables | Daily |
| `mart_filter_quality` | Filter options + data quality checks | milestones | Daily |
| `mart_exception_center` | Stalled/at-risk job alerts | milestones, schedule | Daily |

**Mart refresh pattern (BigQuery example):**

```sql
-- mart_daily_summary.sql
CREATE OR REPLACE TABLE `{project_id}.{dataset}_marts.mart_daily_summary` AS
WITH base AS (
  SELECT ... FROM `{project_id}.{dataset}_raw.construction_milestones`
  WHERE {notOldClosed}
),
sales AS (
  SELECT ... FROM `{project_id}.{dataset}_raw.sales`
)
SELECT
  CURRENT_TIMESTAMP() AS _mart_refreshed_at,
  ... aggregated fields ...
FROM base
LEFT JOIN sales ON ...
```

**Mart refresh strategy:**

| Method | Configuration |
|--------|---------------|
| BigQuery Scheduled Query | Console > Scheduled Queries > Daily at 6 AM UTC |

---

## 4. Source-to-Model Mapping

This section defines the methodology for mapping inconsistent client data into the standardized reporting framework. Every client's ERP uses different field names, different formats, and different structures. This process normalizes them into a consistent model.

### 4.1 Field Mapping Process

Follow these five steps for every new client engagement:

**Step 1: Inventory all source fields**
Export the schema of every source table. For each column, document: column name, data type (as stored), sample values (3-5), and null percentage.

**Step 2: Map to standard field names**
Compare source columns against the Standard Field Inventory (Section 4.2). For each source field, record the target standard field name.

**Step 3: Identify gaps**
Fields required by the KPI framework but not present in the source data. Document each gap and assess its impact on KPI readiness.

**Step 4: Identify extras**
Client-specific fields that do not map to the standard model. Evaluate whether each extra field is useful for the dashboard (include) or irrelevant (exclude).

**Step 5: Document transformations**
For each field that requires transformation (type casting, value mapping, formula, concatenation), document the exact transformation in the mapping table.

### 4.2 Standard Field Inventory

The "ideal" field set across all domains. Not every client will have every field. Fields marked with * are required for core KPIs; others are optional enhancements.

**Construction Domain:**

| Standard Field | Type | Description | Required for Core? |
|---------------|------|-------------|-------------------|
| `job_id` | STRING | Unique job identifier from ERP | Yes* |
| `address` | STRING | Street address of the job | Yes* |
| `city` | STRING | City where the job is located | Yes* |
| `state` | STRING | State abbreviation | No |
| `community` | STRING | Community, subdivision, or development name | Yes* |
| `plan_name` | STRING | Floor plan or model name | No |
| `plan_sqft` | FLOAT | Square footage of the plan | No |
| `job_type` | STRING | Current job status category | Yes* |
| `status` | STRING | Granular status within the job type | No |
| `completion_pct` | FLOAT | Percentage complete (0-100 or 0-1 scale) | Yes* |
| `start_date` | STRING | Construction start date | Yes* |
| `slab_date` | STRING | Slab pour completion date | No |
| `frame_date` | STRING | Framing completion date | No |
| `dry_in_date` | STRING | Dry-in / roof completion date | No |
| `drywall_date` | STRING | Drywall hang date | No |
| `drywall_finish_date` | STRING | Drywall finish/texture date | No |
| `cabinet_date` | STRING | Cabinet installation date | No |
| `trim_date` | STRING | Trim carpentry date | No |
| `flooring_date` | STRING | Flooring installation date | No |
| `hot_check_date` | STRING | Final MEP / hot check date | No |
| `final_date` | STRING | Final inspection date | No |
| `co_date` | STRING | Certificate of Occupancy date | Yes* |
| `closing_date` | STRING | Closing / settlement date | No |
| `po_release_date` | STRING | Purchase order release date | No |
| `superintendent` | STRING | Assigned superintendent name | No |
| `project_manager` | STRING | Assigned project manager name | No |
| `wip` | FLOAT | Work-in-progress cost amount | No |
| `lot_cost` | FLOAT | Lot / land cost | No |
| `original_budget` | FLOAT | Approved budget amount | No |
| `job_cost_amount` | FLOAT | Total actual job cost | No |
| `entity` | STRING | Legal entity or company name (for multi-entity builders) | No |

**Sales Domain:**

| Standard Field | Type | Description | Required for Core? |
|---------------|------|-------------|-------------------|
| `contract_number` | STRING | Unique sales contract identifier | Yes* |
| `lot_id` | STRING | Lot identifier (links to job) | No |
| `job_id` | STRING | Related job identifier | Yes* |
| `community` | STRING | Community name | Yes* |
| `plan_name` | STRING | Floor plan name | No |
| `buyer_name` | STRING | Buyer full name (PII — handle securely) | No |
| `sale_price` | FLOAT | Contract sale price | Yes* |
| `contract_date` | STRING | Date contract was signed | Yes* |
| `projected_close` | STRING | Projected closing date | No |
| `actual_close` | STRING | Actual closing date | No |
| `sale_status` | STRING | Sold, Closed, Cancelled, Pending | Yes* |
| `agent_name` | STRING | Selling agent name | No |
| `commission` | FLOAT | Agent commission amount | No |
| `incentives` | FLOAT | Buyer incentives or concessions | No |
| `earnest_money` | FLOAT | Earnest money deposit | No |

**Loans Domain:**

| Standard Field | Type | Description | Required for Core? |
|---------------|------|-------------|-------------------|
| `job_id` | STRING | Related job identifier | Yes* |
| `lender` | STRING | Lending institution name | Yes* |
| `loan_number` | STRING | Loan identifier | No |
| `loan_amount` | FLOAT | Total loan amount | Yes* |
| `total_drawn` | FLOAT | Total amount drawn to date | Yes* |
| `interest_rate` | FLOAT | Annual interest rate | No |
| `origination_date` | STRING | Loan origination date | No |
| `expiration_date` | STRING | Loan maturity/expiration date | No |
| `loan_status` | STRING | Active, Expired, Paid Off, Extended | No |

**Land Acquisition Domain:**

| Standard Field | Type | Description | Required for Core? |
|---------------|------|-------------|-------------------|
| `deal_id` | STRING | Deal or contract identifier | Yes* |
| `community` | STRING | Planned community name | Yes* |
| `total_lots` | INT | Total lots in the deal | No |
| `purchase_price` | FLOAT | Total land purchase price | No |
| `price_per_lot` | FLOAT | Calculated price per lot | No |
| `contract_date` | STRING | Date deal was signed | No |
| `closing_date` | STRING | Date deal closed | No |
| `land_status` | STRING | Under Contract, Closed, Cancelled | Yes* |
| `jurisdiction` | STRING | City or county jurisdiction | No |
| `zoning` | STRING | Current zoning designation | No |

**Property Management Domain:**

| Standard Field | Type | Description | Required for Core? |
|---------------|------|-------------|-------------------|
| `property_id` | STRING | Unique property identifier | Yes* |
| `address` | STRING | Property address | Yes* |
| `city` | STRING | Property city | Yes* |
| `community` | STRING | Community or portfolio group | No |
| `unit_type` | STRING | SFR, duplex, townhome, etc. | No |
| `pm_status` | STRING | Leased, Vacant, Make Ready, Eviction | Yes* |
| `tenant_name` | STRING | Current tenant (PII) | No |
| `monthly_rent` | FLOAT | Current monthly rent | No |
| `lease_start` | STRING | Lease start date | No |
| `lease_end` | STRING | Lease end date | No |
| `days_vacant` | INT | Days unit has been vacant | No |
| `delinquent_amount` | FLOAT | Amount past due | No |

### 4.3 Mapping Decision Framework

For each client field encountered during the mapping process, follow this decision tree:

| Scenario | Decision | Action |
|----------|----------|--------|
| **Direct match** | Client field name and meaning match a standard field exactly | Map 1:1 with no transformation |
| **Partial match** | Client field contains the same data but with a different name or format | Map with transformation; document the exact transformation |
| **No match (standard field missing)** | A standard field is needed for a KPI but the client does not have it | Mark as gap; assess impact on dependent KPIs; score those KPIs as Partial or Blocked |
| **Extra field (client-only)** | Client has a field not in the standard model | Include if useful for client-specific analysis; exclude if irrelevant; document the decision |
| **Ambiguous** | Unclear whether the client field maps to a standard field | Do not guess. Clarify with the client before mapping. Document the ambiguity. |
| **Composite field** | Client stores multiple values in one field (e.g., "City - Community") | Split using a transformation; document the delimiter and parsing logic |
| **Multi-source** | The same standard field can be populated from multiple source tables | Define priority order; document which source takes precedence |

### 4.4 Example Mapping

The following shows an anonymized mapping for a client using a BuildPro-style ERP:

| Client Field (Source Column) | Standard Field | Transformation | Notes |
|------------------------------|---------------|----------------|-------|
| `Project >> Job` | `job_id` | Direct | Primary key |
| `Project >> Name` | `address` | Direct | Full street address |
| `Area Name` | `community` | Direct | Client uses "Area" instead of "Community" |
| `Builder Plan` | `plan_name` | Direct | Sometimes blank for custom builds |
| `Status` | `job_type` | `CASE WHEN` mapping (see status map) | 12 source values mapped to 8 standard values |
| `% Complete` | `completion_pct` | `SAFE_CAST(v AS FLOAT64) / 100` | Stored as 0-100 integer in source |
| `Total Est Cost` | `original_budget` | `SAFE_CAST(REPLACE(v, ',', '') AS FLOAT64)` | Stored with comma separators |
| `Actual Cost` | `job_cost_amount` | `SAFE_CAST(REPLACE(v, ',', '') AS FLOAT64)` | Same formatting as budget |
| `Lot Amt` | `lot_cost` | `SAFE_CAST(REPLACE(v, ',', '') AS FLOAT64)` | Sometimes includes land development |
| `WIP` | `wip` | `SAFE_CAST(REPLACE(v, ',', '') AS FLOAT64)` | Cumulative work-in-progress |
| `Slab Pour` | `slab_date` | `normalizeTemporalValue(v)` | MM/DD/YYYY format |
| `Framing` | `frame_date` | `normalizeTemporalValue(v)` | MM/DD/YYYY format |
| `Superintendent` | `superintendent` | `TRIM(v)` | Trailing spaces in source |
| N/A | `state` | Hardcoded: `'FL'` | Client operates only in Florida |
| `Buyer Phone` | (excluded) | N/A | Not needed for dashboard |

---

## 5. Naming Conventions & Standards

### 5.1 Warehouse Naming

| Element | Convention | Example |
|---------|-----------|---------|
| **Project ID** | Platform-generated or kebab-case | `atomic-venture-404412`, `{client}-analytics` |
| **Raw dataset** | `{client}_raw` | `acme_builders_raw` |
| **Marts dataset** | `{client}_marts` | `acme_builders_marts` |
| **Table (raw)** | `snake_case`, descriptive | `construction_milestones` |
| **Table (import)** | `xlsx_{source}` or `cd2_{source}` | `xlsx_sales_full`, `cd2_permitting` |
| **Table (mart)** | `mart_{purpose}` | `mart_daily_summary` |
| **Column** | `snake_case`, no spaces | `job_id`, `sale_price`, `completion_pct` |
| **Date column** | `{event}_date` | `contract_date`, `start_date`, `co_date` |
| **Boolean column** | `is_{condition}` or `has_{thing}` | `is_active`, `has_loan` |
| **Amount column** | `{thing}_amount` or descriptive | `loan_amount`, `sale_price`, `wip` |

### 5.2 Dashboard Naming

| Element | Convention | Example |
|---------|-----------|---------|
| **Section (sidebar)** | ALL CAPS, lifecycle stage | `CONSTRUCTION`, `SALES`, `AUDITS` |
| **Tab** | Title case, short | `Dashboard`, `Pipeline`, `Cycle Time` |
| **Tab ID (code)** | camelCase | `constructionDash`, `salesPipeline` |
| **KPI label** | UPPER CASE, abbreviated | `TOTAL JOBS`, `AVG COMPLETION`, `AT RISK` |
| **Panel kicker** | UPPER CASE, category | `PROFITABILITY`, `GEOGRAPHY`, `VELOCITY` |
| **Panel title** | Title case, descriptive | `Community Scorecard`, `Cycle Time by City` |
| **Filter label** | Title case with colon | `City: All`, `Job Type: All` |
| **Column header** | UPPER CASE, abbreviated | `JOB ID`, `COMP%`, `MARGIN` |

### 5.3 Code Naming

| Element | Convention | Example |
|---------|-----------|---------|
| **Component** | PascalCase | `DashboardShell`, `KpiCard`, `AuditPLCard` |
| **Function** | camelCase | `getDashboardData()`, `formatCompactCurrency()` |
| **Variable** | camelCase | `milestonesRoster`, `profitTracking` |
| **CSS class** | kebab-case | `kpi-card`, `compact-table-row`, `cycle-phase-bar` |
| **CSS variable** | `--kebab-case` | `--bg-surface`, `--accent`, `--text-primary` |
| **Env variable** | SCREAMING_SNAKE | `BIGQUERY_PROJECT_ID`, `DASHBOARD_CLIENT_NAME` |
| **File** | kebab-case | `dashboard-data.js`, `dashboard-shell.js` |
| **localStorage key** | `{client}_proforma_defaults` | `acme_proforma_defaults` |

### 5.4 Status Values

Standardize status values across all clients. Map client-specific values to these standard values in the data layer:

| Category | Standard Values |
|----------|----------------|
| **Job type** | `SFR Construction In Progress`, `SFR Completed & Closed`, `Lot`, `Leased: Property Management`, `SFR Completed (not closed)`, `Permitting`, `On Hold`, `POs Released`, `Awaiting CO`, `Development` |
| **Sale status** | `Sold`, `Closed`, `Cancelled`, `Pending`, `Under Contract` |
| **Loan status** | `Active`, `Expired`, `Paid Off`, `Extended` |
| **Land status** | `Under Contract`, `Closed`, `Cancelled` |
| **PM status** | `Leased`, `Make Ready`, `Vacant`, `Eviction` |
| **Permit status** | `Submitted`, `In Review`, `Approved`, `CO'ED`, `Rejected` |

### 5.5 Client-Specific Adaptation Rules

When a client's ERP uses different terminology:
1. Map the client's value to the standard value in the data layer (CASE WHEN or lookup table)
2. Use the **standard value** in all dashboard displays, KPI calculations, and filters
3. Document the mapping in the client's `kpi_assessment.md` or field mapping table
4. Never expose the raw source value in the dashboard — always show the standardized value

### 5.6 Cross-Client Consistency Requirement

All dashboards use the **same CSS class names, component names, and function names** regardless of client. The only differences between client dashboards are:
- Queries in `dashboard-data.js` (different tables, fields, transformations)
- Tab and section configuration in `dashboard-shell.js` (which modules are activated)
- `.env` variables (credentials, project IDs, client name)
- Client-specific KPI caveats and data quality notes

---

## 6. Formatting & Visual Standards

**RULE: The design system is GLOBAL. No per-client CSS variations. Only data and queries differ between client dashboards. All clients share the same `globals.css`.**

### 6.1 Number Formatting

| Type | Function | Input | Output | Usage |
|------|----------|-------|--------|-------|
| **Whole number** | `formatWholeNumber(v)` | `1260` | `1,260` | Job counts, unit counts |
| **Compact currency** | `formatCompactCurrency(v)` | `4200000` | `$4.2M` | KPI cards, table cells |
| **Full currency** | `formatCurrency(v)` | `142000` | `$142,000` | Pro forma line items |
| **Percentage** | `formatPercent(v)` | `0.341` or `34.1` | `34.1%` | Auto-detects 0-1 vs 0-100 scale |
| **Days** | `` `${value}d` `` (inline) | `45` | `45d` | Cycle time, stall alerts |
| **Date** | `formatDate(v)` | `2026-03-17` | `Mar 17, 26` | All date columns |

**Formatting rules:**
- Negative currency shows in red: `$-138K` with `text-danger` class
- Zero values show as `-` in tables, `$0` only in pro forma detail
- Null/undefined values always show as `-`, never blank or "N/A"
- Percentages always include one decimal: `34.1%`, not `34%`
- Currency in KPI cards uses compact form; in drill-down tables uses compact form; in pro forma uses full form

### 6.2 Color Standards

**Semantic colors (both themes):**

| Purpose | Dark Theme | Light Theme | CSS Variable |
|---------|-----------|-------------|-------------|
| **Background (shell)** | `#08111a` | `#f5f7fa` | `--bg-shell` |
| **Background (surface)** | `#0d1825` | `#ffffff` | `--bg-surface` |
| **Background (raised)** | `#121f2e` | `#f0f2f5` | `--bg-surface-raised` |
| **Background (hover)** | `#182838` | `#e8ecf0` | `--bg-hover` |
| **Text (primary)** | `#e8ecf0` | `#1a2332` | `--text-primary` |
| **Text (secondary)** | `#8a9bb0` | `#4a5568` | `--text-secondary` |
| **Text (muted)** | `#5a6b7e` | `#8a95a5` | `--text-muted` |
| **Accent (teal)** | `#24c18d` | `#17b681` | `--accent` |
| **Warning (amber)** | `#efb562` | `#d18d35` | `--warning` |
| **Danger (red)** | `#f46a6a` | `#d45151` | `--danger` |
| **Border** | `#1e2d3d` | `#d5dbe3` | `--border` |

**Chart palette (teal-to-blue gradient, 8 steps):**

```
#0f766e → #0d9488 → #14b8a6 → #06b6d4 → #0ea5e9 → #0284c7 → #1d4ed8 → #1e40af
```

- Phase 1 (Slab): `#0f766e` (deep teal)
- Phase 2 (Frame): `#0d9488` (teal)
- Phase 3 (Dry-in): `#14b8a6` (light teal)
- Phase 4 (Drywall): `#06b6d4` (cyan)
- Phase 5 (Flooring): `#0ea5e9` (sky blue)
- Phase 6 (Hot Check): `#0284c7` (blue)
- Phase 7 (CO): `#1d4ed8` (deep blue)
- Phase 8 (Reserve): `#1e40af` (navy)

**No warm colors in charts.** No red, orange, yellow, or pink in data visualizations. Warm colors are reserved for semantic meaning (danger, warning, good).

**Margin bar colors:**
- >=20%: `#059669` (green)
- 10-19%: `#0d9488` (teal)
- 1-9%: `#d97706` (amber)
- <=0%: `#dc2626` (red)

**Conditional formatting for tables:**

| Condition | Style | CSS Class |
|-----------|-------|-----------|
| Negative currency value | Red text | `text-danger` |
| Margin above 20% | Green background tint | `margin-good` |
| Margin 10-19% | Teal background tint | `margin-ok` |
| Margin 1-9% | Amber background tint | `margin-warn` |
| Margin <= 0% | Red background tint | `margin-bad` |
| Stalled job (>30 days stuck) | Amber row highlight | `row-warning` |
| Critical alert (>60 days stuck) | Red row highlight | `row-danger` |
| Completion 100% | Accent text color | `text-accent` |

### 6.3 Typography

| Element | Size | Weight | Font |
|---------|------|--------|------|
| KPI value | 20px | 800 | Space Grotesk |
| KPI label | 10px | 600 | Space Grotesk, uppercase, 0.08em tracking |
| KPI sub-label | 11px | 400 | Space Grotesk |
| Panel kicker | 10px | 700 | Space Grotesk, uppercase, 0.08em tracking, accent color |
| Panel title | 13px | 700 | Space Grotesk |
| Panel note | 11px | 400 | Space Grotesk, secondary color |
| Table header | 10px | 700 | Space Grotesk, uppercase, 0.05em tracking |
| Table cell | 11px | 400 | Space Grotesk |
| Table cell (mono) | 11px | 400 | Monospace (for IDs, dates) |
| Sidebar section | 9px | 700 | Space Grotesk, uppercase, 0.1em tracking |
| Sidebar tab | 12px | 500 | Space Grotesk |
| Shell bar title | 14px | 600 | Space Grotesk |

### 6.4 Layout Grid

```
┌──────────────────────────────────────────────────────────┐
│ SHELL BAR (gradient tint, 48px height)                    │
│ {client_name} / Builder Ops Console          [theme] [gear]│
├────────┬─────────────────────────────────────────────────┤
│ RAIL   │ MAIN CONTENT (scrollable)                       │
│ 140px  │                                                 │
│ sticky │ ┌─ KPI ROW ─────────────────────────────────┐   │
│        │ │ [Card] [Card] [Card] [Card]                │   │
│ LAND ▾ │ └───────────────────────────────────────────┘   │
│  Dash  │                                                 │
│        │ ┌─ PANELS ROW (2-col) ──────────────────────┐   │
│ PERM ▸ │ │ [Panel: Chart] │ [Panel: Chart]           │   │
│        │ └───────────────────────────────────────────┘   │
│ LOANS▸ │                                                 │
│        │ ┌─ PANELS ROW (single) ─────────────────────┐   │
│ CONST▾ │ │ [Panel: Full-width table or chart]         │   │
│  Dash  │ └───────────────────────────────────────────┘   │
│  Pipe  │                                                 │
│  Cycle │ Max width: 1920px, centered                     │
│  Cost  │ Padding: 20px                                   │
│        │ Gap between panels: 12px                        │
│ SALES▸ │                                                 │
│        │                                                 │
│ PM   ▸ │                                                 │
│        │                                                 │
│ AUDIT▸ │                                                 │
├────────┴─────────────────────────────────────────────────┤
│ RAIL STATS: Jobs: {n} | Active: {n} | WIP: ${n}          │
└──────────────────────────────────────────────────────────┘
```

**Responsive breakpoints:**
- `<=1024px`: Rail collapses, panels stack to 1 column
- `<=768px`: Pipeline board goes to 2 columns
- `<=480px`: KPI cards stack to 2x2 grid

---

## 7. KPI Framework

### 7.1 KPI Classification

Every KPI falls into one of these categories:

| Category | Definition | Examples | Update Frequency |
|----------|-----------|----------|-----------------|
| **Leading** | Predicts future performance | Permits in pipeline, lots under contract, sales backlog | Real-time to weekly |
| **Lagging** | Measures past results | Completed homes, closed sales, realized margin | Monthly to quarterly |
| **Operational** | Tracks process efficiency | Cycle time, days stuck, completion %, superintendent workload | Daily |
| **Financial** | Measures money flow | Revenue, cost, margin, WIP, loan exposure, draw rate | Daily to weekly |
| **Pipeline** | Tracks work-in-progress | Active construction, permitting queue, sales contracts | Daily |
| **Performance** | Benchmarks individuals/teams | Super scorecard, agent rankings, vendor performance | Weekly to monthly |

### 7.2 KPI Definition Template

Every KPI in the system must be documented using this template:

```markdown
### {KPI_ID}: {KPI Name}

- **Category**: Leading / Lagging / Operational / Financial / Pipeline / Performance
- **Business Purpose**: Why this metric matters to the builder (1-2 sentences)
- **Definition**: What exactly is being measured (precise, unambiguous)
- **Formula**: `numerator / denominator` or `SUM(field) WHERE condition`
- **Source Fields**: table.column_name (list all required fields)
- **Source Layer**: Raw / Mart / Computed in dashboard
- **Completeness Threshold**: Minimum % of non-null values to ship (e.g., 60%)
- **Refresh Frequency**: Daily / Weekly / On-demand
- **Owner**: Who is responsible for data accuracy (client role, not person name)
- **Dependencies**: Other KPIs or data that must exist first
- **Assumptions**: What we assume about the data (e.g., "completion_pct is 0-100 scale")
- **Edge Cases**:
  - What happens when value is 0?
  - What happens when denominator is 0?
  - What happens when data is missing?
- **Display**:
  - **Chart type**: KPI card / Ranked bar / Donut / Table column / Histogram
  - **Format**: Currency / Percentage / Integer / Days
  - **Tone**: Good (green) when ___; Alert (red) when ___
  - **Drill-down**: What happens when clicked
- **Readiness Status**: Ready / Partial / Blocked / Roadmap
- **Notes**: Any client-specific considerations
```

### 7.3 KPI Domains

The system organizes KPIs into 11 domains, mapped to 7 dashboard sections. Domains are classified as **Core** (always attempted if any data exists) or **Extended** (built only when specific data is available).

| # | Domain | Type | Section | Tab(s) | KPI Count |
|---|--------|------|---------|--------|-----------|
| 1 | Land Acquisition | Extended | LAND | Dashboard, Pipeline | 8 (LA-01 to LA-08) |
| 2 | Permitting | Extended | PERMITTING | Dashboard, Pipeline | 8 (PT-01 to PT-08) |
| 3 | Construction Progress | **Core** | CONSTRUCTION | Dashboard, Pipeline, Cycle Time | 18 (CP-01 to CP-18) |
| 4 | Financial/Profitability | **Core** | CONSTRUCTION | Cost Metrics | 8 (FP-01 to FP-08) |
| 5 | Loan & Draw | Extended | LOANS | Dashboard | 7 (LN-01 to LN-07) |
| 6 | Sales & Closings | **Core** | SALES | Dashboard, Pipeline | 14 (SL-01 to SL-14) |
| 7 | Geographic/Portfolio | **Core** | CONSTRUCTION | Dashboard (embedded) | 4 (GE-01 to GE-04) |
| 8 | Vendor Scorecard | Extended | CONSTRUCTION | Cost Metrics (if data exists) | 4 (VN-01 to VN-04) |
| 9 | Exception Center | Extended | CONSTRUCTION | Dashboard (alerts section) | 4 (EX-01 to EX-04) |
| 10 | Per-Job P&L Audits | Extended | AUDITS | P&L Audits | 3 (PL-01 to PL-03) |
| 11 | Property Management | Extended | PROPERTY MGMT | Dashboard, Pipeline | 5 (PM-01 to PM-05) |

**Core domains** (always attempted): Construction Progress, Financial/Profitability, Sales & Closings, Geographic/Portfolio. These are attempted for every client because almost every home builder has construction milestones, some cost tracking, and either sales or closings data.

**Extended domains** (data-dependent): Land Acquisition, Permitting, Loans, Vendor Scorecard, Exception Center, P&L Audits, Property Management. These are built only when the client has the specific data required.

**Full KPI definitions are in KPI_MASTER_REFERENCE.md.** That document is the canonical reference for all KPI formulas, thresholds, and field requirements.

### 7.4 Data-Dependent KPI Selection

**CRITICAL RULE: Only KPIs supported by reliable, accessible, and sufficiently complete data should be included in the dashboard.**

**Decision tree for each KPI:**

```
Is the source data available?
├── NO → Mark as "Roadmap" — do not build, do not show placeholder
├── YES → Is field completeness above threshold?
│   ├── NO (below 20%) → Mark as "Blocked" — exclude from dashboard
│   ├── PARTIAL (20-60%) → Mark as "Partial" — ship with caveat note
│   └── YES (above 60%) → Mark as "Ready" — ship fully
└── UNCERTAIN → Investigate in data audit, do not assume
```

**KPI readiness workflow:**

1. List all KPIs in the domain (from KPI_MASTER_REFERENCE.md)
2. For each KPI, identify the required source fields
3. Check if those source fields exist in the client's data
4. If they exist, measure completeness (percentage of non-null, valid values)
5. Score the KPI as Ready, Partial, Blocked, or Roadmap
6. Output: KPI readiness matrix for the domain

**KPI readiness matrix template:**

| KPI ID | KPI Name | Required Fields | Fields Present? | Completeness | Score | Notes |
|--------|----------|----------------|----------------|--------------|-------|-------|
| CP-01 | Active Job Count | job_id, job_type | Yes | 100% | Ready | |
| CP-02 | Avg Completion % | completion_pct | Yes | 61% | Ready | Caveat: 39% missing |
| FP-01 | Budget vs Actual | original_budget, job_cost_amount | Partial | 5% (budget) | Blocked | Budget field nearly empty |
| LN-01 | Total Loan Exposure | loan_amount | No | N/A | Roadmap | No loan data in ERP |

**Never force a KPI into the dashboard if the data does not support it.** A dashboard showing bad data is worse than a dashboard with fewer metrics.

**Caveat display for partial KPIs:**
```
Note: {N} jobs with sales but no cost data are excluded from margin calculations.
```

### 7.5 Cross-Client KPI Adaptation

Not every client's data fits the standard KPI framework perfectly. Common variations:

| Variation | Impact | Adaptation |
|-----------|--------|------------|
| Client tracks completion by **milestones** (slab, frame, etc.) but has no `completion_pct` field | CP-02 (Avg Completion) cannot be computed directly | Calculate completion from milestone count: `milestones_completed / total_milestones * 100` |
| Client does not separate **lot cost** from **construction cost** | FP-03 and related KPIs lose granularity | Use single `total_cost` field; skip lot-vs-construction breakdown |
| Client has **no sales data** (build-to-rent only) | Entire SALES section is skipped | Activate PROPERTY MGMT section instead; skip SALES |
| Client tracks completion as **stages** ("Pre-drywall", "Post-drywall") instead of percentage | CP-02 needs different calculation | Map stages to percentage ranges (e.g., Pre-drywall = 0-40%, Post-drywall = 40-80%) |
| Client has **multiple entities** sharing the same ERP | Need entity-level filtering | Add `entity` as a global filter; all KPIs must support entity-level breakdown |
| Client's costs are in **different currency** | All currency formatting must adapt | Configure currency symbol and formatting in `.env` |

**When adapting, document the adaptation in the client's `kpi_assessment.md` and note the deviation from the standard KPI definition.**

### 7.6 KPI Maturity Model

Use this model to assess a client's data maturity and set realistic expectations for dashboard capability:

| Level | Description | Available Data | KPI Capability | Typical Sections |
|-------|-------------|---------------|---------------|-----------------|
| **Level 1: Basic** | Job list and status only. Minimal milestone or cost data. | Job ID, address, community, status | Job counts, stage distribution, geographic breakdown | CONSTRUCTION (Dashboard only) |
| **Level 2: Operational** | Milestones, dates, and assignments tracked. | Level 1 + milestone dates, superintendent, plan | Cycle time analysis, superintendent workload, stall alerts, pipeline board | CONSTRUCTION (Dashboard + Pipeline + Cycle Time) |
| **Level 3: Financial** | Costs, sales, and budgets tracked. | Level 2 + costs, sale prices, budgets, sales contracts | Margin analysis, budget vs actual, revenue tracking, sales pipeline, P&L audits | CONSTRUCTION + SALES + AUDITS |
| **Level 4: Strategic** | Historical data and trend capability. | Level 3 + 12+ months of historical data | Trendlines, forecasting, year-over-year comparison, absorption rate, velocity | All Level 3 sections + trend charts |
| **Level 5: Full Analytics** | Complete lifecycle data across all domains. | Level 4 + land, permitting, loans, PM, vendor data | Complete lifecycle analytics, pro forma engine, vendor scoring, portfolio analytics | All sections activated |

**How to use the maturity model:**
1. During discovery, assess which level the client's data supports
2. Set expectations accordingly — a Level 2 client should not expect Level 4 dashboards
3. Document the current level and the path to the next level
4. Each level is independently valuable — a Level 2 dashboard still delivers significant operational insight

### 7.7 KPI Scoring Methodology

During the KPI Assessment phase, score each KPI:

| Score | Criteria | Action |
|-------|----------|--------|
| **Ready** | Required fields exist, completeness >= threshold, values make logical sense | Build and ship |
| **Partial** | Fields exist but below threshold, OR some values appear suspect | Ship with caveat note, document in assessment |
| **Blocked** | Required fields missing or empty, OR data is demonstrably unreliable | Do not build, document why |
| **Roadmap** | Data does not exist yet but client plans to add it or data could be sourced later | Document as future phase, estimate when it might be available |

---

## 8. Dashboard Architecture

### 8.1 Lifecycle-Based Navigation

The dashboard is organized around the **home building lifecycle**, not by data type:

```
LAND ACQUISITION → PERMITTING → LOANS → CONSTRUCTION → SALES → PROPERTY MGMT → AUDITS
```

Each lifecycle stage becomes a **collapsible sidebar section**. Each section contains 1-3 tabs. Sections are activated based on data availability. A Level 2 client may only have CONSTRUCTION and SALES sections. A Level 5 client may have all seven.

**Section activation rules:**
- A section appears only if there is data for at least one KPI in that domain
- If a section has data for Dashboard but not Pipeline, only show Dashboard tab
- If no data exists for a section, hide it entirely — do not show empty states
- The CONSTRUCTION section is always present (it is the minimum viable dashboard)

### 8.2 Section Activation Matrix

Use this matrix to determine which sections to build for each client:

| Section | Required Data | Minimum Tables | Activation Threshold | Priority |
|---------|-------------|----------------|---------------------|----------|
| **CONSTRUCTION** | `construction_milestones` with job_id, status, and at least 3 milestone date fields | 1 | Always (core requirement) | Required |
| **SALES** | Sales table with contract_number, sale_price, sale_status | 1 | Any sales contracts exist | High |
| **AUDITS** | Audit cost breakdown tables (e.g., `audit_costs`, `audit_dirt`, `audit_utilities`) | 3+ | Audit cost breakdowns available with line-item detail | Medium |
| **LOANS** | `loan_amount` field populated in milestones or separate loans table | 0 (column) or 1 (table) | >=20% of active jobs have loan data | Medium |
| **LAND** | `land_acquisition_*` table with deal tracking | 1+ | Any land deals recorded | Low |
| **PERMITTING** | Milestones with permit-stage dates or separate permitting table | 1 | >=10 jobs currently in permitting status | Low |
| **PROPERTY MGMT** | `pm_master` table with property records | 1 | Any PM properties exist in portfolio | Low |

**How to read this matrix:**
- "Required Data" describes the minimum data needed to justify the section
- "Minimum Tables" is the fewest warehouse tables needed
- "Activation Threshold" is the data volume below which the section is not worth building
- "Priority" indicates the recommended build order when multiple sections are possible

### 8.3 Tab Structure

Each tab follows a consistent visual hierarchy:

```
1. KPI Row (4-5 cards)           — Always first, always present
2. Panels Row (2-col)            — Charts, ranked bars, donuts
3. Panels Row (single, full-width) — Hero visualization (cycle time, timeline)
4. Panels Row (2 or 3-col)      — Secondary breakdowns
5. Panels Row (single)           — Main data table (roster/pipeline)
6. Quality Checks                — Data quality indicators (optional)
```

**Dashboard tab vs Pipeline tab:**
- **Dashboard**: KPI cards + charts + summary tables (analytical view)
- **Pipeline**: Full spreadsheet-style table with all columns, filters, and frozen columns (operational view)

**Template: Dashboard Tab**

```
┌──────────────────────────────────────────────────────────┐
│ [Title + description]                                     │
├──────────┬──────────┬──────────┬──────────────────────────┤
│ KPI 1    │ KPI 2    │ KPI 3    │ KPI 4                    │
├──────────┴──────────┼──────────┴──────────────────────────┤
│ Ranked Bars / Donut │ Ranked Bars / Table                 │
├─────────────────────┴─────────────────────────────────────┤
│ Hero Chart (Cycle Time / Timeline / Distribution)          │
├──────────────────────┬────────────────────────────────────┤
│ Detail Table (10 rows│ Summary Cards / Alerts              │
│ + "Show all" toggle) │                                    │
└──────────────────────┴────────────────────────────────────┘
```

**Template: Pipeline Tab**

```
┌──────────────────────────────────────────────────────────┐
│ [Title + count]                                           │
├──────────────────────────────────────────────────────────┤
│ [Sub-tabs: Active ({n}) | Inventory ({n}) | ...]          │
├──────────────────────────────────────────────────────────┤
│ Filter Bar: [City ▾] [Community ▾] [Plan ▾] [Type ▾]     │
├──────────────────────────────────────────────────────────┤
│ ┌─────────┬──────────────────────────────────────────┐   │
│ │ FROZEN  │ SCROLLABLE COLUMNS →→→                    │   │
│ │ Job ID  │ City | Community | Plan | Stage | ...     │   │
│ │ Address │                                           │   │
│ ├─────────┼──────────────────────────────────────────┤   │
│ │ J-001   │ City A | Community X | 1800SF | Frame     │   │
│ │ J-002   │ City B | Community Y | 2200SF | Slab      │   │
│ └─────────┴──────────────────────────────────────────┘   │
│ [Show all {n}]                                            │
└──────────────────────────────────────────────────────────┘
```

### 8.4 Interactivity Requirements

**RULE: Every chart, graph, bar, donut segment, and ranked list must be clickable to filter data.**

| Component | Click Behavior |
|-----------|---------------|
| **KPI card** | Toggle drill-down showing related jobs |
| **Ranked bar** | Filter all panels by that category (community, city, etc.) |
| **Donut segment** | Open side drawer with filtered job list |
| **Histogram bar** | Filter to show jobs in that range |
| **Table row** | Open detail view (pro forma card, job detail, etc.) |
| **Cycle time phase** | Filter milestone tracker to that phase |
| **Superintendent card** | Filter all data by that superintendent |
| **Community in table** | Set community filter globally |

**Side drawer pattern:**
- Appears on the right side (max 520px wide)
- Shows filtered list of jobs matching the clicked element
- Has close button
- Does NOT scroll the main page down — drawer sits alongside content

### 8.5 Filter System

**Global filters** (top of page, affect all tabs):

| Filter | Type | Source | Availability |
|--------|------|--------|-------------|
| City | Dropdown | Distinct cities from milestones | Show only if `city` field exists and has >1 distinct value |
| Job Type | Dropdown | Distinct job types from milestones | Always available |
| Entity | Dropdown | Distinct company names from milestones | Show only if `entity` field exists and has >1 distinct value |
| Date Range | Dropdown (Month/Quarter/Year) | Computed from available dates | Show only if date fields are sufficiently populated |

**Available filters depend on data.** If no `city` field exists in the client's data, the city filter is hidden. If the client operates in only one city, the city filter is hidden (single value = no filtering needed).

**Column filters** (per SpreadsheetTable):
- Dropdown above each column header
- Shows distinct values from visible data
- "All" as default option
- Multiple filters combine with AND logic

**Filter behavior:**
- Selecting a filter immediately updates all visible data
- Re-selecting the same value clears the filter (toggle behavior)
- "Clear filters" button appears when any filter is active
- Filter chip shows below header bar when community filter active

### 8.6 Modular Scalability

The dashboard architecture is designed to be modular at every level:

**Adding a new section:**
1. Add section entry to the SECTIONS array in `dashboard-shell.js`
2. Create tab component(s) for the section
3. Add data query to `dashboard-data.js` Promise.all
4. No changes to existing sections required

**Removing a section:**
1. Remove from SECTIONS array
2. Remove the tab component (optional — unused code is harmless but should be cleaned up)
3. Remove the data query from Promise.all
4. No impact on remaining sections

**Adding a new KPI:**
1. Add to an existing tab's KPI row or panel
2. Ensure the source field is included in the data query
3. No structural changes needed

**Adding a new data source:**
1. Add query to Promise.all in `dashboard-data.js`
2. Add the returned data to the return shape
3. Consume in the relevant tab component in `dashboard-shell.js`

**Per-client customization:**
Each client has its own `dashboard-shell.js` — tabs can be added, removed, or reordered freely. The data layer (`dashboard-data.js`) is also per-client, so queries can be completely different.

**Never build a dashboard section assuming data will exist in the future.** Only build what the current data supports.

---

## 9. Data Validation & Quality Assurance

### 9.1 Pre-Import Validation

Before importing any data source into the warehouse:

| Check | Method | Action if Failed |
|-------|--------|-----------------|
| **Row count > 0** | Count rows in source file or API response | Skip import, log error |
| **Header row present** | Check first row for expected column names | Reject file, notify client |
| **No duplicate headers** | Count distinct vs total column names | Rename duplicates with suffix |
| **Job ID format consistent** | Regex check on ID column | Flag inconsistencies in assessment |
| **Date format parseable** | Test parse first 10 date values | Document format in schema |
| **Currency values numeric** | Check for `$` and `,` in number fields | Strip symbols before import |
| **No PII in wrong tables** | Verify buyer names only in sales/PM tables | Redact or flag |
| **Encoding is valid** | Check for UTF-8 vs. Windows-1252 encoding | Convert to UTF-8 before import |

### 9.2 Post-Import Quality Checks

Run these checks after every data import:

```sql
-- Field completeness check (BigQuery example)
SELECT
  '{field_name}' AS field,
  COUNT(*) AS total,
  COUNTIF({field_name} IS NOT NULL AND {field_name} != '') AS populated,
  ROUND(COUNTIF({field_name} IS NOT NULL AND {field_name} != '') / COUNT(*) * 100, 1) AS pct
FROM `{project_id}.{dataset}.{table}`
```

**Standard quality metrics (shown in dashboard footer):**

| Metric | Formula | Good | Warning | Bad |
|--------|---------|------|---------|-----|
| Completion % populated | Non-null / total | >=80% (green) | 50-79% (amber) | <50% (red) |
| WIP populated | Non-null / total | >=70% | 40-69% | <40% |
| Lot cost populated | Non-null / total | >=85% | 60-84% | <60% |
| Superintendent assigned | Non-null / total | >=70% | 40-69% | <40% |
| Sale price populated (sales) | Non-null / total | >=90% | 70-89% | <70% |
| Milestone dates populated | Avg non-null across all date columns | >=60% | 30-59% | <30% |

### 9.3 Cross-Client Validation Standards

Every client gets the same quality checks regardless of data source. The checks listed in 9.1 and 9.2 are applied uniformly. Additional cross-client standards:

| Standard | Rule | Enforcement |
|----------|------|-------------|
| **Completeness floor** | No field used in a "Ready" KPI can have completeness below 60% | Checked in KPI assessment |
| **Value range validation** | Completion % must be 0-100 (or 0-1); cost values must be non-negative; dates must be after 2000 | Checked in data layer |
| **Referential integrity** | Job IDs in sales table should exist in milestones table | Warning if >5% orphan records |
| **Freshness requirement** | Data must have been updated within the last 30 days | Warning banner if stale |
| **Duplicate detection** | No duplicate job_id values in core roster | Deduplicate using ROW_NUMBER |

### 9.4 Handling Data Issues

| Issue | Detection | Resolution |
|-------|-----------|-----------|
| **Duplicate records** | `GROUP BY job_id HAVING COUNT(*) > 1` | Use `ROW_NUMBER() OVER (PARTITION BY job_id ORDER BY _extracted_at DESC)` to keep latest |
| **Missing required fields** | Completeness check below threshold | Mark KPI as Partial, show caveat in dashboard |
| **Inconsistent status values** | Distinct values do not match expected list | Map in data layer: `CASE WHEN status IN ('CIP', 'In Progress') THEN 'SFR Construction In Progress'` |
| **Outlier values** | Budget = $0 but WIP = $500K | Flag in exception center, exclude from aggregations |
| **Stale data** | `MAX(_extracted_at) < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)` | Show "Data last updated: X days ago" warning |
| **Type mismatches** | `SAFE_CAST returns NULL` on expected numeric | Log count of cast failures, investigate source |
| **Orphan records** | Job in sales but not in milestones | Include in dashboard with limited fields, note "no milestone data" |

### 9.5 Quality Score

Every dashboard displays an aggregate **Data Quality Score** in the footer:

```
Data Quality Score: 74% (Good)
● Completion %: 61.1% (678/{n})  ● WIP populated: 66.4% (737/{n})
● Lot cost: 91.4% (1015/{n})  ● Super assigned: 56.8% (631/{n})
```

**Score calculation:**
1. For each tracked quality metric, calculate the percentage of non-null, valid values
2. Average all metric percentages
3. Display the aggregate score with a label: >=80% = "Excellent", 60-79% = "Good", 40-59% = "Fair", <40% = "Poor"

Colors: >=80% green, 50-79% amber, <50% red.

### 9.6 Quality-Gated KPIs

If a quality metric drops below its threshold, the dependent KPI should be flagged or hidden:

| Quality Level | KPI Behavior |
|--------------|-------------|
| **Good** (above threshold) | KPI displays normally |
| **Warning** (below threshold but above 20%) | KPI displays with amber caveat note explaining the data gap |
| **Bad** (below 20%) | KPI is hidden from the dashboard entirely — do not show unreliable data |

**The principle:** It is better to show fewer accurate metrics than many unreliable ones.

---

## 10. Security & Access Control

### 10.1 Data Security

| Control | Implementation | Verification |
|---------|---------------|-------------|
| **Service account isolation** | One service account per client project | Check IAM bindings quarterly |
| **Least privilege** | Service account has Data Viewer + Job User only | Audit roles quarterly |
| **Key rotation** | Rotate service account keys every 90 days | Calendar reminder, update `.env` |
| **Key storage** | Service account credentials never committed to git | `.gitignore` includes `*-sa-key.json`, `*.json` keys |
| **Data at rest** | Warehouse encrypts at rest by default | Platform-managed, no action needed |
| **Data in transit** | HTTPS enforced for all API calls | Default in all warehouse SDKs |

### 10.2 Application Security

| Control | Implementation |
|---------|---------------|
| **No client data in git** | `.gitignore`: `*.env*`, `*-sa-key.json`, `demo-data.json` (if contains real data) |
| **No PII exposure** | Buyer names, phone numbers, emails only in authenticated views |
| **Environment variables** | All secrets in `.env.local`, never hardcoded |
| **Dependency audit** | Run `npm audit` monthly, update vulnerable packages |
| **No cross-client access** | Each app has its own credentials pointing to its own project |
| **Demo data separation** | Demo/POC dashboards use static anonymized data, zero live connections, no PII |

### 10.3 Multi-Client Security Isolation

**RULE: Client A must never be able to see Client B's data, credentials, or configuration.**

| Isolation Layer | How It Is Enforced |
|----------------|-------------------|
| **Warehouse** | Separate projects or datasets per client. Service account for Client A has zero access to Client B's project. |
| **Application** | Each client dashboard is a separate deployment with separate `.env` credentials. No shared runtime. |
| **Source Control** | Each client's directory contains only that client's code and configuration. |
| **Deployment** | Separate Vercel projects (or equivalent) per client. Different URLs, different environment variables. |
| **Network** | No client dashboard makes requests to another client's warehouse or API. |

### 10.4 Client Data Handling

| Phase | Security Requirement |
|-------|---------------------|
| **Data intake** | Receive via secure channel (Google Drive shared folder, encrypted email, SFTP) |
| **Processing** | Process on local machine or in client's cloud project only |
| **Storage** | Store only in client's warehouse project — never in AD Consulting's own project |
| **Sharing** | Never share one client's data with another client |
| **Deletion** | Upon contract end: delete service account, revoke access, offer data export |
| **Backups** | Warehouse snapshots managed by platform, no additional backup needed |

### 10.5 Demo Environment Security

Demo dashboards used for sales presentations or POC demonstrations have additional restrictions:

| Requirement | Implementation |
|-------------|---------------|
| **No live data** | Demo uses static JSON file with anonymized, synthetic data |
| **No warehouse connection** | Demo `.env` has no real credentials; data loaded from local file |
| **No PII** | All names, addresses, and identifiers are fictional |
| **Clearly labeled** | Demo dashboard shows "DEMO" badge in shell bar |
| **Separate deployment** | Demo is deployed separately from any client dashboard |

### 10.6 Access Control

| Role | Access Level |
|------|-------------|
| **AD Consulting (developer)** | Full access to client's warehouse project via service account |
| **Client admin** | Warehouse project owner, can revoke AD's access at any time |
| **Client viewer** | Dashboard URL only, no warehouse access |
| **Demo viewers** | Demo dashboard only, zero access to any client data |

### 10.7 Incident Response

If a data breach or unauthorized access is suspected:

1. **Immediately** revoke the affected service account key
2. **Notify** the client within 24 hours
3. **Audit** warehouse access logs
4. **Generate** new service account key and update `.env`
5. **Document** the incident, root cause, and remediation steps
6. **Review** all other client configurations for similar vulnerabilities

---

## 11. Governance & Maintenance

### 11.1 Update Workflow

| Trigger | Action | Frequency |
|---------|--------|-----------|
| Client provides new data export | Run import script, verify quality, update dashboard | As needed |
| Client requests new KPI | Assess data availability, update KPI assessment, implement | Per request |
| Warehouse schema change | Update schema docs, verify queries, test dashboard | Per change |
| Next.js / dependency update | Update `package.json`, run `npm audit`, test all tabs | Monthly |
| Design system change | Update `globals.css` in ALL client apps (see cross-client change management) | Per change (rare) |

### 11.2 Version Control

| Item | Versioning Method |
|------|------------------|
| **Dashboard code** | Git commits with conventional messages |
| **Documentation** | Version number in document header + date |
| **KPI Assessment** | Date stamp at top, append changelog at bottom |
| **Warehouse schema** | Schema docs (YAML or equivalent) in client directory |
| **Mart queries** | SQL files in `scripts/` directory |

### 11.3 Data Refresh Schedule

| Data Source | Refresh Method | Frequency | Owner |
|-------------|---------------|-----------|-------|
| Google Sheets linked tables | External table (auto) or periodic export | Real-time or daily | Platform / AD Consulting |
| XLSX/CSV imports | Import script | Weekly or on-demand | AD Consulting |
| Mart tables | Scheduled query or script | Daily at 6 AM | Automated |
| Dashboard cache | Next.js ISR revalidation | Every 86,400 seconds (24 hours) | Automatic |

### 11.4 Cross-Client Change Management

When the global design system or framework changes, propagate the change to all active client dashboards:

| Change Type | Propagation Process | Risk Level |
|-------------|-------------------|------------|
| **CSS variable change** | Update `globals.css` in every client's `next_dashboard/app/` directory. Test dark and light themes in each. | Low |
| **Component API change** | Update the component in every client's `components/` directory. Test affected tabs. | Medium |
| **Data layer pattern change** | Update `dashboard-data.js` in affected clients. Verify query results match. | High |
| **KPI definition change** | Update KPI_MASTER_REFERENCE.md. Re-assess affected KPIs in each client's assessment. | High |
| **New framework section** | Add to this playbook. Does not affect existing clients unless they request the new section. | None |

**Process:**
1. Make the change in one client's codebase and test thoroughly
2. Document the change in a changelog entry
3. Apply to all other active client codebases
4. Test each client's dashboard after applying the change
5. Deploy each client independently

### 11.5 Documentation Currency

| Document | Review Schedule | Reviewer |
|----------|----------------|----------|
| **DATA_DASHBOARD_PLAYBOOK.md** (this document) | After every new client engagement or major process change | AD Consulting |
| **KPI_MASTER_REFERENCE.md** | When new KPI domains are added or thresholds are adjusted | AD Consulting |
| **DASHBOARD_DESIGN_SYSTEM.md** | When new components are created or visual standards change | AD Consulting |
| **DASHBOARD_SHELL_BUILD_GUIDE.md** | When new build patterns emerge or new gotchas are discovered | AD Consulting |
| **CLIENT_ONBOARDING_GUIDE.md** | After each client onboarding to capture process improvements | AD Consulting |
| **Client kpi_assessment.md** | When new data sources are added or KPI status changes | AD Consulting + Client |

### 11.6 Client Feedback Loop

How to incorporate client requests and feedback into the framework:

| Feedback Type | Process | Timeline |
|--------------|---------|----------|
| **Bug report** (data incorrect) | Investigate data source, fix transformation or query, redeploy | 1-2 business days |
| **New KPI request** | Assess data availability using KPI readiness workflow (Section 7.4), implement if Ready | 3-5 business days |
| **New section request** | Evaluate against Section Activation Matrix (Section 8.2), build if data supports it | 5-10 business days |
| **Visual change request** | Evaluate against design system. If it is a global improvement, apply to all clients. If it is client-specific, decline (design system is global). | 1-3 business days |
| **Framework improvement** | If a client's feedback reveals a gap in the framework, update this playbook and all companion docs | Next review cycle |

---

## 12. Client Onboarding Process

### 12.1 Phase 0: Discovery (Day 1)

**Objective:** Understand the client's operation, data ecosystem, and goals before touching any data.

**Activities:**

| Activity | Deliverable | Time |
|----------|------------|------|
| Run discovery questionnaire (Section 2.1) | Completed questionnaire with notes | 1-2 hours |
| Get data access (exports, API credentials, Google Sheets URLs) | List of data sources with access confirmed | 1-2 hours |
| Initial data assessment — open each file/sheet, count rows, note column names | Source systems inventory (Section 2.2) | 2-3 hours |
| Determine warehouse strategy (new project or existing) | Warehouse decision documented | 30 minutes |

**Phase 0 exit criteria:**
- Discovery questionnaire completed
- At least one data export received and opened
- Warehouse access confirmed or project creation initiated
- Initial assessment of data maturity level (Section 7.6)

### 12.2 Phase 1: Data Audit (Days 2-3)

**Objective:** Profile every table, document every field, score data completeness, and identify issues.

**Activities:**

| Activity | Deliverable | Time |
|----------|------------|------|
| Import all source data into raw layer | Raw tables created in warehouse | 2-4 hours |
| Profile all tables (row counts, column types, sample values) | Schema documentation (bigquery.yaml or equivalent) | 2-3 hours |
| Run completeness checks on every field | Completeness report per table | 1-2 hours |
| Identify data issues (duplicates, outliers, format problems) | Issues log with severity ratings | 1-2 hours |
| Create source-to-model field mapping (Section 4) | Completed field mapping table | 2-3 hours |
| Assess data maturity level | Maturity level assignment (Section 7.6) | 30 minutes |

**Phase 1 exit criteria:**
- All source data imported into raw layer
- Schema documentation complete
- Field completeness report generated
- Field mapping table complete
- Data issues documented with severity ratings

### 12.3 Phase 2: KPI Assessment (Days 3-4)

**Objective:** Score every KPI against the client's data and determine which sections and tabs to build.

**Activities:**

| Activity | Deliverable | Time |
|----------|------------|------|
| Score every KPI in each domain using readiness workflow (Section 7.4) | KPI readiness matrix per domain | 2-3 hours |
| Determine section activation using matrix (Section 8.2) | Section activation checklist | 1 hour |
| Determine which tabs to build per section | Tab list per section | 30 minutes |
| Document KPI caveats and data-quality notes | Caveat inventory | 1 hour |
| Produce `kpi_assessment.md` with all findings and recommendations | Complete KPI assessment document | 2-3 hours |
| Review assessment with client (optional but recommended) | Client sign-off or feedback | 1 hour |

**Phase 2 exit criteria:**
- `kpi_assessment.md` produced with all KPI scores
- Section activation decisions documented
- Client aware of which sections will be built and which are deferred

### 12.4 Phase 3: Build (Days 5-9)

**Objective:** Build the dashboard application.

**Activities:**

| Activity | Deliverable | Time |
|----------|------------|------|
| Scaffold Next.js app from template | App directory with standard structure | 1 hour |
| Configure `.env.local` with warehouse credentials | Environment configured | 30 minutes |
| Write data layer (`dashboard-data.js`) with all queries | Data layer returning complete data shape | 4-8 hours |
| Create marts if needed (queries joining 3+ tables) | Mart tables and refresh scripts | 2-4 hours |
| Write shell component (`dashboard-shell.js`) with all tabs | Complete dashboard UI | 8-16 hours |
| Implement all activated KPI cards, charts, tables, and drill-downs | Interactive dashboard | (included in shell build) |
| Copy `globals.css` from design system | Themed UI | 30 minutes |
| Configure `page.js` and `layout.js` with client name and metadata | App configuration | 30 minutes |

**Phase 3 exit criteria:**
- Dashboard runs locally without errors
- All activated sections and tabs render with real data
- All KPI cards show non-zero values for Ready KPIs
- All Partial KPIs show caveat notes

### 12.5 Phase 4: Test & Validate (Days 9-10)

**Objective:** Verify the dashboard is accurate, functional, and ready for production.

**Testing checklist:**

| # | Check | Method | Pass Criteria |
|---|-------|--------|--------------|
| 1 | All KPI cards show non-zero values | Visual inspection | Every Ready KPI shows a meaningful value |
| 2 | All charts render with data | Visual inspection | No empty charts, no rendering errors |
| 3 | Every clickable element produces a drill-down | Click test each element | Drill-downs open with filtered data |
| 4 | Global filters affect all panels | Test each filter | Data updates correctly across all tabs |
| 5 | Column filters work in SpreadsheetTable | Test 3+ filters | Filters correctly narrow table rows |
| 6 | Dark theme renders correctly | Toggle theme | All text readable, no broken colors |
| 7 | Light theme renders correctly | Toggle theme | All text readable, no broken colors |
| 8 | No console errors | Check browser dev tools | Zero errors on page load and navigation |
| 9 | Data quality checks show acceptable thresholds | Check footer | Scores match expectations from audit |
| 10 | Negative values display in red | Check margin columns | Red text for negative currency |
| 11 | Date columns show formatted dates | Check date columns | "Mar 17, 26" format, no raw strings |
| 12 | Page loads in under 5 seconds | Time with dev tools | First contentful paint < 5s |
| 13 | KPI values match client's own reports | Cross-reference 3-5 KPIs | Values match within 2% tolerance |
| 14 | Responsive layout works at 1024px and 768px | Resize browser | No overlapping elements, readable text |

**Client review:**
- Share dashboard URL with client
- Walk through each section and tab
- Verify 3-5 KPI values against their own reports
- Collect feedback and prioritize fixes

**Phase 4 exit criteria:**
- All 14 checks pass
- Client has reviewed and confirmed data accuracy
- No critical issues remaining

### 12.6 Phase 5: Handoff & Support

**Objective:** Deploy to production, deliver documentation, and establish ongoing support.

**Deployment activities:**

| Activity | Deliverable |
|----------|------------|
| Deploy to Vercel (or client hosting) | Production URL |
| Configure production environment variables | Secure configuration |
| Verify production deployment works | Live dashboard accessible |
| Deliver KPI assessment document to client | `kpi_assessment.md` |
| Deliver schema documentation | `bigquery.yaml` |
| Deliver user guide (brief walkthrough of navigation, filters, drill-downs) | User guide document or video |
| Set up data refresh schedule | Documented refresh process |
| Establish support channel (email, Slack, etc.) | Communication channel active |

**Ongoing support:**
- Respond to data quality issues within 2 business days
- Process new data imports as agreed (weekly, monthly, or on-demand)
- Implement new KPI requests following the KPI readiness workflow
- Apply framework updates as they occur

---

## 13. Phased Rollout Framework

Not every client starts at the same maturity level. This framework defines how to deliver value incrementally, with each phase being independently valuable.

### 13.1 Phase Definitions

| Phase | Name | What It Delivers | Required Data Maturity |
|-------|------|-----------------|----------------------|
| **Phase 1** | Core Construction | Construction Dashboard + Pipeline + Cycle Time. Job counts, stage distribution, milestone tracking, superintendent workload, stall alerts. | Level 2 (Operational) |
| **Phase 2** | Financial + Sales | Sales Dashboard + Pipeline, Cost Metrics tab, P&L Audits. Margin analysis, budget vs actual, revenue tracking, sales velocity. | Level 3 (Financial) |
| **Phase 3** | Lending | Loans Dashboard. Loan exposure, draw tracking, lender analysis, expiration alerts. | Level 3 + loan data |
| **Phase 4** | Lifecycle | Land Acquisition Dashboard + Pipeline, Permitting Dashboard + Pipeline. Deal tracking, lot pipeline, permit status. | Level 3 + land/permit data |
| **Phase 5** | Operations | Property Management Dashboard + Pipeline. Occupancy, rent roll, delinquency, make-ready tracking. | Level 3 + PM data |
| **Phase 6** | Advanced Analytics | Trendlines, year-over-year comparisons, forecasting, absorption rate, pro forma enhancements. | Level 4 (Strategic) — requires 12+ months of historical data |

### 13.2 Phase Transition Criteria

A client moves to the next phase when:

| Transition | Trigger | Validation |
|------------|---------|------------|
| Phase 1 → Phase 2 | Client has sales data or cost data available | Score SALES and FINANCIAL domain KPIs; >=3 KPIs score Ready |
| Phase 2 → Phase 3 | Client has loan data (>=20% of jobs have loan_amount) | Score LOANS domain KPIs; >=3 KPIs score Ready |
| Phase 3 → Phase 4 | Client has land acquisition or permitting data | Score LAND or PERMITTING domain KPIs; >=3 KPIs score Ready |
| Phase 4 → Phase 5 | Client has property management data | Score PM domain KPIs; >=3 KPIs score Ready |
| Phase 5 → Phase 6 | Client has 12+ months of historical data across all active domains | Historical data available for trend computation |

**Phases can be skipped.** A client with construction + sales + PM data but no loans or land data would go Phase 1 → Phase 2 → Phase 5, skipping Phases 3 and 4.

### 13.3 Phase Independence

Each phase is independently valuable. A client who only ever reaches Phase 1 still gets significant operational insight:

| Phase | Standalone Value |
|-------|-----------------|
| Phase 1 | Know exactly where every job stands, which are stalled, superintendent workload, cycle time analysis. This alone replaces weekly status meetings. |
| Phase 2 | Understand profitability by community, track sales pipeline, audit P&L per job. Replaces manual spreadsheet-based financial reviews. |
| Phase 3 | Track loan exposure, draw percentages, expiration risk. Replaces manual lender reporting. |
| Phase 4 | Visualize land pipeline, permitting bottlenecks. Replaces ad-hoc deal tracking. |
| Phase 5 | Monitor occupancy, delinquency, make-ready pipeline. Replaces property management spreadsheets. |
| Phase 6 | Identify trends, forecast performance, benchmark against historical data. Enables strategic planning. |

**Never delay Phase 1 delivery waiting for Phase 2 data.** Ship what is ready now.

---

## 14. Templates & Decision Tools

This section provides ready-to-use templates for common assessment and decision tasks.

### 14.1 KPI Assessment Template

```markdown
# KPI Assessment: {client}
Date: {date}
Assessor: AD Consulting
Data Maturity Level: {level}

## Summary
- Total KPIs assessed: {n}
- Ready: {n}
- Partial: {n}
- Blocked: {n}
- Roadmap: {n}

## Section Activation
| Section | Status | Reason |
|---------|--------|--------|
| CONSTRUCTION | Active | Core milestone data available |
| SALES | Active / Inactive | {reason} |
| LOANS | Active / Inactive | {reason} |
| LAND | Active / Inactive | {reason} |
| PERMITTING | Active / Inactive | {reason} |
| PROPERTY MGMT | Active / Inactive | {reason} |
| AUDITS | Active / Inactive | {reason} |

## Domain: Construction Progress (CP)
| KPI ID | KPI Name | Score | Completeness | Notes |
|--------|----------|-------|-------------|-------|
| CP-01 | Active Job Count | Ready | 100% | |
| CP-02 | Avg Completion % | {score} | {pct} | {notes} |
| ... | ... | ... | ... | ... |

## Domain: Financial/Profitability (FP)
| KPI ID | KPI Name | Score | Completeness | Notes |
|--------|----------|-------|-------------|-------|
| FP-01 | Budget vs Actual | {score} | {pct} | {notes} |
| ... | ... | ... | ... | ... |

(Repeat for each domain)

## Data Quality Findings
- {finding_1}
- {finding_2}
- ...

## Recommendations
- Phase 1 deliverables: {list}
- Future phases: {list}
- Data improvements needed: {list}

## Changelog
| Date | Change | Author |
|------|--------|--------|
| {date} | Initial assessment | AD Consulting |
```

### 14.2 Field Mapping Template

```markdown
# Field Mapping: {client}
Source System: {erp_name}
Date: {date}

## Source: {table_or_sheet_name}
| Source Field | Type (Source) | Standard Field | Type (Target) | Transformation | Completeness | Notes |
|-------------|--------------|---------------|---------------|----------------|-------------|-------|
| {source_col_1} | STRING | {standard_field} | STRING | Direct | {pct}% | |
| {source_col_2} | STRING | {standard_field} | FLOAT | SAFE_CAST(REPLACE(v,',','') AS FLOAT64) | {pct}% | Comma-separated in source |
| {source_col_3} | STRING | (excluded) | N/A | N/A | N/A | Not needed for dashboard |
| N/A | N/A | {standard_field} | STRING | Gap — field not in source | 0% | Blocks KPI {id} |

## Unmapped Source Fields
| Source Field | Reason for Exclusion |
|-------------|---------------------|
| {field} | {reason} |

## Gaps (Standard Fields Not in Source)
| Standard Field | Impact | Workaround |
|---------------|--------|------------|
| {field} | Blocks {KPI_ID} | {workaround or "None — Roadmap"} |
```

### 14.3 Quality Scorecard Template

```markdown
# Data Quality Scorecard: {client}
Date: {date}
Overall Score: {pct}% ({label})

## Field-Level Quality
| Field | Table | Total Rows | Populated | Completeness | Rating |
|-------|-------|-----------|-----------|-------------|--------|
| job_id | construction_milestones | {n} | {n} | {pct}% | {Good/Warning/Bad} |
| completion_pct | construction_milestones | {n} | {n} | {pct}% | {Good/Warning/Bad} |
| wip | construction_milestones | {n} | {n} | {pct}% | {Good/Warning/Bad} |
| sale_price | sales | {n} | {n} | {pct}% | {Good/Warning/Bad} |
| ... | ... | ... | ... | ... | ... |

## Issues Found
| Issue | Severity | Affected Records | Resolution |
|-------|----------|-----------------|------------|
| {issue} | High/Medium/Low | {n} records | {resolution} |

## Recommendations
- {recommendation_1}
- {recommendation_2}
```

### 14.4 Client Profile Template

```markdown
# Client Data Profile: {client}
Date: {date}

## Overview
- ERP System: {system}
- Active Jobs: {count}
- Communities/Subdivisions: {count}
- Operating Markets: {cities/states}
- Data History: {months/years}
- Data Owner: {role and name}
- Data Maturity Level: {level} ({description})

## Source Systems
| System | Format | Refresh Cadence | Tables/Sheets | Approx. Row Volume |
|--------|--------|-----------------|---------------|-------------------|
| {system_1} | {format} | {cadence} | {count} | {rows} |
| {system_2} | {format} | {cadence} | {count} | {rows} |

## Data Quality Summary
- Overall completeness: {pct}%
- Critical field gaps: {list}
- Known issues: {list}

## Dashboard Scope
- Recommended starting phase: Phase {n}
- Sections to activate: {list}
- Estimated build time: {days} days
- Special considerations: {notes}
```

### 14.5 Discovery Questionnaire Template

```markdown
# Discovery Questionnaire: {client}
Date: {date}
Interviewer: {name}
Interviewee: {name, role}

## Operational Profile
1. ERP system: ___
2. Active jobs/projects: ___
3. Communities/subdivisions: ___
4. Average closings per month: ___
5. Data manager (role): ___
6. Current financial reports: ___
7. Biggest operational blind spots: ___
8. Decisions you would make differently with better data: ___

## Data Depth
9. Historical data availability (how far back): ___
10. Construction milestones tracked: ___
11. Separate lot cost vs. construction cost: ___
12. Loan/draw tracking: ___
13. Sales contracts tracked separately: ___
14. Property management portfolio: ___
15. Land acquisition tracking: ___
16. Permitting data: ___
17. Vendor/subcontractor cost breakdowns: ___
18. Budget tracking per job: ___

## Technical Environment
19. Existing data warehouse or BI tool: ___
20. Google Cloud account: ___
21. Data delivery method: ___
22. Dashboard users (count and roles): ___

## Notes
{free-form notes from the conversation}
```

### 14.6 Go/No-Go Checklist

Use this checklist before deploying a client dashboard:

**GO if ALL of the following are true:**
- [ ] At least Phase 1 (Core) sections are built and functional
- [ ] All shipped KPIs show accurate, non-zero values
- [ ] Client has reviewed and confirmed data accuracy for at least 3-5 KPI values
- [ ] No console errors in production build
- [ ] Both dark and light themes tested and rendering correctly
- [ ] Service account key is NOT committed to git
- [ ] `.env.local` contains correct production credentials
- [ ] Data quality score is at least "Fair" (>=40%)
- [ ] Responsive layout tested at 1024px breakpoint

**NO-GO if ANY of the following are true:**
- [ ] Core milestones data is missing or corrupt
- [ ] KPI values do not match client's own reports (>5% variance unexplained)
- [ ] Console errors on page load
- [ ] Service account key committed to repository
- [ ] Client has not validated any sample data
- [ ] Data quality score is "Poor" (<40%)

### 14.7 Section Activation Checklist

For each potential section, answer these questions:

```markdown
## Section: {SECTION_NAME}

1. Does the required data exist?          [ ] Yes  [ ] No
2. Does the data meet minimum volume?     [ ] Yes  [ ] No
   (Threshold: {threshold from Section 8.2})
3. Are >=3 KPIs in this domain Ready?     [ ] Yes  [ ] No
4. Has the field mapping been completed?   [ ] Yes  [ ] No
5. Are there known data quality issues?    [ ] Yes  [ ] No
   If yes, are they documented?           [ ] Yes  [ ] No

Decision: [ ] Activate  [ ] Defer to Phase {n}  [ ] Skip (no data)
```

---

## 15. Appendices

### Appendix A: File Changes Per Client

Every client dashboard follows the same directory structure. The following table shows which files change per client:

| File | Changes Per Client | Effort |
|------|--------------------|--------|
| `lib/bigquery.js` | Env var defaults only (warehouse connection library is reusable) | Minimal |
| `lib/dashboard-data.js` | **Complete rewrite** — queries, field names, transformations, return shape | High |
| `components/dashboard-shell.js` | **Complete rewrite** — tabs, KPIs, panels, drawer logic, section configuration | High |
| `app/globals.css` | Copy from design system (identical across all clients) | None |
| `app/page.js` | Update imports, page title | Minimal |
| `app/layout.js` | Update title, description, metadata | Minimal |
| `.env.local` | Client-specific credentials, project ID, dataset name, client display name | Minimal |
| `package.json` | Update project name | Minimal |

### Appendix B: BigQuery Cost Estimation

For clients using Google BigQuery (the default warehouse):

| Metric | Value |
|--------|-------|
| Free tier | 1 TB scans/month, 10 GB storage |
| Typical client data size | 2-10 MB |
| Queries per page load | 10-20 |
| Data scanned per page load | 2-5 MB |
| Daily revalidation (ISR) | 1 page load/day = 2-5 MB |
| Monthly scan (single user, daily refresh) | ~100-150 MB |
| **Monthly cost** | **$0.00** (well within free tier) |
| Breakeven point | Approximately 200,000 page loads/month would still be $0.00 |

BigQuery's free tier is more than sufficient for every home builder client. No other warehouse is needed.

### Appendix C: Companion Documents

| Document | Purpose | Location |
|----------|---------|----------|
| KPI Master Reference | All KPI definitions, formulas, thresholds | `KPI_MASTER_REFERENCE.md` |
| Dashboard Design System | Visual tokens, components, layout rules | `DASHBOARD_DESIGN_SYSTEM.md` |
| Dashboard Shell Build Guide | Step-by-step build process | `DASHBOARD_SHELL_BUILD_GUIDE.md` |
| Client Onboarding Guide | End-to-end onboarding workflow | `CLIENT_ONBOARDING_GUIDE.md` |
| Client KPI Assessment | Per-client data audit results | `clients/{client}/kpi_assessment.md` |
| Client Schema | Per-client warehouse table documentation | `clients/{client}/bigquery.yaml` |

### Appendix D: ERP-Specific Extraction Guides

**BuildPro / BRIX:**
- Primary data source: Google Sheets linked to BuildPro database
- Extraction: Export each sheet as XLSX, or set up BigQuery external table pointing to the Google Sheet
- Common sheets: Milestones, Job Cost, Sales, Schedule, Lots
- Gotchas: Date formats are inconsistent (mix of MM/DD/YYYY and M/D/YY). Completion percentage stored as 0-100 integer. Some fields contain trailing spaces. Google Sheets row limits (10M cells) may require splitting large datasets.
- Refresh: Manual export or Google Sheets auto-sync (if external table)

**BuilderTrend:**
- Primary data source: REST API
- Extraction: Node.js script using BuilderTrend API endpoints
- Common endpoints: Projects, Schedules, Change Orders, Daily Logs
- Gotchas: API rate limits (varies by plan). Pagination required for large datasets. Date format is ISO 8601. Nested JSON responses need flattening.
- Refresh: Scheduled API call (daily or weekly)

**CoConstruct:**
- Primary data source: REST API or CSV export
- Extraction: API script or manual CSV export from CoConstruct admin panel
- Common data: Projects, Selections, Change Orders, Financial Summaries
- Gotchas: API documentation can be sparse. CSV exports may have different column names than API responses. Financial data may be in separate exports.
- Refresh: Scheduled API call or manual CSV export

**Sage 300 CRE:**
- Primary data source: Fivetran connector or ODBC export to CSV
- Extraction: Fivetran pulls from Sage database into BigQuery; fallback is scheduled CSV export by client IT
- Common tables: JC (Job Cost), AR (Accounts Receivable), AP (Accounts Payable), GL (General Ledger)
- Gotchas: Sage uses internal codes for job status that need mapping. Cost categories use Sage-specific category codes. Large databases may require incremental exports.
- Refresh: Fivetran scheduled sync or manual CSV export (typically by client IT)

**Procore:**
- Primary data source: REST API with OAuth 2.0
- Extraction: Node.js script using Procore API
- Common endpoints: Projects, Budget, RFIs, Submittals, Daily Logs
- Gotchas: OAuth token refresh required. Webhook support for real-time updates. Rich API but requires specific scopes. Financial data may require additional permissions.
- Refresh: API polling (daily) or webhooks (real-time)

**Foundation Software:**
- Primary data source: Fivetran connector or report export
- Extraction: Fivetran pulls into BigQuery; fallback is exported reports (CSV/XLSX)
- Common tables: Job Master, Cost Detail, Payroll, AP
- Gotchas: Report formats vary by version. Database access may require VPN. Historical data retention policies vary by client.
- Refresh: Fivetran scheduled sync or manual report export

**Newstar (ECI):**
- Primary data source: FTP export or manual XLSX export
- Extraction: Download from FTP site, import script
- Common files: Job List, Cost Reports, Schedule Reports
- Gotchas: FTP credentials and file naming conventions vary. Date formats are often non-standard. Some exports include summary rows that need filtering.
- Refresh: FTP pickup (daily or weekly) or manual export

**Custom/Legacy Systems:**
- Primary data source: Google Sheets or manual XLSX
- Extraction: Client manually exports data into a standardized template
- Common approach: Provide the client with a Google Sheets template matching the standard field inventory; client populates it from their system
- Gotchas: Highest data quality risk. Manual entry errors common. Refresh cadence depends entirely on client discipline.
- Refresh: Manual (weekly or monthly)

### Appendix E: Glossary of Terms

| Term | Definition |
|------|-----------|
| **CO** | Certificate of Occupancy — official approval that a building is habitable |
| **CIP** | Construction In Progress — a job that has started but not received CO |
| **WIP** | Work In Progress — cumulative cost incurred on a job to date |
| **ISR** | Incremental Static Regeneration — Next.js feature that rebuilds pages at set intervals |
| **Mart** | A pre-computed summary table in the warehouse, built from raw tables via scheduled query |
| **Raw** | The first layer of the data warehouse, containing unmodified data from the source system |
| **KPI** | Key Performance Indicator — a measurable value demonstrating business performance |
| **ERP** | Enterprise Resource Planning — the client's primary business management software |
| **PII** | Personally Identifiable Information — data that can identify a specific individual (names, addresses, phone numbers) |
| **WRITE_TRUNCATE** | A BigQuery load disposition that replaces the entire table on each import (full refresh) |
| **Service Account** | A non-human identity used to authenticate API calls to cloud services |
| **Shell** | The main dashboard component that renders all tabs, KPI cards, panels, and navigation |
| **Data Layer** | The `dashboard-data.js` file that queries the warehouse and returns structured data to the shell |
| **Panel** | A card-style container in the dashboard that holds a chart, table, or visualization |
| **Kicker** | The small uppercase label above a panel title (e.g., "PROFITABILITY", "GEOGRAPHY") |
| **Drill-down** | An interactive element that, when clicked, reveals more detailed data |
| **Side Drawer** | A panel that slides in from the right side of the screen to show filtered detail data |
| **Absorption Rate** | The rate at which available homes are sold, typically measured over 90 days |
| **Pro Forma** | A financial projection showing estimated profit/loss for a specific job or community |
| **Lot** | A parcel of land, either developed or undeveloped, within a community |
| **Community** | A residential development or subdivision containing multiple lots/homes |
| **Superintendent** | The field supervisor responsible for managing construction of one or more homes |

---

*This framework is maintained by AD Consulting. Last updated: March 2026.*
