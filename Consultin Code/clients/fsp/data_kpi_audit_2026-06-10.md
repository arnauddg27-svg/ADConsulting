# FSP Dashboard Data Audit — 2026-06-10

**Scope:** every KPI/panel on the FSP Builder Ops Console (fsp-builder-ops-dashboard.vercel.app) recomputed from `fsp_erp_test_raw` + `fsp_erp_test_marts`, cross-checked three ways: ERP UI (fsp-2-ten.vercel.app screenshot, 2026-06-10) ↔ warehouse ↔ dashboard formulas.
**Method:** per `DASHBOARD_BUILDING_SOP.md` §6 acceptance checklist (counts reconcile across card/chart/table/drawer; one source of truth for currency; date basis; known-limitation verification). Audit script replicated the exact SQL in `next_dashboard/lib/dashboard-data.js`.
**Data as of:** raw + marts extracted 2026-06-10 16:48 UTC (same-day sync, single writer per table — refresh ownership clean).

## Verdict

**Core numbers are trustworthy.** Budgets reconcile to the dollar across ERP → warehouse → dashboard for every visible job; task counts, status breakdown, milestone progress (post fix earlier today), committed/open PO totals, and data-integrity checks all pass. Six findings below — the two that matter are inside the **marts** (not what the dashboard shows): `mart_actual_spending.effective_actual_total/variance` carry bogus values that the dashboard correctly ignores but other consumers could read, and the ERP's "O/U" column is a different metric than the dashboard's "PO Variance" (definition gap, not a bug).

## Three-way reconciliation (ERP UI ↔ warehouse ↔ dashboard)

| Check | ERP UI | Warehouse | Dashboard | Result |
|---|---|---|---|---|
| Projects / jobs | 12 | 12 (`schedule`, distinct in tasks, mart) | 12 | ✅ |
| Per-job budgets (10 visible jobs) | e.g. Dallas $356,074 | task-budget sum identical **to the dollar, all 10** | compact ($356K) | ✅ |
| Per-job task counts | 76/73/76/73/77/74/77/74/74/74 | identical | identical (sum 901) | ✅ |
| Total Budget | — | $5,046,885 (tasks = mart, per job and total) | $5.0M | ✅ |
| Milestone progress | 35% Dry-in Roof etc. | `schedule` native = `mart_lot_pipeline` (0 disagreements) | matches post-fix | ✅ |
| Actual Spend (proxy) | — | completed-task budget $692,402 | $692K, note discloses proxy | ✅ |
| Committed POs | — | $1,129,901 (158 POs; 157 SENT + 1 DRAFT $1,000) | $1.1M / "$1.1M open" | ✅ |
| Task Status Breakdown | — | 99 / 13 / 77 / 712 of 901 (no stray statuses) | identical, shares correct | ✅ |
| Vendors | — | 15 distinct vendors | 15 | ✅ |
| Stage taxonomy | — | exactly the 8 dashboard stages, 901/901 tasks covered | — | ✅ |

**Integrity:** 0 duplicate task_ids · 0 orphan tasks · 0 POs without a valid job · 0 inverted date pairs · 0 null scheduled_starts · 0 completed tasks missing actual_end · quality-check coverages reproduce exactly (889/901 budgeted, 99/901 completed, 157/158 PO amounts, 901/901 dates).

## Findings

### F1 — 🔴 `mart_actual_spending.effective_actual_total` and `.variance` are wrong (dashboard unaffected)
The mart claims, e.g., **18830 Natchez** (0% Not Started, $75 of POs) has `effective_actual_total` **$443,524**; portfolio mart "actuals" total **$4.44M** against $1.13M of POs. The pattern `eff_actual ≈ budget_total − variance`, with `variance` ≈ a constant **$61,596** for every job with no POs, indicates a placeholder/broken formula in the sync (`cloud-function/index.js`). The dashboard *ignores both columns* (it computes its own completed-task actual and sent-PO variance), so the UI is correct — but any other consumer of this mart (exports, future dashboards, quality checks) would read garbage.
**Recommendation:** fix or NULL these two columns in the sync; add them to the nightly quality check so regressions surface.

### F2 — 🔴 ERP "O/U" ≠ dashboard "PO Variance" (definition gap, will cause confusion)
ERP shows Dallas Blvd **O/U +$13,636**; dashboard shows **PO Variance +$50,292**. Neither is wrong — they measure different things: ERP O/U appears to be line-level PO-vs-budget overrun; dashboard PO Variance = (budget of tasks whose vendor has a PO on that job) − (committed POs). They will never agree, and a reader comparing screens will conclude the data is broken (as happened with milestone % today).
**Recommendation:** sync the ERP cost-summary O/U into the warehouse and display *ERP's own number* labeled "ERP O/U", or rename/abandon the local computation. Until then, treat PO Variance as remaining-sent-scope budget, not overrun.

### F3 — 🟠 "PO Budget" covers 29% of total budget — by design, now quantified
Sent-PO scope = **$1.47M of $5.05M**. 574 tasks ($3.53M) have a vendor with no PO yet on that job; 62 tasks have no vendor. Largest unsent vendors: Palm City Sod ($228K), A&L Septic ($210K), BAS Walls & Ceilings ($173K), Alliance Pavers ($156K). This matches the documented intent ("PO Budget intentionally excludes unsent scope") — recorded here so the small denominators in Budget-vs-POs panels aren't mistaken for missing data.

### F4 — 🟡 Exception center is a daily snapshot; drifts intraday
Mart: 106 HIGH + 49 MEDIUM TASK_OVERDUE (155). Recomputed live ~1h later: 161 overdue (105 >14d). The drift is the mart's daily snapshot vs the render-time clock — expected, but worth knowing the footer count can lag up to a day. TASK_NO_VENDOR reproduces exactly (50 = 50). PO_NO_TASK: zero unlinked POs — every PO matches a task vendor+job.

### F5 — 🟡 Dead-zero money columns: `actual_cost`, `invoiced_amount`, `paid_po_total` are 100% NULL/0
The "All Jobs" drawer's **Actual** column and the spending drawer's **Paid POs** column always show $0 — the ERP doesn't supply these yet (documented backlog P3). Cosmetic but misleading in drilldowns.
**Recommendation:** hide these drawer columns (or label "(not provided by ERP)") until the ERP exposes invoice/paid data.

### F6 — 🟢 Stale code comment: "mart open_po_count is broken"
`dashboard-shell.js` (VendorsTab) recomputes PO counts because of this comment, but the mart now matches raw exactly for all vendors (18/18, 28/28, 12/12…). Harmless — the recompute returns identical numbers — but the comment documents a bug that no longer exists. Note: with zero PAID/CLOSED POs, "open" currently equals "all".

## SOP acceptance-checklist status (data items)

- Counts reconcile card ↔ chart ↔ table ↔ drawer: **PASS** (status counts, job counts, PO counts verified)
- Currency single source of truth: **PASS for the UI** (task budgets = mart budget_total = ERP); **FAIL inside mart** for eff_actual/variance (F1)
- Percentages divide-by-zero guarded: **PASS** (SAFE_DIVIDE throughout; no NaN observed)
- Labels match logic: **PASS post-milestone-fix**; F2 names the remaining definitional exposure
- Date basis: starts = MIN(scheduled_start) (matches ERP starts); overdue = render-time date (note F4 snapshot lag)
- Known limitations re-verified: cancelled-PO caveat currently moot (0 cancelled POs exist); invoice actuals still absent (F5)

*Audit script: replicates `dashboard-data.js` SQL 1:1; run against BigQuery 2026-06-10 ~18:00 UTC.*

## Resolutions — applied 2026-06-10 (same day)

- **F1 RESOLVED.** Root cause refined: the mart columns faithfully mirror ERP cost-summary fields (`actuals.effectiveTaskActualTotal`, `variance.taskBudgetMinusEffectiveActual`) whose ERP-side definitions differ from the dashboard's — a naming collision, not a broken formula. Fix: both sync paths (`cloud-function/index.js` + `sync_erp_to_bq.js`) now enrich `mart_actual_spending` with explicitly-named dashboard-semantic columns: `completed_task_budget_total`, `po_sent_budget_total`, `po_variance`. ERP mirrors retained. Cloud function redeployed (revision `fsp-erp-sync-00003-hig`) and smoke-tested.
- **F2 RESOLVED.** The ERP's O/U was found in the cost-summary payload: `variance.trackedTaskBudgetMinusTaskLinkedPOs` (= tracked task budget − task-linked committed POs). Verified equal to the ERP UI for every visible job (Dallas +13,636 ✓ Mosby +1,920 ✓ Somerset +120 ✓ Robertson +25 ✓ Northrop +6,261 ✓ Mardi Gras +6,820 ✓). Now synced as `erp_over_under` (+ `tracked_task_budget_total`, `task_linked_committed_total`) and displayed as an "ERP O/U" column in Budget vs POs by Plan, Actual Spending by Job, and the spending drilldown — alongside PO Variance, each labeled. Dashboard reads it behind a schema guard.
- **F3 documented (by design).** Quantification stands; panel notes already disclose sent-PO scope.
- **F4 RESOLVED.** Exceptions footer now reads "daily snapshot" so intraday drift isn't mistaken for error.
- **F5 RESOLVED.** Dead-zero columns removed: "Actual" (all-jobs drawer) and "Paid POs" (spending drawer). They return when the ERP starts feeding invoice/payment data.
- **F6 RESOLVED.** Stale "mart open_po_count is broken" comment replaced; the client-side recompute is kept as a deliberate reconcile-with-detail-panel choice.
- **Bonus:** the documented design-system visuals (teal→cyan chart gradient palette + global treatments from `DASHBOARD_DESIGN_SYSTEM.md`) were applied to the dashboard the same day.

## Daily-refresh verification — 2026-06-10 evening

**Verified: the pipeline updates daily.** Cloud Scheduler `fsp-erp-daily-sync` (`0 6 * * *` America/New_York, ENABLED) → completed successfully 7/7 of the last 7 days at 10:00–10:01 UTC (Cloud Run logs). Updated function revision `fsp-erp-sync-00003-hig` smoke-tested by direct invocation. Dashboard page revalidates BigQuery once per 24h (`revalidate = 86400`) and on every deploy.

**P1 root cause finally pinned down.** The "competing hourly legacy job" is the Cloud Run job `fsp-erp-test-ingestion` (image `client-scaffold-ingestion`, created by `managed-ingestion-deployer@` — the ERP platform's own managed ingestion). The paused Cloud Scheduler `fsp-erp-test-ingestion-schedule` is NOT its trigger — it executed hourly 7:00am–noon ET today regardless (BigQuery audit logs show it rewriting `fsp_erp_test_raw.schedule` and `.vendors` at 11:02–16:02 UTC). It writes the **legacy 13-column schedule schema (no milestone fields)**; `fsp_erp_test_staging.stg_schedule` is a view over raw `schedule` and breaks whenever the new-schema sync runs (cosmetic). It does NOT touch `schedule_tasks`, `vendors_master`, or any mart.

**Mitigation shipped:** `dashboard-data.js` milestone expressions now fall back `raw schedule → mart_lot_pipeline → task ratio`. The marts are rebuilt only by the 6:00 AM sync and persist all day, so milestone progress stays ERP-correct even while raw `schedule` holds the legacy schema (verified by simulating the degraded branch against live data). Residual exposure: raw `vendors` is also rewritten hourly by the legacy job (schema-compatible; row count differs slightly), so PO figures can drift intraday from the 6 AM snapshot.

**Real fix still open (ERP side):** disable or schema-align the managed ingestion for this division in the ERP platform — it belongs to AD ERP SYSTEMS' own infrastructure.
