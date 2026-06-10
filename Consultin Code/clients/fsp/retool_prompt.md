# FSP Builder Ops Console — Retool AI Prompt

Build a **homebuilder operations dashboard** called "FSP / Builder Ops Console" in Retool. It connects to **BigQuery** and has three main tabs: **Overview**, **Construction**, and **Vendors**. Every table, chart, bar, and KPI card must be **clickable** — clicking drills down into a **slide-out drawer panel** showing filtered detail rows.

---

## Data Source: BigQuery

### Connection Details
- **Project ID**: `applied-well-461916-g8`
- **Raw dataset**: `fsp_erp_test_raw`
- **Marts dataset**: `fsp_erp_test_marts`
- **Resource name in Retool**: `FSP`

### Tables Used

#### Raw Tables (in `fsp_erp_test_raw`)

**`schedule`** — One row per job/lot
| Column | Type | Notes |
|--------|------|-------|
| job_id | STRING | Unique hash ID |
| lot_id | STRING | Lot identifier |
| project_address | STRING | Full street address |
| community | STRING | Community/subdivision name |
| plan_name | STRING | Floor plan name |
| current_stage | STRING | Current construction stage |
| start_date | DATE | Schedule-level start (may be NULL) |
| target_close_date | DATE | Schedule-level target close (may be NULL) |

**`schedule_tasks`** — One row per task within a job
| Column | Type | Notes |
|--------|------|-------|
| task_id | STRING | Unique task identifier |
| job_id | STRING | FK to schedule.job_id |
| lot_id | STRING | Lot identifier |
| project_address | STRING | Full street address |
| community | STRING | |
| plan_name | STRING | Floor plan name |
| stage | STRING | Construction stage: Pre-Construction, Foundation, Framing, MEP Rough, Exterior, Interior, Trim, Close-Out |
| task_group | STRING | Trade/group (Concrete, Framing, Electrical, Plumbing, HVAC, etc.) |
| activity | STRING | Specific task name |
| vendor_name | STRING | Assigned vendor |
| status | STRING | COMPLETED, IN_PROGRESS, ORDERED, NOT_STARTED |
| scheduled_start | DATE | Scheduled start date |
| scheduled_end | DATE | Scheduled end date |
| actual_start | DATE | Actual start date |
| actual_end | DATE | Actual end date |
| budget_cost | FLOAT | Budgeted cost |
| actual_cost | FLOAT | Actual cost |

**`vendors`** — One row per purchase order
| Column | Type | Notes |
|--------|------|-------|
| vendor_name | STRING | |
| po_number | STRING | PO identifier |
| job_id | STRING | FK to schedule.job_id |
| po_amount | FLOAT | PO dollar amount |
| invoiced_amount | FLOAT | Amount invoiced |
| status | STRING | PO status |
| issue_date | DATE | PO issue date |

#### Mart Tables (in `fsp_erp_test_marts`)

**`mart_vendor_scorecard`** — Aggregated vendor metrics
| Column | Type | Notes |
|--------|------|-------|
| vendor_name | STRING | |
| total_po_value | FLOAT | |
| total_invoiced | FLOAT | |
| open_po_count | INT | **NOTE: this field returns 0 — compute PO count from raw `vendors` table instead** |
| avg_variance_pct | FLOAT | |
| overrun_flag | BOOL | |
| ranking | INT | Vendor rank by PO value |

**`mart_exception_center`** — Data quality exceptions
| Column | Type | Notes |
|--------|------|-------|
| exception_center_key | STRING | |
| exception_type | STRING | |
| severity | STRING | HIGH, MEDIUM, LOW |
| affected_entity | STRING | |
| days_outstanding | INT | |

**`mart_lot_pipeline`** — Lot-level pipeline metrics
| Column | Type | Notes |
|--------|------|-------|
| job_id | STRING | |
| days_in_current_stage | INT | |
| schedule_health_score | FLOAT | |

---

## Queries to Build

### Q1: Portfolio Summary
```sql
SELECT
  COUNT(DISTINCT job_id) AS total_jobs,
  COUNT(*) AS total_tasks,
  COUNTIF(status = 'COMPLETED') AS completed_tasks,
  SUM(COALESCE(budget_cost, 0)) AS total_budget,
  COUNT(DISTINCT plan_name) AS distinct_plans
FROM fsp_erp_test_raw.schedule_tasks
```

### Q2: Construction Summary
```sql
SELECT
  COUNTIF(status = 'COMPLETED') AS completed,
  COUNTIF(status = 'IN_PROGRESS') AS in_progress,
  COUNTIF(status = 'ORDERED') AS ordered,
  COUNTIF(status = 'NOT_STARTED') AS not_started,
  COUNT(DISTINCT IF(status IN ('COMPLETED','IN_PROGRESS','ORDERED'), job_id, NULL)) AS jobs_with_progress,
  SAFE_DIVIDE(COUNTIF(status = 'COMPLETED'), COUNT(*)) AS avg_completion_pct
FROM fsp_erp_test_raw.schedule_tasks
```

### Q3: Vendor Summary
```sql
SELECT
  COUNT(DISTINCT vendor_name) AS total_vendors,
  SUM(COALESCE(po_amount, 0)) AS total_po_value,
  COUNT(*) AS total_pos
FROM fsp_erp_test_raw.vendors
```

### Q4: Job Progress (per-job aggregation)
```sql
SELECT
  t.job_id,
  t.lot_id,
  MAX(t.project_address) AS project_address,
  t.community,
  t.plan_name,
  COUNT(*) AS total_tasks,
  COUNTIF(t.status = 'COMPLETED') AS completed,
  COUNTIF(t.status = 'IN_PROGRESS') AS in_progress,
  COUNTIF(t.status = 'ORDERED') AS ordered,
  COUNTIF(t.status = 'NOT_STARTED') AS not_started,
  SAFE_DIVIDE(COUNTIF(t.status = 'COMPLETED'), COUNT(*)) AS completion_pct,
  SUM(COALESCE(t.budget_cost, 0)) AS total_budget,
  SUM(COALESCE(t.actual_cost, 0)) AS total_actual,
  MIN(t.scheduled_start) AS earliest_start,
  MAX(t.scheduled_end) AS latest_end,
  MIN(t.actual_start) AS actual_start,
  MAX(t.actual_end) AS actual_end,
  s.current_stage,
  p.days_in_current_stage,
  p.schedule_health_score
FROM fsp_erp_test_raw.schedule_tasks t
LEFT JOIN fsp_erp_test_raw.schedule s ON t.job_id = s.job_id
LEFT JOIN fsp_erp_test_marts.mart_lot_pipeline p ON t.job_id = p.job_id
GROUP BY t.job_id, t.lot_id, t.community, t.plan_name, s.current_stage, p.days_in_current_stage, p.schedule_health_score
ORDER BY completion_pct DESC, t.lot_id ASC
```

### Q5: Task Roster (full task list for drilldowns)
```sql
SELECT
  task_id, lot_id, job_id, job_name, project_address, community,
  plan_name, stage, task_group, activity, vendor_name,
  status, scheduled_start, scheduled_end, actual_start, actual_end,
  budget_cost, actual_cost
FROM fsp_erp_test_raw.schedule_tasks
ORDER BY job_id,
  CASE stage
    WHEN 'Pre-Construction' THEN 1 WHEN 'Foundation' THEN 2
    WHEN 'Framing' THEN 3 WHEN 'MEP Rough' THEN 4
    WHEN 'Exterior' THEN 5 WHEN 'Interior' THEN 6
    WHEN 'Trim' THEN 7 WHEN 'Close-Out' THEN 8
    ELSE 9
  END, activity ASC
```

### Q6: Vendor Scorecard
```sql
SELECT vendor_name, total_po_value, total_invoiced, open_po_count, avg_variance_pct, overrun_flag, ranking
FROM fsp_erp_test_marts.mart_vendor_scorecard
ORDER BY ranking ASC
```
**Important**: `open_po_count` from this table returns 0. You must compute PO counts from the raw `vendors` table by counting rows per vendor_name.

### Q7: Vendor PO Detail
```sql
SELECT vendor_name, po_number, job_id, po_amount, invoiced_amount, status, issue_date
FROM fsp_erp_test_raw.vendors
ORDER BY po_amount DESC NULLS LAST
```

### Q8: Exception Rows
```sql
SELECT exception_center_key, exception_type, severity, affected_entity, days_outstanding
FROM fsp_erp_test_marts.mart_exception_center
ORDER BY CASE severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, days_outstanding DESC
```

### Q9: Data Quality Checks
```sql
SELECT label, coverage, covered_rows, total_rows FROM (
  SELECT 'Tasks with budget' AS label,
    SAFE_DIVIDE(COUNTIF(budget_cost IS NOT NULL AND budget_cost > 0), COUNT(*)) AS coverage,
    COUNTIF(budget_cost IS NOT NULL AND budget_cost > 0) AS covered_rows,
    COUNT(*) AS total_rows
  FROM fsp_erp_test_raw.schedule_tasks
  UNION ALL
  SELECT 'Tasks completed',
    SAFE_DIVIDE(COUNTIF(status = 'COMPLETED'), COUNT(*)),
    COUNTIF(status = 'COMPLETED'), COUNT(*)
  FROM fsp_erp_test_raw.schedule_tasks
  UNION ALL
  SELECT 'Vendors with PO amount',
    SAFE_DIVIDE(COUNTIF(po_amount IS NOT NULL AND po_amount > 0), COUNT(*)),
    COUNTIF(po_amount IS NOT NULL AND po_amount > 0), COUNT(*)
  FROM fsp_erp_test_raw.vendors
  UNION ALL
  SELECT 'Schedule dates populated',
    SAFE_DIVIDE(COUNTIF(scheduled_start IS NOT NULL), COUNT(*)),
    COUNTIF(scheduled_start IS NOT NULL), COUNT(*)
  FROM fsp_erp_test_raw.schedule_tasks
)
```

---

## Layout & Navigation

### Top Bar
- Left: "**FSP** / Builder Ops Console" branding
- Right: Data source badge ("live"), theme toggle (dark/light)

### Left Rail (Sidebar Navigation)
Grouped navigation with stats at bottom:

**Analytics** section:
- **Overview** (OV) — "Portfolio snapshot"
- **Construction** (CO) — "Construction progress"

**Pipelines** section:
- **Vendors** (VN) — "Vendor scorecard"

**Rail Stats** (always visible at bottom of rail):
- Total Jobs count
- Completed tasks count
- Total Budget (compact format like $1.2M)
- Total PO Value (compact format)

### Main Content Area
- Full width, no max-width constraint, padding 28px 32px
- Tab header with title and one-line description
- Content specific to each tab (see below)

---

## Tab 1: Overview

### KPI Row (4 cards, all clickable)
| Card | Value | Sub-text | Click Action |
|------|-------|----------|-------------|
| Total Jobs | count | "{n} plans" | Opens drawer: all jobs list |
| Total Tasks | count | "{completed} completed · {active} active" | Opens drawer: all tasks list |
| Total Budget | $amount | "Across all task schedules" | Opens drawer: all jobs with budget focus |
| Vendor Exposure | $amount | "{n} vendors · {n} POs" | Opens drawer: all vendors list |

### Two-Column Panels Row
**Left: "Jobs by Plan"** — Horizontal ranked bar chart grouped by plan_name, showing count of jobs per plan. Each bar clickable → drills into jobs filtered by that plan.

**Right: "Task Status Breakdown"** — Table with 4 rows:
| Status | Count | Share |
|--------|-------|-------|
| Completed | n | x.x% |
| In Progress | n | x.x% |
| Ordered | n | x.x% |
| Not Started | n | x.x% |
Each row clickable → opens drawer showing all tasks with that status.

### Full-Width Panel: "Budget vs Actual by Plan"
Table grouped by plan_name:
| Plan | Budget | Actual | Over/Under |
|------|--------|--------|-----------|
Each row clickable → drills into jobs for that plan. Over/Under colored: red if positive (overrun), blue/accent if negative (under budget).

### Full-Width Panel: "In Construction"
**Only shows jobs where `completed > 0 OR in_progress > 0 OR ordered > 0`** (active jobs).
| Address | Plan | Tasks | Done | Progress | Start | Budget |
|---------|------|-------|------|----------|-------|--------|
- **Address**: Show `project_address`, NOT lot_id or job_id
- **Progress**: Stacked horizontal bar (green=completed, blue=in_progress, yellow=ordered) with percentage text below, **centered**
- Each row clickable → opens job drilldown drawer

### Full-Width Panel: "Not Started" (Inventory)
Jobs where `completed = 0 AND in_progress = 0 AND ordered = 0`. Same columns as above but **dimmed at 45% opacity**. Each row still clickable.

### Audit Notes
Show any data quality warnings at the bottom (e.g., "Schedule dates not populated", "Most tasks NOT_STARTED").

---

## Tab 2: Construction

**Critical filter**: This tab only shows data for **active jobs** — jobs where `completed > 0 OR in_progress > 0 OR ordered > 0`. All aggregations (stages, trades, upcoming tasks) are recomputed from the filtered task roster, not from pre-aggregated data.

### KPI Row (4 cards)
| Card | Value | Sub-text |
|------|-------|----------|
| Jobs In Construction | count | "of {total} total" |
| Tasks (active jobs) | count | "{done} done · {active} active" |
| Completion Rate | percent | "{done} of {total}" |
| Budget (active) | $amount | — |

### Full-Width Panel: "Upcoming Tasks" (Schedule)
Tasks due in the **next 14 days** (also include tasks overdue by up to 3 days). Exclude COMPLETED tasks. Show max 20 rows sorted by scheduled_start ASC.
| Address | Stage | Task | Trade | Scheduled | Status |
|---------|-------|------|-------|-----------|--------|
- **Scheduled** date in red/warning if it's in the past (overdue)
- **Status** shown as colored pill: IN_PROGRESS=blue, ORDERED=green, NOT_STARTED=muted gray
- Each row clickable → opens job drilldown

### Full-Width Panel: "Recently Completed"
Tasks with status=COMPLETED where `actual_end` (or `scheduled_end` as fallback) is within the last 14 days. Show max 20 rows sorted by completion date DESC (most recent first).
| Address | Stage | Task | Trade | Completed | Vendor |
|---------|-------|------|-------|-----------|--------|
Each row clickable → opens job drilldown.

### Full-Width Panel: "Per-Job Construction Detail"
| Address | Plan | Done | Active | Total | Progress | Start | Budget |
|---------|------|------|--------|-------|----------|-------|--------|
- Progress column: stacked bar + percentage, **centered**
- Each row clickable → opens job drilldown

### Full-Width Panel: "Tasks by Construction Stage"
Stage order: Pre-Construction → Foundation → Framing → MEP Rough → Exterior → Interior → Trim → Close-Out
| Stage | Total | Done | Active | Pending | Progress (bar) | Budget |
|-------|-------|------|--------|---------|----------------|--------|
Each row clickable → opens stage drilldown drawer.

### Two-Column Panels: Trade Groups
**Left: "Budget by Trade Group"** — Ranked bar chart by group_budget. Clickable.
**Right: "Task Count by Trade"** — Ranked bar chart by total_tasks. Clickable.

---

## Tab 3: Vendors

### KPI Row (4 cards)
| Card | Value | Sub-text |
|------|-------|----------|
| Total Vendors | count | — |
| Total PO Value | $amount | "{n} purchase orders" |
| Top Vendor | vendor name | PO value of top vendor |
| Avg PO Value | $amount | — |

### Two-Column Panels
**Left: "Vendor Ranking by PO Value"** — Ranked horizontal bar chart from vendor scorecard. Each bar clickable → opens vendor drilldown.

**Right: "Vendor Scorecard"** — Table:
| Vendor | PO Value | POs | Rank |
|--------|----------|-----|------|
- **POs column**: Count computed from raw `vendors` table (COUNT of rows per vendor_name), NOT from `mart_vendor_scorecard.open_po_count` which is broken
- Each row clickable → opens vendor PO drilldown

### Full-Width Panel: "PO Detail"
All purchase orders sorted by amount DESC:
| Vendor | PO # | Address | Amount | Issued |
|--------|------|---------|--------|--------|
- **Address**: Resolve `job_id` to `project_address` using the job progress data. Never show raw job_id hashes.
- Each row clickable → opens vendor drilldown

---

## Drilldown Drawer (Slide-Out Panel)

A right-side slide-out panel that opens when any data element is clicked. Width: `min(1200px, 92vw)`.

### Drawer Header
- Title (context-dependent, e.g., "Tasks for 123 Main St")
- Row count: "{filtered} of {total} rows" if filtered, else just "{total} rows"
- Close button (X)

### Filter Bar
Auto-generate dropdown filters for any column in the set: `stage`, `status`, `task_group`, `vendor_name`, `plan_name`, `community`, `severity`. Only show filters where there are 2+ unique values. Active filter shows with accent background. "Clear" button when any filter is active.

### Drill-Down Types

**Job Drill-Down** (clicking a job/address anywhere):
Show all tasks for that job_id:
| Stage | Trade | Activity | Status | Sched Start | Sched End | Vendor | Budget |

**Stage Drill-Down** (clicking a construction stage):
| Address | Trade | Activity | Status | Vendor | Budget |

**Trade/Group Drill-Down** (clicking a trade group):
| Address | Stage | Activity | Status | Vendor | Budget |

**Vendor Drill-Down** (clicking a vendor):
Show all POs for that vendor from the vendors table. Resolve job_id → address:
| PO # | Address | Amount | Issued |

**Plan Drill-Down** (clicking a plan name):
| Address | Done | Total | Progress | Budget |

**Status Drill-Down** (clicking a status like "Completed"):
| Address | Stage | Trade | Activity | Start | Vendor | Budget |

**All Jobs** (clicking Total Jobs KPI):
| Address | Plan | Done | Tasks | Progress | Budget | Actual |

**All Tasks** (clicking Total Tasks KPI):
| Address | Stage | Activity | Status | Start | Budget |

**All Vendors** (clicking Vendor Exposure KPI):
| Vendor | PO Value | POs | Rank |

---

## Exceptions Section

**Do NOT show as a main tab.** Show as a collapsible section at the bottom of every tab, below the quality checks.

- Collapsed by default: Shows "▶ Data Exceptions (count)" with HIGH count badge if any
- Expanded: Shows table:
| Entity | Type | Severity | Days Outstanding |
- Severity shown as colored pill: HIGH=red, MEDIUM=yellow, LOW=gray
- Dimmed at 70% opacity

---

## Data Quality Checks

Show at the bottom of each tab, above exceptions. Small inline indicators:
- Colored dot (green ≥85%, yellow ≥35%, red <35%) + label + percentage + "(covered/total)"
- Checks: Tasks with budget, Tasks completed, Vendors with PO amount, Schedule dates populated

---

## Formatting Rules

- **Addresses**: Always show `project_address` field. Never show `job_id` (hash) or `lot_id` alone.
- **Currency**: Compact format for KPIs/summaries ($1.2M, $46K), full format ($121,473) in tables. No decimals.
- **Percentages**: One decimal (e.g., 25.3%)
- **Dates**: "Mar 17, '26" format (Month abbreviation, day, 2-digit year)
- **Numbers**: Comma-separated thousands (1,234)
- **Progress bars**: Stacked horizontal bars with 3 segments — green (completed), blue (in_progress), yellow (ordered). Small percentage text centered below the bar.

---

## Visual Design Notes

- Clean, minimal design with dark mode support
- No heavy borders — use subtle separators
- KPI cards in a horizontal row, hover effect on clickable cards
- Tables use CSS grid layout, not HTML tables
- Ranked bar charts: label left, horizontal bar middle, value right
- Interactive rows highlight on hover
- Drawer overlay darkens the background
- Color palette: success=green, accent=blue, warning=yellow, alert/danger=red, muted=gray
