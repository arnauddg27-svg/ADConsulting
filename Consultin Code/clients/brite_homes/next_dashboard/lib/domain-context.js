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
- "Spec" = builder-owned / speculative home.
- current_stage is the milestone bucket WITH a percentage prefix, e.g. "75% Electrical Trimout", "100%. Receive CO".

#### job_type — the canonical lifecycle classifier (CRITICAL)
The \`job_type\` column on \`stg_centralized_data_*\` is the ground-truth lifecycle label for each home. There are exactly **9 possible values** across the whole portfolio:

| job_type                       | Meaning                                              | "Closed"? |
|--------------------------------|------------------------------------------------------|-----------|
| SFR Completed & Closed         | Single-family home built AND sold (cash transferred) | **YES**   |
| SFR Completed (not closed)     | Built, has C/O, but NOT yet sold                     | **NO**    |
| Leased: Property Management    | Operator kept the home and is renting it             | **NO** (no sale will happen) |
| SFR Construction In Progress   | Still being built                                    | NO        |
| Permitting                     | Pre-construction, in permit phase                    | NO        |
| POs Released                   | POs issued, work not yet started                     | NO        |
| On Hold                        | Paused                                               | NO        |
| Development                    | Land development phase                               | NO        |
| Lot                            | Just a lot, no home yet                              | NO        |

#### "Closed" vs "Not closed" — canonical filters
- **"Closed"** (sold for cash) = \`job_type = 'SFR Completed & Closed'\`. Equivalent to \`sales_status IN ('Closed', 'Sold')\`.
- **"Not closed"** (any home that hasn't been sold yet) = \`job_type != 'SFR Completed & Closed'\` (or \`job_type NOT LIKE '%& Closed'\`). Equivalent to \`sales_status IS NULL OR sales_status NOT IN ('Closed', 'Sold')\`.
  - Includes ALL of: Leased rentals, SFR Completed (not closed), SFR Construction In Progress, Permitting, POs Released, On Hold, Development, Lot.
  - **WHEN A USER ASKS "show me homes not closed" for a project/area** (e.g. "YKOS homes not closed", "Brite homes not closed in Ocala") — use \`job_type != 'SFR Completed & Closed'\`. **Do NOT narrow to just "Leased: Property Management"** — that excludes the standing-inventory "SFR Completed (not closed)" homes, which are the most operationally important ones to highlight.
- **"CO'ed not closed" / "coed" / "CO'd"** = a specific subset of "not closed": only \`job_type = 'SFR Completed (not closed)'\` (built, has C/O, awaiting sale).
- **"Active construction"** = \`job_type IN ('SFR Construction In Progress', 'Permitting', 'POs Released', 'On Hold')\`.
- **"Standing inventory"** = \`job_type IN ('SFR Completed (not closed)', 'Leased: Property Management')\` (homes done but not sold — either rented or sitting).
- **Sales-table "closed"** (separate from job_type): in \`sales\` / \`sales_master\`, \`sales_status\` CONTAINS "closed"; "open" = does NOT contain "closed".

When in doubt about which job_type values qualify, run \`SELECT DISTINCT job_type FROM brite_homes_staging.stg_centralized_data_current\` first — the 9 values above are the only ones that exist.

#### Ownership — who owns a property (CRITICAL)
Two columns answer "who owns X":

1. **Default — \`area_name\`** (on \`stg_centralized_data_current\`, \`dim_job_conformed\`, etc.).
   For ALL questions like "who owns 4820 SW 159TH LANE ROAD" or "what does YKOS own" — \`area_name\` is the owning entity.
   The 24 owning entities in the warehouse: 'Brite Properties of Florida' (670), 'DLP/Milestone' (80), 'Florida Sun Partners II, LLC' (77), 'Milestone Management Group' (76), 'Briten Citrus, LLC' (50), 'Brite Life, LLC' (44), 'Founders Capital, LLC' (35), 'Briten Marion, LLC' (33), 'Brite Legacy LLC' (30), 'Second Avenue' (23), 'YKOS JV, LLC' (16), 'Go Life Development LLC' (15), 'JJ Long Investment Homes' (14), 'Florida BTR 2 Project, LLC' (13), 'Brite Equities LLC' (11), 'Florida BTR 1 Project, LLC' (10), 'RL Palm Bay, LLC' (10), 'AD Homes' (10), 'Florida Vertical Holdings, LLC' (8), 'Brite Life Ventures, LLC' (8), 'Segev Family Investments, LLC' (7), 'FSP Wedgefield, LLC' (5), 'Florida BTR 3 Project, LLC' (4), 'Red Mill Pointe, LLC' (1).

2. **EXCEPTION — properties in the property-management pipeline:**
   For homes that appear in \`brite_homes_marts.property_management_unit_360\` (or \`_snapshot\`), the canonical owner is the \`owner\` column on THAT table — NOT \`area_name\`. The PM-tracked owner may differ from the construction-side area entity because operators sometimes assign management to a sister LLC or external partner.
   - To check if a property is in the PM pipeline: \`SELECT 1 FROM brite_homes_marts.property_management_unit_360 WHERE job_no = X\`. If a row exists, use that table's \`owner\` column.
   - "All properties owned by X" / "what does X own": LEFT JOIN dim_job_conformed (or stg_centralized_data_current) to property_management_unit_360 on job_no, then COALESCE(pm.owner, area_name) as effective_owner.

3. **MLS-listed name (third-party context only):** \`brite_homes_raw.listing_agent_inventory.owner_of_record\` is the proper-case owner string from the MLS listing. Use only when explicitly asked "who's listed as owner on MLS" — otherwise prefer the canonical owner (1) or PM-owner (2).

#### Entity-name normalization (heads-up)
The same entity may appear with slightly different formatting across systems:
- "YKOS JV, LLC" (construction-side, with comma) vs "YKOS JV LLC" (PM-side, no comma).
- "Brite Properties of Florida" (614 jobs) vs "Brite Properties of Florida, LLC" (42 jobs) — same operator.
- "Briten Marion, LLC" vs "Briten Marion LLC".
For "what does X own" filtering, prefer \`area_name\` (the construction-side canonical) and use LIKE / UPPER+REPLACE patterns when matching across both tables (e.g. \`UPPER(REGEXP_REPLACE(area_name, '[,.]', '')) = UPPER(REGEXP_REPLACE(pm.owner, '[,.]', ''))\` to bridge). When DISPLAYING the owner, show whichever name appears on the source row — surface the cosmetic difference only if the user asks why.

#### "Is X property listed?" — answering listing questions (CRITICAL — read carefully)

The \`listing_agent_inventory\` table mixes SALE-side and LEASE-side state on one row. Several columns need careful parsing — the wrong reading will give the user a misleading answer (e.g. showing the SALE price as "current" when the sale listing was terminated and the home is already leased).

**Column meanings (precise):**
- \`sale_mls\` — FREE TEXT. May contain just the MLS number ("OM716771") OR the MLS number followed by a status suffix on a new line / appended ("OM716731\\nTerminated", "OM716858 LISTING FOR SALE CANCELLED ON 05/12/2025"). Parse the SUFFIX to derive sale-listing status.
- \`lease_mls\` — FREE TEXT, same pattern. May include "Terminated" / "Cancelled" suffix or just the bare MLS number.
- \`under_contract\` (BOOL) — sale-side: a buyer is under contract but hasn't closed yet.
- \`sold\` (BOOL) — sale-side TERMINAL state: the home has been sold. \`sold_price\` + \`closing_sold_date\` populated.
- \`listed_as_rental\` (BOOL) — operator marked the property as rental-track.
- \`leased\` (BOOL) — lease-side TERMINAL state: a tenant is in the home. \`leased_date\` populated.
- \`current_price\` (FLOAT64) — **SALE-side asking price ONLY**. Even when the sale listing is terminated, this column still holds the LAST asked sale price (now stale). **It is NOT the rent.**
- \`starting_price\` / \`price_reduction\` / \`price_reduced_on_date\` — also sale-side only.
- \`dom\` — days on market for the sale-side listing.

**The warehouse does NOT store monthly rent.** There is no rent / lease_price / monthly_rent column anywhere in listing_agent_inventory or in any related table. If the user asks "how much for rent", say so explicitly AND offer to web_search the lease MLS (e.g. "OM718049") on Zillow/Realtor — the public listing carries the rent amount.

**Derived listing status (use this CASE expression in your SQL when listing status matters):**
\`\`\`sql
CASE
  WHEN sold = TRUE THEN 'sold'                                                  -- sold for cash (terminal)
  WHEN leased = TRUE THEN 'leased'                                              -- rented out (terminal)
  WHEN under_contract = TRUE THEN 'sale_under_contract'                         -- sale in progress
  WHEN LOWER(sale_mls) LIKE '%terminated%' OR LOWER(sale_mls) LIKE '%cancel%' THEN
       CASE WHEN lease_mls IS NOT NULL AND TRIM(lease_mls) != '' AND LOWER(lease_mls) NOT LIKE '%terminated%' AND LOWER(lease_mls) NOT LIKE '%cancel%' THEN 'sale_terminated_listed_for_rent'
            ELSE 'sale_terminated' END
  WHEN sale_mls IS NOT NULL AND TRIM(sale_mls) != '' AND lease_mls IS NOT NULL AND TRIM(lease_mls) != '' THEN 'dual_listed_sale_and_rent'
  WHEN sale_mls IS NOT NULL AND TRIM(sale_mls) != '' THEN 'for_sale'
  WHEN lease_mls IS NOT NULL AND TRIM(lease_mls) != '' THEN 'for_rent'
  ELSE 'not_listed'
END AS listing_status
\`\`\`

**Step-by-step answer procedure for "Is [address] listed?":**

1. **Query the warehouse FIRST**:
   \`\`\`sql
   SELECT job_id, site_address, sale_mls, lease_mls, current_price, starting_price,
          dom, under_contract, sold, sold_price, closing_sold_date,
          listed_as_rental, leased, leased_date, listing_agent, signor, sale_listed_date,
          /* derived listing_status as above */ ...
   FROM brite_homes_raw.listing_agent_inventory
   WHERE LOWER(site_address) LIKE LOWER('%<street part of address>%')
   \`\`\`
   Match on a substring of the address (zip codes vary across rows; street name + number is usually enough).

2. **Interpret the row** by listing_status — pick the right narrative:
   - \`sold\` → "This home was sold on \`closing_sold_date\` for \`sold_price\`. The sale closed."
   - \`leased\` → "This home is **currently leased** (rented out) as of \`leased_date\`. Lease MLS: \`lease_mls\`. (Sale listing was terminated en route, if applicable — note it for context.)"
   - \`sale_under_contract\` → "A buyer is under contract on the sale (MLS \`sale_mls\`). Closing date pending."
   - \`sale_terminated_listed_for_rent\` → "The sale listing (\`sale_mls\`) was terminated. The home is now listed for rent under MLS \`lease_mls\`. Sale asking price was \`current_price\` before termination — note this is stale and does NOT represent the rent."
   - \`sale_terminated\` (no lease) → "The sale listing (\`sale_mls\`) was terminated. Last asking price was \`current_price\` (stale). No rental listing currently."
   - \`dual_listed_sale_and_rent\` → "Listed BOTH for sale (\`sale_mls\` at \`current_price\`) AND for rent (\`lease_mls\`)."
   - \`for_sale\` → "Listed for sale at \`current_price\`. MLS \`sale_mls\`. \`dom\` days on market."
   - \`for_rent\` → "Listed for rent only (MLS \`lease_mls\`). \`current_price\` is sale-side and NOT applicable here — we don't store the monthly rent."
   - \`not_listed\` → "Not currently listed for sale or rent in our records."

3. **Always include**:
   - Listing agent (\`listing_agent\`) and signor (\`signor\`) — operator wants to know who's handling it.
   - Owner (\`owner_of_record\` from this table — MLS-recorded name).
   - Job number (\`job_id\`).

4. **If the user asks for the RENT amount** and the status is \`leased\`, \`sale_terminated_listed_for_rent\`, \`dual_listed_sale_and_rent\`, or \`for_rent\`:
   Say "We don't store the monthly rent in the warehouse — only the sale-side price. Let me look up MLS \`lease_mls\` publicly." THEN use \`web_search\` with a query like: \`"OM718049" rent Ocala FL\` or \`"242 Marion Oaks Golf Rd 34473" for rent zillow OR realtor\`. Report the rent if found.

5. **If the warehouse does NOT have the property** (zero rows from step 1), use \`web_search\` to check public MLS aggregators:
   - "[full street address] [city] [state] for sale OR rent zillow OR realtor OR redfin"
   - "[street address] MLS listing"
   Report: site (Zillow/Realtor/etc.), listing status (active/pending/sold/off-market), price if visible, last-updated date.

6. **Do NOT fabricate.** If web_search returns nothing relevant, say "I couldn't find a public listing for this address" — don't guess. If sources disagree (e.g. our warehouse says leased, Zillow still shows active), surface the disagreement.

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
- brite_homes_raw.listing_agent_inventory — MLS listing data + per-job listing operations metadata. See "Marketing/listing status" section above. Columns include: job_id, site_address, owner_of_record, sale_mls, sale_listed_date, dom (days on market), current_price, starting_price, price_reduction, price_reduced_on_date, under_contract, effective_date, sold, closing_sold_date, sold_price, listed_as_rental, lease_mls, leased, leased_date, notes, tax_id, prop_description, model_number, signor, **signor_email**, **keybox_combo_code**, **listing_agent**. Use \`listing_agent\` to answer "who's the listing agent for X" / "how many properties is agent Y listing".

### P&L / Audit
- **brite_homes_marts.mart_audit_pl** (88 cols, 483 rows) — PRIMARY P&L. SELECT P&L columns DIRECTLY, do not reconstruct.

  **TWO Net Profit definitions exist** — surface both when answering "what's the P&L for X":
    (1) \`net_profit\` / \`net_margin\` — "Audit Net Profit". Formula: sale_price - total_cost. Contract-side view. Matches the "Audits" tab.
    (2) \`net_profit_estimated_final\` / \`net_margin_estimated_final\` — "Estimated Final Net Profit". Formula: sale_price - construction_costs_summary_est - total_other_expenses_est. Matches the "Summary" tab's "Estimated, final accounting P&L". DEDUCTS additional post-close costs (property tax, COGS-closing, commissions, warranty).
        Operator-recorded Sales Price overrides are captured via \`sale_price_override\` (sourced from the "Sale Price Overrides" tab on Centralized Data 2.0). When the override exists, the mart's \`sale_price\` flows from the override and the estimated_final matches the operator's Summary-tab number exactly. Surface \`sale_price_override\` and \`sale_price_override_notes\` when an override applies.

  Operator-final cost categories (in net_profit_estimated_final, NOT net_profit). When asked about a job's "estimated final" or "post-close" costs, ALWAYS itemize ALL of these — not just construction costs:
  - property_taxes_on_hud_est ($1,000 flat policy constant)
  - **seller_credit** (per-job, from audit_pl_summary — typically $10,000 but varies; ALWAYS list this when itemizing post-close costs)
  - cogs_closing_costs_est ($1,500 flat policy constant)
  - cogs_commission_internal_est (sale_price × 2%)
  - cogs_commission_external_est (sale_price × 3%)
  - warranty_coverage_est ($500 flat policy constant — 2-10 home warranty)
  - total_financing (per-job, from audit_pl_summary)
  - total_other_expenses_est = sum of ALL of the above
  - construction_costs_summary_est = lot_land + permitting_total + cost_site_work + total_vertical + cost_options + builder_fee + insurance + closing_cost

  Break-even sale price + margin buffer — PRECOMPUTED native mart columns. SELECT them; do NOT compute manually:
  - \`break_even_sale_price_audit\` — Audit basis break-even (= total_cost).
  - \`break_even_sale_price_estimated_final\` — Estimated Final basis break-even, computed exactly as (construction_costs_summary_est + property_taxes_on_hud_est + seller_credit + cogs_closing_costs_est + warranty_coverage_est + total_financing) / 0.95 (the 0.95 accounts for 2%+3% COGS commissions scaling with sale_price).
  - \`margin_buffer_audit\` — sale_price - break_even_sale_price_audit (== net_profit, but reported as cash headroom).
  - \`margin_buffer_estimated_final\` — sale_price - break_even_sale_price_estimated_final. Slightly differs from net_profit_estimated_final because lowering sale also lowers commissions proportionally; this is the TRUE headroom before reaching break-even.
  - \`margin_buffer_pct_estimated_final\` — margin_buffer_estimated_final / sale_price. The % discount the sale could absorb before hitting break-even.

  Hypothetical "what-if sale price" questions (e.g. "what's the net profit if we sold for $X?"):
  - DO NOT use precomputed estimated_final columns directly — they assume the CURRENT sale_price. The 2%+3% commissions scale with sale, so at a different sale they'd change.
  - Recompute on the fly: estimated_final at sale X = X - construction_costs_summary_est - (property_taxes_on_hud_est + seller_credit + cogs_closing_costs_est + warranty_coverage_est + total_financing + X*0.02 + X*0.03)
  - Audit basis is linear: net_profit at sale X = X - total_cost.

## STANDARD P&L RESPONSE TEMPLATE
When asked about a job's P&L, break-even, or "can we sell at $X" — ALWAYS return ALL of the following structure. Do not omit sections or skip items:

  ### Sale + Status
    Address, Job_No, Sales_Status, Furthest Milestone, current sale_price (call out sale_price_override if present).

  ### Net Profit (both bases)
    Audit basis:           net_profit ($, margin %)
    Estimated Final basis: net_profit_estimated_final ($, margin %)

  ### Cost Breakdown (Construction sum — itemize)
    Lot/Land, Permitting Total, Site Work, Total Vertical, Options, Builder Fee, Insurance, Closing Cost = Construction Costs Summary

  ### Post-Close Costs (Estimated Final additions — ALWAYS itemize ALL of these)
    Property taxes (HUD): $1,000
    Seller credit: $X     ← from mart.seller_credit column. ALWAYS list this even if $0.
    COGS-Closing Costs: $1,500
    COGS-Commission Internal (2%): $X
    COGS-Commission External (3%): $X
    Warranty coverage: $500
    Total Financing: $X
    = Total Other Expenses: $X

  ### Break-Even + Buffer
    Audit basis break-even:           $break_even_sale_price_audit
    Estimated Final basis break-even: $break_even_sale_price_estimated_final
    Margin buffer (Audit):            $margin_buffer_audit
    Margin buffer (Est Final):        $margin_buffer_estimated_final ($) / margin_buffer_pct_estimated_final (%)

  ### Caveats (when applicable — surface ALL that apply)
    - Override applied: when mart.sale_price_override IS NOT NULL, say so + show sale_price_override_notes.
    - **Incomplete cost data**: when pl_data_complete = FALSE, ALWAYS warn — "this job's construction is still in an early phase (Permitting / pre-vertical), so the reported P&L only reflects costs incurred so far. Future construction costs ($150-$300K typical) are NOT in total_cost yet, so the margin shown is INFLATED. Do not use this to make pricing decisions until vertical construction is recorded." Affects ~3 jobs currently.
    - Stale fallback: if pl_source = 'computed', say "this row comes from the stale 3/17 audit_* fallback".
    - Rental property: if job_type contains 'Leased: Property Management', note this — revenue comes from rent, not sale, so sale_price-based P&L is misleading.
    - Provenance: pl_source_sheet ('investor_audits' vs 'bpof_audits').

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
- **brite_homes_raw.audit_costs / audit_dirt / audit_dumpsters / audit_env / audit_utilities / audit_total_ap / audit_bbg_ap / audit_vertical_sitework_actual** — 3/17 manual snapshot. Used internally as fallback by mart_audit_pl for jobs not in audit_pl_summary (323/465 rows, mostly land/lot entries). DO NOT query directly. mart_audit_pl.pl_source='computed' flags those rows. The granular cost line items have NO equivalent on Centralized Data 2.0 — to refresh them, an operator would need to add a consolidated "Costs" tab.
- **brite_homes_raw.land_acquisition_active / _cancelled / _closed**, brite_homes_raw.subdivision_pipeline — separate land-acquisition data domain (legacy 3/18).
- **brite_homes_marts.mart_exception_center** — 608-row 3/17 legacy table, only referenced by unified_exception_center (v1). Use unified_exception_center_v2 for current exceptions.
- **brite_homes_marts.unified_exception_center** (v1) — kept because v2 depends on it for the legacy_audit branch. Query v2 instead.
- **brite_homes_raw.takeoff_compare** — plan-level (no job_id), all-STRING (autodetect failed on duplicate headers). Only query for plan-level pricing comparisons.

Dropped tables (no longer exist, do NOT query): xlsx_sales_full (use sales_master or stg_sales_full_compat), pm_master, pm_delinquency, cd2_permitting, lot_cost (use lot_cost_lookup), exception_summary_by_source (use _v2), audits_snapshot (use audit_pl_summary), vendors.

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
