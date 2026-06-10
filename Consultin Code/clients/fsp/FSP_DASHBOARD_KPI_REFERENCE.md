# FSP Builder Ops Dashboard - KPI and Data Reference

**Client:** Florida Sun Partners II / FSP  
**Dashboard app:** `next_dashboard/`  
**Production URL:** https://fsp-builder-ops-dashboard.vercel.app  
**Last updated:** 2026-05-27  
**Canonical owner:** AD ERP Systems / Construction Operations Consulting

This document is the source of truth for the FSP visual Next.js dashboard. It defines the KPIs, formulas, source tables, refresh path, validation checks, known limitations, and operating rules needed to keep the dashboard accurate.

The current dashboard is intentionally compact. It is not the full 11-domain builder dashboard. It covers the FSP operating surface that is currently supported by the ERP API:

- Portfolio and budget overview
- Construction progress
- Vendor and purchase order exposure
- Data quality and exception review

When this file conflicts with older generic KPI documents, this file wins for FSP.

---

## 1. Executive Summary

The FSP dashboard is a warehouse-backed Next.js app that reads BigQuery tables generated from the FSP ERP external API.

The most important current KPI rule is:

> Construction progress is milestone-based when ERP milestone progress exists. Task completion percentage is only a fallback.

The second important current KPI rule is:

> PO variance is measured only against the budgeted task scope that has sent POs. It is not variance against total job budget.

The third important operating rule is:

> Only one scheduled ingestion path should write the FSP raw and mart tables. Competing scheduled jobs can silently replace the table schema and break the dashboard.

As of 2026-05-27, the project has two enabled scheduler jobs:

| Job | Schedule | Target | Intended status |
|---|---:|---|---|
| `fsp-erp-daily-sync` | `0 6 * * *` America/New_York | `https://us-central1-applied-well-461916-g8.cloudfunctions.net/fsp-erp-sync` | Keep. This is the updated sync path. |
| `fsp-erp-test-ingestion-schedule` | `0 * * * *` America/New_York | Cloud Run job `fsp-erp-test-ingestion:run` | Review and pause or update. This job appears to write the legacy schedule schema. |

Do not rely on the milestone-progress dashboard until the hourly legacy job is either paused or updated to the same schema as `fsp-erp-sync`.

Observed verification on 2026-05-27: after the hourly Cloud Run job ran, `fsp_erp_test_raw.schedule` contained the legacy columns `lot_id`, `job_id`, `community`, `plan_name`, `superintendent`, `start_date`, `target_close_date`, `actual_close_date`, `current_stage`, and `stage_start_date`, but not the required milestone fields. That schema causes `getDashboardData()` to fail with `Name progress_percent not found inside s`. The docs and dashboard code below describe the intended/current FSP dashboard contract; the scheduler conflict must be resolved for unattended production refresh.

---

## 2. System Map

### 2.1 Source to dashboard flow

```text
FSP ERP external API
  /api/external/projects
  /api/external/tasks?includePurchaseOrders=true
  /api/external/purchase-orders
  /api/external/vendors
  /api/external/projects/{id}/cost-summary
        |
        v
FSP sync code
  Local:          sync_erp_to_bq.js
  Cloud Function: cloud-function/index.js
        |
        v
BigQuery
  Raw dataset:   applied-well-461916-g8.fsp_erp_test_raw
  Marts dataset: applied-well-461916-g8.fsp_erp_test_marts
        |
        v
Next.js dashboard
  Data layer:    next_dashboard/lib/dashboard-data.js
  UI shell:      next_dashboard/components/dashboard-shell.js
  Hosting:       Vercel project fsp-builder-ops-dashboard
```

### 2.2 Deployed sync function

| Field | Value |
|---|---|
| Function | `fsp-erp-sync` |
| Platform | Google Cloud Functions Gen 2 |
| Region | `us-central1` |
| Runtime | `nodejs20` |
| Entry point | `fspErpSync` |
| Trigger | HTTP |
| Current known revision | `fsp-erp-sync-00002-gaz` |
| Daily scheduler | `fsp-erp-daily-sync` at 6:00 AM ET |

Note: Google Cloud warned on deploy that `nodejs20` is deprecated as of 2026-04-30. The runtime should be upgraded in a separate maintenance change after the ingestion path is stabilized.

---

## 3. BigQuery Tables

### 3.1 Raw tables

| Table | Grain | Source endpoint | Important fields |
|---|---|---|---|
| `fsp_erp_test_raw.schedule` | 1 row per ERP project/job | `/api/external/projects` | `job_id`, `lot_id`, `project_address`, `plan_name`, `progress_percent`, `progress_milestone`, `milestones_completed`, `milestones_total`, `start_date` |
| `fsp_erp_test_raw.schedule_tasks` | 1 row per ERP task | `/api/external/tasks` | `task_id`, `job_id`, `stage`, `task_group`, `activity`, `vendor_name`, `status`, `scheduled_start`, `actual_end`, `budget_cost`, `actual_cost` |
| `fsp_erp_test_raw.vendors` | 1 row per purchase order | `/api/external/purchase-orders` | `vendor_name`, `po_number`, `job_id`, `task_id`, `po_amount`, `status`, `draw_status`, `is_paid`, `issue_date` |
| `fsp_erp_test_raw.vendors_master` | 1 row per vendor | `/api/external/vendors` | `vendor_id`, `vendor_name`, contact fields, trade, task count, PO count |

### 3.2 Mart tables

| Table | Grain | Purpose |
|---|---|---|
| `fsp_erp_test_marts.mart_actual_spending` | 1 row per job | ERP cost summary: total budget, committed POs, paid POs, open POs, source variance |
| `fsp_erp_test_marts.mart_vendor_scorecard` | 1 row per vendor | Vendor ranking by PO value, paid value, open PO count, variance percentage |
| `fsp_erp_test_marts.mart_lot_pipeline` | 1 row per job | Current stage and milestone progress for pipeline-level calculations |
| `fsp_erp_test_marts.mart_exception_center` | 1 row per exception | Missing vendor, orphan PO, and overdue task flags |
| `fsp_erp_test_marts.mart_job_profitability` | 1 row per job/cost code | Budget, actual, committed PO, variance, projected final cost |

### 3.3 Required milestone schema

The `schedule` raw table must include these fields. If any are missing, the dashboard progress queries fail.

| Field | Type | Meaning |
|---|---|---|
| `progress_percent` | FLOAT | ERP milestone percent as a whole number, for example `25` for 25%. |
| `progress_milestone` | STRING | Current milestone label, for example `Block House`. |
| `progress_matched_task_name` | STRING | ERP task that matched the current milestone, when available. |
| `milestones_completed` | INTEGER | Count of completed milestone steps. |
| `milestones_total` | INTEGER | Total milestone steps in the ERP progress model. |

Validation SQL:

```sql
SELECT column_name
FROM `applied-well-461916-g8.fsp_erp_test_raw.INFORMATION_SCHEMA.COLUMNS`
WHERE table_name = 'schedule'
  AND column_name IN (
    'progress_percent',
    'progress_milestone',
    'progress_matched_task_name',
    'milestones_completed',
    'milestones_total'
  )
ORDER BY column_name;
```

Expected result: 5 rows.

---

## 4. Dashboard Surfaces

### 4.1 Overview tab

Purpose: executive snapshot of jobs, budget, spend proxy, committed POs, active construction jobs, not-started jobs, plan distribution, task statuses, and PO variance.

Panels:

- Total jobs / total budget / actual spend / committed POs
- In Construction
- Jobs by Plan
- Task Status Breakdown
- Budget vs POs by Plan
- Actual Spending by Job
- Not Started
- Data Quality
- Data Exceptions

### 4.2 Construction tab

Purpose: field operations view for active jobs. This tab now prioritizes ERP milestone progress.

Panels:

- Jobs In Construction
- Tasks (active jobs)
- Milestone Progress
- Budget (active)
- Upcoming Tasks
- Recently Completed
- Per-Job Construction Detail
- Tasks by Construction Stage
- Budget by Trade Group
- Task Count by Trade

### 4.3 Vendors tab

Purpose: PO and vendor exposure. This is a committed-spend and purchasing view, not an invoice reconciliation view.

Panels:

- Total Vendors
- Total PO Value
- Top Vendor
- Avg PO Value
- Vendor Ranking by PO Value
- Vendor Scorecard
- PO Detail

---

## 5. KPI Definitions

### 5.1 Portfolio and budget overview

| KPI | Grain | Formula | Source | Caveats |
|---|---|---|---|---|
| Total Jobs | Job | `COUNT(DISTINCT job_id)` | `schedule_tasks` | Jobs without tasks are not counted. |
| Total Budget | Job/task | `SUM(mart_actual_spending.budget_total)` | `mart_actual_spending` | ERP cost-summary budget, not the PO-sent budget scope. |
| Actual Spend | Job/task | Sum of completed-task budget proxy returned as `effective_actual_total` in dashboard data | `schedule_tasks` via `dashboard-data.js` | This is not cash paid or invoice actuals. It is a progress-based proxy: budget cost of completed tasks. |
| Committed POs | Purchase order | `SUM(committed_po_total)` | `mart_actual_spending` | Comes from ERP cost summary. Includes committed PO exposure; not necessarily paid. |
| Open POs | Purchase order | `SUM(open_po_total)` | `mart_actual_spending` | Displayed as the committed PO card subtitle. |

### 5.2 Construction progress

| KPI | Grain | Formula | Source | Caveats |
|---|---|---|---|---|
| Active Jobs / In Construction | Job | Jobs where any task is `COMPLETED`, `IN_PROGRESS`, or `ORDERED`, or `progress_percent > 0` | `jobProgress` from `dashboard-data.js` | A job can be active by ERP milestone progress even if task statuses are sparse. |
| Not Started | Job | Jobs where completed, in-progress, and ordered task counts are all zero and `progress_percent = 0` | `jobProgress` | Requires milestone schema to avoid misclassifying jobs. |
| Milestone Progress | Active job | Average of `progress_percent` across active jobs | `schedule.progress_percent` | Percent is a whole-number ERP milestone percent. Displayed as `25% Block House`, not `0.25`. |
| Milestones | Active job | `milestones_completed / milestones_total` | `schedule` | Prefer this over task count when discussing job progress. |
| Task Status Breakdown | Task | Count of task rows by `status` | `schedule_tasks` | Still useful for work queue visibility, but not the main progress KPI. |
| Tasks by Stage | Task | Active-job task rows grouped by `stage`; completed, active, and pending counts | `schedule_tasks` | Active = `IN_PROGRESS + ORDERED` in the UI. |
| Budget by Trade Group | Task | Active-job `SUM(budget_cost)` grouped by `task_group` | `schedule_tasks` | Includes budgeted task scope, not PO or invoice totals. |
| Task Count by Trade | Task | Active-job task count grouped by `task_group` | `schedule_tasks` | Operational workload indicator. |
| Upcoming Tasks | Task | Non-completed active-job tasks where `scheduled_start` is from 3 days ago through 14 days ahead | `schedule_tasks` | Uses current browser/server date at render time. |
| Recently Completed | Task | Completed active-job tasks where `actual_end` or `scheduled_end` is within the last 14 days | `schedule_tasks` | If `actual_end` is missing, scheduled end is used as fallback. |

### 5.3 PO budget and variance

| KPI | Grain | Formula | Source | Caveats |
|---|---|---|---|---|
| PO Budget | Job or plan | Sum of `budget_cost` for task rows where the same job and normalized vendor name have a non-zero PO | `schedule_tasks` joined to `vendors` | This intentionally excludes unsent/unmatched budget scope. |
| Committed POs | Job or plan | `committed_po_total` from ERP cost summary | `mart_actual_spending` | Committed exposure, not paid cash. |
| Open POs | Job or plan | `open_po_total` from ERP cost summary | `mart_actual_spending` | Open exposure. |
| PO Variance | Job or plan | If committed POs > 0: `po_sent_budget_total - committed_po_total`; else `0` | `dashboard-data.js` | Positive means remaining budget on sent-PO scope. Negative means committed POs exceed sent-PO budget scope. |
| Actual | Job or plan | Completed-task budget proxy | `schedule_tasks` via `dashboard-data.js` | Label should stay "Actual" only with the explanatory note in the panel. Do not present it as invoice actuals. |

Correct label language:

- Use `PO Budget`, not `Budget`, when the denominator is only sent-PO scope.
- Use `PO Variance`, not `Variance`, when the comparison is `PO Budget - Committed POs`.
- Keep the panel note: `Actual = budget cost of completed tasks - PO variance uses only sent PO scope`.

### 5.4 Vendor KPIs

| KPI | Grain | Formula | Source | Caveats |
|---|---|---|---|---|
| Total Vendors | Vendor | `COUNT(DISTINCT vendor_name)` | `vendors` | Counts vendors represented in PO data. |
| Total PO Value | PO | `SUM(po_amount)` | `vendors` | Dashboard summary query does not currently exclude cancelled POs. |
| Total POs | PO | `COUNT(*)` | `vendors` | Displayed as subtitle under total PO value. |
| Top Vendor | Vendor | Vendor ranked #1 by `total_po_value` | `mart_vendor_scorecard` | Mart excludes cancelled POs. |
| Avg PO Value | PO | `total_po_value / total_pos` | `vendors` | Sensitive to cancelled/zero-dollar POs. |
| Vendor Ranking | Vendor | `ROW_NUMBER() OVER (ORDER BY SUM(po_amount) DESC)` | `mart_vendor_scorecard` | Ranking by dollars, not performance quality. |
| Vendor PO Count | Vendor | UI recomputes count from raw PO detail by vendor name | `vendors` | This intentionally overrides mart `open_po_count` for display because mart open count is not the desired visible count. |

### 5.5 Data quality KPIs

| Check | Formula | Good | Watch | Alert |
|---|---|---:|---:|---:|
| Tasks with budget | `COUNTIF(budget_cost > 0) / COUNT(*)` | >= 85% | 35%-84.9% | < 35% |
| Tasks completed | `COUNTIF(status = 'COMPLETED') / COUNT(*)` | >= 85% | 35%-84.9% | < 35% |
| Vendors with PO amount | `COUNTIF(po_amount > 0) / COUNT(*)` | >= 85% | 35%-84.9% | < 35% |
| Schedule dates populated | `COUNTIF(scheduled_start IS NOT NULL) / COUNT(*)` | >= 85% | 35%-84.9% | < 35% |

These checks are not business performance KPIs. They are trust indicators for the dashboard data.

### 5.6 Exception center

| Exception | Severity | Logic | Action |
|---|---|---|---|
| `TASK_NO_VENDOR` | MEDIUM | Task has positive budget and no vendor | Assign or clean vendor on task. |
| `PO_NO_TASK` | HIGH unless EPO, then LOW | PO has no linked task and is not cancelled | Link PO to a task or confirm it is a valid exception. |
| `TASK_OVERDUE` | HIGH if over 14 days overdue, else MEDIUM | Task not completed and scheduled end is before current date | Review schedule owner and update status/date. |

---

## 6. Drilldown Contract

Every clickable KPI or row opens a drawer with rows scoped to the click.

| Click source | Drawer rows |
|---|---|
| Job row | All tasks for that `job_id` |
| Stage | All task rows where `stage` equals clicked stage |
| Trade group | All task rows where `task_group` equals clicked group |
| Vendor | All PO rows where `vendor_name` equals clicked vendor |
| Plan | All job progress rows where `plan_name` equals clicked plan |
| Status | All task rows where `status` equals clicked status |
| All Jobs | All job progress rows |
| Spending | All actual spending rows |
| All Vendors | All vendor scorecard rows |

Drawer filters are available for fields in this set:

```text
stage, status, task_group, vendor_name, plan_name, community, severity
```

Do not fill a drawer with broad rows when a scoped click returns no rows. An empty state is better than unrelated data.

---

## 7. Validation Checklist

Run these checks before updating the public dashboard or claiming the KPIs are healthy.

### 7.1 Code checks

From `Consultin Code/clients/fsp`:

```bash
node --check sync_erp_to_bq.js
node --check cloud-function/index.js
```

From `Consultin Code/clients/fsp/next_dashboard`:

```bash
npm run build
```

### 7.2 Schema checks

Confirm the schedule table contains the milestone fields:

```sql
SELECT column_name
FROM `applied-well-461916-g8.fsp_erp_test_raw.INFORMATION_SCHEMA.COLUMNS`
WHERE table_name = 'schedule'
ORDER BY ordinal_position;
```

Confirm these fields exist:

```text
progress_percent
progress_milestone
progress_matched_task_name
milestones_completed
milestones_total
```

### 7.3 Data-layer spot check

Use `getDashboardData()` and inspect one known job. A healthy result has:

- `errorMessage: null`
- `progress_percent` populated when ERP milestone progress exists
- `progress_milestone` populated when ERP milestone progress exists
- `milestones_completed` and `milestones_total` populated
- `completion_pct = progress_percent / 100` when `progress_percent` exists

Example previously verified on 2026-05-19:

```json
{
  "address": "4509 Dallas Blvd, Orlando FL 32833",
  "progress_percent": 25,
  "progress_milestone": "Block House",
  "milestones_completed": 5,
  "milestones_total": 22,
  "completion_pct": 0.25
}
```

If the ERP source changes, update the example rather than hard-coding this value as a permanent truth.

### 7.4 Refresh-path checks

List scheduler jobs:

```bash
gcloud scheduler jobs list \
  --location=us-central1 \
  --project=applied-well-461916-g8
```

Healthy operating state:

- `fsp-erp-daily-sync` is enabled.
- Any legacy/test job that writes the same raw and mart tables is paused or updated to the current schema.

If the hourly `fsp-erp-test-ingestion-schedule` remains enabled and writes the legacy schema, it can remove the milestone fields and break the dashboard.

### 7.5 Public deployment checks

Build and deploy:

```bash
vercel build --prod --yes
vercel deploy --prebuilt --prod -y
```

Expected public alias:

```text
https://fsp-builder-ops-dashboard.vercel.app
```

The Vercel app is currently static/ISR. If the production environment does not have server-side BigQuery credentials, the public page reflects the data captured during the prebuilt production build.

---

## 8. Known Limitations and Improvement Backlog

### 8.1 Current limitations

1. **Actual spend is a completion proxy.** The UI currently displays completed-task budget as `Actual`. This is useful for directional build progress, but it is not a substitute for accounting actuals or invoices.
2. **Vendor invoice data is not populated.** `vendors.invoiced_amount` is currently `null` in the transform.
3. **Vendor scorecard ranking is spend-based.** It is not yet a quality, schedule, or variance performance score.
4. **No global filters.** The FSP dashboard does not currently include global community/plan/date filters.
5. **No auth layer in the public dashboard.** The public Vercel URL is accessible to anyone with the link.
6. **Competing scheduler risk.** The hourly `fsp-erp-test-ingestion-schedule` appears to write a legacy schema. Pause or update it before relying on unattended refreshes.

### 8.2 Recommended next improvements

| Priority | Improvement | Why |
|---:|---|---|
| 1 | Remove or update the hourly legacy Cloud Run ingestion job | Prevents schema drift and dashboard outages. |
| 2 | Rename `Actual Spend` to `Completed Scope` or wire true accounting actuals | Prevents finance users from reading a task proxy as cash actuals. |
| 3 | Add invoice/paid actuals once ERP exposes them consistently | Enables real budget vs actual and invoice variance. |
| 4 | Add global plan/community filters | Makes the dashboard more useful for recurring ops meetings. |
| 5 | Add a schema guard to the sync/deploy checklist | Fail fast when milestone fields are missing. |
| 6 | Upgrade Cloud Function runtime from Node 20 | Keeps the ingestion stack supported. |
| 7 | Add access control if the dashboard leaves internal review | Protects client operational and cost data. |

---

## 9. Definition of Done for FSP KPI Changes

A KPI change is not done until all of these are true:

- The business question is written down.
- Grain, numerator, denominator, date basis, and row scope are explicit.
- Source tables and fields are named.
- The UI label matches the actual formula.
- The drawer rows reconcile to the clicked metric.
- BigQuery schema checks pass.
- `getDashboardData()` returns `errorMessage: null`.
- The relevant job/PO/vendor spot check matches source ERP behavior.
- `npm run build` passes.
- If public output is needed, Vercel production deploy is complete and the alias is correct.
- Any scheduled jobs that write the same destination tables are accounted for.
