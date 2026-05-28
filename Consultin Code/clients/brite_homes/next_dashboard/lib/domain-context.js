// Curated Brite Homes domain knowledge, distilled from field_map.md and kpi_logic.md.
// Injected into the Ask assistant's system prompt so it understands the business
// vocabulary and metric definitions without having to discover them via queries.
// Keep this concise and update it when the warehouse semantics change.

export const DOMAIN_CONTEXT = `# Brite Homes domain knowledge

Brite Homes is a residential homebuilder. A "job" is one home/lot moving through land -> construction -> CO -> sale or rental. Most analysis is at the job grain (id: job_no / job_id, formatted like 00045-000147).

## Field synonyms (same concept, different column names across tables)
- job_id = job_no
- community = project_name = subdivision = subdivision_name
- city = city_name = job_city = project_city
- area_name = area = region_name  (a.k.a. "entity" / division)
- job_type = product_type = construction_type  (lifecycle/product classification)
- status = occupancy_status = current_status
- the address columns are address, address_number, address_street, address_city, address_state, address_postal_code, address_county (there is NO "property_address")

## Lifecycle vocabulary (job_type / current_stage values)
- "CO" = Certificate of Occupancy (home complete enough to occupy). The matching current_stage looks like "100%. Receive CO".
- "CO'ed not closed" / "coed" / "CO'd" = a finished home not yet closed/sold: job_type CONTAINS "SFR Completed (not closed)".
- "Active construction" = job_type CONTAINS one of: "SFR Construction In Progress", "Awaiting CO", "On Hold", "POs Released".
- "Spec" = builder-owned / speculative home (vs. presold).
- "Closed" sale = sales row whose status CONTAINS "closed"; "open/other" = status does NOT contain "closed".
- current_stage is a milestone label with a percentage prefix, e.g. "75% Electrical Trimout", "95% Final Survey", "100%. Receive CO".

## Milestone progress — USE \`furthest_milestone_completed\`, NOT \`current_stage\`
When answering anything about a job's actual progress, how far along it is, how long it's been "stuck", or which milestone it's at, use the **last milestone actually completed**, NOT the current stage. The relevant fields:
- \`furthest_milestone_completed\` (STRING, e.g. "75% Electrical Trimout") — the most recent milestone the job has finished. This is the truthful indicator of progress.
- \`days_since_last_milestone\` (INT64) — days since that last-completed milestone happened. Use this for "stuck longest", "stalled jobs", milestone aging, etc.
- \`current_stage\` represents the stage a job is *working in* (and may carry the same label even when no completion has happened in months); it should NOT be used to answer "what milestone is this job at" or "how long has progress been stuck".
These fields live on \`brite_homes_staging.stg_centralized_data_enriched\` (and its sibling staging views). Prefer them whenever progress, aging, or "stuck" questions come up.

## Marketing / listing status (CRITICAL real-estate vocabulary)
- "Listed" / "on the market" = a home is in the listing agent inventory with an MLS number. The source is \`brite_homes_raw.listing_agent_inventory\`; treat a job as "listed" when \`sale_mls\` IS NOT NULL (for sale) OR \`lease_mls\` IS NOT NULL (for rent), and "listed as rental" when \`listed_as_rental\` is true / \`lease_mls\` populated.
- "Not listed" / "unlisted" / "not yet on the market" = a job whose job_id has NO row in \`listing_agent_inventory\` with sale_mls or lease_mls populated. Use a LEFT JOIN ... WHERE listing.sale_mls IS NULL AND listing.lease_mls IS NULL, or a NOT EXISTS / anti-join against \`listing_agent_inventory\`. The join key is job_id (= job_no).
- Disambiguation rule: when a question uses both "listed" AND a place ("listed in palm coast", "not listed in cape coral"), interpret "listed" as the MLS/inventory sense and the place as a city/community filter — NOT as "located in <place>". For example, "CO'd but not listed in Palm Coast" means: city = Palm Coast AND job_type = CO'd-not-closed AND NOT in the listing inventory.
- "Listed for sale" = sale_mls populated. "Listed for rent" = lease_mls populated or listed_as_rental flag set. "Sale listed date" / "lease listed date" come from \`sale_listed_date\` / \`leased_date\`.

## Domains and where the data lives (prefer marts; use staging/raw for detail)
- Construction / lifecycle: per-job stage, completion_pct, wip, superintendent, days_since_last_milestone. Enriched per-job rows: brite_homes_staging.stg_centralized_data_enriched and brite_homes_marts.dim_job_conformed. Portfolio totals: brite_homes_marts.mart_daily_summary.
- Sales: buyer_name, sale_price, status, sold_date, scheduled_closing.
- Property management (rentals): unit / tenant, status (occupied/vacant), market_rent, actual_rent, past_due, deposit, lease dates. Tables named property_management_* (e.g. property_management_unit_360 / snapshots).
- Loans: lender, loan_amount, total_drawn, draw_pct, loan_days_until_expiration.
- P&L / margin (Assurance / Audit): brite_homes_marts.mart_audit_pl. SELECT P&L columns DIRECTLY — they are native, canonical SQL columns (do NOT reconstruct by summing line items).

  TWO Net Profit definitions exist — surface both when answering "what's the P&L for X":
    (1) **net_profit / net_margin** — "Audit Net Profit". Formula: sale_price - total_cost.
        Contract-side view. Matches the "Audits" tab in the Investor Audits / BPOF Audits Google Sheets.
    (2) **net_profit_estimated_final / net_margin_estimated_final** — "Estimated Final Net Profit".
        Formula: sale_price - construction_costs_summary_est - total_other_expenses_est.
        Matches the "Summary" tab's "Estimated, final accounting P&L" view — what the operations team treats as the working final estimate.
        DEDUCTS additional post-close costs (property tax, COGS-closing, commissions, warranty) that the Audit Net Profit ignores.
        Caveat: the Summary tab supports a manual sale_price override per job (e.g., $292,900 vs the contract $299,900 for 00241-000042) that the mart cannot capture. When sale_price differs from the operator's working number, our estimated_final will differ from theirs proportionally. State this when relevant.

  Operator-final cost categories (deducted in net_profit_estimated_final but NOT in net_profit):
  - property_taxes_on_hud_est ($1,000 flat — HUD line item)
  - cogs_closing_costs_est ($1,500 flat — distinct from closing_cost line item)
  - cogs_commission_internal_est (sale_price × 2%)
  - cogs_commission_external_est (sale_price × 3%)
  - warranty_coverage_est ($500 flat — 2-10 home warranty)
  - total_other_expenses_est (sum of above + seller_credit + total_financing)
  - construction_costs_summary_est (sum of lot_land + permitting_total + cost_site_work + total_vertical + cost_options + builder_fee + insurance + closing_cost)

  Other columns:
  - Revenue: sale_price, net_revenue, seller_credit, proceeds
  - Cost rollups (Audits semantics): construction_costs, overhead, other_expenses, total_direct_cost, total_indirect_cost, total_cost, gross_margin, cost_to_sale
  - Sheet-only (NULL for jobs not in Investor/BPOF Audits sheets): proceeds, cost_to_sale, amount_drawn, sheet_loan_amount, sheet_lender, bgh_total, bgh_margin
  - Flags: margin_status ('good'|'watch'|'at-risk'|'loss'|'missing revenue'|'missing cost') — based on net_margin (Audits). data_quality_flag, pl_readiness.
  - Provenance: pl_source ('sheet' = authoritative from Investor/BPOF Audits Google Sheets; 'computed' = derived by summing line items from stale audit_* tables).
  - Line items: lot_land, permitting (single)/permitting_total (rolled), cost_site_work, cost_vertical, total_vertical (rolled), cost_options, closing_cost, financing, insurance, warranty, builder_fee, dirt_total, dumpsters, env_total, utilities_total, monthly_interest, total_ap, actual_vertical, actual_site_work.
  - Margin thresholds (for Audit margin_status): net_margin < 0 → loss; 0 ≤ x < 0.08 → at-risk; 0.08 ≤ x < 0.12 → watch; ≥ 0.12 → good. For Estimated Final margin, apply the same thresholds to net_margin_estimated_final.
- Exceptions: priority (P1/P2), exception_type, days_outstanding.

## KPI definitions (compute consistently with the dashboard)
- WIP = SUM(wip). Loan exposure = SUM(loan_amount). Drawn = SUM(total_drawn). Jobs with loans = COUNT(loan_amount > 0).
- Avg completion = AVG(completion_pct) over rows where it is populated.
- Over budget = rows where original_budget AND job_cost_amount are populated AND job_cost_amount > original_budget.
- Sales value = SUM(sale_price). Contracts = count of sales rows. 45-day closings = rows with a closing date in the next 45 days.
- Occupancy = occupied units / total units. Past due = SUM(past_due).
- Net profit = net_revenue - total_cost (only rows with both populated). Weighted margin = SUM(net_profit) / SUM(net_revenue) over rows that have BOTH revenue and cost. Rows MISSING revenue are EXCLUDED from margin/profit averages (they are cost-audit-only).
- At-risk jobs = margin_status IN ('loss','at-risk','watch'). Negative margin = net_margin < 0.
- Expiring loans = loan_days_until_expiration between 1 and 30.

## Caveats
- Margin / profitability lives ONLY in the P&L audit data (mart_audit_pl), NOT in the sales tables.
- mart_audit_pl combines two sources. Authoritative: 160 rows sourced from the "Construction audits" tab on Centralized Data 2.0 — which IMPORTRANGE-consolidates the per-portfolio Audits tabs from Investor Audits + BPOF Audits Google Sheets. These flow through brite_homes_raw.audit_pl_summary (refreshed nightly by refresh-raw-transforms.js, same as construction_milestones etc.). Tagged pl_source='sheet'. Fallback: 323 rows sourced from the stale audit_* manual upload (pl_source='computed') — mostly land/lot records. If a job is in neither, the answer is "no P&L data available" — do NOT fabricate.
- When answering P&L for a specific job, surface pl_source so the user knows whether the number came from the operations team's curated sheet or from a stale 3/17 snapshot.
- completion_pct, WIP, budget/actual, superintendent, and loan fields are partially populated. Answer from rows where the field exists and note when coverage is partial.
- Use _mart_refreshed_at / snapshot timestamps to state data freshness when relevant.`;
