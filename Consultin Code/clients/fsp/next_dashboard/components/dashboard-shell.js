"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "./theme-toggle";
import AiAnalyst from "./ai-analyst";

/* ── Formatting helpers ───────────────────────── */

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatWholeNumber(v) {
  return safeNumber(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatCompactCurrency(v) {
  const n = safeNumber(v);
  if (Math.abs(n) >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

function formatCurrency(v) {
  return safeNumber(v).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPercent(v) {
  const n = safeNumber(v);
  return (n * 100).toFixed(1) + "%";
}

function formatProgressPercent(v) {
  const n = safeNumber(v);
  return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
}

function formatMilestoneProgress(row) {
  const milestone = row?.progress_milestone || row?.current_stage || "Not Started";
  return `${formatProgressPercent(row?.progress_percent)} ${milestone}`;
}

function formatMilestoneCount(row) {
  const total = safeNumber(row?.milestones_total);
  if (!total) return "-";
  return `${safeNumber(row?.milestones_completed)} / ${total}`;
}

function formatDate(v) {
  if (!v) return "-";
  const s = typeof v === "object" && "value" in v ? v.value : String(v);
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function toDate(v) {
  if (!v) return null;
  const s = typeof v === "object" && "value" in v ? v.value : String(v);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfMonth(v = new Date()) {
  const d = toDate(v) || new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(v, months) {
  const d = startOfMonth(v);
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

function monthKey(v) {
  const d = startOfMonth(v);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(v) {
  const d = toDate(v);
  if (!d) return "-";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/* Stall coloring per the design system's semantic rules: yellow = slow
   progress (45-90 days), red = stuck (>90 days). */
function stallColor(days) {
  if (days == null) return "var(--text-muted)";
  if (days >= 90) return "var(--danger)";
  if (days >= 45) return "var(--warning)";
  return "var(--text-secondary)";
}

function formatStallDays(days) {
  return days == null ? "—" : `${days}d`;
}

/* Signed budget figures spell out their meaning: + = under budget, − = over. */
function formatSignedBudget(v, fmt) {
  const n = safeNumber(v);
  if (n === 0) return "-";
  return `${n > 0 ? "+" : "−"}${fmt(Math.abs(n))} ${n > 0 ? "under" : "over"}`;
}

/* Hover glossary — one definition per term, shown via <Term>. */
const TIPS = {
  totalJobs: "Jobs with tasks in the construction schedule.",
  totalBudget: "Sum of task budget costs. Matches the ERP cost summary to the dollar.",
  actualSpend: "Budget cost of completed tasks — a proxy for spend. The ERP feed has no invoice or payment data yet.",
  committedPos: "Total PO dollars issued to vendors. Open = committed minus paid, which equals committed until payments post.",
  milestones: "Completed milestones out of the 22-milestone schedule per job.",
  progress: "ERP milestone progress: percent complete and the current milestone.",
  sinceMilestone: "Days since the task marking the last milestone was completed. Amber at 45+, red at 90+ days.",
  poBudget: "Budget for tasks whose vendor has a PO on this job (sent scope). Excludes budget for vendors without POs yet.",
  committed: "PO dollars issued.",
  openPos: "Committed minus paid. Equals Committed until payments post in the ERP.",
  poVariance: "PO Budget minus Committed POs. + means under (budget headroom left on sent scope); − means over.",
  erpOu: "The ERP's own over/under: tracked task budget minus task-linked POs. + means under budget; − means over. Matches the ERP UI.",
  share: "Share of all tasks across the portfolio.",
  milestoneProgress: "Average ERP milestone progress across active jobs.",
  totalPoValue: "Sum of all purchase-order amounts.",
  avgPoValue: "Total PO value divided by the number of POs.",
  availableLand: "Owned lots not yet started, including acquired pipeline lots.",
  landRunout: "Month the owned-lot balance reaches zero at the current start schedule.",
  acqNeeded: "Scheduled starts not covered by an owned lot or the planned acquisition pace.",
};

/* Dotted-underline term with a styled hover/focus tooltip. */
function Term({ tip, align, below, children }) {
  if (!tip) return children;
  return (
    <span className={`term ${align === "right" ? "term-right" : ""} ${below ? "term-below" : ""}`} tabIndex={0}>
      {children}
      <span className="term-tip" role="tooltip">{tip}</span>
    </span>
  );
}

function isJobStarted(row) {
  return Boolean(toDate(row?.actual_start))
    || safeNumber(row?.completed) > 0
    || safeNumber(row?.in_progress) > 0
    || safeNumber(row?.ordered) > 0
    || safeNumber(row?.progress_percent) > 0;
}

function isJobComplete(row) {
  return safeNumber(row?.progress_percent) >= 100;
}

/* ── Tab config ───────────────────────────────── */

const SECTIONS = [
  {
    label: "Analytics",
    tabs: [
      { id: "overview", label: "Overview", mono: "OV", title: "Portfolio snapshot", desc: "Jobs, task progress, budgets, and vendor exposure at a glance." },
      { id: "construction", label: "Construction", mono: "CO", title: "Construction progress", desc: "Task completion by stage, trade group breakdown, and per-job progress." },
    ],
  },
  {
    label: "Pipelines",
    tabs: [
      { id: "vendors", label: "Vendors", mono: "VN", title: "Vendor scorecard", desc: "PO values, vendor ranking, and purchase order detail." },
    ],
  },
  {
    label: "Planning",
    tabs: [
      { id: "land-runway", label: "Land Runway", mono: "LR", title: "Land runway", desc: "Editable per-address start and completion schedule, with land balance and acquisition needs before available land reaches zero." },
    ],
  },
];

const ALL_TABS = SECTIONS.flatMap((s) => s.tabs);

/* ── Reusable sub-components ──────────────────── */

function KpiCard({ label, value, sub, onClick, tip }) {
  return (
    <div className="kpi-card" style={onClick ? { cursor: "pointer" } : {}} onClick={onClick}>
      <div className="kpi-label">{tip ? <Term tip={tip}>{label}</Term> : label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function RankedBars({ items = [], labelKey, valueKey, formatValue = formatWholeNumber, onSelect, maxItems = 12 }) {
  const max = Math.max(...items.slice(0, maxItems).map((r) => safeNumber(r[valueKey])), 1);
  return (
    <div className="ranked-bars">
      {items.slice(0, maxItems).map((row, i) => {
        const val = safeNumber(row[valueKey]);
        return (
          <div key={i} className="ranked-bar" onClick={() => onSelect?.(row)}>
            <div className="bar-label">{row[labelKey] || "(blank)"}</div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(val / max) * 100}%` }} /></div>
            <div className="bar-value">{formatValue(val)}</div>
          </div>
        );
      })}
    </div>
  );
}

function Panel({ kicker, title, note, children }) {
  return (
    <div className="panel">
      <div className="panel-header">
        {kicker && <div className="panel-kicker">{kicker}</div>}
        <div className="panel-title">{title}</div>
        {note && <div className="panel-note">{note}</div>}
      </div>
      {children}
    </div>
  );
}

function AuditNotes({ notes = [] }) {
  if (!notes.length) return null;
  return (
    <div className="audit-notes">
      {notes.map((n, i) => <p key={i}>{n}</p>)}
    </div>
  );
}

/* ── Land Runway Tab ─────────────────────────── */

/* Aspire planned pipeline (starts/completions email, Jun 2026). Scenario seed
   only — these addresses are not in the warehouse. Rows are editable and
   removable in the UI; edits persist in this browser's localStorage. */
const PLANNED_PIPELINE_DEFAULTS = [
  { id: "plan-reynolds-pkwy", address: "Reynolds Pkwy, Orlando", start: "2026-08", end: "2027-02", acquired: true },
  { id: "plan-134-w-hazel", address: "134 W Hazel St, Orlando", start: "2026-08", end: "2027-03", acquired: true },
  { id: "plan-edgerton-ave", address: "Edgerton Ave, Orlando", start: "2026-09", end: "2027-03", acquired: true },
  { id: "plan-2613-jamie-cir", address: "2613 Jamie Cir, Orlando", start: "2026-09", end: "2027-04", acquired: true },
  { id: "plan-lot-60-somerset", address: "Lot 60 Somerset, Orlando", start: "2026-10", end: "2027-04", acquired: true },
  { id: "plan-odham-st", address: "Odham St, Orlando", start: "2026-10", end: "2027-04", acquired: true },
  { id: "plan-sheldon-st", address: "Sheldon St, Orlando", start: "2026-11", end: "2027-05", acquired: true },
  { id: "plan-18118-robertson", address: "18118 Robertson St, Orlando", start: "2026-11", end: "2027-05", acquired: true },
  { id: "plan-2515-laura-pl", address: "2515 Laura Pl, Orlando", start: "2026-11", end: "2027-06", acquired: true },
  { id: "plan-racine-st", address: "Racine St, Orlando", start: "2026-12", end: "2027-06", acquired: true },
  { id: "plan-osborne-st", address: "Osborne St, Orlando", start: "2026-12", end: "2027-06", acquired: true },
  { id: "plan-sodbury-st", address: "Sodbury St, Orlando", start: "2027-01", end: "2027-07", acquired: true },
  { id: "plan-sabal-st", address: "Sabal St, Orlando", start: "2027-01", end: "2027-07", acquired: true },
  { id: "plan-814-park-lake", address: "814 Park Lake St, Orlando", start: "2027-01", end: "2027-08", acquired: true },
  { id: "plan-1201-asbury", address: "1201 Asbury Ave, Orlando", start: "2027-03", end: "2027-10", acquired: true },
];

const SCHEDULE_STORAGE_KEY = "fsp-land-runway-schedule-v1";

const SCHEDULE_SOURCE_LABELS = {
  active: "ERP · active",
  owned: "ERP · owned lot",
  planned: "Pipeline",
  custom: "Manual",
};

function ymToDate(ym) {
  if (!ym) return null;
  const [y, m] = String(ym).split("-").map(Number);
  if (!y || !m) return null;
  return new Date(y, m - 1, 1);
}

function addYm(ym, n) {
  const d = ymToDate(ym);
  return d ? monthKey(addMonths(d, n)) : null;
}

function formatYm(ym) {
  const d = ymToDate(ym);
  return d ? formatMonth(d) : "—";
}

function MonthSelect({ value, defaultKey, defaultTag, options, onChange, emptyLabel = "Unscheduled" }) {
  const isDefault = value == null;
  const defaultLabel = defaultKey ? `${formatYm(defaultKey)} · ${defaultTag}` : emptyLabel;
  return (
    <select
      className={`schedule-select ${isDefault ? "is-default" : ""}`}
      value={isDefault ? "" : value}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">{defaultLabel}</option>
      {options.map((ym) => <option key={ym} value={ym}>{formatYm(ym)}</option>)}
    </select>
  );
}

function LandRunwayTab({ dashboard, onSelect }) {
  const [buildDuration, setBuildDuration] = useState(6);
  const [acquisitionsPerMonth, setAcquisitionsPerMonth] = useState(0);
  const [horizon, setHorizon] = useState(24);
  const [scheduleState, setScheduleState] = useState({ rows: {}, custom: [] });
  const [hydrated, setHydrated] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [dragId, setDragId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setScheduleState({ rows: parsed.rows || {}, custom: Array.isArray(parsed.custom) ? parsed.custom : [] });
      }
    } catch { /* corrupted local state falls back to defaults */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(scheduleState)); } catch { /* storage blocked */ }
  }, [scheduleState, hydrated]);

  const setRowOverride = (id, patch) =>
    setScheduleState((prev) => ({ ...prev, rows: { ...prev.rows, [id]: { ...(prev.rows[id] || {}), ...patch } } }));

  const removeRow = (row) => {
    if (row.source === "custom") {
      setScheduleState((prev) => {
        const rows = { ...prev.rows };
        delete rows[row.id];
        return { ...prev, rows, custom: prev.custom.filter((c) => c.id !== row.id) };
      });
    } else {
      setRowOverride(row.id, { removed: true });
    }
  };

  const addCustomRow = () => {
    const address = newAddress.trim();
    if (!address) return;
    const id = `custom-${Date.now().toString(36)}`;
    setScheduleState((prev) => ({ ...prev, custom: [...prev.custom, { id, address }] }));
    setNewAddress("");
  };

  const resetSchedule = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset all schedule edits and restore defaults?")) return;
    setScheduleState({ rows: {}, custom: [] });
    try { localStorage.removeItem(SCHEDULE_STORAGE_KEY); } catch { /* noop */ }
  };

  const today = startOfMonth();
  const jobs = dashboard.jobProgress || [];
  const availableLand = jobs.filter((row) => !isJobStarted(row));
  const activeJobs = jobs.filter((row) => isJobStarted(row) && !isJobComplete(row));
  const months = Array.from({ length: horizon }, (_, index) => addMonths(today, index));
  const monthOptions = Array.from({ length: 36 }, (_, index) => monthKey(addMonths(today, index)));

  const rosterRows = [];
  for (const job of activeJobs) {
    const id = `wh-${job.job_id}`;
    const ov = scheduleState.rows[id] || {};
    const startDate = toDate(job.actual_start) || toDate(job.earliest_start);
    const whEnd = toDate(job.latest_end);
    let baseEnd;
    let baseEndTag;
    if (whEnd && whEnd >= today) {
      baseEnd = monthKey(whEnd);
      baseEndTag = "warehouse";
    } else {
      const remainingShare = Math.max(0.05, 1 - safeNumber(job.progress_percent) / 100);
      baseEnd = monthKey(addMonths(today, Math.max(1, Math.ceil(buildDuration * remainingShare))));
      baseEndTag = "estimated";
    }
    rosterRows.push({
      id, source: "active", address: job.project_address || `Lot ${job.lot_id}`, jobId: job.job_id,
      start: startDate ? monthKey(startDate) : null, startLocked: true, removable: false, lotOwned: true,
      baseStart: null, baseStartTag: "", baseEnd, baseEndTag,
      end: ov.end ?? baseEnd,
    });
  }
  for (const job of availableLand) {
    const id = `wh-${job.job_id}`;
    const ov = scheduleState.rows[id] || {};
    if (ov.removed) continue;
    const whStart = toDate(job.earliest_start);
    const baseStart = whStart ? (whStart >= today ? monthKey(whStart) : monthKey(today)) : null;
    const start = ov.start ?? baseStart;
    const whEnd = toDate(job.latest_end);
    const baseEnd = whEnd && start && monthKey(whEnd) > start ? monthKey(whEnd) : null;
    rosterRows.push({
      id, source: "owned", address: job.project_address || `Lot ${job.lot_id}`, jobId: job.job_id,
      start, startLocked: false, removable: true, lotOwned: true,
      baseStart, baseStartTag: "warehouse", baseEnd, baseEndTag: baseEnd ? "warehouse" : "",
      end: ov.end ?? baseEnd ?? (start ? addYm(start, buildDuration) : null),
    });
  }
  for (const seed of PLANNED_PIPELINE_DEFAULTS) {
    const ov = scheduleState.rows[seed.id] || {};
    if (ov.removed) continue;
    const start = ov.start ?? seed.start;
    rosterRows.push({
      id: seed.id, source: "planned", address: seed.address, jobId: null,
      start, startLocked: false, removable: true, lotOwned: ov.acquired ?? seed.acquired ?? true,
      baseStart: seed.start, baseStartTag: "plan", baseEnd: seed.end, baseEndTag: "plan",
      end: ov.end ?? seed.end ?? (start ? addYm(start, buildDuration) : null),
    });
  }
  for (const custom of scheduleState.custom) {
    const ov = scheduleState.rows[custom.id] || {};
    const start = ov.start ?? null;
    rosterRows.push({
      id: custom.id, source: "custom", address: custom.address, jobId: null,
      start, startLocked: false, removable: true, lotOwned: ov.acquired ?? true,
      baseStart: null, baseStartTag: "", baseEnd: null, baseEndTag: "",
      end: ov.end ?? (start ? addYm(start, buildDuration) : null),
    });
  }

  for (const row of rosterRows) {
    if (!row.startLocked && row.start && row.end && row.end <= row.start) {
      row.end = addYm(row.start, buildDuration);
    }
  }

  const ownedLotsTotal = rosterRows.filter((row) => row.source !== "active" && row.lotOwned).length;

  const horizonSet = new Set(months.map((m) => monthKey(m)));
  const startsByMonth = {};
  const endsByMonth = {};
  for (const row of rosterRows) {
    if (row.source !== "active" && row.start && horizonSet.has(row.start)) {
      (startsByMonth[row.start] = startsByMonth[row.start] || []).push(row);
    }
    if (row.end && horizonSet.has(row.end)) {
      endsByMonth[row.end] = safeNumber(endsByMonth[row.end]) + 1;
    }
  }

  const uncoveredIds = new Set();
  let ownedPool = ownedLotsTotal;
  let acquisitionPool = 0;
  let activeBuildBalance = activeJobs.length;
  let totalUncovered = 0;
  let runoutMonth = null;
  let firstGapMonth = null;
  const runwayRows = months.map((month) => {
    const key = monthKey(month);
    const opening = ownedPool + acquisitionPool;
    const acquired = acquisitionsPerMonth;
    acquisitionPool += acquired;
    const startRows = startsByMonth[key] || [];
    const ownedStarts = startRows.filter((row) => row.lotOwned);
    const prospectStarts = startRows.filter((row) => !row.lotOwned).sort((a, b) => a.address.localeCompare(b.address));
    ownedPool -= ownedStarts.length;
    const prospectCovered = Math.min(prospectStarts.length, acquisitionPool);
    const uncovered = prospectStarts.length - prospectCovered;
    for (const row of prospectStarts.slice(prospectCovered)) uncoveredIds.add(row.id);
    acquisitionPool -= prospectCovered;
    const starts = startRows.length;
    const completions = safeNumber(endsByMonth[key]);
    activeBuildBalance = Math.max(0, activeBuildBalance + starts - completions);
    totalUncovered += uncovered;
    if (uncovered > 0 && !firstGapMonth) firstGapMonth = month;
    const ending = ownedPool + acquisitionPool;
    if (!runoutMonth && ending === 0 && starts > 0) runoutMonth = month;
    return { month, opening, acquired, starts, uncovered, completions, ending, activeBuilds: activeBuildBalance };
  });

  rosterRows.sort((a, b) =>
    String(a.start || "9999-99").localeCompare(String(b.start || "9999-99")) || a.address.localeCompare(b.address));

  const upcomingRows = rosterRows.filter((row) => row.source !== "active");
  const scheduledCount = upcomingRows.filter((row) => row.start).length;
  const runwayMonths = runoutMonth
    ? Math.max(0, Math.round((runoutMonth.getFullYear() - today.getFullYear()) * 12 + runoutMonth.getMonth() - today.getMonth()))
    : horizon;
  const startsNextQuarter = runwayRows.slice(0, 3).reduce((sum, row) => sum + row.starts, 0);
  const completionsNextQuarter = runwayRows.slice(0, 3).reduce((sum, row) => sum + row.completions, 0);
  const maxLand = Math.max(ownedLotsTotal, ...runwayRows.map((row) => row.opening), 1);
  const rosterCols = "0.35fr 2.2fr 0.85fr 1fr 1fr 0.55fr 0.95fr 0.3fr";
  const runwayCols = "0.9fr 0.7fr 0.7fr 0.9fr 0.7fr 0.7fr 0.7fr 1.3fr";

  const rowStatus = (row) => {
    if (row.source === "active") return { cls: "pill-good", label: "In construction" };
    if (!row.start) return { cls: "pill-watch", label: "Unscheduled" };
    if (row.lotOwned) return { cls: "pill-good", label: "Lot owned" };
    if (uncoveredIds.has(row.id)) return { cls: "pill-alert", label: "Needs lot" };
    if (!horizonSet.has(row.start)) return { cls: "pill-watch", label: "Beyond horizon" };
    return { cls: "pill-good", label: "Covered" };
  };

  const handleDropOnRow = (targetId, dataTransferId) => {
    const sourceId = dataTransferId || dragId;
    setDragId(null);
    setDropTargetId(null);
    if (!sourceId || sourceId === targetId) return;
    const source = rosterRows.find((row) => row.id === sourceId);
    const target = rosterRows.find((row) => row.id === targetId);
    if (!source || !target || source.startLocked || !target.start) return;
    const newStart = target.start;
    const explicitEnd = (scheduleState.rows[sourceId] || {}).end != null || source.baseEnd != null;
    if (explicitEnd && source.start && source.end) {
      const sd = ymToDate(source.start);
      const ed = ymToDate(source.end);
      const span = sd && ed ? (ed.getFullYear() - sd.getFullYear()) * 12 + (ed.getMonth() - sd.getMonth()) : buildDuration;
      setRowOverride(sourceId, { start: newStart, end: addYm(newStart, Math.max(1, span)) });
    } else {
      setRowOverride(sourceId, { start: newStart, end: null });
    }
  };

  return (
    <>
      <div className="planning-status">
        <div>
          <strong>Forecast basis</strong>
          <span>Each row below is one address. Active builds keep warehouse dates; upcoming rows have editable start and completion months. Drag the &#x2839;&#x283C; handle onto another row to adopt its start slot; the Lot checkbox marks the lot as acquired. Edits save in this browser.</span>
        </div>
        <span className="planning-source">{scheduledCount} of {upcomingRows.length} upcoming addresses scheduled</span>
      </div>

      <div className="planning-controls" aria-label="Land runway scenario assumptions">
        <label>
          <span>Default build duration (months)</span>
          <input type="number" min="1" max="36" value={buildDuration} onChange={(e) => setBuildDuration(Math.max(1, safeNumber(e.target.value, 1)))} />
        </label>
        <label>
          <span>New acquisitions / month</span>
          <input type="number" min="0" max="50" value={acquisitionsPerMonth} onChange={(e) => setAcquisitionsPerMonth(Math.max(0, safeNumber(e.target.value)))} />
        </label>
        <label>
          <span>Forecast horizon</span>
          <select value={horizon} onChange={(e) => setHorizon(safeNumber(e.target.value, 24))}>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </select>
        </label>
      </div>

      <div className="kpi-row land-kpi-row">
        <KpiCard label="Available Land" tip={TIPS.availableLand} value={formatWholeNumber(ownedLotsTotal)} sub="Owned lots not yet started, incl. pipeline" />
        <KpiCard label="Land Runout" tip={TIPS.landRunout} value={runoutMonth ? formatMonth(runoutMonth) : `Beyond ${horizon} mo`} sub={runoutMonth ? (runwayMonths === 0 ? "This month at the current schedule" : `${runwayMonths} months at the current schedule`) : "No gap inside forecast horizon"} />
        <KpiCard label="Starts Next 90 Days" value={formatWholeNumber(startsNextQuarter)} sub="From the address schedule below" />
        <KpiCard label="Completions Next 90 Days" value={formatWholeNumber(completionsNextQuarter)} sub={`${activeJobs.length} active builds today`} />
        <KpiCard label="Additional Acquisitions Needed" tip={TIPS.acqNeeded} value={formatWholeNumber(totalUncovered)} sub="Scheduled starts without a lot" />
      </div>

      <div className="panels-row single">
        <Panel kicker="Schedule" title="Projected Starts and Completions" note="One row per address. Pipeline lots are marked acquired by default — uncheck Lot if a closing is still pending. Scenario edits stay in this browser, not the warehouse.">
          <div className="schedule-toolbar">
            <input
              className="schedule-input"
              placeholder="Add address (e.g. 123 Main St, Orlando)"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCustomRow(); }}
            />
            <button className="schedule-btn" onClick={addCustomRow}>Add address</button>
            <span className="schedule-spacer" />
            <button className="schedule-btn" onClick={resetSchedule}>Reset schedule</button>
          </div>
          <div className="compact-table planning-detail-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: rosterCols }}>
              <span /><span>Address</span><span>Source</span><span>Start</span><span>Completion</span><span>Lot</span><span>Status</span><span />
            </div>
            {rosterRows.map((row) => {
              const status = rowStatus(row);
              const override = scheduleState.rows[row.id] || {};
              const isDropTarget = dropTargetId === row.id && dragId && dragId !== row.id;
              return (
                <div
                  key={row.id}
                  className={`compact-table-row ${isDropTarget ? "drop-target" : ""}`}
                  style={{ gridTemplateColumns: rosterCols, alignItems: "center" }}
                  onDragOver={(e) => {
                    const dragging = dragId || (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes("text/plain"));
                    if (dragging && dragId !== row.id && !row.startLocked && row.start) {
                      e.preventDefault();
                      if (dropTargetId !== row.id) setDropTargetId(row.id);
                    }
                  }}
                  onDrop={(e) => { e.preventDefault(); handleDropOnRow(row.id, e.dataTransfer ? e.dataTransfer.getData("text/plain") : null); }}
                >
                  <span>
                    {!row.startLocked ? (
                      <span
                        className="drag-handle"
                        title="Drag onto another row to adopt its start slot"
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData("text/plain", row.id); e.dataTransfer.effectAllowed = "move"; setDragId(row.id); }}
                        onDragEnd={() => { setDragId(null); setDropTargetId(null); }}
                      >&#x2839;&#x283C;</span>
                    ) : null}
                  </span>
                  <span
                    className={`text-truncate ${row.jobId ? "addr-link" : ""}`}
                    title={row.address}
                    onClick={row.jobId ? () => onSelect({ type: "job", value: row.jobId, label: row.address }) : undefined}
                  >{row.address}</span>
                  <span className="source-tag">{SCHEDULE_SOURCE_LABELS[row.source]}</span>
                  <span>
                    {row.startLocked
                      ? <span className="font-mono">{formatYm(row.start)}</span>
                      : <MonthSelect value={override.start ?? null} defaultKey={row.baseStart} defaultTag={row.baseStartTag} options={monthOptions} onChange={(v) => setRowOverride(row.id, { start: v })} />}
                  </span>
                  <span>
                    <MonthSelect
                      value={override.end ?? null}
                      defaultKey={row.baseEnd || (row.start ? addYm(row.start, buildDuration) : null)}
                      defaultTag={row.baseEnd ? row.baseEndTag : "auto"}
                      options={row.start ? monthOptions.filter((m) => m > row.start) : monthOptions}
                      onChange={(v) => setRowOverride(row.id, { end: v })}
                      emptyLabel="—"
                    />
                  </span>
                  <span>
                    {row.source === "active"
                      ? <span className="source-tag">—</span>
                      : row.source === "owned"
                        ? <input type="checkbox" className="lot-check" checked readOnly disabled title="Owned lot in the warehouse" />
                        : <input type="checkbox" className="lot-check" checked={row.lotOwned} onChange={(e) => setRowOverride(row.id, { acquired: e.target.checked })} title="Lot acquired" />}
                  </span>
                  <span><span className={`pill ${status.cls}`}>{status.label}</span></span>
                  <span>{row.removable ? <button className="row-remove" title="Remove row" onClick={() => removeRow(row)}>&#x2715;</button> : null}</span>
                </div>
              );
            })}
            {rosterRows.length === 0 && <div className="planning-empty">No addresses to schedule. Add one above.</div>}
          </div>
        </Panel>
      </div>

      <div className="panels-row single">
        <Panel kicker="Forecast" title="Monthly Land Runway" note="Starts and completions come from the address schedule above. Acquired lots use the acquisitions-per-month pace.">
          <div className="compact-table runway-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: runwayCols }}>
              <span>Month</span><span className="text-right">Opening Land</span><span className="text-right">Acquired</span><span className="text-right">Starts</span><span className="text-right">Completions</span><span className="text-right">Active Builds</span><span className="text-right">Ending Land</span><span>Land Remaining</span>
            </div>
            {runwayRows.map((row) => (
              <div key={monthKey(row.month)} className={`compact-table-row runway-row ${row.uncovered > 0 ? "runway-gap" : ""}`} style={{ gridTemplateColumns: runwayCols }}>
                <span className="font-mono">{formatMonth(row.month)}</span>
                <span className="text-right">{row.opening}</span>
                <span className="text-right">{row.acquired || "-"}</span>
                <span className="text-right">{row.starts || "-"}{row.uncovered > 0 ? <small className="text-danger"> ({row.uncovered} short)</small> : ""}</span>
                <span className="text-right">{row.completions || "-"}</span>
                <span className="text-right">{row.activeBuilds}</span>
                <span className={`text-right ${row.ending === 0 ? "text-danger" : ""}`}>{row.ending}</span>
                <span className="runway-meter"><span style={{ width: `${(row.ending / maxLand) * 100}%` }} /></span>
              </div>
            ))}
          </div>
          {totalUncovered > 0 && (
            <div className="runway-gap-note">
              {totalUncovered} scheduled start{totalUncovered === 1 ? " is" : "s are"} not covered by owned land plus the acquisition pace
              {firstGapMonth ? ` (first gap ${formatMonth(firstGapMonth)})` : ""}. Add acquisitions or move start months.
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

/* ── Stacked Progress Bar ─────────────────────── */

function StackedBar({ completed, inProgress, ordered, notStarted, total }) {
  if (!total) return <div className="bar-track" style={{ height: 8, background: "var(--bg-surface-raised)", borderRadius: 3 }} />;
  const pcts = [
    { key: "completed", value: completed, color: "var(--color-success)" },
    { key: "in_progress", value: inProgress, color: "var(--color-accent)" },
    { key: "ordered", value: ordered, color: "var(--color-warning)" },
  ];
  return (
    <div className="bar-track" style={{ height: 8, display: "flex", background: "var(--bg-surface-raised)", borderRadius: 3, overflow: "hidden" }}>
      {pcts.map((p) => (
        p.value > 0 ? (
          <div
            key={p.key}
            style={{
              width: `${(p.value / total) * 100}%`,
              backgroundColor: p.color,
              height: "100%",
            }}
            title={`${p.key}: ${p.value}`}
          />
        ) : null
      ))}
    </div>
  );
}

/* ── Overview Tab ─────────────────────────────── */

function OverviewTab({ dashboard, onSelect }) {
  const p = dashboard.summaries.portfolio;
  const c = dashboard.summaries.construction;
  const v = dashboard.summaries.vendors;
  const spending = dashboard.actualSpending || [];
  const spendTotals = spending.reduce((acc, s) => ({
    budget: acc.budget + safeNumber(s.budget_total),
    actual: acc.actual + safeNumber(s.effective_actual_total),
    committed: acc.committed + safeNumber(s.committed_po_total),
    open: acc.open + safeNumber(s.open_po_total),
  }), { budget: 0, actual: 0, committed: 0, open: 0 });
  const overviewJobCols = "2.5fr 1.2fr 0.5fr 0.7fr 1.3fr 0.8fr 0.7fr 0.7fr";
  const activeJobs = dashboard.jobProgress.filter((r) => r.completed > 0 || r.in_progress > 0 || r.ordered > 0 || safeNumber(r.progress_percent) > 0);
  const notStartedJobs = dashboard.jobProgress.filter((r) => r.completed === 0 && r.in_progress === 0 && r.ordered === 0 && safeNumber(r.progress_percent) === 0);
  const renderOverviewJobRow = (r, i, dimmed) => (
    <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: overviewJobCols, opacity: dimmed ? 0.45 : 1 }}
      onClick={() => onSelect({ type: "job", value: r.job_id, label: r.project_address || `Lot ${r.lot_id}` })}>
      <span>{r.project_address || r.lot_id}</span>
      <span>{r.plan_name}</span>
      <span className="text-right">{r.total_tasks}</span>
      <span className="text-right">{formatMilestoneCount(r)}</span>
      <span className="text-center">{formatMilestoneProgress(r)}</span>
      <span className="text-right" style={{ color: stallColor(r.days_since_milestone) }}>{formatStallDays(r.days_since_milestone)}</span>
      <span className="text-right text-muted">{formatDate(r.earliest_start)}</span>
      <span className="text-right">{formatCompactCurrency(r.total_budget)}</span>
    </div>
  );

  return (
    <>
      <div className="kpi-row">
        <KpiCard label="Total Jobs" tip={TIPS.totalJobs} value={formatWholeNumber(p.totalJobs)} sub={`${p.distinctPlans} plans`}
          onClick={() => onSelect({ type: "all_jobs", label: "All Jobs" })} />
        <KpiCard label="Total Budget" tip={TIPS.totalBudget} value={formatCompactCurrency(spendTotals.budget)} sub={`Across all task schedules`}
          onClick={() => onSelect({ type: "all_jobs", label: "All Jobs — Budget" })} />
        <KpiCard label="Actual Spend" tip={TIPS.actualSpend} value={formatCompactCurrency(spendTotals.actual)} sub={`${c.completed} tasks completed`}
          onClick={() => onSelect({ type: "spending", label: "Actual Spending by Job" })} />
        <KpiCard label="Committed POs" tip={TIPS.committedPos} value={formatCompactCurrency(spendTotals.committed)} sub={`${formatCompactCurrency(spendTotals.open)} open`}
          onClick={() => onSelect({ type: "spending", label: "Actual Spending by Job" })} />
      </div>

      {activeJobs.length > 0 && (
        <div className="panels-row single">
          <Panel kicker="Construction" title="In Construction" note={`${activeJobs.length} jobs with task activity`}>
            <div className="compact-table">
              <div className="compact-table-head" style={{ gridTemplateColumns: overviewJobCols }}>
                <span>Address</span><span>Plan</span><span className="text-right">Tasks</span><span className="text-right"><Term tip={TIPS.milestones}>Milestones</Term></span><span className="text-center"><Term tip={TIPS.progress}>Progress</Term></span><span className="text-right"><Term tip={TIPS.sinceMilestone}>Since Milestone</Term></span><span className="text-right">Start</span><span className="text-right">Budget</span>
              </div>
              {activeJobs.map((r, i) => renderOverviewJobRow(r, i, false))}
            </div>
          </Panel>
        </div>
      )}

      <div className="panels-row">
        <Panel kicker="Portfolio" title="Jobs by Plan">
          <RankedBars
            items={(() => {
              const byPlan = {};
              for (const j of dashboard.jobProgress) {
                const plan = j.plan_name || "(unknown)";
                byPlan[plan] = (byPlan[plan] || 0) + 1;
              }
              return Object.entries(byPlan).map(([plan_name, count]) => ({ plan_name, count })).sort((a, b) => b.count - a.count);
            })()}
            labelKey="plan_name"
            valueKey="count"
            onSelect={(r) => onSelect({ type: "plan", value: r.plan_name, label: r.plan_name })}
          />
        </Panel>
        <Panel kicker="Progress" title="Task Status Breakdown">
          <div className="compact-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: "1.5fr 0.7fr 0.7fr" }}>
              <span>Status</span><span className="text-right">Count</span><span className="text-right"><Term tip={TIPS.share} align="right">Share</Term></span>
            </div>
            {[
              { label: "Completed", status: "COMPLETED", count: c.completed },
              { label: "In Progress", status: "IN_PROGRESS", count: c.inProgress },
              { label: "Ordered", status: "ORDERED", count: c.ordered },
              { label: "Not Started", status: "NOT_STARTED", count: c.notStarted },
            ].map((r, i) => (
              <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: "1.5fr 0.7fr 0.7fr" }}
                onClick={() => onSelect({ type: "status", value: r.status, label: `${r.label} Tasks` })}>
                <span>{r.label}</span>
                <span className="text-right">{formatWholeNumber(r.count)}</span>
                <span className="text-right">{p.totalTasks ? formatPercent(r.count / p.totalTasks) : "-"}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="panels-row single">
        <Panel kicker="Budget" title="Budget vs POs by Plan" note="PO variance = budgeted scope for sent POs less committed POs · ERP O/U = the ERP's own over/under (tracked task budget less task-linked POs)">
          <div className="compact-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: "2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr" }}>
              <span>Plan</span><span className="text-right"><Term tip={TIPS.poBudget}>PO Budget</Term></span><span className="text-right"><Term tip={TIPS.actualSpend}>Actual</Term></span><span className="text-right"><Term tip={TIPS.committed}>Committed POs</Term></span><span className="text-right"><Term tip={TIPS.openPos}>Open POs</Term></span><span className="text-right"><Term tip={TIPS.poVariance} align="right">PO Variance</Term></span><span className="text-right"><Term tip={TIPS.erpOu} align="right">ERP O/U</Term></span>
            </div>
            {(() => {
              const spending = dashboard.actualSpending || [];
              const byPlan = {};
              for (const s of spending) {
                const plan = s.plan_name || "(unknown)";
                if (!byPlan[plan]) byPlan[plan] = { budget: 0, actual: 0, committed: 0, open: 0, variance: 0, erpOu: 0 };
                byPlan[plan].budget += safeNumber(s.po_sent_budget_total);
                byPlan[plan].actual += safeNumber(s.effective_actual_total);
                byPlan[plan].committed += safeNumber(s.committed_po_total);
                byPlan[plan].open += safeNumber(s.open_po_total);
                byPlan[plan].variance += safeNumber(s.variance);
                byPlan[plan].erpOu += safeNumber(s.erp_over_under);
              }
              return Object.entries(byPlan).sort((a, b) => b[1].budget - a[1].budget).map(([plan, d], i) => (
                <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: "2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr" }}
                  onClick={() => onSelect({ type: "plan", value: plan, label: plan })}>
                  <span>{plan}</span>
                  <span className="text-right">{formatCompactCurrency(d.budget)}</span>
                  <span className="text-right">{formatCompactCurrency(d.actual)}</span>
                  <span className="text-right">{formatCompactCurrency(d.committed)}</span>
                  <span className="text-right">{formatCompactCurrency(d.open)}</span>
                  <span className={`text-right ${d.variance < 0 ? "text-danger" : d.variance > 0 ? "text-accent" : ""}`}>
                    {formatSignedBudget(d.variance, formatCompactCurrency)}
                  </span>
                  <span className={`text-right ${d.erpOu < 0 ? "text-danger" : d.erpOu > 0 ? "text-accent" : ""}`}>
                    {formatSignedBudget(d.erpOu, formatCompactCurrency)}
                  </span>
                </div>
              ));
            })()}
          </div>
        </Panel>
      </div>

      <div className="panels-row single">
        <Panel kicker="Financials" title="Actual Spending by Job" note="Actual = budget cost of completed tasks · PO variance uses only sent PO scope · ERP O/U matches the ERP's over/under">
          <div className="compact-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: "2.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr" }}>
              <span>Address</span><span className="text-right"><Term tip={TIPS.poBudget}>PO Budget</Term></span><span className="text-right"><Term tip={TIPS.actualSpend}>Actual</Term></span><span className="text-right"><Term tip={TIPS.committed}>Committed POs</Term></span><span className="text-right"><Term tip={TIPS.openPos}>Open POs</Term></span><span className="text-right"><Term tip={TIPS.poVariance} align="right">PO Variance</Term></span><span className="text-right"><Term tip={TIPS.erpOu} align="right">ERP O/U</Term></span>
            </div>
            {spending.map((s, i) => {
              const v = safeNumber(s.variance);
              const ou = safeNumber(s.erp_over_under);
              return (
                <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: "2.5fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.7fr" }}
                  onClick={() => onSelect({ type: "job", value: s.job_id, label: s.project_address })}>
                  <span>{s.project_address || "-"}</span>
                  <span className="text-right">{formatCompactCurrency(s.po_sent_budget_total)}</span>
                  <span className="text-right">{formatCompactCurrency(s.effective_actual_total)}</span>
                  <span className="text-right">{formatCompactCurrency(s.committed_po_total)}</span>
                  <span className="text-right">{formatCompactCurrency(s.open_po_total)}</span>
                  <span className={`text-right ${v < 0 ? "text-danger" : v > 0 ? "text-accent" : ""}`}>
                    {formatSignedBudget(v, formatCompactCurrency)}
                  </span>
                  <span className={`text-right ${ou < 0 ? "text-danger" : ou > 0 ? "text-accent" : ""}`}>
                    {formatSignedBudget(ou, formatCompactCurrency)}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {notStartedJobs.length > 0 && (
        <div className="panels-row single">
          <Panel kicker="Inventory" title="Not Started" note={`${notStartedJobs.length} jobs with no task activity`}>
            <div className="compact-table">
              <div className="compact-table-head" style={{ gridTemplateColumns: overviewJobCols }}>
                <span>Address</span><span>Plan</span><span className="text-right">Tasks</span><span className="text-right"><Term tip={TIPS.milestones}>Milestones</Term></span><span className="text-center"><Term tip={TIPS.progress}>Progress</Term></span><span className="text-right"><Term tip={TIPS.sinceMilestone}>Since Milestone</Term></span><span className="text-right">Start</span><span className="text-right">Budget</span>
              </div>
              {notStartedJobs.map((r, i) => renderOverviewJobRow(r, i, true))}
            </div>
          </Panel>
        </div>
      )}

      <AuditNotes notes={dashboard.auditNotes} />
    </>
  );
}

/* ── Construction Tab ─────────────────────────── */

function ConstructionTab({ dashboard, onSelect }) {
  // Filter to only jobs with activity
  const activeJobs = dashboard.jobProgress.filter((r) => r.completed > 0 || r.in_progress > 0 || r.ordered > 0 || safeNumber(r.progress_percent) > 0);
  const activeJobIds = new Set(activeJobs.map((r) => r.job_id));
  const activeTasks = (dashboard.taskRoster || []).filter((r) => activeJobIds.has(r.job_id));

  // Recompute stats from active jobs only
  const totalTasks = activeTasks.length;
  const completed = activeTasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = activeTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const ordered = activeTasks.filter((t) => t.status === "ORDERED").length;
  const notStarted = activeTasks.filter((t) => t.status === "NOT_STARTED").length;
  const totalBudget = activeTasks.reduce((s, t) => s + safeNumber(t.budget_cost), 0);
  const totalMilestones = activeJobs.reduce((s, j) => s + safeNumber(j.milestones_total), 0);
  const completedMilestones = activeJobs.reduce((s, j) => s + safeNumber(j.milestones_completed), 0);
  const avgMilestoneProgress = activeJobs.length
    ? activeJobs.reduce((s, j) => s + safeNumber(j.progress_percent), 0) / activeJobs.length
    : 0;

  // Recompute stages from active tasks
  const stageOrder = ["Pre-Construction", "Foundation", "Framing", "MEP Rough", "Exterior", "Interior", "Trim", "Close-Out"];
  const stageMap = {};
  for (const t of activeTasks) {
    const s = t.stage || "(unknown)";
    if (!stageMap[s]) stageMap[s] = { stage: s, total_tasks: 0, completed: 0, in_progress: 0, ordered: 0, not_started: 0, stage_budget: 0 };
    stageMap[s].total_tasks++;
    if (t.status === "COMPLETED") stageMap[s].completed++;
    else if (t.status === "IN_PROGRESS") stageMap[s].in_progress++;
    else if (t.status === "ORDERED") stageMap[s].ordered++;
    else stageMap[s].not_started++;
    stageMap[s].stage_budget += safeNumber(t.budget_cost);
  }
  const stages = Object.values(stageMap).sort((a, b) => {
    const ai = stageOrder.indexOf(a.stage), bi = stageOrder.indexOf(b.stage);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // Recompute trades from active tasks
  const groupMap = {};
  for (const t of activeTasks) {
    const g = t.task_group || "(unknown)";
    if (!groupMap[g]) groupMap[g] = { task_group: g, total_tasks: 0, group_budget: 0 };
    groupMap[g].total_tasks++;
    groupMap[g].group_budget += safeNumber(t.budget_cost);
  }
  const groups = Object.values(groupMap).sort((a, b) => b.group_budget - a.group_budget);

  // Upcoming tasks: next 14 days from today
  const now = new Date();
  const upcoming = activeTasks
    .filter((t) => {
      if (t.status === "COMPLETED") return false;
      const start = t.scheduled_start ? new Date(t.scheduled_start) : null;
      if (!start) return false;
      const daysOut = (start - now) / (1000 * 60 * 60 * 24);
      return daysOut >= -3 && daysOut <= 14;
    })
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));

  // Recently completed tasks: completed within last 14 days (by actual_end or scheduled_end)
  const recentlyCompleted = activeTasks
    .filter((t) => {
      if (t.status !== "COMPLETED") return false;
      const end = t.actual_end ? new Date(t.actual_end) : t.scheduled_end ? new Date(t.scheduled_end) : null;
      if (!end || isNaN(end)) return false;
      const daysAgo = (now - end) / (1000 * 60 * 60 * 24);
      return daysAgo >= 0 && daysAgo <= 14;
    })
    .sort((a, b) => {
      const aEnd = new Date(a.actual_end || a.scheduled_end);
      const bEnd = new Date(b.actual_end || b.scheduled_end);
      return bEnd - aEnd; // most recent first
    });

  const detailCols = "2.4fr 1fr 0.6fr 0.7fr 1.4fr 0.8fr 0.7fr 0.7fr";

  return (
    <>
      <div className="kpi-row">
        <KpiCard label="Jobs In Construction" value={formatWholeNumber(activeJobs.length)} sub={`of ${dashboard.summaries.portfolio.totalJobs} total`} />
        <KpiCard label="Tasks (active jobs)" value={formatWholeNumber(totalTasks)} sub={`${completed} done · ${inProgress + ordered} active`} />
        <KpiCard label="Milestone Progress" tip={TIPS.milestoneProgress} value={formatProgressPercent(avgMilestoneProgress)} sub={`${completedMilestones} of ${totalMilestones} milestones`} />
        <KpiCard label="Budget (active)" value={formatCompactCurrency(totalBudget)} />
      </div>

      {upcoming.length > 0 && (
        <div className="panels-row single">
          <Panel kicker="Schedule" title="Upcoming Tasks" note="Next 14 days across active jobs">
            <div className="compact-table">
              <div className="compact-table-head" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1fr 0.7fr 0.7fr" }}>
                <span>Address</span><span>Stage</span><span>Task</span><span>Trade</span><span className="text-right">Scheduled</span><span>Status</span>
              </div>
              {upcoming.slice(0, 20).map((t, i) => {
                const start = new Date(t.scheduled_start);
                const isPast = start < now;
                return (
                  <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1fr 0.7fr 0.7fr" }}
                    onClick={() => onSelect({ type: "job", value: t.job_id, label: t.project_address || t.lot_id })}>
                    <span>{t.project_address || t.lot_id}</span>
                    <span className="text-muted">{t.stage}</span>
                    <span>{t.activity}</span>
                    <span className="text-muted">{t.task_group}</span>
                    <span className={`text-right ${isPast ? "text-warning" : ""}`}>{formatDate(t.scheduled_start)}</span>
                    <span><span className={`pill pill-${t.status === "IN_PROGRESS" ? "watch" : t.status === "ORDERED" ? "good" : "muted"}`}
                      style={t.status === "NOT_STARTED" ? { background: "var(--bg-surface-raised)", color: "var(--text-muted)" } : {}}>{t.status.replace("_", " ")}</span></span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      {recentlyCompleted.length > 0 && (
        <div className="panels-row single">
          <Panel kicker="Schedule" title="Recently Completed" note="Last 14 days across active jobs">
            <div className="compact-table">
              <div className="compact-table-head" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1fr 0.7fr 0.7fr" }}>
                <span>Address</span><span>Stage</span><span>Task</span><span>Trade</span><span className="text-right">Completed</span><span>Vendor</span>
              </div>
              {recentlyCompleted.slice(0, 20).map((t, i) => (
                <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1fr 0.7fr 0.7fr" }}
                  onClick={() => onSelect({ type: "job", value: t.job_id, label: t.project_address || t.lot_id })}>
                  <span>{t.project_address || t.lot_id}</span>
                  <span className="text-muted">{t.stage}</span>
                  <span>{t.activity}</span>
                  <span className="text-muted">{t.task_group}</span>
                  <span className="text-right">{formatDate(t.actual_end || t.scheduled_end)}</span>
                  <span className="text-muted">{t.vendor_name || "-"}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      <div className="panels-row single">
        <Panel kicker="Active Jobs" title="Per-Job Construction Detail" note={`${activeJobs.length} jobs in construction`}>
          <div className="compact-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: detailCols }}>
              <span>Address</span><span>Plan</span><span className="text-right">Tasks Done</span><span className="text-right"><Term tip={TIPS.milestones}>Milestones</Term></span><span className="text-center"><Term tip={TIPS.progress}>Progress</Term></span><span className="text-right"><Term tip={TIPS.sinceMilestone}>Since Milestone</Term></span><span className="text-right">Start</span><span className="text-right">Budget</span>
            </div>
            {activeJobs.map((r, i) => (
              <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: detailCols }}
                onClick={() => onSelect({ type: "job", value: r.job_id, label: r.project_address || `Lot ${r.lot_id}` })}>
                <span>{r.project_address || r.lot_id}</span>
                <span>{r.plan_name}</span>
                <span className="text-right">{r.completed}</span>
                <span className="text-right">{formatMilestoneCount(r)}</span>
                <span className="text-center">{formatMilestoneProgress(r)}</span>
                <span className="text-right" style={{ color: stallColor(r.days_since_milestone) }}>{formatStallDays(r.days_since_milestone)}</span>
                <span className="text-right text-muted">{formatDate(r.earliest_start)}</span>
                <span className="text-right">{formatCompactCurrency(r.total_budget)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="panels-row single">
        <Panel kicker="Stages" title="Tasks by Construction Stage" note="Active jobs only">
          <div className="compact-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: "1.5fr 0.5fr 0.5fr 0.5fr 0.5fr 2fr 0.8fr" }}>
              <span>Stage</span><span className="text-right">Total</span><span className="text-right">Done</span><span className="text-right">Active</span><span className="text-right">Pending</span><span>Progress</span><span className="text-right">Budget</span>
            </div>
            {stages.map((r, i) => (
              <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: "1.5fr 0.5fr 0.5fr 0.5fr 0.5fr 2fr 0.8fr" }}
                onClick={() => onSelect({ type: "stage", value: r.stage, label: r.stage })}>
                <span>{r.stage}</span>
                <span className="text-right">{r.total_tasks}</span>
                <span className="text-right">{r.completed}</span>
                <span className="text-right">{r.in_progress + r.ordered}</span>
                <span className="text-right">{r.not_started}</span>
                <span>
                  <StackedBar completed={r.completed} inProgress={r.in_progress} ordered={r.ordered} notStarted={r.not_started} total={r.total_tasks} />
                </span>
                <span className="text-right">{formatCompactCurrency(r.stage_budget)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="panels-row">
        <Panel kicker="Trades" title="Budget by Trade Group">
          <RankedBars
            items={groups}
            labelKey="task_group"
            valueKey="group_budget"
            formatValue={formatCompactCurrency}
            onSelect={(r) => onSelect({ type: "group", value: r.task_group, label: r.task_group })}
          />
        </Panel>
        <Panel kicker="Trades" title="Task Count by Trade">
          <RankedBars
            items={groups}
            labelKey="task_group"
            valueKey="total_tasks"
            onSelect={(r) => onSelect({ type: "group", value: r.task_group, label: r.task_group })}
          />
        </Panel>
      </div>

      <AuditNotes notes={dashboard.auditNotes} />
    </>
  );
}

/* ── Vendors Tab ──────────────────────────────── */

function VendorsTab({ dashboard, onSelect }) {
  const v = dashboard.summaries.vendors;
  const poDetail = dashboard.vendorPoDetail || [];
  // PO counts derive from the PO detail rows rendered in this tab so the
  // scorecard column always reconciles with the PO Detail panel. (The mart's
  // open_po_count matches raw exactly today — audited 2026-06-10 — this is a
  // consistency choice, not a workaround.)
  const poCountByVendor = {};
  for (const po of poDetail) {
    const name = po.vendor_name;
    poCountByVendor[name] = (poCountByVendor[name] || 0) + 1;
  }
  const scorecard = (dashboard.vendorScorecard || []).map((r) => ({
    ...r,
    open_po_count: poCountByVendor[r.vendor_name] || 0,
  }));

  return (
    <>
      <div className="kpi-row">
        <KpiCard label="Total Vendors" value={formatWholeNumber(v.totalVendors)} />
        <KpiCard label="Total PO Value" tip={TIPS.totalPoValue} value={formatCompactCurrency(v.totalPoValue)} sub={`${v.totalPos} purchase orders`} />
        <KpiCard label="Top Vendor" value={scorecard[0]?.vendor_name || "-"} sub={scorecard[0] ? formatCompactCurrency(scorecard[0].total_po_value) : ""} />
        <KpiCard label="Avg PO Value" tip={TIPS.avgPoValue} value={v.totalPos ? formatCompactCurrency(v.totalPoValue / v.totalPos) : "-"} />
      </div>

      <div className="panels-row">
        <Panel kicker="Scorecard" title="Vendor Ranking by PO Value">
          <RankedBars
            items={scorecard}
            labelKey="vendor_name"
            valueKey="total_po_value"
            formatValue={formatCompactCurrency}
            onSelect={(r) => onSelect({ type: "vendor", value: r.vendor_name, label: r.vendor_name })}
          />
        </Panel>
        <Panel kicker="Detail" title="Vendor Scorecard">
          <div className="compact-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: "2fr 0.8fr 0.5fr 0.5fr" }}>
              <span>Vendor</span><span className="text-right">PO Value</span><span className="text-right">POs</span><span className="text-right">Rank</span>
            </div>
            {scorecard.map((r, i) => (
              <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: "2fr 0.8fr 0.5fr 0.5fr" }}
                onClick={() => onSelect({ type: "vendor", value: r.vendor_name, label: r.vendor_name })}>
                <span>{r.vendor_name}</span>
                <span className="text-right">{formatCurrency(r.total_po_value)}</span>
                <span className="text-right">{r.open_po_count}</span>
                <span className="text-right">#{r.ranking}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="panels-row single">
        <Panel kicker="Purchase Orders" title="PO Detail" note="All purchase orders by value">
          {(() => {
            const addrMap = {};
            for (const j of dashboard.jobProgress || []) addrMap[j.job_id] = j.project_address || j.lot_id;
            return (
          <div className="compact-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: "1.5fr 0.7fr 1.5fr 0.8fr 0.8fr" }}>
              <span>Vendor</span><span>PO #</span><span>Address</span><span className="text-right">Amount</span><span className="text-right">Issued</span>
            </div>
            {poDetail.map((r, i) => (
              <div key={i} className="compact-table-row interactive-row" style={{ gridTemplateColumns: "1.5fr 0.7fr 1.5fr 0.8fr 0.8fr" }}
                onClick={() => onSelect({ type: "vendor", value: r.vendor_name, label: r.vendor_name })}>
                <span>{r.vendor_name}</span>
                <span>{r.po_number}</span>
                <span className="text-muted">{addrMap[r.job_id] || r.job_id}</span>
                <span className="text-right">{formatCurrency(safeNumber(r.po_amount))}</span>
                <span className="text-right">{formatDate(r.issue_date)}</span>
              </div>
            ))}
          </div>
            );
          })()}
        </Panel>
      </div>
    </>
  );
}

/* ── Exceptions Footer (collapsible, secondary) ─ */

function ExceptionsFooter({ dashboard }) {
  const [expanded, setExpanded] = useState(false);
  const e = dashboard.summaries?.exceptions || {};
  const rows = dashboard.exceptionRows || [];

  if (!rows.length) return null;

  const highCount = e.highSeverity || 0;

  return (
    <div style={{
      marginTop: 32,
      borderTop: "1px solid var(--border)",
      paddingTop: 12,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          color: "var(--text-muted)", fontSize: 11, fontWeight: 600,
          letterSpacing: "0.04em", minHeight: 44, padding: "8px 0",
        }}
      >
        <span style={{ fontSize: 14, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "rotate(0)" }}>&#x25B6;</span>
        <span>Data Exceptions</span>
        <span style={{
          fontSize: 10, padding: "1px 6px", borderRadius: 4,
          background: highCount > 0 ? "var(--danger-dim)" : "var(--bg-surface-raised)",
          color: highCount > 0 ? "var(--danger)" : "var(--text-muted)",
        }}>
          {rows.length}
        </span>
        {highCount > 0 && (
          <span style={{ fontSize: 10, color: "var(--danger)" }}>{highCount} HIGH</span>
        )}
        <span style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>daily snapshot</span>
      </button>

      {expanded && (
        <div style={{ marginTop: 8 }}>
          <div className="compact-table">
            <div className="compact-table-head" style={{ gridTemplateColumns: "2fr 1.5fr 0.8fr 0.6fr" }}>
              <span>Entity</span><span>Type</span><span>Severity</span><span className="text-right">Days</span>
            </div>
            {rows.map((r, i) => (
              <div key={i} className="compact-table-row" style={{ gridTemplateColumns: "2fr 1.5fr 0.8fr 0.6fr", opacity: 0.7 }}>
                <span style={{ fontSize: 10 }}>{r.affected_entity}</span>
                <span style={{ fontSize: 10 }}>{r.exception_type}</span>
                <span>
                  <span className={`pill pill-${r.severity === "HIGH" ? "alert" : r.severity === "MEDIUM" ? "watch" : "muted"}`}
                    style={r.severity === "LOW" ? { background: "var(--bg-surface-raised)", color: "var(--text-muted)" } : {}}>
                    {r.severity}
                  </span>
                </span>
                <span className="text-right" style={{ fontSize: 10 }}>{safeNumber(r.days_outstanding)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Filter Bar for Drawer ────────────────────── */

const FILTERABLE_KEYS = new Set(["stage", "status", "task_group", "vendor_name", "plan_name", "community", "severity"]);
const FILTER_LABELS = { stage: "Stage", status: "Status", task_group: "Trade", vendor_name: "Vendor", plan_name: "Plan", community: "Community", severity: "Severity" };

function DrawerFilters({ columns, rows, filters, setFilters }) {
  const filterableCols = columns.filter((c) => FILTERABLE_KEYS.has(c.key));
  if (!filterableCols.length) return null;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
      {filterableCols.map((col) => {
        const uniqueVals = [...new Set(rows.map((r) => r[col.key]).filter(Boolean))].sort();
        if (uniqueVals.length <= 1) return null;
        return (
          <select
            key={col.key}
            className="schedule-select"
            value={filters[col.key] || ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, [col.key]: e.target.value }))}
            style={filters[col.key] ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}
          >
            <option value="">All {FILTER_LABELS[col.key] || col.label}</option>
            {uniqueVals.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        );
      })}
      {Object.values(filters).some(Boolean) && (
        <button className="schedule-btn" onClick={() => setFilters({})}>
          Clear
        </button>
      )}
    </div>
  );
}

/* ── Drilldown Drawer ─────────────────────────── */

function DrilldownDrawer({ detail, dashboard, onClose, onDrill }) {
  const [filters, setFilters] = useState({});
  const detailKey = detail ? `${detail.type}:${detail.value}` : null;

  // Reset filters when detail changes
  useEffect(() => { setFilters({}); }, [detailKey]);

  if (!detail) return null;

  let title = detail.label || detail.value;
  let rows = [];
  let columns = [];
  let rowDrill = null;

  if (detail.type === "job") {
    const jobTasks = (dashboard.taskRoster || []).filter((r) => r.job_id === detail.value);
    title = `Tasks for ${detail.label}`;
    columns = [
      { key: "stage", label: "Stage", width: "1fr" },
      { key: "task_group", label: "Trade", width: "1fr" },
      { key: "activity", label: "Activity", width: "1.5fr" },
      { key: "status", label: "Status", width: "0.8fr" },
      { key: "scheduled_start", label: "Sched Start", width: "0.8fr", format: formatDate },
      { key: "scheduled_end", label: "Sched End", width: "0.8fr", format: formatDate },
      { key: "vendor_name", label: "Vendor", width: "1fr" },
      { key: "budget_cost", label: "Budget", width: "0.8fr", format: (v) => formatCurrency(safeNumber(v)) },
    ];
    rows = jobTasks;
  } else if (detail.type === "stage") {
    const stageTasks = (dashboard.taskRoster || []).filter((r) => r.stage === detail.value);
    title = `${detail.label} — All Tasks`;
    columns = [
      { key: "project_address", label: "Address", width: "1.5fr" },
      { key: "task_group", label: "Trade", width: "1fr" },
      { key: "activity", label: "Activity", width: "1.5fr" },
      { key: "status", label: "Status", width: "0.8fr" },
      { key: "vendor_name", label: "Vendor", width: "1fr" },
      { key: "budget_cost", label: "Budget", width: "0.8fr", format: (v) => formatCurrency(safeNumber(v)) },
    ];
    rows = stageTasks;
  } else if (detail.type === "group") {
    const groupTasks = (dashboard.taskRoster || []).filter((r) => r.task_group === detail.value);
    title = `${detail.label} — All Tasks`;
    columns = [
      { key: "project_address", label: "Address", width: "1.5fr" },
      { key: "stage", label: "Stage", width: "1fr" },
      { key: "activity", label: "Activity", width: "1.5fr" },
      { key: "status", label: "Status", width: "0.8fr" },
      { key: "vendor_name", label: "Vendor", width: "1fr" },
      { key: "budget_cost", label: "Budget", width: "0.8fr", format: (v) => formatCurrency(safeNumber(v)) },
    ];
    rows = groupTasks;
  } else if (detail.type === "vendor") {
    const jobAddressMap = {};
    for (const j of dashboard.jobProgress || []) {
      jobAddressMap[j.job_id] = j.project_address || j.lot_id;
    }
    const vendorPos = (dashboard.vendorPoDetail || []).filter((r) => r.vendor_name === detail.value)
      .map((r) => ({ ...r, address: jobAddressMap[r.job_id] || r.job_id }));
    title = `${detail.label} — Purchase Orders`;
    columns = [
      { key: "po_number", label: "PO #", width: "0.8fr" },
      { key: "address", label: "Address", width: "2fr" },
      { key: "po_amount", label: "Amount", width: "0.8fr", format: (v) => formatCurrency(safeNumber(v)) },
      { key: "issue_date", label: "Issued", width: "0.8fr", format: formatDate },
    ];
    rows = vendorPos;
    rowDrill = (r) => onDrill?.({ type: "job", value: r.job_id, label: r.address || r.job_id });
  } else if (detail.type === "plan") {
    const planJobs = dashboard.jobProgress.filter((r) => r.plan_name === detail.value);
    title = `${detail.label} — Jobs`;
    columns = [
      { key: "project_address", label: "Address", width: "2fr", format: (v, r) => v || r?.lot_id || "-" },
      { key: "completed", label: "Done", width: "0.5fr" },
      { key: "total_tasks", label: "Total", width: "0.5fr" },
      { key: "milestones_completed", label: "Milestones", width: "0.8fr", format: (_v, r) => formatMilestoneCount(r) },
      { key: "progress_milestone", label: "Progress", width: "1fr", format: (_v, r) => formatMilestoneProgress(r) },
      { key: "total_budget", label: "Budget", width: "0.8fr", format: (v) => formatCurrency(safeNumber(v)) },
    ];
    rows = planJobs;
    rowDrill = (r) => onDrill?.({ type: "job", value: r.job_id, label: r.project_address || `Lot ${r.lot_id}` });
  } else if (detail.type === "status") {
    const statusTasks = (dashboard.taskRoster || []).filter((r) => r.status === detail.value);
    title = `${detail.label} (${statusTasks.length})`;
    columns = [
      { key: "project_address", label: "Address", width: "1.5fr", format: (v, r) => v || r?.lot_id || "-" },
      { key: "stage", label: "Stage", width: "0.8fr" },
      { key: "task_group", label: "Trade", width: "0.8fr" },
      { key: "activity", label: "Activity", width: "1.5fr" },
      { key: "scheduled_start", label: "Start", width: "0.7fr", format: formatDate },
      { key: "vendor_name", label: "Vendor", width: "0.8fr" },
      { key: "budget_cost", label: "Budget", width: "0.7fr", format: (v) => formatCurrency(safeNumber(v)) },
    ];
    rows = statusTasks;
  } else if (detail.type === "all_jobs") {
    title = detail.label;
    columns = [
      { key: "project_address", label: "Address", width: "2fr", format: (v, r) => v || r?.lot_id || "-" },
      { key: "plan_name", label: "Plan", width: "1fr" },
      { key: "completed", label: "Done", width: "0.5fr" },
      { key: "total_tasks", label: "Tasks", width: "0.5fr" },
      { key: "milestones_completed", label: "Milestones", width: "0.7fr", format: (_v, r) => formatMilestoneCount(r) },
      { key: "progress_milestone", label: "Progress", width: "1fr", format: (_v, r) => formatMilestoneProgress(r) },
      { key: "total_budget", label: "Budget", width: "0.8fr", format: (v) => formatCurrency(safeNumber(v)) },
    ];
    rows = dashboard.jobProgress;
    rowDrill = (r) => onDrill?.({ type: "job", value: r.job_id, label: r.project_address || `Lot ${r.lot_id}` });
  } else if (detail.type === "all_tasks") {
    title = `All Tasks (${(dashboard.taskRoster || []).length})`;
    columns = [
      { key: "project_address", label: "Address", width: "1.5fr", format: (v, r) => v || r?.lot_id || "-" },
      { key: "stage", label: "Stage", width: "0.8fr" },
      { key: "activity", label: "Activity", width: "1.5fr" },
      { key: "status", label: "Status", width: "0.7fr" },
      { key: "scheduled_start", label: "Start", width: "0.7fr", format: formatDate },
      { key: "budget_cost", label: "Budget", width: "0.7fr", format: (v) => formatCurrency(safeNumber(v)) },
    ];
    rows = dashboard.taskRoster || [];
  } else if (detail.type === "spending") {
    title = detail.label || "Actual Spending by Job";
    columns = [
      { key: "project_address", label: "Address", width: "2fr" },
      { key: "plan_name", label: "Plan", width: "1fr" },
      { key: "po_sent_budget_total", label: "PO Budget", width: "0.8fr", tip: "Budget for tasks whose vendor has a PO on this job (sent scope)", format: (v) => formatCurrency(safeNumber(v)) },
      { key: "effective_actual_total", label: "Actual", width: "0.8fr", tip: "Budget cost of completed tasks (proxy — the ERP feed has no invoice/payment data yet)", format: (v) => formatCurrency(safeNumber(v)) },
      { key: "committed_po_total", label: "Committed POs", width: "0.8fr", tip: "PO dollars issued", format: (v) => formatCurrency(safeNumber(v)) },
      { key: "open_po_total", label: "Open POs", width: "0.8fr", tip: "Committed minus paid — equals Committed until payments post in the ERP", format: (v) => formatCurrency(safeNumber(v)) },
      { key: "variance", label: "PO Variance", width: "0.8fr", tip: "PO Budget minus Committed POs — sent-scope budget not yet committed (headroom)", format: (v) => formatSignedBudget(v, formatCurrency) },
      { key: "erp_over_under", label: "ERP O/U", width: "0.8fr", tip: "The ERP's over/under: tracked task budget minus task-linked POs. Positive = under budget on PO'd line items", format: (v) => formatSignedBudget(v, formatCurrency) },
    ];
    rows = dashboard.actualSpending || [];
    rowDrill = (r) => onDrill?.({ type: "job", value: r.job_id, label: r.project_address || r.job_id });
  } else if (detail.type === "all_vendors") {
    title = "All Vendors";
    columns = [
      { key: "vendor_name", label: "Vendor", width: "2fr" },
      { key: "total_po_value", label: "PO Value", width: "1fr", format: (v) => formatCurrency(safeNumber(v)) },
      { key: "open_po_count", label: "POs", width: "0.5fr" },
      { key: "ranking", label: "Rank", width: "0.5fr", format: (v) => `#${v}` },
    ];
    rows = dashboard.vendorScorecard || [];
  }

  // Apply filters
  const filteredRows = rows.filter((r) => {
    for (const [key, val] of Object.entries(filters)) {
      if (val && r[key] !== val) return false;
    }
    return true;
  });

  const gridCols = columns.map((c) => c.width).join(" ");

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{title}</h3>
          <span className="drawer-count">{filteredRows.length}{filteredRows.length !== rows.length ? ` of ${rows.length}` : ""} row{filteredRows.length !== 1 ? "s" : ""}</span>
          <button className="drawer-close" onClick={onClose}>&#x2715;</button>
        </div>
        <DrawerFilters columns={columns} rows={rows} filters={filters} setFilters={setFilters} />
        <div className="compact-table">
          <div className="compact-table-head" style={{ gridTemplateColumns: gridCols }}>
            {columns.map((c, ci) => <span key={c.key}>{c.tip ? <Term tip={c.tip} below align={ci >= columns.length - 2 ? "right" : undefined}>{c.label}</Term> : c.label}</span>)}
          </div>
          {filteredRows.map((r, i) => (
            <div
              key={i}
              className={`compact-table-row ${rowDrill ? "interactive-row" : ""}`}
              style={{ gridTemplateColumns: gridCols }}
              onClick={rowDrill ? () => rowDrill(r) : undefined}
              title={rowDrill ? "Open this job" : undefined}
            >
              {columns.map((c) => (
                <span key={c.key}>{c.format ? c.format(r[c.key], r) : (r[c.key] ?? "-")}</span>
              ))}
            </div>
          ))}
          {filteredRows.length === 0 && <div className="compact-table-row" style={{ opacity: 0.5, padding: "12px" }}>No data</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Quality Checks Panel ─────────────────────── */

function QualityChecks({ checks = [] }) {
  if (!checks.length) return null;
  return (
    <div className="quality-checks" style={{ padding: "16px 0", borderTop: "1px solid var(--color-border)" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, marginBottom: 8 }}>Data Quality</div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {checks.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: c.tone === "good" ? "var(--color-success)" : c.tone === "watch" ? "var(--color-warning)" : "var(--color-alert)",
            }} />
            <span>{c.label}: {formatPercent(c.coverage)} ({c.coveredRows}/{c.totalRows})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Shell ───────────────────────────────── */

export default function DashboardShell({ dashboard }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDetail, setSelectedDetail] = useState(null);

  const currentTab = ALL_TABS.find((t) => t.id === activeTab) || ALL_TABS[0];
  const CLIENT_NAME = dashboard.config?.clientName || "Dashboard";
  const p = dashboard.summaries?.portfolio || {};
  const c = dashboard.summaries?.construction || {};
  const v = dashboard.summaries?.vendors || {};

  if (dashboard.errorMessage) {
    return (
      <div className="shell">
        <div className="error-banner">
          <strong>Dashboard unavailable</strong>
          <p>{dashboard.errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      {/* Shell Bar */}
      <div className="shell-bar">
        <div className="brand">
          <span className="brand-name">{CLIENT_NAME}</span> / Builder Ops Console
        </div>
        <div className="shell-bar-right">
          <div className="config-chips">
            <span className="chip">{dashboard.sourceMode}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <nav className="mobile-tabs" aria-label="Dashboard sections">
        {ALL_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`mobile-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => { setActiveTab(tab.id); setSelectedDetail(null); }}
          >
            <span className="mobile-tab-mono">{tab.mono}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Rail */}
      <nav className="rail">
        <div className="rail-tabs">
          {SECTIONS.map((sec) => (
            <div key={sec.label} className="rail-section">
              <div className="rail-section-label">{sec.label}</div>
              {sec.tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`rail-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => { setActiveTab(tab.id); setSelectedDetail(null); }}
                >
                  <span className="rail-tab-mono">{tab.mono}</span>
                  <span className="rail-tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="rail-stats">
          <div className="rail-stat"><span className="rail-stat-value">{formatWholeNumber(p.totalJobs)}</span><span className="rail-stat-label">Jobs</span></div>
          <div className="rail-stat"><span className="rail-stat-value">{formatWholeNumber(c.completed)}</span><span className="rail-stat-label">Done</span></div>
          <div className="rail-stat"><span className="rail-stat-value">{formatCompactCurrency(p.totalBudget)}</span><span className="rail-stat-label">Budget</span></div>
          <div className="rail-stat"><span className="rail-stat-value">{formatCompactCurrency(v.totalPoValue)}</span><span className="rail-stat-label">POs</span></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="tab-header">
          <h2>{currentTab.title}</h2>
          <p className="tab-desc">{currentTab.desc}</p>
        </div>

        {activeTab === "overview" && <OverviewTab dashboard={dashboard} onSelect={setSelectedDetail} />}
        {activeTab === "construction" && <ConstructionTab dashboard={dashboard} onSelect={setSelectedDetail} />}
        {activeTab === "vendors" && <VendorsTab dashboard={dashboard} onSelect={setSelectedDetail} />}
        {activeTab === "land-runway" && <LandRunwayTab dashboard={dashboard} onSelect={setSelectedDetail} />}
        <QualityChecks checks={dashboard.qualityChecks} />
        <ExceptionsFooter dashboard={dashboard} />
      </main>

      {/* Drilldown Drawer */}
      <DrilldownDrawer detail={selectedDetail} dashboard={dashboard} onClose={() => setSelectedDetail(null)} onDrill={setSelectedDetail} />

      {/* AI Analyst chat */}
      <AiAnalyst dashboard={dashboard} />
    </div>
  );
}
