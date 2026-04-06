# Dashboard Design System

Standardized visual spec for all client dashboards. Every new client build must follow these rules so dashboards look identical regardless of the underlying data.

---

## Architecture

Each client gets a fully isolated Next.js 15 app. No shared runtime code between clients.

```
client_scaffold/
  clients/
    brite_homes/                    ← per-client env, config, SQL, reports
      .env
      bigquery.yaml
      raw_transforms.sql
      next_dashboard/               ← STANDALONE Next.js 15 app
        package.json
        app/
          page.js
          layout.js
          globals.css               ← THE design system — single source of truth
        components/
          dashboard-shell.js        ← all tabs, components, and rendering
          theme-toggle.js
        lib/
          bigquery.js               ← generic connection, reads env vars
          dashboard-data.js         ← BigQuery queries (13 parallel)
    fsp/
      .env
      next_dashboard/               ← STANDALONE Next.js app (separate code)
    {new_client}/
      .env
      next_dashboard/
  switch-client.sh                  ← launches the correct client app
```

**Rule**: Each client's `next_dashboard/` is a self-contained app with its own `package.json`, `components/`, `lib/`, and `app/`. Never write one client's code into another client's folder.

---

## Launching a Client

```bash
./switch-client.sh brite_homes        # default port 3001
./switch-client.sh fsp 3002           # custom port
```

---

## Theme & Color Tokens

All colors use CSS custom properties. Never use raw hex values in components.

### Dark Theme (default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-shell` | `#08111a` | Page background |
| `--bg-surface` | `#0d1825` | Cards, panels, rail, drawers |
| `--bg-surface-raised` | `#121f2e` | Elevated elements inside surfaces |
| `--bg-hover` | `#182838` | Hover state on interactive elements |
| `--border` | `#1e2d3d` | All borders — 1px solid |
| `--text-primary` | `#e8ecf0` | Headings, values, primary text |
| `--text-secondary` | `#8a9bb0` | Descriptions, secondary labels |
| `--text-muted` | `#5a6b7e` | Kickers, muted annotations |
| `--accent` | `#24c18d` | Active states, positive values, brand highlight |
| `--accent-dim` | `rgba(36,193,141,0.12)` | Background for accent elements |
| `--warning` | `#efb562` | Caution states (45-90 day stalls) |
| `--warning-dim` | `rgba(239,181,98,0.12)` | Background for warning elements |
| `--danger` | `#f46a6a` | Alert states (>90 day stalls, overruns) |
| `--danger-dim` | `rgba(244,106,106,0.12)` | Background for danger elements |

### Teal-to-Blue Gradient Palette

The primary data visualization palette uses a teal-to-blue gradient spectrum with no warm colors:

| Usage | Colors |
|-------|--------|
| Phase bars (Cycle Time Pipeline) | `#0f766e` (deep teal) → `#22d3ee` (cyan) → `#1e40af` (navy) |
| Histogram bars | Same teal→cyan→navy spectrum, gradient per bar |
| Donut segments | `#14b8a6` through `#1d4ed8` |
| Ranked bar fills | Teal→cyan gradient with glow shadow |

### Light Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-shell` | `#f5f7fa` | Page background |
| `--bg-surface` | `#ffffff` | Cards, panels, rail, drawers |
| `--bg-surface-raised` | `#f0f2f5` | Elevated elements inside surfaces |
| `--bg-hover` | `#e8ecf0` | Hover state on interactive elements |
| `--border` | `#d5dbe3` | All borders — 1px solid |
| `--text-primary` | `#1a2332` | Headings, values, primary text |
| `--text-secondary` | `#4a5568` | Descriptions, secondary labels |
| `--text-muted` | `#8a95a5` | Kickers, muted annotations |
| `--accent` | `#17b681` | Active states, positive values, brand highlight |
| `--warning` | `#d18d35` | Caution states (45-90 day stalls) |
| `--danger` | `#d45151` | Alert states (>90 day stalls, overruns) |

Both themes must be tested for every dashboard.

### Semantic Color Rules

- **Green (accent)**: Positive/on-track values, active nav state, completed milestones
- **Yellow (warning)**: Slow progress (45-90 days stalled), approaching thresholds
- **Red (danger)**: Stuck (>90 days), budget overruns, expiring loans, HIGH severity
- **Teal-to-blue gradient**: All chart fills, phase bars, donut segments, histogram bars
- **Never** use raw colors like `#ff0000` — always use the token variables

---

## Typography

| Element | Font Size | Weight | Color | Extra |
|---------|-----------|--------|-------|-------|
| Base HTML | 13px | 400 | `--text-primary` | `Space Grotesk` → system-ui fallback |
| Shell bar brand | 14px | 700 | accent for client name | letter-spacing: -0.02em |
| Tab header h2 | 16px | 700 | `--text-primary` | |
| Tab header kicker | 10px | 600 | teal-tinted | UPPERCASE, letter-spacing 0.1em |
| Tab header description | 11px | 400 | `--text-secondary` | |
| KPI value | 20px | 800 | tinted per-card color | line-height: 1.1, glow text-shadow |
| KPI label | 10px | 600 | `--text-muted` | UPPERCASE, letter-spacing 0.08em |
| KPI sub | 10px | 400 | `--text-secondary` | |
| Panel title | 13px | 700 | `--text-primary` | |
| Panel kicker | 10px | 600 | teal-tinted | UPPERCASE, letter-spacing 0.08em |
| Table header | 10px | 600 | `--text-muted` | UPPERCASE, letter-spacing 0.06em |
| Table row | 11px | 400 | `--text-primary` | |
| Monospace (IDs, codes) | 11px | 400 | inherit | `SF Mono` → `Fira Code` fallback |
| Pill | 10px | 600 | varies | UPPERCASE, letter-spacing 0.04em |
| Rail section label | 9px | 700 | `--text-muted` | UPPERCASE, letter-spacing 0.1em |
| Rail tab | 12px | 500 (600 active) | `--text-secondary` / `--accent` | |
| Rail stat | 10px | 400/600 | `--text-muted` / `--text-primary` | |

---

## Layout Grid

```
┌─────────────────────────────────────────────────────┐
│ Top Bar (grid-column: 1/-1)                         │
│ gradient tint + animated bottom accent line          │
├─────────────────────────────────────────────────────┤
│ Filter Bar (grid-column: 1/-1)                      │
├────────────┬────────────────────────────────────────┤
│ Rail       │ Main Content                            │
│ 140px      │ 1fr                                     │
│ sticky     │ overflow-y: auto                        │
│            │                                         │
│ [sections] │ [tab-header]                            │
│  ▸ Land    │ [kpi-row → 4 cols]                      │
│  ▸ Permit  │ [panels-row → 2 cols]                   │
│  ▸ Loans   │ [panels-row.single → 1 col]            │
│  ▾ Constr  │ [compact-table]                         │
│   Dashboard│ [spreadsheet-table]                     │
│   Pipeline │                                         │
│   Cycle    │                                         │
│   Cost     │                                         │
│  ▸ Sales   │                                         │
│  ▸ PropMgmt│                                         │
│  ▸ Audits  │                                         │
│            │                                         │
│ ────────── │                                         │
│ [stats]    │                                         │
└────────────┴────────────────────────────────────────┘
```

| Measurement | Value |
|-------------|-------|
| Max width | 1920px |
| Rail width | 140px (CSS var `--rail-width`) |
| Top bar padding | 7px 24px |
| Filter bar padding | 4px 24px |
| Main content padding | 16px 24px |
| KPI row | 4-col grid, 10px gap, 14px margin-bottom |
| Panels row | 2-col grid, 12px gap, 14px margin-bottom |
| Panel padding | 12px 14px |
| Panel header margin-bottom | 8px |
| Table row padding | 5px 10px |
| Table column gap | 8px |
| Border radius — cards/panels | 8px |
| Border radius — tabs/pills | 5px / 4px |

### Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| ≤1024px | Rail hidden, shell → single column, panels → 1 col, KPIs → 2 col, pipeline → 3 col |
| ≤768px | Pipeline board → 2 col |

---

## Component Library

Every dashboard uses these exact components. Do not create one-off alternatives.

### 1. KpiCard

```jsx
<KpiCard label="Total Jobs" value="1,260" sub="24 communities" />
```

- Always 4 per row in `.kpi-row`
- Label: uppercase muted
- Value: large bold number with glow text-shadow, tinted per-card color
- Sub: optional context line
- **Visual treatment**: gradient background, colored top accent line via `::before` pseudo-element, hover lift with box-shadow

### 2. Panel

```jsx
<Panel kicker="Portfolio" title="Jobs by Type" note="Optional note">
  {children}
</Panel>
```

- Kicker: uppercase teal-tinted label (optional)
- Title: bold panel heading
- Note: muted description (optional)
- Wrap in `.panels-row` (2-col) or `.panels-row.single` (full-width)
- **Visual treatment**: subtle gradient background, hover border highlight

### 3. RankedBars

```jsx
<RankedBars items={data} labelKey="name" valueKey="count" formatValue={formatWholeNumber} maxItems={12} />
```

- Horizontal bar chart with label → track → value
- Label column: 160px fixed
- Bar height: 18px
- **Visual treatment**: teal→cyan gradient fills with glow shadow
- Always inside a `<Panel>`

### 4. CompactTable (**Pipeline tabs only**)

```jsx
<div className="compact-table">
  <div className="compact-table-head" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
    <span>Column</span><span className="text-right">Value</span><span>Status</span>
  </div>
  {rows.map((r, i) => (
    <div key={i} className="compact-table-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
      ...
    </div>
  ))}
</div>
```

- Grid-based, not `<table>` — `gridTemplateColumns` defined inline
- Head and row must use the **same** gridTemplateColumns
- Add `interactive-row` class for clickable rows (adds cursor: pointer)
- **Visual treatment**: teal-tinted header border, alternating row stripes, teal hover
- Always inside a `<Panel>`
- **Never use on Dashboard tabs** — dashboards display only charts and KPI cards

### 5. SVG Donut Chart

```jsx
<DonutChart segments={segments} size={120} thickness={18} />
```

- SVG-based with animated arcs using `stroke-dasharray`
- Center count text displayed inside the donut
- Active segment gets drop-shadow glow effect
- Segments: `{ label, value, color }`
- Palette: teal-to-blue spectrum (`#14b8a6` through `#1d4ed8`)
- Always paired with a `<DonutLegend>` in a flex container

### 6. Cycle Time Pipeline

```jsx
<CycleTimePipeline phases={phases} />
```

- Horizontal gradient phase bars with proportional widths based on duration
- White text overlay on each bar showing phase name and days
- Color flow: `#0f766e` (deep teal) → `#22d3ee` (cyan) → `#1e40af` (navy)
- Always inside a `<Panel>`

### 7. Histogram v2

```jsx
<div className="histogram">
  {buckets.map(b => (
    <div className="histogram-bar">
      <div className="histogram-fill" style={{ height: `${pct}%`, background: b.color }} />
      <div className="histogram-count">{b.count}</div>
      <div className="histogram-label">{b.label}</div>
    </div>
  ))}
</div>
```

- Fixed height: 120px
- 5 buckets recommended for completion distributions
- **Visual treatment**: color-coded gradient bars using teal→blue spectrum, glow effects on each bar

### 8. HorizontalStackBar

```jsx
<HorizontalStackBar segments={[
  { label: "Spent", value: 50000, color: "#3b82f6" },
  { label: "Remaining", value: 20000, color: "#1e3a5f" },
]} height={14} />
```

- Stacked segments inside a `bar-track`
- Always include a legend below

### 9. Pipeline Board

```jsx
<div className="pipeline-board">
  {PHASES.map(phase => (
    <div className="pipeline-column">
      <div className="pipeline-column-head">...</div>
      <div className="pipeline-column-cards">
        {jobs.map(job => <PipelineCard key={job.id} job={job} />)}
      </div>
    </div>
  ))}
</div>
```

- 6-column grid (responsive → 3 → 2)
- Each column has colored top bar, count, and scrollable card list
- Cards get `pipeline-card-stuck` (red, >90d) or `pipeline-card-slow` (yellow, >45d) left border

### 10. FilterDropdown / FilterBar

```jsx
<FilterDropdown label="City" placeholder="All Cities" value={filter} options={options} onChange={setFilter} />
```

- Dropdown `<select>` with custom chevron via SVG background-image
- Options show count: `"Ocala (409)"`
- Active state: accent border + color
- Clear button appears when any filter is active

### 11. Pill (status badges)

```jsx
<span className="pill pill-good">READY</span>
<span className="pill pill-watch">MEDIUM</span>
<span className="pill pill-alert">HIGH</span>
```

- Three tones only: good (accent), watch (warning), alert (danger)
- **Visual treatment**: rounded capsule shape with colored borders

### 12. DrilldownDrawer

- Fixed right overlay, max 520px
- Opens on row click → shows filtered detail table
- Close button top-right
- **Visual treatment**: gradient background, accent border glow

### 13. AuditNotes

- Warning-toned banner at bottom of tab content
- Only renders when notes array is non-empty

### 14. Superintendent Card Grid

- 2x4 grid layout displaying metric cards per superintendent
- Each card shows superintendent name and key workload/performance metrics
- Always inside a `<Panel>`

### 15. SpreadsheetTable (**Pipeline tabs only**)

```jsx
<div className="ss-table">
  <div className="ss-frozen ss-frozen-last">...</div>
  <div className="ss-scroll">...</div>
</div>
```

- Horizontal scrolling table with sticky headers
- Frozen columns on the left via JS measurement (`.ss-frozen`, `.ss-frozen-last`)
- Column filters for narrowing visible data
- Use for wide data sets that exceed panel width
- **Never use on Dashboard tabs** — dashboards display only charts and KPI cards

### 16. Collapsible Sidebar Section

```jsx
<div className="rail-section-open">
  <div className="rail-section-header">
    <span>CONSTRUCTION</span>
    <span className="rail-chevron">▾</span>
  </div>
  <div className="rail-section-tabs">
    <div className="rail-tab rail-section-active">Dashboard</div>
    <div className="rail-tab">Pipeline</div>
  </div>
</div>
```

- Chevron icon rotates on expand/collapse
- Only one section expanded at a time (accordion behavior)
- Active tab gets left accent bar via `box-shadow: inset 3px 0 0`

### 17. Pro Forma Settings Panel

```jsx
<div className="proforma-settings">
  <div className="proforma-input">...</div>
  <div className="proforma-inline-input">...</div>
</div>
```

- Settings panel for configurable financial defaults
- Inline input fields for editable values
- Used in audit/financial tabs

### 18. AuditPLCard

- Card component for P&L audit display
- Editable fields for adjusting line items
- Configurable defaults for pro forma assumptions
- Always inside a `<Panel>`

---

## Navigation Structure

The dashboard uses a lifecycle-based navigation with 7 collapsible sections and 12 total tabs. The sidebar uses collapsible section headers with chevron icons, and only one section is expanded at a time (accordion behavior).

```
LAND
  └─ Dashboard         — Land acquisition overview

PERMITTING
  └─ Dashboard         — Permit status and tracking

LOANS
  └─ Dashboard         — Loan portfolio, draws, expirations

CONSTRUCTION
  ├─ Dashboard         — KPI snapshot, job status, community breakdown
  ├─ Pipeline          — Kanban board with phase swim lanes
  ├─ Cycle Time        — Phase duration analysis, cycle time pipeline bars
  └─ Cost Metrics      — WIP, cost codes, budget vs actual

SALES
  ├─ Dashboard         — Sales KPIs, community and plan breakdowns
  └─ Pipeline          — Sales pipeline and closings tracker

PROPERTY MGMT
  ├─ Dashboard         — Property management overview
  └─ Pipeline          — Property management pipeline

AUDITS
  └─ P&L Audits        — Pro forma P&L with editable fields and configurable defaults
```

Tabs may be omitted if data doesn't support them (see KPI_MASTER_REFERENCE.md), but never add client-specific tabs. If a client needs extra views, add them as sub-panels within existing tabs.

---

## Visual Upgrades (Applied Globally)

These treatments apply across all tabs and components:

| Element | Treatment |
|---------|-----------|
| KPI cards | Gradient background, colored top accent line (`::before`), glow text-shadow on tinted values, hover lift with box-shadow |
| Panels | Subtle gradient background, teal-tinted kicker labels, hover border highlight |
| Ranked bars | Teal→cyan gradient fills with glow shadow, 18px bar height |
| Compact tables | Teal-tinted header border, alternating row stripes, teal hover |
| Pills | Rounded capsule shape with colored borders |
| Drill-down drawer | Gradient background, accent border glow |
| Sidebar nav | Active tab gets left accent bar (`box-shadow: inset 3px 0 0`), collapsible sections with chevrons |
| Top bar | Gradient tint with animated bottom accent line |

---

## Dashboard vs Pipeline Content Rules

**This is a hard rule for all sections (Land, Permitting, Loans, Construction, Sales, Property Mgmt, Audits).**

### Dashboard Tabs — Charts & KPIs Only

Dashboard tabs display **only** visual summaries: KPI cards, donut charts, ranked bars, area charts, multi-line charts, histograms, stacked bars, sparkline cards, and cycle time pipelines.

**Allowed components on Dashboard tabs:**
- `KpiCard` / `SHKpiCard`
- `DonutChart` / `SHDonutChart`
- `RankedBars` / `SHRankedBars`
- `SHAreaChart`
- `SHMultiLineChart`
- `SHHistogram`
- `SHStackedCycleBar`
- `SHSparklineCards`
- `SHCycleTimePipeline`
- `SHCrossTab`

**Never use on Dashboard tabs:**
- `CompactTable` / `SHCompactTable`
- `SpreadsheetTable` / `SHSpreadsheetTable`
- Any grid-based tabular data display

If a dashboard tab currently has a table, move that table to the corresponding Pipeline tab or remove it entirely.

### Pipeline Tabs — Spreadsheet-Style Tables

Pipeline tabs display **spreadsheet-style tables** with fixed rows and columns for easy navigation. Use `SpreadsheetTable` / `SHSpreadsheetTable` with frozen columns, sticky headers, and per-column filters.

**Exception:** The Construction Pipeline tab uses a kanban board (`PipelineBoard` / `SHPipelineBoard`) instead of a spreadsheet. This is the **only** pipeline tab that uses a non-table layout.

### Cross-Filtering Model

Dashboard tabs support Power BI-style cross-filtering:
- **Chart clicks** (donut segments, bar clicks, sparkline cards) set page-level filters via `onStageClick`, `onCommunityClick`, `onCityClick`
- Filters are shown in a breadcrumb bar (`SHBreadcrumb`) with per-dimension clear
- Clicking the same value again deselects it (toggle behavior)

Pipeline tabs support drill-through:
- **Row clicks** open a drill-through drawer (`DrillDownTable` / `SHDrawer`) with job-level details
- Drawer shows filtered detail for the selected entity

---

## Tab Page Formula

Every **dashboard** tab follows this vertical stack (no tables):

```
1. KPI Row (4 cards) — always first
2. Panels Row (2 cols) — charts, ranked bars, donuts
3. Panels Row Single (full width) — full-width chart or stacked bars
4. Panels Row (2 cols) — secondary charts or breakdowns (optional)
5. AuditNotes — always last (only if present)
```

Every **pipeline** tab follows this vertical stack:

```
1. KPI Row (4 cards) — optional summary (optional)
2. Panels Row Single (full width) — SpreadsheetTable with frozen cols, sticky headers, column filters
```

---

## Formatting Functions

Use these consistently across all dashboards:

| Function | Example | When |
|----------|---------|------|
| `formatWholeNumber(v)` | `1,260` | Job counts, row counts |
| `formatCompactCurrency(v)` | `$4.2M` | KPI values, summaries |
| `formatCurrency(v)` | `$142,000` | Table cells, detail views |
| `formatPercent(v)` | `85.0%` | Completion (expects 0-1 decimal) |
| `formatDate(v)` | `Mar 17, 26` | Milestone dates |
| `` `${v}d` `` (inline) | `45d` | Cycle times, days stuck |

**Important**: `completion_pct` is stored as 0-1 decimals. `formatPercent` multiplies by 100 internally. Never divide by 100 before calling it.

---

## Data Layer Contract

`getDashboardData()` returns this shape (all clients):

```js
{
  config: { clientName, projectId, dataset, rawDataset },
  summaries: {
    portfolio: { totalJobs, activeInConstruction, completedClosed, lotsOnly, distinctCommunities, distinctPlans },
    financial: { totalWip, totalWipWithoutLot, totalLotCost, jobsWithBudget },
    sales: { totalSales, avgSalePrice, salesWithBuyer, salesWithPrice },
    loans: { jobsWithLoans, totalLoanAmount, totalDrawn, loansExpiringSoon },
    exceptions: { totalExceptions, highSeverity },
  },
  // Arrays
  milestonesRoster: [],    // Main job list with dates
  jobsByType: [],
  stageCounts: [],
  communityBreakdown: [],
  jobsByCompany: [],
  costBreakdown: [],
  inConstructionBudgets: [],
  superintendentWorkload: [],
  cycleTimesByPlan: [],
  salesRoster: [],
  salesByCommunity: [],
  salesByPlan: [],
  loanRoster: [],
  lenderDistribution: [],
  exceptionRows: [],
  qualityChecks: [],
  filterOptions: { cities: [], jobTypes: [], areaNames: [] },
  areaNameMap: {},
  auditNotes: [],
}
```

If a query returns no data for a client, the array should be `[]` and summaries should default to `0`. The shell handles empty state gracefully.

---

## Onboarding a New Client Checklist

1. Create `clients/{client_name}/.env` with BigQuery credentials
2. Create `clients/{client_name}/bigquery.yaml` with dataset schema
3. Scaffold `clients/{client_name}/next_dashboard/` with its own `package.json`, `app/`, `components/`, `lib/`
4. Verify `getDashboardData()` returns data (check server logs)
5. If tables are missing, add queries with `try/catch` returning `[]`
6. **Do not** write one client's code into another client's folder
7. Test both dark and light themes
8. Test at 1920px, 1024px, and 768px widths
