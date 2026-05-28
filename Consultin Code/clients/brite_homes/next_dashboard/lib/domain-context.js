// Curated Brite Homes domain knowledge, organized by business domain.
// Injected into the Ask assistant's system prompt so it understands the business
// vocabulary and metric definitions without having to discover them via queries.
// Keep this in sync when the warehouse semantics change.

export const DOMAIN_CONTEXT = `# Brite Homes domain knowledge

Brite Homes is a residential homebuilder. A "job" is one home/lot moving through land → construction → CO → sale or rental. Most analysis is at the job grain (id: job_no / job_id, formatted like 00045-000147).

## Warehouse layers (always prefer the higher layer)
- **brite_homes_marts** — pre-computed marts + dim/fact views. Use FIRST for portfolio KPIs, filtered lists, P&L, expirations, open tickets/issues.
- **brite_homes_staging** — typed/cleaned views over raw. Use when you need per-job detail with proper types (DATE not Excel serial, FLOAT64 not STRING).
- **brite_homes_raw** — passthrough from source sheets/files. Use only when staging/mart doesn't cover the columns you need.
- **Centralized** — external federated tables (raw Google Sheets reads). Do NOT query directly — they refresh through brite_homes_raw.

## Refresh cycle
- Nightly: \`refresh-raw-transforms.js\` rebuilds all brite_homes_raw + brite_homes_staging + most brite_homes_marts views from Centralized Data 2.0 + Property Management federated tables.
- Nightly (separate): \`create-marts.js\` rebuilds the BASE-table marts (mart_audit_pl, mart_daily_summary, mart_filter_quality).
- Snapshot tables: rebuilt periodically (5/13 was the last big run for property_management_* / fact_exception_conformed_snapshot etc.).

## Conventions
- **job_id** is the canonical join key. Synonyms: job_no, Job_No, Job_Number, Column1 (TaskCompletion). All point to the same ##### - ###### identifier.
- Other field synonyms: community = project_name = subdivision_name; city = job_city = project_city; area_name = area = region_name (entity/division); status = occupancy_status.
- Address columns are address, address_number, address_street, address_city, address_state, address_postal_code, address_county (there is NO "property_address").
- Refresh timestamps: \`_refreshed_at\` (staging/mart), \`_extracted_at\` (raw), \`_mart_refreshed_at\` (mart_audit_pl, mart_daily_summary).
- **Raw tables wired from Centralized Data 2.0 have PascalCase columns** (e.g. \`Address_City\`, \`Plan_Name\`, \`Sales_Status\`). Staging views give them snake_case aliases.

## Critical vocabulary

### Lifecycle (job_type / current_stage)
- "CO" = Certificate of Occupancy (home complete enough to occupy). Stage label "100%. Receive CO".
- "CO'ed not closed" / "coed" / "CO'd" = finished home not yet closed/sold: job_type CONTAINS "SFR Completed (not closed)".
- "Active construction" = job_type CONTAINS one of: "SFR Construction In Progress", "Awaiting CO", "On Hold", "POs Released".
- "Spec" = builder-owned / speculative home.
- "Closed" sale = sales.status CONTAINS "closed"; "open" = does NOT contain "closed".
- current_stage is the milestone bucket WITH a percentage prefix, e.g. "75% Electrical Trimout", "100%. Receive CO".

### Milestone progress — USE \`furthest_milestone_completed\`, NOT \`current_stage\`
For any progress / aging / stuck question, use the **last milestone actually completed**, NOT the current stage.
- \`furthest_milestone_completed\` (STRING) — most recent milestone the job has finished. Truth for "how far is X".
- \`days_since_last_milestone\` (INT64) — days since that last-completed milestone. Use for "stuck longest", "stalled", aging.
- \`current_stage\` — the stage a job is *working in*. May carry the same label for months with no progress; do NOT use for "what milestone is this job at" or "how long stuck".

### Marketing / listing status
- "Listed" / "on the market" = home is in the listing agent inventory with an MLS. Source: \`brite_homes_raw.listing_agent_inventory\`. Treat as listed when \`sale_mls\` IS NOT NULL OR \`lease_mls\` IS NOT NULL.
- "Listed as rental" = \`listed_as_rental\` true / \`lease_mls\` populated.
- "Not listed" = job_id has NO row in listing_agent_inventory with sale_mls or lease_mls. Use LEFT JOIN ... WHERE listing.sale_mls IS NULL AND listing.lease_mls IS NULL, or NOT EXISTS.
- Disambiguation: "listed in palm coast" = MLS-listed AND city=Palm Coast. NOT "located in".
- "Sale listed date" / "lease listed date" come from \`sale_listed_date\` / \`leased_date\`.

═══════════════════════════════════════════════════════════════════════════════
## Where to look — by domain
═══════════════════════════════════════════════════════════════════════════════

### Construction / lifecycle
- **brite_homes_staging.stg_centralized_data_lifecycle_v2** — PRIMARY per-job view. Final stage of the ETL ladder (clean → current → enriched → lifecycle_v2). Has \`furthest_milestone_completed\`, \`days_since_last_milestone\`, completion %, WIP, superintendent, loan exposure, derived_lifecycle_status (incl. lot fallback). All downstream conformed/dim views build off this.
- brite_homes_staging.stg_centralized_data_enriched — penultimate stage; same data minus the lot-lifecycle fallback.
- brite_homes_staging.stg_centralized_data_current / _clean — intermediate ETL stages (dedup, trim). Avoid querying directly.
- **brite_homes_marts.dim_job_conformed** (31 cols) — conformed dim version. Stable schema across queries.
- **brite_homes_marts.mart_daily_summary** (16 cols, 1 row) — portfolio-wide KPI snapshot (total WIP, total budget/actual, total loan exposure, etc.).
- **brite_homes_marts.mart_filter_quality** — filter options + data quality coverage stats.
- brite_homes_raw.construction_milestones (63 cols, 1257 rows) — wide raw construction roster.
- brite_homes_raw.construction_summary (147 cols, 823 rows) — even wider Summary-line-type construction view.
- brite_homes_raw.schedule — schedule snapshot (start, target close, actual close per job).
- brite_homes_raw.jme_future_dates (12 cols, 904 rows) — forecasted milestone dates per job from the JME template.

### Sales
- **brite_homes_raw.sales** (12 cols, 1257 rows) — PRIMARY narrow contract table (contract_number, buyer, sale_price, status, dates). Typed.
- **brite_homes_staging.stg_sales_master** (23 cols, 1084 rows) — typed slim view of sales_master (key fields with parsed dates).
- brite_homes_raw.sales_master (130 cols, 1084 rows, all STRING) — master sales table with EVERYTHING (sales agent, realtor, mortgage, title, contingency, etc.). Use stg_sales_master for typed access; query raw only for columns not exposed in stg.
- brite_homes_staging.stg_sales_full_compat — drop-in compat view that mirrors xlsx_sales_full's lowercase column naming (sourced from sales_master).
- brite_homes_raw.listing_agent_inventory — MLS listing data. See "Marketing/listing status" section above.

### P&L / Audit
- **brite_homes_marts.mart_audit_pl** (88 cols, 483 rows) — PRIMARY P&L. SELECT P&L columns DIRECTLY, do not reconstruct.

  **TWO Net Profit definitions exist** — surface both when answering "what's the P&L for X":
    (1) \`net_profit\` / \`net_margin\` — "Audit Net Profit". Formula: sale_price - total_cost. Contract-side view. Matches the "Audits" tab.
    (2) \`net_profit_estimated_final\` / \`net_margin_estimated_final\` — "Estimated Final Net Profit". Formula: sale_price - construction_costs_summary_est - total_other_expenses_est. Matches the "Summary" tab's "Estimated, final accounting P&L". DEDUCTS additional post-close costs (property tax, COGS-closing, commissions, warranty).
        Operator-recorded Sales Price overrides are captured via \`sale_price_override\` (sourced from the "Sale Price Overrides" tab on Centralized Data 2.0). When the override exists, the mart's \`sale_price\` flows from the override and the estimated_final matches the operator's Summary-tab number exactly. Surface \`sale_price_override\` and \`sale_price_override_notes\` when an override applies.

  Operator-final cost categories (in net_profit_estimated_final, NOT net_profit):
  - property_taxes_on_hud_est ($1,000), cogs_closing_costs_est ($1,500), warranty_coverage_est ($500), cogs_commission_internal_est (sale × 2%), cogs_commission_external_est (sale × 3%)
  - total_other_expenses_est = sum of above + seller_credit + total_financing
  - construction_costs_summary_est = lot_land + permitting_total + cost_site_work + total_vertical + cost_options + builder_fee + insurance + closing_cost

  Other columns:
  - Revenue: sale_price, net_revenue, seller_credit, proceeds, cost_to_sale
  - Rollups: construction_costs, overhead, other_expenses, total_direct_cost, total_indirect_cost, total_cost, gross_margin
  - Sheet-only (NULL when computed): proceeds, cost_to_sale, amount_drawn, sheet_loan_amount, sheet_lender, bgh_total, bgh_margin
  - Flags: margin_status ('good'|'watch'|'at-risk'|'loss'|'missing revenue'|'missing cost'), data_quality_flag, pl_readiness
  - Provenance: \`pl_source\` ('sheet' = authoritative from Centralized.ConstructionAudits / audit_pl_summary; 'computed' = derived from stale audit_* fallback). 160 sheet rows + 323 computed rows.
  - Line items: lot_land, permitting/permitting_total, cost_site_work, cost_vertical, total_vertical, cost_options, closing_cost, financing, insurance, warranty, builder_fee, dirt_total, dumpsters, env_total, utilities_total, monthly_interest, total_ap, actual_vertical, actual_site_work.
  - Thresholds (Audit margin): <0 → loss; <0.08 → at-risk; <0.12 → watch; ≥0.12 → good. Same thresholds apply to net_margin_estimated_final.

- brite_homes_raw.audit_pl_summary (160 rows) — source for mart_audit_pl sheet rows. From the Construction audits tab on Centralized Data 2.0.

### Loans
- **brite_homes_marts.mart_loan_pipeline** (26 cols, 278 rows) — PRIMARY loan view. Per-job loan status with \`expiration_bucket\` ('healthy' | 'expiring 30d' | 'expiring 60d' | 'expiring 90d' | 'expired' | 'no expiration tracked') + joined job context. Columns: lender, loan_number, loan_amount, interest_rate, total_drawn, wip, drawable_wip, equity, loan_status, days_until_expiration, loan_closing_date, loan_expiration_date, extended_to_date, address, community, current_stage.
- **brite_homes_staging.stg_loan_tracker** (37 cols, 276 rows) — typed view, dates parsed.
- brite_homes_raw.loan_tracker (38 cols, 276 rows) — raw, has Excel-serial dates.
- construction_milestones.loan_amount / total_drawn / loan_days_until_expiration — coarser loan fields on the main roster.

### Property management (rentals)
- **brite_homes_marts.property_management_unit_360** — per-unit 360 view (PRIMARY).
- **brite_homes_marts.property_management_portfolio_summary_snapshot** — portfolio totals snapshot.
- **brite_homes_marts.property_management_project_summary** — by community.
- brite_homes_marts.property_management_status_breakdown — counts by occupancy/lease status.
- brite_homes_staging.stg_property_management_master / _delinquency / _rent_roll — typed views.
- brite_homes_raw.property_management_master_snapshot / _delinquency_snapshot / _rent_roll_snapshot — raw snapshots (5/13).

### Permitting
- **brite_homes_staging.stg_permitting_detail** (732 rows) — typed view with Excel-serial dates parsed. Columns: city, owner, permit_status, permit_number, permit_issued_date, permit_approved_date, expiration_date, lot_type, garage, env_issues, construction_manager, surveyor, plus cycle-time fields.
- brite_homes_raw.permitting_detail — raw, Excel serials.

### Warranty
- **brite_homes_marts.mart_warranty_open** (19 cols, 69 rows) — PRIMARY: open tickets joined to construction_milestones for job context.
- **brite_homes_marts.mart_warranty_summary** (8 cols, 27 rows) — counts grouped by (category, ticket_status, item_status, supplier). Use for "how many open warranty tickets" / "which supplier has most claims".
- brite_homes_staging.stg_warranty_tickets — typed view (69 rows).
- brite_homes_raw.warranty_tickets — raw.

### Tasks (PO / supplier / completion)
- **brite_homes_staging.stg_task_completion** (15 cols, 11,421 rows) — PRIMARY: per-task completion records with date parsed. Columns: cost_code, task_name, supplier, po_number, subtotal, tax, complete_total, contract_type, completed_date (DATE), completed_by, task_id, job_task_id. Use for "who supplied X for job Y" / "when was task Z completed".
- brite_homes_raw.task_completion — raw, Completed_Date is Excel-serial FLOAT64.

### Operations issues
- **brite_homes_marts.mart_progress_issues_open** (19 cols, 136 rows) — PRIMARY: unresolved issues joined to construction_milestones. Columns: issue_category, assignee, vendor, root_cause, notes, date_recorded, date_updated, days_since_last_milestone. Use for "which jobs are blocked" / "open issues for X".
- brite_homes_staging.stg_progress_issue_notes — typed view (136 rows).
- brite_homes_raw.progress_issue_notes — raw, Excel-serial dates.

### Inventory / Job details
- brite_homes_raw.inventory_details (154 cols, 1,615 rows) — master inventory.
- brite_homes_raw.job_details (152 cols, 1,250 rows) — job details master.
- brite_homes_raw.takeoff_compare (106 cols, 4,582 rows, all STRING, no single job_id — plan-level) — plan/elevation takeoff comparison.

### Per-job metric lookups (2-col: job_id → value)
- **brite_homes_marts.fact_job_metrics** — UNIONed view of all 8 lookup tables. Each row (job_id, metric, value). Easier than 8 separate joins. Metric values: 'bpof_wip', 'bpof_drawable_wip', 'brite_assets_wip', 'brite_assets_drawable_wip', 'financing_cost', 'job_cost_on_closed', 'lot_cost_closed', 'lot_cost'.
- Individual tables: brite_homes_raw.{bpof_wip, bpof_drawable_wip, brite_assets_wip, brite_assets_drawable_wip, financing_cost, job_cost_on_closed, lot_cost, lot_cost_closed}.
- These mirror columns already on construction_milestones; only use the lookups if you need the operator's exact published number.

### Exceptions / Data quality
- **brite_homes_marts.unified_exception_center_v2** (774 rows) — PRIMARY consolidated exception view. Sources: legacy_audit (608, via v1 → mart_exception_center), property_management (21), property_management_reconciliation (90), construction (55, via lifecycle_v2).
- brite_homes_marts.unified_exception_center (v1, 1007 rows) — older view; v2 depends on it for the legacy_audit branch. Don't query directly — query v2.
- brite_homes_marts.actionable_exception_queue_snapshot — actionable queue (snapshot).
- brite_homes_marts.actionable_exception_summary_snapshot — summary.
- brite_homes_marts.fact_exception_conformed_snapshot — fact table.
- brite_homes_marts.project_exception_summary_snapshot — by project.
- brite_homes_marts.exception_summary_by_source_v2 — by source system.
- brite_homes_marts.warehouse_object_health / warehouse_data_quality_summary — meta health checks.

### Cost vs Budget analysis
- brite_homes_raw.completions (7 cols, 142 rows) — completed jobs split by category (Site Work / Vertical) with Job_Cost_Amount, Original_Budget, Variance.
- brite_homes_raw.in_construction (7 cols, 134 rows) — same shape for in-progress jobs.
- brite_homes_raw.britten_variance — Britten-specific variance.

═══════════════════════════════════════════════════════════════════════════════
## Deprecated / legacy — DO NOT query for new questions
═══════════════════════════════════════════════════════════════════════════════
- **brite_homes_raw.xlsx_sales_full** — 3/18 stale XLSX snapshot. Use \`sales_master\` (live, same row count) or stg_sales_full_compat.
- **brite_homes_raw.audit_costs / audit_dirt / audit_dumpsters / audit_env / audit_utilities / audit_total_ap / audit_bbg_ap / audit_vertical_sitework_actual** — 3/17 manual snapshot. Used internally as fallback by mart_audit_pl for jobs not in audit_pl_summary (323/483 rows, mostly land/lot entries). DO NOT query directly. mart_audit_pl.pl_source='computed' flags those rows. The granular cost line items in these tables (Lot/Land, Vertical, Site Work, Options, Dirt, Dumpsters, Env, Utilities, AP, Builder Fee) have NO equivalent on Centralized Data 2.0 — to refresh them, an operator would need to add a consolidated "Costs" tab to Centralized Data 2.0 similar to "Construction audits".
- **brite_homes_raw.audits_snapshot** (206 rows) — older snapshot of an Audits view. Don't confuse with audit_pl_summary (the live source). Only useful for historical comparison.
- **brite_homes_raw.land_acquisition_active / _cancelled / _closed**, brite_homes_raw.subdivision_pipeline — separate land-acquisition data domain (legacy 3/18).
- **brite_homes_marts.mart_exception_center** — empty 3/17 legacy table, only referenced by unified_exception_center (v1). Use unified_exception_center_v2.
- **brite_homes_marts.unified_exception_center** (v1) — superseded by v2.
- **brite_homes_raw.vendors** — empty shell. No PO-level data available in the source.
- **brite_homes_raw.takeoff_compare** — plan-level (no job_id). Only query when comparing plan-level pricing.

Dropped tables (no longer exist): pm_master, pm_delinquency, cd2_permitting, lot_cost_lookup (renamed to lot_cost), exception_summary_by_source (use _v2).

═══════════════════════════════════════════════════════════════════════════════
## KPI definitions (consistent with the dashboard)
═══════════════════════════════════════════════════════════════════════════════
- WIP = SUM(wip). Loan exposure = SUM(loan_amount). Drawn = SUM(total_drawn). Jobs with loans = COUNT(loan_amount > 0).
- Avg completion = AVG(completion_pct) over rows where it is populated.
- Over budget = rows where original_budget AND job_cost_amount are populated AND job_cost_amount > original_budget.
- Sales value = SUM(sale_price). Contracts = count of sales rows. 45-day closings = rows with closing date in next 45 days.
- Occupancy = occupied units / total units. Past due = SUM(past_due).
- Net Profit = SUM(net_profit) over rows with both revenue + cost. Weighted margin = SUM(net_profit) / SUM(net_revenue) over those rows. Rows missing revenue are EXCLUDED.
- At-risk jobs = margin_status IN ('loss','at-risk','watch'). Negative margin = net_margin < 0.
- Expiring loans = loan_days_until_expiration BETWEEN 1 AND 30, OR mart_loan_pipeline.expiration_bucket IN ('expiring 30d', 'expired').

═══════════════════════════════════════════════════════════════════════════════
## Caveats
═══════════════════════════════════════════════════════════════════════════════
- Margin / profitability lives ONLY in mart_audit_pl, NOT in sales tables.
- mart_audit_pl combines two sources. Authoritative: 160 rows from Centralized.ConstructionAudits (refreshed nightly). Fallback: 323 rows from stale audit_* manual snapshot (mostly land/lot). If a job is in neither, the answer is "no P&L data available" — do NOT fabricate.
- When answering P&L for a specific job, surface pl_source so the user knows the data origin.
- completion_pct, WIP, budget/actual, superintendent, and loan fields are partially populated. Note when coverage is partial.
- Use _refreshed_at / _extracted_at / _mart_refreshed_at to state data freshness when relevant.`;
