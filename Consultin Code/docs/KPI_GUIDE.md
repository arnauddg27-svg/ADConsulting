# Homebuilder Dashboard KPI Guide

> **⚠ Canonical reference has moved.** For the current authoritative KPI catalogue,
> dashboard architecture, and data model, see **[`DASHBOARD_KPI_REFERENCE.md`](./DASHBOARD_KPI_REFERENCE.md)**.
> This file remains for plain-language KPI narratives useful in client-facing collateral.

A plain-language guide to every metric we track across the builder operations platform. Organized by the lifecycle stage you'll find them in.

---

## 1. Land Acquisition

The land section tracks how your company sources, contracts, and closes on buildable lots.

| KPI | What It Tells You |
|-----|-------------------|
| **Active Deals** | How many lots you currently have under contract but haven't closed on yet. A healthy pipeline means future inventory. |
| **Closed Acquisitions** | Total lots you've purchased. Tracks your acquisition pace over time. |
| **Cancel Rate** | What percentage of your land deals fall through. High rates signal due diligence issues, market shifts, or seller problems. |
| **Acquisition by City** | Where you're buying. Helps identify geographic concentration risk or expansion opportunities. |
| **Lot Price Trend** | Are lot prices going up or down in each market? Critical for pro forma accuracy and knowing when to lock in deals. |
| **Pipeline by Year & City** | A cross-tab showing how many lots you closed each year in each city. Reveals growth patterns and market timing. |
| **Subdivision Pipeline** | Status of your development projects — how many lots are platted, under development, or ready to build. |
| **Under Contract Distribution** | Breaks down your active deals by city and type so you can see where your near-term inventory is coming from. |

---

## 2. Permitting

Permitting tracks jobs from land acquisition through government approvals to construction-ready status.

| KPI | What It Tells You |
|-----|-------------------|
| **In Permitting** | How many jobs are currently waiting on permits. A growing number may signal government bottlenecks. |
| **Avg Permitting Days** | How long permits take on average. Varies heavily by jurisdiction — this helps you plan realistic timelines. |
| **Stuck Permits** | Jobs that have been in permitting for 90+ days without progress. These need immediate attention. |
| **Permits by Stage** | Where in the permitting process your jobs are sitting (submitted, under review, approved, etc.). |
| **Permits by City** | Which cities have the most permits in process. Helps allocate admin resources. |
| **Permitting Cycle Time by City** | Average days per sub-stage broken down by city. Reveals which jurisdictions are slow and where. |
| **Environmental Issues** | Flags like gopher tortoise surveys, tree surveys, or wetland concerns that can delay or kill a project. |
| **Year & City Starts** | How many permits you've started per year in each city. Shows your growth trajectory by market. |

---

## 3. Loans & Draw Tracking

The loan section monitors your construction financing — how much you've borrowed, drawn, and have remaining.

| KPI | What It Tells You |
|-----|-------------------|
| **Loan Exposure Summary** | Your total outstanding loan amounts, how much you've drawn, and what's still available. The big picture of your debt position. |
| **Draw % by Job** | How much of each loan has been drawn down. Jobs near 100% drawn with low completion are a red flag. |
| **Loans Approaching Expiration** | Loans that will expire soon. These need extensions or payoffs — missing an expiration date is expensive. |
| **Lender Distribution** | Which banks hold your loans and how much exposure you have with each. Diversification matters. |
| **Interest Rate Distribution** | The spread of rates across your portfolio. Helps understand your blended cost of capital. |
| **Lender Count** | How many active lending relationships you maintain. Too few = concentration risk, too many = relationship dilution. |
| **Total Drawn vs Exposure** | Compares what you've actually used against your total credit lines. Shows how leveraged you are. |

---

## 4. Construction Progress & Milestones

The core of operations — tracking every job from dirt to CO (Certificate of Occupancy).

**Current standard:** when an ERP exposes milestone progress, the dashboard should use that milestone progress as the primary job-completion signal. Task completion percentage is still useful for work queues, but it should not be treated as the same KPI. A good progress display shows both the percent and the milestone name, such as `25% Block House`.

### Pipeline & Status

| KPI | What It Tells You |
|-----|-------------------|
| **Jobs by Stage** | How many homes are at each construction stage (slab, framing, drywall, etc.). Shows your pipeline flow and bottlenecks. |
| **Milestone Progress** | How far each job has moved through the ERP milestone sequence. Prefer this over completed-task percentage when the ERP provides it. |
| **Completion % Distribution** | Are most jobs clustered at the beginning, middle, or end? Use milestone completion when available; use task completion only as a documented fallback. |
| **Jobs by Type** | Breakdown of Lot, Permitting, Construction, Completed, and Closed jobs. Your full inventory picture. |
| **Homes in Construction** | How many active builds you have trending over time. Indicates whether you're scaling up or winding down. |
| **Completions Over Time** | Cumulative homes completed vs your goal. Are you hitting your delivery targets? |
| **Overdue Lots** | Jobs past their target completion date. These are costing you money every day in carry costs. |

### Cycle Time (How Long Things Take)

| KPI | What It Tells You |
|-----|-------------------|
| **Avg Cycle Time** | The average number of days from job start to completion. The single most important efficiency metric for a builder. |
| **Phase Cycle Times** | How long each construction phase takes (start→pad, framing→drywall, etc.). Pinpoints where you're losing time. |
| **Stacked Cycle Time by City** | Compares phase durations across cities side by side. Instantly shows which markets are slower and in which phases. |
| **Cycle Time Trendline** | Is your cycle time getting better or worse over time? Shows quarterly trends with a goal line. |
| **Completion Trendline** | Three trend lines showing how long it takes from key milestones (foundation, framing, finishes) to completion. |
| **Days Between Milestones by City** | Mini sparkline cards for each city showing whether specific phase durations are on track or at risk. |
| **Stage Duration Outliers** | Jobs stuck in a phase longer than the community average. These are your problem children — investigate them. |

### People & Accountability

| KPI | What It Tells You |
|-----|-------------------|
| **Superintendent Workload** | How many active jobs each super is managing. Overloaded supers = slower builds and more mistakes. |
| **Project Manager Workload** | Same concept for PMs. Balanced workloads lead to better oversight. |
| **Avg Cycle Time Ratio per Super** | Compares superintendent efficiency. Who's consistently delivering faster or slower than average? |

### Job-Level Detail

| KPI | What It Tells You |
|-----|-------------------|
| **Milestone Tracker by Job** | A timeline/Gantt view of every milestone date for a specific job. The complete build story. |
| **Gantt Chart by Job** | Visual representation of how long each stage took for individual jobs. Great for post-mortem analysis. |

---

## 5. Cost Metrics & Job Profitability

Financial performance at the job and portfolio level.

**Current standard:** every budget, actual, and variance metric must name its denominator. If the dashboard compares committed POs only against the budgeted scope that has sent POs, label it `PO Variance` and show `PO Budget`. Do not present sent-PO variance as full job-budget variance.

| KPI | What It Tells You |
|-----|-------------------|
| **Budget vs Actual by Job** | Are you building homes for what you estimated? The gap between budget and actual cost is your variance. |
| **Variance by Job** | Dollar amount over or under budget per job. The dashboard must disclose whether this is full budget vs actual, budget vs committed POs, or only sent-PO scope. |
| **PO Variance** | Budgeted task scope with sent POs minus committed POs. Positive means remaining budget on sent-PO scope; negative means committed POs exceed that scoped budget. |
| **WIP Summary** | Total Work In Progress dollars — your capital tied up in unfinished homes. |
| **WIP Without Lot Cost** | Same as WIP but excluding lot cost. Shows pure construction exposure. |
| **Lot Cost Summary** | Total capital tied up in land across your portfolio. |
| **Equity Position** | Your equity in each job or community. Equity = Value - Debt. |
| **Margin by Community** | Average profit margin per community. Shows which neighborhoods make you money and which don't. |
| **Margin by Plan** | Average profit margin per floor plan. Tells you which house designs are most profitable. |

---

## 6. Sales & Closings

Everything from contract signing through closing day.

| KPI | What It Tells You |
|-----|-------------------|
| **Sales by Status** | How many contracts are active, pending, closed, or cancelled. Your sales pipeline at a glance. |
| **Sales Pipeline Value** | Total dollar value of active/pending contracts. Your future revenue. |
| **Sales by Community** | Which communities are selling and how much revenue each is generating. |
| **Closing Pipeline** | Upcoming closings by month. Tells you when cash is coming in. |
| **Sales by Plan** | Which floor plans sell best and at what price. Informs future product mix decisions. |
| **Buyer Absorption Rate** | How many new contracts you're signing per month. Your sales velocity — the heartbeat of the business. |
| **Cancellation Rate** | What percentage of buyers back out. High cancellation rates signal pricing, market, or qualification issues. |
| **Sales by City** | Revenue and volume broken down by market. Where's the demand? |
| **Sales Trendline** | Total sales value over time. Are you growing, flat, or declining? |
| **Top Agents** | Which sales agents are producing. Performance accountability. |
| **Homes Sold by Entity & Year** | Cross-tab showing which legal entities sold how many homes each year. Important for multi-entity builders. |
| **Avg Sales Price by City** | Price trends per market over time. Are prices rising or compressing? |
| **Year-over-Year COs** | How many certificates of occupancy (completed homes) per year. Your delivery track record. |
| **Homes Under Contract Trend** | Contract volume over time. Leading indicator of future closings. |

---

## 7. Per-Job P&L Audits

Detailed profitability analysis at the individual job level — your financial X-ray.

| KPI | What It Tells You |
|-----|-------------------|
| **Audit Roster Count** | How many jobs have full cost audit data available. More coverage = better financial visibility. |
| **Per-Job Pro Forma P&L** | A complete profit & loss statement for each home: revenue (sale price), direct costs (lot, permitting, site work, vertical construction, options), indirect costs (builder fee, insurance, closing costs, contingency), and the bottom line (net profit and margin). This is the most granular financial view available. |
| **Net Margin Distribution** | Shows the spread of profit margins across all audited jobs. Identifies at-risk (negative margin) jobs that need immediate attention. Target: 14-20% net margin for a healthy operation. |

---

## 8. Property Management

For builders who hold rental inventory — tracking units, tenants, and revenue.

| KPI | What It Tells You |
|-----|-------------------|
| **Portfolio Summary** | The big four: total units, occupancy rate, monthly rent revenue, and vacancy count. Your rental business at a glance. |
| **Occupancy by Status** | Breakdown of units by status — leased, make ready, vacant, eviction. Healthy portfolios are 90%+ leased. |
| **Delinquency Tracking** | Which tenants are behind on rent, how much they owe, and how long they've been delinquent. Cash flow risk. |
| **Revenue by City** | Monthly rental income per market. Shows which markets generate the most return. |
| **Property Roster** | The full inventory: every unit with address, tenant, rent, deposit, square footage, and status. Your master list. |

---

## 9. Geographic & Portfolio Views

Cross-cutting views that span all sections.

| KPI | What It Tells You |
|-----|-------------------|
| **Jobs by County** | Geographic spread of your operations. Useful for tax planning and jurisdictional awareness. |
| **Jobs by City** | Same view at the city level. Your operational footprint. |
| **Jobs by Entity** | Which legal entities own which jobs. Critical for multi-entity builders with different LLCs per community. |
| **Community Summary** | One row per community showing lot count, active jobs, avg cycle time, and avg cost. The executive snapshot. |

---

## 10. Vendor Scorecard

Tracks your trade partners' performance and cost.

Vendor metrics are only as strong as the PO and invoice fields exposed by the source system. If invoice actuals are unavailable, the dashboard should describe the scorecard as PO exposure, not invoice performance.

| KPI | What It Tells You |
|-----|-------------------|
| **Total PO Value by Vendor** | How much you're spending with each trade. Identifies your biggest vendor relationships. |
| **Vendor Variance** | Difference between committed PO scope and the chosen budget or invoice denominator. Only use invoice language when invoice fields are populated. |
| **Open PO Count** | Outstanding purchase orders per vendor. Helps track commitment exposure. |
| **Vendor Ranking** | Ranks vendors by cost performance. Who delivers on budget and who doesn't? |

> Note: Vendor metrics require purchase order data from your ERP. Not all systems expose this.

---

## 11. Exception Center

Automated flags for issues that need human attention.

| KPI | What It Tells You |
|-----|-------------------|
| **Exceptions by Severity** | How many high, medium, and low priority issues exist right now. |
| **Exceptions by Type** | What kinds of problems are occurring (budget overrun, schedule delay, missing data, etc.). |
| **Exception Aging** | How long issues have been open. Old exceptions = unresolved problems festering. |
| **High-Priority Queue** | The action list: high-severity issues sorted by urgency. Start here every morning. |

---

## How to Read the Dashboard

**KPI Cards** — The large number cards at the top of each section. They show the current value, trend direction (up/down arrow), and comparison to a prior period or goal. Green = good, yellow = watch, red = needs attention.

**Donuts & Bars** — Distribution charts. Click any segment to filter the entire page to that category.

**Pipeline Tables** — Full data rosters with 25-30 columns. Scroll horizontally, sort by any column, click any row for the drill-down detail card.

**Cross-Tabs** — Grid tables showing one dimension (like City) as rows and another (like Year) as columns. The cells show counts or values with color intensity indicating volume.

**Sparklines** — Mini trend charts inside cards. They show directional movement over time without needing to read exact numbers.

**Drill-Down Drawer** — Click any metric, chart segment, or table row to open the detail drawer on the right. It shows the underlying data that makes up that number, including individual job details and pro forma cards.

**Filters** — Use the top filter bar to narrow by City, Entity, Community, or Time Period (All Time, Month, Quarter, Year). All charts and KPIs update instantly.
