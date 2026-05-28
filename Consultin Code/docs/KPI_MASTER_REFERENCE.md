# KPI Master Reference

> **⚠ Canonical reference has moved.** For the current authoritative KPI catalogue,
> dashboard architecture, and data model, see **[`DASHBOARD_KPI_REFERENCE.md`](./DASHBOARD_KPI_REFERENCE.md)**.
> This file remains for deep per-KPI field-mapping detail useful in warehouse audits.

Cross-reference this list against every new client's warehouse audit to determine which KPIs are supportable. Each KPI lists the required fields, the recommended source layer, and the minimum completeness threshold to ship.

## How To Use

1. Run the warehouse audit for the client.
2. For each KPI below, check if the required fields meet the threshold.
3. Mark each KPI as `ready`, `partial`, or `blocked`.
4. Only design dashboard components for `ready` KPIs.
5. Use `partial` KPIs for supporting detail views with caveats.
6. Do not ship `blocked` KPIs.

---

## Domain 1: Construction Progress & Milestones

### CP-01: Jobs by Stage
- Description: Count of active jobs grouped by current construction stage
- Required fields: `current_stage`, `job_id`
- Minimum threshold: `current_stage` ≥ 60% complete
- Recommended source: `construction_milestones` (raw) or `mart_lot_pipeline`
- Chart type: Horizontal bar or Kanban board

### CP-02: Completion Percentage / Milestone Progress Distribution
- Description: Histogram or average completion across active jobs. Use ERP milestone progress when available; use task completion percentage only as a documented fallback.
- Required fields: Preferred: `progress_percent`, `progress_milestone`, `job_id`. Fallback: `completion_pct`, `job_id`.
- Minimum threshold: `progress_percent` or fallback `completion_pct` >= 50% complete
- Recommended source: `construction_milestones` (raw), ERP schedule table, or `mart_lot_pipeline`
- Chart type: Histogram or gauge

### CP-03: Milestone Tracker by Job
- Description: Gantt or timeline view showing key milestone dates per job
- Required fields: `job_start`, `clear_lot_date`, `build_pad_date`, `pour_slab_date`, `block_house_date`, `frame_house_date`, `dry_in_roof_date`, `insulate_house_date`, `drywall_house_date`, `flooring_install_date`, `cabinet_install_date`, `hot_check_date`, `ac_startup_date`, `receive_co_date`, `completion_date`
- Minimum threshold: At least 5 milestone date fields ≥ 40% complete each
- Recommended source: `construction_milestones` (raw)
- Chart type: Gantt chart or milestone timeline

### CP-04: Average Cycle Time (Start to Completion)
- Description: Average days from job start to completion, by community or plan
- Required fields: `start_to_completion_days`, `community`, `plan_name`
- Minimum threshold: `start_to_completion_days` ≥ 50% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Bar chart, grouped by community or plan

### CP-05: Phase Cycle Times
- Description: Average days per construction phase (start→pad, block→insulation, etc.)
- Required fields: `start_to_pad_days`, `block_to_insulation_days`, `insulation_to_flooring_days`, `flooring_to_hot_check_days`, `hot_check_to_completion_days`
- Minimum threshold: At least 3 phase fields ≥ 35% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Stacked bar or waterfall

### CP-06: Jobs by Type
- Description: Breakdown of job types (Lot, Permitting, Construction In Progress, Completed, Closed, etc.)
- Required fields: `job_type`, `job_id`
- Minimum threshold: `job_type` ≥ 90% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Donut or bar

### CP-07: Superintendent Workload
- Description: Number of active jobs per superintendent
- Required fields: `superintendent`, `job_type` or `current_stage`
- Minimum threshold: `superintendent` ≥ 50% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Bar chart

### CP-08: Project Manager Workload
- Description: Number of active jobs per project manager
- Required fields: `project_manager`, `job_type` or `current_stage`
- Minimum threshold: `project_manager` ≥ 40% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Bar chart

### CP-09: Overdue Lots (Days Past Target Close)
- Description: Lots where today > target close date and no actual close date
- Required fields: `closing_date` or `completion_date`, `closed_date`
- Minimum threshold: `closing_date` ≥ 40% complete, `closed_date` ≥ 50% complete
- Recommended source: `construction_milestones` (raw) or `mart_lot_pipeline`
- Chart type: Table with severity color coding

### CP-10: Stage Duration Outliers
- Description: Jobs stuck in a stage longer than the community/plan average
- Required fields: `current_stage`, `current_stage_code`, plus at least one milestone date
- Minimum threshold: `current_stage` ≥ 60% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Scatter or flagged table

### CP-11: Stacked Cycle Time by City
- Description: Horizontal stacked bar per city showing days spent in each construction phase
- Required fields: Milestone date fields (phase durations), `city`
- Minimum threshold: At least 3 phase fields ≥ 35% complete, `city` ≥ 90%
- Recommended source: `construction_milestones` (raw)
- Chart type: Stacked horizontal bar

### CP-12: Cycle Time Trendline
- Description: Average cycle time over time with goal line, labeled On Track / At Risk
- Required fields: `start_to_completion_days`, `job_start` or `completion_date`
- Minimum threshold: `start_to_completion_days` ≥ 50% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Area chart

### CP-13: Completions Over Time
- Description: Cumulative completions vs goal over time
- Required fields: `completion_date`
- Minimum threshold: `completion_date` ≥ 40% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Area chart

### CP-14: Homes in Construction
- Description: Active construction job count trending over time
- Required fields: `job_type`, `job_start`, `completion_date`
- Minimum threshold: `job_type` ≥ 90%, `job_start` ≥ 40%
- Recommended source: `construction_milestones` (raw)
- Chart type: Area chart

### CP-15: Gantt Chart by Job
- Description: Milestone-level Gantt showing days per construction stage for individual jobs
- Required fields: Milestone date fields, `job_id`
- Minimum threshold: At least 5 milestone date fields ≥ 40% complete each
- Recommended source: `construction_milestones` (raw)
- Chart type: Gantt / timeline

### CP-16: Days Between Milestones by City
- Description: Sparkline cards per city showing average days between milestones vs goal
- Required fields: Milestone date fields, `city`
- Minimum threshold: At least 3 phase fields ≥ 35% complete, `city` ≥ 90%
- Recommended source: `construction_milestones` (raw)
- Chart type: Sparkline cards

### CP-17: Avg Cycle Time Ratio per Super
- Description: Bar chart comparing superintendent efficiency (avg cycle time ratio)
- Required fields: `superintendent`, `start_to_completion_days`
- Minimum threshold: `superintendent` ≥ 50%, `start_to_completion_days` ≥ 50%
- Recommended source: `construction_milestones` (raw)
- Chart type: Bar chart

### CP-18: Completion Trendline
- Description: Multi-line chart showing plumbing→completion, insulation→completion, hot check→completion trends over time
- Required fields: `insulate_house_date`, `hot_check_date`, `completion_date`, plus plumbing milestone
- Minimum threshold: At least 3 milestone date fields ≥ 40% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Multi-line chart

---

## Domain 2: Financial / Job Profitability

### FP-01: Budget vs Actual by Job
- Description: Side-by-side comparison of original budget vs actual job cost
- Required fields: `original_budget`, `job_cost_amount`
- Minimum threshold: Both ≥ 30% complete with non-zero values
- Recommended source: `construction_milestones` (raw) or `mart_job_profitability`
- Chart type: Bar chart or table

### FP-02: Variance by Job
- Description: Budget minus actual cost, flagging over-budget jobs. If the metric compares committed POs only against budgeted scope with sent POs, label it `PO Variance` and document the scoped denominator.
- Required fields: Full variance: `variance_in_flight` or (`original_budget` AND `job_cost_amount`). PO-scoped variance: `po_sent_budget_total`, `committed_po_total`, `job_id`.
- Minimum threshold: Full variance field or PO-scoped fields >= 30% complete
- Recommended source: `construction_milestones` (raw) or `mart_job_profitability`
- Chart type: Bar chart with positive/negative coloring

### FP-03: WIP (Work In Progress) Summary
- Description: Total WIP across all active jobs, optionally split by community
- Required fields: `wip`, `community`
- Minimum threshold: `wip` ≥ 50% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI card + breakdown table

### FP-04: WIP Without Lot Cost
- Description: WIP excluding lot acquisition cost, for construction-only exposure
- Required fields: `wip_without_lot`
- Minimum threshold: `wip_without_lot` ≥ 50% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI card

### FP-05: Lot Cost Summary
- Description: Total lot costs across inventory, by community or county
- Required fields: `lot_cost`, `community`
- Minimum threshold: `lot_cost` ≥ 80% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI card + bar chart

### FP-06: Equity Position
- Description: Equity value per job or aggregated by community
- Required fields: `equity`
- Minimum threshold: `equity` ≥ 30% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI card + table

### FP-07: Margin Analysis by Community
- Description: Average margin (budget - actual) / budget grouped by community
- Required fields: `original_budget`, `job_cost_amount`, `community`
- Minimum threshold: Both financial fields ≥ 30% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Bar chart

### FP-08: Margin Analysis by Plan
- Description: Average margin grouped by plan name / elevation
- Required fields: `original_budget`, `job_cost_amount`, `plan_name`
- Minimum threshold: Both financial fields ≥ 30% complete, `plan_name` ≥ 60%
- Recommended source: `construction_milestones` (raw)
- Chart type: Bar chart

---

## Domain 3: Loan & Draw Tracking

### LN-01: Loan Exposure Summary
- Description: Total loan amounts outstanding, total drawn, remaining availability
- Required fields: `loan_amount`, `total_drawn`
- Minimum threshold: Both ≥ 20% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI cards

### LN-02: Draw Percentage by Job
- Description: Total drawn / loan amount per job
- Required fields: `loan_amount`, `total_drawn`, `job_id`
- Minimum threshold: Both ≥ 20% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Progress bars or table

### LN-03: Loans Approaching Expiration
- Description: Jobs where loan_days_until_expiration is under threshold
- Required fields: `loan_days_until_expiration`, `lender`, `job_id`
- Minimum threshold: `loan_days_until_expiration` ≥ 15% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Alert table

### LN-04: Lender Distribution
- Description: Count of jobs and total loan exposure by lender
- Required fields: `lender`, `loan_amount`
- Minimum threshold: `lender` ≥ 20% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Donut or bar

### LN-05: Interest Rate Distribution
- Description: Distribution of interest rates across active loans
- Required fields: `interest_rate`
- Minimum threshold: `interest_rate` ≥ 20% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Histogram or table

### LN-06: Lender Count
- Description: Number of active lending relationships
- Required fields: `lender`
- Minimum threshold: `lender` ≥ 20% complete
- Recommended source: `construction_milestones` (raw, loan fields)
- Chart type: KPI card

### LN-07: Total Drawn vs Exposure
- Description: Comparison of total drawn amount to total loan exposure
- Required fields: `total_drawn`, `loan_amount`
- Minimum threshold: Both ≥ 20% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI cards

---

## Domain 4: Sales & Closings

### SL-01: Sales by Status
- Description: Count of sales by current status (active, cancelled, closed, etc.)
- Required fields: `status`
- Minimum threshold: `status` ≥ 60% complete
- Recommended source: `sales` (raw)
- Chart type: Donut or bar

### SL-02: Sales Pipeline Value
- Description: Total sale_price of active/pending contracts
- Required fields: `sale_price`, `status`
- Minimum threshold: `sale_price` ≥ 50% non-zero, `status` ≥ 60% complete
- Recommended source: `sales` (raw)
- Chart type: KPI card

### SL-03: Sales by Community
- Description: Count and total value of sales per community
- Required fields: `community`, `sale_price`
- Minimum threshold: `community` ≥ 90%, `sale_price` ≥ 40%
- Recommended source: `sales` (raw)
- Chart type: Bar chart

### SL-04: Closing Pipeline
- Description: Upcoming closings by month/week based on projected close date
- Required fields: `projected_close`, `sale_price`
- Minimum threshold: `projected_close` ≥ 40% complete
- Recommended source: `sales` (raw) joined with `construction_milestones`
- Chart type: Timeline or bar by month

### SL-05: Sales by Plan
- Description: Count and average price per plan name
- Required fields: `plan_name`, `sale_price`
- Minimum threshold: `plan_name` ≥ 60%, `sale_price` ≥ 40%
- Recommended source: `sales` (raw)
- Chart type: Table or bar

### SL-06: Buyer Absorption Rate
- Description: Sales velocity — new contracts per month over time
- Required fields: `contract_date`
- Minimum threshold: `contract_date` ≥ 40% complete with date spread
- Recommended source: `sales` (raw)
- Chart type: Line chart

### SL-07: Cancellation Rate
- Description: Percentage of contracts cancelled vs total contracts
- Required fields: `cancellation_date`, `contract_date`, `status`
- Minimum threshold: `status` ≥ 60% complete
- Recommended source: `sales` (raw)
- Chart type: KPI card

### SL-08: Sales Distribution by City
- Description: Sales count or value broken down by city
- Required fields: `city`, `sale_price`
- Minimum threshold: `city` ≥ 90%, `sale_price` ≥ 40%
- Recommended source: `sales` / `xlsx_sales_full` (raw)
- Chart type: Donut

### SL-09: Sales Trendline
- Description: Total sales value over time
- Required fields: `sale_price`, `contract_date` or `close_date`
- Minimum threshold: `sale_price` ≥ 50%, date field ≥ 40%
- Recommended source: `sales` (raw)
- Chart type: Line chart

### SL-10: Top Agents
- Description: Ranked list of agents by name and sales volume
- Required fields: `agent_name`, `sale_price`
- Minimum threshold: `agent_name` ≥ 50%, `sale_price` ≥ 40%
- Recommended source: `xlsx_sales_full` (raw)
- Chart type: Ranked table

### SL-11: Homes Sold by Entity×Year
- Description: Cross-tab with entity rows and year columns showing homes sold
- Required fields: `company_name` or `entity`, `close_date` or `contract_date`
- Minimum threshold: Entity field ≥ 80%, date field ≥ 40%
- Recommended source: `xlsx_sales_full` (raw)
- Chart type: Cross-tab table

### SL-12: Avg Sales Price by City
- Description: Multi-line chart of average sale price trends per city over time
- Required fields: `city`, `sale_price`, `contract_date` or `close_date`
- Minimum threshold: `city` ≥ 90%, `sale_price` ≥ 50%, date field ≥ 40%
- Recommended source: `sales` (raw)
- Chart type: Multi-line chart

### SL-13: Year-over-Year CO'ed
- Description: Bar chart comparing completions (certificates of occupancy) per year
- Required fields: `receive_co_date` or `completion_date`
- Minimum threshold: Date field ≥ 40% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Grouped bar chart

### SL-14: Homes Under Contract Trend
- Description: Count of homes put under contract over time
- Required fields: `contract_date`, `status`
- Minimum threshold: `contract_date` ≥ 40%, `status` ≥ 60%
- Recommended source: `sales` (raw)
- Chart type: Bar chart

---

## Domain 5: Geographic / Portfolio

### GE-01: Jobs by County
- Description: Count and value of jobs per Florida county
- Required fields: `county`, `job_id`
- Minimum threshold: `county` ≥ 90% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Map or bar chart

### GE-02: Jobs by City
- Description: Count of jobs per city
- Required fields: `city`, `job_id`
- Minimum threshold: `city` ≥ 90% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Table or map

### GE-03: Jobs by Company / Division
- Description: Portfolio breakdown by legal entity (company_name or division_name)
- Required fields: `company_name`, `job_id`
- Minimum threshold: `company_name` ≥ 90% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: Donut or bar

### GE-04: Community Summary Dashboard
- Description: One-row-per-community summary with lot count, active jobs, avg cycle time, avg cost
- Required fields: `community`, `job_type`, `start_to_completion_days`, `wip`
- Minimum threshold: `community` ≥ 90%, at least 2 metric fields ≥ 40%
- Recommended source: `construction_milestones` (raw)
- Chart type: Summary table

---

## Domain 6: Vendor Scorecard

### VN-01: Total PO Value by Vendor
- Required fields: `vendor_name`, `po_amount`
- Minimum threshold: Both ≥ 80% complete
- Recommended source: `vendors` (raw) or `mart_vendor_scorecard`

### VN-02: Vendor Variance
- Required fields: Invoice variance requires `vendor_name`, `po_amount`, `invoiced_amount`. PO exposure variance may use `vendor_name`, `po_amount`, committed PO totals, and the chosen budget denominator.
- Minimum threshold: Fields used by the selected denominator >= 70% complete
- Label rule: use invoice wording only when invoice fields are populated. Use PO exposure or PO variance wording when invoice fields are unavailable.

### VN-03: Open PO Count by Vendor
- Required fields: `vendor_name`, `status`, `po_number`
- Minimum threshold: All three ≥ 70% complete

### VN-04: Vendor Ranking
- Required fields: `vendor_name`, `avg_variance_pct`, `total_po_value`
- Minimum threshold: All ≥ 70% complete

> Note: Vendor data requires PO-level source data. If the ERP does not expose PO data, this entire domain is blocked.

---

## Domain 7: Exception Center

### EX-01: Exceptions by Severity
- Required fields: `severity`, `exception_type`
- Minimum threshold: Both ≥ 90% complete, at least HIGH or MEDIUM severity present
- Recommended source: `mart_exception_center`
- Chart type: Donut or count cards

### EX-02: Exceptions by Type
- Required fields: `exception_type`, `affected_entity`
- Minimum threshold: `exception_type` ≥ 90% complete
- Chart type: Bar chart

### EX-03: Exception Aging
- Required fields: `days_outstanding`, `severity`
- Minimum threshold: `days_outstanding` ≥ 80% complete, non-zero values present
- Chart type: Table or histogram

### EX-04: High-Priority Follow-Up Queue
- Required fields: `severity`, `affected_entity`, `exception_type`, `days_outstanding`
- Minimum threshold: HIGH severity rows exist
- Chart type: Filtered table

---

## Domain 8: Land Acquisition

### LA-01: Active Deals
- Description: Count of lots currently under contract
- Required fields: `deal_status`, `lot_id`
- Minimum threshold: `deal_status` ≥ 60% complete
- Recommended source: `land_acquisition_active` (raw)
- Chart type: KPI card

### LA-02: Closed Acquisitions
- Description: Total lots acquired (closed)
- Required fields: `deal_status`, `lot_id`
- Minimum threshold: `deal_status` ≥ 60% complete
- Recommended source: `land_acquisition_closed` (raw)
- Chart type: KPI card

### LA-03: Cancel Rate
- Description: Percentage of deals cancelled vs total (closed + cancelled)
- Required fields: `deal_status`
- Minimum threshold: `deal_status` ≥ 60% complete
- Recommended source: `land_acquisition_cancelled` (raw)
- Chart type: KPI card with alert tone

### LA-04: Acquisition by City
- Description: Lot count per city for closed acquisitions
- Required fields: `city`, `lot_id`
- Minimum threshold: `city` ≥ 90% complete
- Recommended source: `land_acquisition_closed` (raw)
- Chart type: Ranked bars

### LA-05: Lot Price Trend
- Description: Average contract price over time by city
- Required fields: `contract_price`, `closing_date`, `city`
- Minimum threshold: `contract_price` ≥ 50%, `closing_date` ≥ 40%, `city` ≥ 90%
- Recommended source: `land_acquisition_closed` (raw)
- Chart type: Multi-line chart

### LA-06: Pipeline by Year×City
- Description: Cross-tab of acquisitions per year per city
- Required fields: `closing_date`, `city`
- Minimum threshold: `closing_date` ≥ 40%, `city` ≥ 90%
- Recommended source: `land_acquisition_closed` (raw)
- Chart type: Cross-tab table

### LA-07: Subdivision Pipeline
- Description: Count and status of development projects in the subdivision pipeline
- Required fields: `project_name`, `project_status`, `lot_count`
- Minimum threshold: `project_status` ≥ 60% complete
- Recommended source: `subdivision_pipeline` (raw)
- Chart type: Table

### LA-08: Under Contract Distribution
- Description: Active deals distributed by city and type
- Required fields: `city`, `deal_type`, `lot_id`
- Minimum threshold: `city` ≥ 90%, `deal_type` ≥ 60%
- Recommended source: `land_acquisition_active` (raw)
- Chart type: Donut

---

## Domain 9: Permitting

### PT-01: In Permitting
- Description: Count of jobs with type "Permitting"
- Required fields: `job_type`, `job_id`
- Minimum threshold: `job_type` ≥ 90% complete
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI card

### PT-02: Avg Permitting Days
- Description: Average days from job_start for permitting jobs
- Required fields: `job_type`, `job_start`
- Minimum threshold: `job_type` ≥ 90%, `job_start` ≥ 40%
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI card

### PT-03: Stuck Permits
- Description: Count of permitting jobs >90 days without progress
- Required fields: `job_type`, `job_start`, `current_stage`
- Minimum threshold: `job_type` ≥ 90%, `job_start` ≥ 40%
- Recommended source: `construction_milestones` (raw)
- Chart type: KPI card with alert tone

### PT-04: Permits by Stage
- Description: Distribution of permitting jobs by current_stage
- Required fields: `job_type`, `current_stage`
- Minimum threshold: `job_type` ≥ 90%, `current_stage` ≥ 60%
- Recommended source: `construction_milestones` (raw)
- Chart type: Donut

### PT-05: Permits by City
- Description: Count of permitting jobs per city
- Required fields: `job_type`, `city`
- Minimum threshold: `job_type` ≥ 90%, `city` ≥ 90%
- Recommended source: `construction_milestones` (raw)
- Chart type: Ranked bars

### PT-06: Permitting Cycle Time by City
- Description: Table showing average days per permitting sub-stage per city
- Required fields: `job_type`, `city`, milestone date fields
- Minimum threshold: `job_type` ≥ 90%, `city` ≥ 90%, at least 2 milestone fields ≥ 35%
- Recommended source: `construction_milestones` (raw)
- Chart type: Compact table

### PT-07: Environmental Issues
- Description: Count of environmental concerns by type (gopher tortoise, tree survey, etc.)
- Required fields: `gopher_tortoise_survey`, `tree_survey`
- Minimum threshold: At least one environmental field ≥ 20% complete
- Recommended source: `land_acquisition` data (raw)
- Chart type: Compact table

### PT-08: Year×City Starts
- Description: Cross-tab of permitting starts per year per city
- Required fields: `job_type`, `job_start`, `city`
- Minimum threshold: `job_type` ≥ 90%, `job_start` ≥ 40%, `city` ≥ 90%
- Recommended source: `construction_milestones` (raw)
- Chart type: Cross-tab table

---

## Domain 10: Per-Job P&L Audits

### PL-01: Audit Roster Count
- Description: Total number of jobs with detailed cost audit data (audit_costs joined with milestones)
- Required fields: `audit_costs.Row_Labels`, `construction_milestones.job_id`
- Minimum threshold: `Row_Labels` ≥ 30%
- Recommended source: `mart_audit_pl` or JOIN of milestones + 8 audit tables
- Chart type: KPI card

### PL-02: Per-Job Pro Forma P&L
- Description: Estimated P&L per job showing Lot/Land, Permitting, Site Work, Vertical, Builder Fee, Insurance, Closing Cost, Contingency, Other Expenses, Total Cost, Net Profit, Net Margin
- Required fields: `audit_costs.*` (Lot, Permitting, Site_Work, Vertical, Options, Closing_Cost, Financing), `audit_dirt.*`, `audit_dumpsters.*`, `audit_utilities.*`, `audit_total_ap.*`, `audit_bbg_ap.*`, `sales.sale_price`
- Minimum threshold: `audit_costs.Row_Labels` ≥ 30%
- Recommended source: `mart_audit_pl`
- Chart type: Pro forma card (editable, configurable defaults)

### PL-03: Net Margin Distribution
- Description: Distribution of net margin percentages across all audited jobs, identifying at-risk (negative margin) jobs
- Required fields: Same as PL-02
- Minimum threshold: Same as PL-02
- Recommended source: `mart_audit_pl`
- Chart type: KPI card (at-risk count) + roster table sorted by worst margin

---

## Domain 11: Property Management

### PM-01: Portfolio Summary
- Description: Total units under management, occupancy rate, total monthly rent, vacancy count
- Required fields: `pm_master.status`, `pm_master.rent`, `pm_master.mkt_rent`
- Minimum threshold: `status` ≥ 80%, `rent` ≥ 60%
- Recommended source: `pm_master` (raw)
- Chart type: KPI cards (4: Total Units, Occupancy Rate, Monthly Revenue, Vacancies)

### PM-02: Occupancy by Status
- Description: Breakdown of properties by status (Leased, Make Ready, Vacant, Eviction)
- Required fields: `pm_master.status`
- Minimum threshold: `status` ≥ 80%
- Recommended source: `pm_master` (raw)
- Chart type: Donut chart

### PM-03: Delinquency Tracking
- Description: Count and total value of delinquent tenants, grouped by days past due
- Required fields: `pm_delinquency.past_due`, `pm_delinquency.balance`, `pm_delinquency.tenant`
- Minimum threshold: Table exists with ≥ 5 rows
- Recommended source: `pm_delinquency` (raw)
- Chart type: KPI card (count + total) + compact table

### PM-04: Revenue by City
- Description: Monthly rent revenue grouped by city/market
- Required fields: `pm_master.city`, `pm_master.rent`
- Minimum threshold: `city` ≥ 80%, `rent` ≥ 60%
- Recommended source: `pm_master` (raw)
- Chart type: Ranked bars

### PM-05: Property Roster
- Description: Full property inventory with tenant details, rent, deposit, past due, receivable, management %
- Required fields: `pm_master.address`, `pm_master.city`, `pm_master.owner`, `pm_master.bd_ba`, `pm_master.sqft`, `pm_master.status`, `pm_master.tenant`, `pm_master.mkt_rent`, `pm_master.rent`, `pm_master.deposit`
- Minimum threshold: `address` ≥ 90%
- Recommended source: `pm_master` (raw)
- Chart type: SpreadsheetTable (Pipeline tab)

---

## Quick Reference: Minimum Field Requirements Per Domain

| Domain | Key Fields | Min Completeness |
|--------|-----------|-----------------|
| Construction Progress | current_stage, completion_pct, milestone dates | 40-60% |
| Job Profitability | original_budget, job_cost_amount, variance_in_flight | 30% |
| Loan Tracking | lender, loan_amount, total_drawn, loan_days_until_expiration | 20% |
| Sales | sale_price, status, contract_date, projected_close, agent_name | 40-60% |
| Geographic | county, city, company_name | 90% |
| Vendor Scorecard | vendor_name, po_amount, invoiced_amount | 70% |
| Exception Center | severity, exception_type, days_outstanding | 80% |
| Land Acquisition | deal_status, contract_price, closing_date, city | 40-90% |
| Permitting | job_type, job_start, current_stage, city | 40-90% |
| Per-Job P&L Audits | audit_costs.*, sale_price, milestones.job_id | 30% |
| Property Management | pm_master.status, rent, city, address | 60-90% |
