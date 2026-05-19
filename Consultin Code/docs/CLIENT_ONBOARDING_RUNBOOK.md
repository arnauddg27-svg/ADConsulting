# Client Onboarding Runbook

**Operational playbook - 2026-04-30.** Step-by-step sequence to stand up a new builder client on the platform. Companion to `DASHBOARD_KPI_REFERENCE.md` and `DASHBOARD_BUILDING_SOP.md`.

Total elapsed time: **4–8 weeks** from kickoff to first live dashboard.

---

## Phase 0 — Pre-kickoff (before contract)

Gate: discovery call complete, scope agreed.

| Step | Owner | Output |
|---|---|---|
| Identify source systems | AD + client ops | Inventory: ERP, sheets, bank portal, MLS, PM tool, file shares |
| Agreement signed | Client | MSA + SOW in DocuSign |
| Kickoff scheduled | AD | 60-min call with ops + finance + IT |

---

## Phase 1 — Week 1: Warehouse standup

Gate: end of week 1, BigQuery project live, ingestion to `{dataset}_raw` running.

### 1.1 GCP project + service account
- Client creates a GCP project OR grants us an IAM role on theirs
- Service account with BigQuery Admin, Storage Admin
- Add to `config/clients.yaml`:
  ```yaml
  clients:
    - id: acme_homes
      project_id: acme-homes-prod
      raw_dataset: acme_homes_raw
      marts_dataset: acme_homes_marts
      region: US
  ```

### 1.2 Scaffold client folders
```bash
node scripts/scaffold-client.js acme_homes
```
Creates `clients/acme_homes/` with `lib/`, `components/`, `app/`, empty `kpi_assessment.md`, empty `kpi_overrides.yaml`.

### 1.3 Canonical datasets
```bash
bq --project_id=acme-homes-prod mk --dataset --location=US acme_homes_raw
bq --project_id=acme-homes-prod mk --dataset --location=US acme_homes_marts
bq query --use_legacy_sql=false < sql/canonical_schema.sql
```
Substitute `dataset_placeholder` with `acme_homes_marts` in the DDL (scaffold script does this).

### 1.4 First ingestion
- Map each client source table → canonical table (one row per day of work, usually)
- Land raw extracts in `{dataset}_raw.source_*`
- Write `lib/dashboard-data.js` transforms: `source_* → {dataset}_marts.jobs/sales/loans/...`
- Schedule with `scripts/daily-sync.js` (cron 5:47 AM)

---

## Phase 2 — Week 2: KPI assessment

Gate: every Layer-A KPI scored in `kpi_assessment.md`.

### 2.1 Profile the warehouse
```bash
node scripts/profile-warehouse.js --client acme_homes
```
Outputs per-table: row count, column list, null %, distinct values for low-cardinality columns.

### 2.2 Fill `kpi_assessment.md`
For every dashboard KPI in `DASHBOARD_KPI_REFERENCE.md` §2, mark one of:

- `ready` — all required fields present, >80% non-null
- `partial` — fields present but <80% populated OR one derived field missing (we can compute)
- `blocked` — core field missing; cannot ship without source data change
- `renamed` - source data supports a related metric, but the dashboard label must be changed to match the actual logic

Use the template:
```markdown
## Construction Dashboard

| KPI | Status | Notes |
|---|---|---|
| Total jobs | ready | jobs.job_id 100% |
| Active jobs | ready | stage enum clean |
| Avg completion | partial | completion_pct 68% populated — will impute from milestones |
| Total WIP | blocked | wip_balance column missing; need ERP export |
```

### 2.3 Fill `kpi_logic.md`
Before UI build starts, create `clients/acme_homes/kpi_logic.md` and define every `ready`, `partial`, and `renamed` KPI using the template in `DASHBOARD_BUILDING_SOP.md`.

Required for each KPI:

- Business question.
- Grain.
- Numerator and denominator.
- Date basis.
- Source tables or mart views.
- Filters.
- Drilldown row scope.
- Validation check.
- Edge cases.

Hard rule: if the logic uses `start_date`, the chart cannot be labeled as completions. If the logic uses `contract_date`, the chart cannot be labeled as closed deals.

### 2.4 First nightly validation
Enable `scripts/daily-quality-check.js` for the new client. First run expect 30–40% PASS, rest ERROR (schema drift). Work down the ERROR list in day 2–5.

---

## Phase 3 — Weeks 3–5: Dashboard build

Gate: all `ready`, approved `partial`, and `renamed` KPIs render in the dashboard with labels that match the actual logic.

### 3.1 Pick the tab set
Based on assessment:
- **Full** (12 tabs): Land + Permitting + Loans + 4 Construction + 2 Sales + 2 PM + Audits
- **Typical** (8–9 tabs): drop Land + PM, keep 4 Construction + 2 Sales + Loans + Audits
- **Minimal** (4–5 tabs): Construction (Dashboard + Pipeline + Cycle Time) + Sales + Audits

Blocked domains get their tab hidden.

### 3.2 Confirm dashboard vs pipeline split

Before editing the shell, mark each planned view as one of:

- **Dashboard** - summary cards, charts, exception panels, and operational decision views.
- **Pipeline** - spreadsheet-style roster tables, fixed headers, frozen key columns, column filters, and row drilldowns.

Do not place full rosters on dashboard tabs. If a dashboard chart needs detail, use a click-through drawer or link to the matching pipeline tab.

### 3.3 Copy + prune `dashboard-shell.js`
```bash
cp clients/brite_homes/components/dashboard-shell.js \
   clients/acme_homes/components/dashboard-shell.js
```
Then:
1. Remove hidden-tab sections from the SECTIONS array
2. Update client name in ShellBar
3. Wire `onCityClick` / `onCommunityClick` / `onStatusClick` to drawer categories
4. Confirm drilldowns pass `domain`, `metric`, `dateBasis`, `series`, `period`, and exact row scope
5. Confirm all year, quarter, and month values are clickable when they represent grouped data

### 3.4 Build `dashboard-data.js`
One function per tab, each returns the shape the shell expects. Reference implementations in `clients/brite_homes/lib/dashboard-data.js`.

Cache heavy queries with `revalidate = 86400` (24h). Nightly sync refreshes data.

Shared data-layer rules:

- KPI cards, charts, and drawers must use the same helper or mart view.
- Monthly spend charts require spend snapshots, invoice dates, draw dates, or accounting dates. Do not group full job costs by job start month and label it monthly spend.
- Closed-deal charts must use close date. Contract-activity charts may use contract date.
- Completion charts must use CO/completion date. Start/activity charts may use start date.
- Status charts must include every normalized status or document why a status is excluded.

### 3.5 Smoke test every click
Checklist:
- [ ] Every KPI card click opens drawer with populated rows
- [ ] Every bar/donut segment click opens drawer
- [ ] Every table row click opens drawer with detail card
- [ ] Every timeline point opens rows for the clicked metric, series, and period
- [ ] Every year/quarter/month cell opens the matching rows
- [ ] City / Entity / Community filters cascade to every chart
- [ ] Time period filter (month/quarter/year/all) re-scopes KPIs
- [ ] Breadcrumb shows active filters and clears correctly
- [ ] Fullpage mode works without site header overlap
- [ ] Day/night toggle doesn't lose filter state
- [ ] Pipeline tabs scroll horizontally (frozen first column)
- [ ] Pro Forma drawer (Audits) shows full P&L for any job
- [ ] Empty drawers show honest empty states, not fallback rows
- [ ] Drawer titles and subtitles show metric, row count, active filters, and date basis

### 3.6 SOP audit

Run the acceptance checklist in `DASHBOARD_BUILDING_SOP.md` before staging.

Minimum evidence to save in `handoff.md`:

- Reconciliation notes for each dashboard tab.
- Any `partial`, `renamed`, or excluded KPI and why.
- Known data gaps.
- Date-basis decisions.
- Drilldown limitations, if any.

### 3.7 Deploy to staging
```bash
vercel --env production deploy clients/acme_homes
```
Staging URL: `{client}.staging.aderpsystems.com`. Password-protect until week 5.

---

## Phase 4 — Week 6: Calibration & client review

Gate: client signs off on dashboards; thresholds tuned.

### 4.1 Three 60-min review sessions
1. **Ops lead** — cycle times, cost variance, exception flags
2. **Finance** — P&L audits, margin distribution, WIP, loan exposure
3. **Exec** — sales pipeline, community scorecard, trendlines

### 4.2 Threshold overrides
Client-specific thresholds go in `clients/acme_homes/kpi_overrides.yaml`:
```yaml
construction:
  - id: con_avg_total_cycle_days
    min: 100   # override — Acme's target is 100-180 not 90-300
    max: 180
  - id: con_wip_over_500k_count
    max: 3     # override — their rule
```
Overrides merge on top of `kpi_thresholds.yaml` at runtime.

### 4.3 Exception flags wired
Decide which KPIs produce email alerts when FAIL. Default to loan expirations, stuck permits, jobs with margin <5%. Alert routing goes through n8n.

---

## Phase 5 — Weeks 7–8: Production cutover

Gate: client using dashboard daily; legacy spreadsheets retired.

| Step | Owner |
|---|---|
| Move from staging to production URL | AD |
| SSO / Google Workspace access for client team | Client IT |
| Recorded walkthroughs for each team role | AD |
| First monthly business review with dashboard as single source | Client exec |
| Formal retire of legacy weekly reports | Client ops |

---

## Escalation & troubleshooting

### Dashboard shows "N/A" everywhere
- BigQuery connection broken. Check `.env.local`, service account key, project ID.
- Run `scripts/daily-sync.js --client acme_homes --dry-run` to verify queries execute.

### KPI value looks wrong
- Check `reports/acme_homes/quality-{date}.json` — validation run may have flagged it.
- Verify the underlying view: `SELECT * FROM acme_homes_marts.vw_construction_kpis LIMIT 10`
- Check for schema drift: `scripts/profile-warehouse.js --client acme_homes --diff-yesterday`

### Drawer is empty
- `detail.value` doesn't match any record. Usually a typo between chart onClick payload and table filter key.
- Check `SHDrawer.tsx` case block for the category — does the `.find(...)` predicate match the chart's click payload?

### Filter doesn't cascade
- Filter state in `SunshineDashboard.tsx` must be passed down to the active tab component. Verify the `filters` prop is threaded through.

---

## Deliverables checklist (end of week 8)

- [ ] `clients/acme_homes/` fully populated
- [ ] Production dashboard live at `acme.aderpsystems.com`
- [ ] `kpi_assessment.md` complete, all `ready`, approved `partial`, and `renamed` KPIs in UI
- [ ] `kpi_logic.md` complete for every shipped KPI
- [ ] `kpi_overrides.yaml` tuned with client-specific thresholds
- [ ] Nightly sync + quality check running (`reports/acme_homes/` populated daily)
- [ ] Dashboard SOP checklist completed
- [ ] Client team has SSO access
- [ ] 3 recorded walkthroughs posted
- [ ] Legacy weekly reports retired
- [ ] First monthly business review completed with dashboard
