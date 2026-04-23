# KPI List — AI Reference for Dashboard Creation

> **⚠ Canonical reference has moved.** For the current authoritative KPI catalogue,
> dashboard architecture, and data model, see **[`DASHBOARD_KPI_REFERENCE.md`](./DASHBOARD_KPI_REFERENCE.md)**.
> This file remains as a historical snapshot of the 83-KPI taxonomy; the live
> system now tracks 45 dashboard KPIs (Layer A) + 105 validation KPIs (Layer B).

Use this list when building a new client dashboard. Each KPI includes the ID, name, domain, required data fields, and recommended chart type.

---

## Domain 1: Construction Progress & Milestones (18 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| CP-01 | Jobs by Stage | `current_stage`, `job_id` | Horizontal bar / Kanban |
| CP-02 | Completion % Distribution | `completion_pct`, `job_id` | Histogram / Gauge |
| CP-03 | Milestone Tracker by Job | `job_start`, `clear_lot_date`, `build_pad_date`, `pour_slab_date`, `block_house_date`, `frame_house_date`, `dry_in_roof_date`, `insulate_house_date`, `drywall_house_date`, `flooring_install_date`, `cabinet_install_date`, `hot_check_date`, `ac_startup_date`, `receive_co_date`, `completion_date` | Gantt / Timeline |
| CP-04 | Avg Cycle Time (Start→Completion) | `start_to_completion_days`, `community`, `plan_name` | Bar chart by community/plan |
| CP-05 | Phase Cycle Times | `start_to_pad_days`, `block_to_insulation_days`, `insulation_to_flooring_days`, `flooring_to_hot_check_days`, `hot_check_to_completion_days` | Stacked bar / Waterfall |
| CP-06 | Jobs by Type | `job_type`, `job_id` | Donut / Bar |
| CP-07 | Superintendent Workload | `superintendent`, `job_type` or `current_stage` | Bar chart |
| CP-08 | Project Manager Workload | `project_manager`, `job_type` or `current_stage` | Bar chart |
| CP-09 | Overdue Lots | `closing_date` or `completion_date`, `closed_date` | Table with severity colors |
| CP-10 | Stage Duration Outliers | `current_stage`, `current_stage_code`, milestone dates | Scatter / Flagged table |
| CP-11 | Stacked Cycle Time by City | Milestone date fields (phase durations), `city` | Stacked horizontal bar |
| CP-12 | Cycle Time Trendline | `start_to_completion_days`, `job_start` or `completion_date` | Area chart |
| CP-13 | Completions Over Time | `completion_date` | Area chart |
| CP-14 | Homes in Construction | `job_type`, `job_start`, `completion_date` | Area chart |
| CP-15 | Gantt Chart by Job | Milestone date fields, `job_id` | Gantt / Timeline |
| CP-16 | Days Between Milestones by City | Milestone date fields, `city` | Sparkline cards |
| CP-17 | Avg Cycle Time Ratio per Super | `superintendent`, `start_to_completion_days` | Bar chart |
| CP-18 | Completion Trendline | `insulate_house_date`, `hot_check_date`, `completion_date`, plumbing milestone | Multi-line chart |

---

## Domain 2: Financial / Job Profitability (8 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| FP-01 | Budget vs Actual by Job | `original_budget`, `job_cost_amount` | Bar chart / Table |
| FP-02 | Variance by Job | `variance_in_flight` or (`original_budget` + `job_cost_amount`) | Bar chart (pos/neg) |
| FP-03 | WIP Summary | `wip`, `community` | KPI card + table |
| FP-04 | WIP Without Lot Cost | `wip_without_lot` | KPI card |
| FP-05 | Lot Cost Summary | `lot_cost`, `community` | KPI card + bar |
| FP-06 | Equity Position | `equity` | KPI card + table |
| FP-07 | Margin Analysis by Community | `original_budget`, `job_cost_amount`, `community` | Bar chart |
| FP-08 | Margin Analysis by Plan | `original_budget`, `job_cost_amount`, `plan_name` | Bar chart |

---

## Domain 3: Loan & Draw Tracking (7 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| LN-01 | Loan Exposure Summary | `loan_amount`, `total_drawn` | KPI cards |
| LN-02 | Draw % by Job | `loan_amount`, `total_drawn`, `job_id` | Progress bars / Table |
| LN-03 | Loans Approaching Expiration | `loan_days_until_expiration`, `lender`, `job_id` | Alert table |
| LN-04 | Lender Distribution | `lender`, `loan_amount` | Donut / Bar |
| LN-05 | Interest Rate Distribution | `interest_rate` | Histogram / Table |
| LN-06 | Lender Count | `lender` | KPI card |
| LN-07 | Total Drawn vs Exposure | `total_drawn`, `loan_amount` | KPI cards |

---

## Domain 4: Sales & Closings (14 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| SL-01 | Sales by Status | `status` | Donut / Bar |
| SL-02 | Sales Pipeline Value | `sale_price`, `status` | KPI card |
| SL-03 | Sales by Community | `community`, `sale_price` | Bar chart |
| SL-04 | Closing Pipeline | `projected_close`, `sale_price` | Timeline / Bar by month |
| SL-05 | Sales by Plan | `plan_name`, `sale_price` | Table / Bar |
| SL-06 | Buyer Absorption Rate | `contract_date` | Line chart |
| SL-07 | Cancellation Rate | `cancellation_date`, `contract_date`, `status` | KPI card |
| SL-08 | Sales Distribution by City | `city`, `sale_price` | Donut |
| SL-09 | Sales Trendline | `sale_price`, `contract_date` or `close_date` | Line chart |
| SL-10 | Top Agents | `agent_name`, `sale_price` | Ranked table |
| SL-11 | Homes Sold by Entity×Year | `entity`, `close_date` or `contract_date` | Cross-tab table |
| SL-12 | Avg Sales Price by City | `city`, `sale_price`, `contract_date` or `close_date` | Multi-line chart |
| SL-13 | Year-over-Year CO'ed | `receive_co_date` or `completion_date` | Grouped bar chart |
| SL-14 | Homes Under Contract Trend | `contract_date`, `status` | Bar chart |

---

## Domain 5: Geographic / Portfolio (4 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| GE-01 | Jobs by County | `county`, `job_id` | Map / Bar |
| GE-02 | Jobs by City | `city`, `job_id` | Table / Map |
| GE-03 | Jobs by Company/Division | `company_name`, `job_id` | Donut / Bar |
| GE-04 | Community Summary Dashboard | `community`, `job_type`, `start_to_completion_days`, `wip` | Summary table |

---

## Domain 6: Vendor Scorecard (4 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| VN-01 | Total PO Value by Vendor | `vendor_name`, `po_amount` | Bar / Table |
| VN-02 | Vendor Variance (Invoice vs PO) | `vendor_name`, `po_amount`, `invoiced_amount` | Bar / Table |
| VN-03 | Open PO Count by Vendor | `vendor_name`, `status`, `po_number` | Table |
| VN-04 | Vendor Ranking | `vendor_name`, `avg_variance_pct`, `total_po_value` | Ranked table |

> ⚠ Requires PO-level source data from ERP. Entire domain blocked if unavailable.

---

## Domain 7: Exception Center (4 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| EX-01 | Exceptions by Severity | `severity`, `exception_type` | Donut / Count cards |
| EX-02 | Exceptions by Type | `exception_type`, `affected_entity` | Bar chart |
| EX-03 | Exception Aging | `days_outstanding`, `severity` | Table / Histogram |
| EX-04 | High-Priority Follow-Up Queue | `severity`, `affected_entity`, `exception_type`, `days_outstanding` | Filtered table |

---

## Domain 8: Land Acquisition (8 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| LA-01 | Active Deals | `deal_status`, `lot_id` | KPI card |
| LA-02 | Closed Acquisitions | `deal_status`, `lot_id` | KPI card |
| LA-03 | Cancel Rate | `deal_status` | KPI card (alert tone) |
| LA-04 | Acquisition by City | `city`, `lot_id` | Ranked bars |
| LA-05 | Lot Price Trend | `contract_price`, `closing_date`, `city` | Multi-line chart |
| LA-06 | Pipeline by Year×City | `closing_date`, `city` | Cross-tab table |
| LA-07 | Subdivision Pipeline | `project_name`, `project_status`, `lot_count` | Table |
| LA-08 | Under Contract Distribution | `city`, `deal_type`, `lot_id` | Donut |

---

## Domain 9: Permitting (8 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| PT-01 | In Permitting | `job_type`, `job_id` | KPI card |
| PT-02 | Avg Permitting Days | `job_type`, `job_start` | KPI card |
| PT-03 | Stuck Permits | `job_type`, `job_start`, `current_stage` | KPI card (alert tone) |
| PT-04 | Permits by Stage | `job_type`, `current_stage` | Donut |
| PT-05 | Permits by City | `job_type`, `city` | Ranked bars |
| PT-06 | Permitting Cycle Time by City | `job_type`, `city`, milestone date fields | Compact table |
| PT-07 | Environmental Issues | `gopher_tortoise_survey`, `tree_survey` | Compact table |
| PT-08 | Year×City Starts | `job_type`, `job_start`, `city` | Cross-tab table |

---

## Domain 10: Per-Job P&L Audits (3 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| PL-01 | Audit Roster Count | `audit_costs.Row_Labels`, `construction_milestones.job_id` | KPI card |
| PL-02 | Per-Job Pro Forma P&L | `audit_costs.*` (Lot, Permitting, Site_Work, Vertical, Options, Closing_Cost, Financing), `audit_dirt.*`, `audit_dumpsters.*`, `audit_utilities.*`, `audit_total_ap.*`, `audit_bbg_ap.*`, `sales.sale_price` | Pro forma card |
| PL-03 | Net Margin Distribution | Same as PL-02 | KPI card + roster table |

---

## Domain 11: Property Management (5 KPIs)

| ID | KPI Name | Required Fields | Chart Type |
|----|----------|----------------|------------|
| PM-01 | Portfolio Summary | `pm_master.status`, `pm_master.rent`, `pm_master.mkt_rent` | KPI cards (4) |
| PM-02 | Occupancy by Status | `pm_master.status` | Donut |
| PM-03 | Delinquency Tracking | `pm_delinquency.past_due`, `pm_delinquency.balance`, `pm_delinquency.tenant` | KPI card + table |
| PM-04 | Revenue by City | `pm_master.city`, `pm_master.rent` | Ranked bars |
| PM-05 | Property Roster | `pm_master.address`, `city`, `owner`, `bd_ba`, `sqft`, `status`, `tenant`, `mkt_rent`, `rent`, `deposit` | Spreadsheet table |

---

## Summary: 83 KPIs across 11 Domains

| Domain | Count |
|--------|-------|
| Construction Progress & Milestones | 18 |
| Financial / Job Profitability | 8 |
| Loan & Draw Tracking | 7 |
| Sales & Closings | 14 |
| Geographic / Portfolio | 4 |
| Vendor Scorecard | 4 |
| Exception Center | 4 |
| Land Acquisition | 8 |
| Permitting | 8 |
| Per-Job P&L Audits | 3 |
| Property Management | 5 |
| **Total** | **83** |

---

## Minimum Field Completeness by Domain

| Domain | Key Fields | Min Completeness |
|--------|-----------|-----------------|
| Construction Progress | current_stage, completion_pct, milestone dates | 40–60% |
| Job Profitability | original_budget, job_cost_amount, variance_in_flight | 30% |
| Loan Tracking | lender, loan_amount, total_drawn, loan_days_until_expiration | 20% |
| Sales | sale_price, status, contract_date, projected_close, agent_name | 40–60% |
| Geographic | county, city, company_name | 90% |
| Vendor Scorecard | vendor_name, po_amount, invoiced_amount | 70% |
| Exception Center | severity, exception_type, days_outstanding | 80% |
| Land Acquisition | deal_status, contract_price, closing_date, city | 40–90% |
| Permitting | job_type, job_start, current_stage, city | 40–90% |
| Per-Job P&L Audits | audit_costs.*, sale_price, milestones.job_id | 30% |
| Property Management | pm_master.status, rent, city, address | 60–90% |
