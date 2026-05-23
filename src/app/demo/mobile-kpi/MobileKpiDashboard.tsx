"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  DollarSign,
  FileCheck2,
  FilePlus2,
  FileText,
  Home,
  Hourglass,
  KeyRound,
  Layers,
  ListChecks,
  Map as MapIcon,
  Milestone,
  Percent,
  ReceiptText,
  Timer,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";

type DashboardTone = "good" | "watch" | "risk";
type KpiTag = "schedule" | "budget" | "pipeline" | "owners";
type Category = "all" | KpiTag | "milestones";
type Metric = "stock" | "flow" | "money" | "rate" | "duration";
type ValueFormat = "count" | "pct" | "usd" | "days";
type TrendDirection = "up" | "down" | "flat";

type Community = {
  key: string;
  label: string;
  hint: string;
  share: number; // fraction of the portfolio (stocks/money scale by this)
  delta: number; // rate adjustment in points
  deltaD: number; // duration adjustment in days
};

type Period = {
  key: string;
  label: string;
  factor: number; // flow metrics scale by this (relative to "this week")
  delta: number;
  deltaD: number;
};

type BaseKpi = {
  id: string;
  label: string;
  icon: LucideIcon;
  tags: KpiTag[];
  metric: Metric;
  base: number;
  format: ValueFormat;
  tone: DashboardTone;
  trend: TrendDirection;
  prog?: number; // explicit progress fill; pct metrics default to their value
  detail: string | ((n: number, scope: Community, period: Period) => string);
};

type Kpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: DashboardTone;
  icon: LucideIcon;
  progress: number;
  trend: TrendDirection;
  tags: KpiTag[];
};

// ── scope (community) + review (period) options ──────────────────────────────
const COMMUNITIES: Community[] = [
  { key: "all", label: "All communities", hint: "6 active · 142 jobs", share: 1, delta: 0, deltaD: 0 },
  { key: "sunshine", label: "Sunshine Ridge", hint: "46 jobs", share: 0.32, delta: 2, deltaD: -2 },
  { key: "lake-nona", label: "Lake Nona", hint: "34 jobs", share: 0.24, delta: -3, deltaD: 3 },
  { key: "emerald", label: "Emerald Bay", hint: "25 jobs", share: 0.175, delta: 1, deltaD: -1 },
  { key: "magnolia", label: "Magnolia Park", hint: "23 jobs", share: 0.16, delta: -1, deltaD: 1 },
  { key: "palm", label: "Palm Coast", hint: "14 jobs", share: 0.1, delta: 4, deltaD: -3 },
];

const PERIODS: Period[] = [
  { key: "today", label: "Today", factor: 0.2, delta: -1, deltaD: 1 },
  { key: "week", label: "This week", factor: 1, delta: 0, deltaD: 0 },
  { key: "month", label: "This month", factor: 4.2, delta: 1, deltaD: -1 },
  { key: "quarter", label: "This quarter", factor: 12.5, delta: 2, deltaD: -2 },
];

const TOTAL_BUDGET = 55_000_000; // portfolio budget, for "budget used → $ actual"

// ── KPI catalog (expanded for schedule, budget, pipeline) ────────────────────
const BASE_KPIS: BaseKpi[] = [
  // Pipeline
  { id: "active-jobs", label: "Active jobs", icon: Home, tags: ["pipeline"], metric: "stock", base: 142, format: "count", tone: "good", trend: "up", prog: 72, detail: (n) => `${Math.max(1, Math.round(n * 0.08))} near close` },
  { id: "starts", label: "Starts", icon: CalendarDays, tags: ["schedule", "pipeline"], metric: "flow", base: 18, format: "count", tone: "watch", trend: "down", prog: 62, detail: (n) => `${Math.max(1, Math.round(n * 0.22))} delayed` },
  { id: "closings", label: "Closings due", icon: KeyRound, tags: ["pipeline", "schedule"], metric: "flow", base: 14, format: "count", tone: "watch", trend: "flat", prog: 57, detail: (n) => `${Math.max(1, Math.round(n * 0.2))} need signoff` },
  { id: "inventory", label: "Inventory homes", icon: Building2, tags: ["pipeline"], metric: "stock", base: 31, format: "count", tone: "watch", trend: "up", prog: 56, detail: (n) => `${Math.max(1, Math.round(n * 0.16))} need action` },
  { id: "backlog", label: "Backlog value", icon: Layers, tags: ["pipeline", "budget"], metric: "money", base: 96_000_000, format: "usd", tone: "good", trend: "up", prog: 78, detail: "sold + permitted" },
  { id: "lots", label: "Lots remaining", icon: MapIcon, tags: ["pipeline"], metric: "stock", base: 214, format: "count", tone: "good", trend: "down", prog: 64, detail: (_n, s) => (s.key === "all" ? "across 6 communities" : "in this community") },
  { id: "sold-ns", label: "Sold, not started", icon: Hourglass, tags: ["pipeline", "schedule"], metric: "stock", base: 27, format: "count", tone: "watch", trend: "up", prog: 48, detail: "ready to release" },

  // Schedule
  { id: "on-schedule", label: "On schedule", icon: Clock3, tags: ["schedule"], metric: "rate", base: 87, format: "pct", tone: "good", trend: "up", detail: "+5 pts vs prior" },
  { id: "cycle", label: "Cycle time", icon: TrendingDown, tags: ["schedule"], metric: "duration", base: 64, format: "days", tone: "good", trend: "down", prog: 66, detail: "-3 days vs prior" },
  { id: "adherence", label: "Schedule adherence", icon: CalendarCheck, tags: ["schedule"], metric: "rate", base: 91, format: "pct", tone: "good", trend: "up", detail: "phase dates hit" },
  { id: "at-risk", label: "At-risk dates", icon: CalendarClock, tags: ["schedule"], metric: "stock", base: 8, format: "count", tone: "risk", trend: "up", prog: 32, detail: "next 14 days" },
  { id: "start-lag", label: "Avg start lag", icon: Timer, tags: ["schedule", "pipeline"], metric: "duration", base: 5, format: "days", tone: "watch", trend: "flat", prog: 44, detail: "permit → start" },
  { id: "inspections", label: "Inspections passed", icon: BadgeCheck, tags: ["schedule"], metric: "rate", base: 94, format: "pct", tone: "good", trend: "up", detail: "first-pass rate" },
  { id: "permits", label: "Permits aging", icon: FileCheck2, tags: ["schedule", "owners"], metric: "stock", base: 9, format: "count", tone: "risk", trend: "up", prog: 34, detail: (n) => `${Math.max(1, Math.round(n * 0.33))} over 14 days` },

  // Budget
  { id: "budget-used", label: "Budget used", icon: DollarSign, tags: ["budget"], metric: "rate", base: 58, format: "pct", tone: "watch", trend: "up", detail: (n, s) => `$${((n / 100) * TOTAL_BUDGET * s.share / 1e6).toFixed(1)}M actual` },
  { id: "variance", label: "Cost variance", icon: CircleDollarSign, tags: ["budget"], metric: "money", base: 284_000, format: "usd", tone: "risk", trend: "up", prog: 36, detail: "flagged early" },
  { id: "margin", label: "Avg margin", icon: Percent, tags: ["budget"], metric: "rate", base: 18.6, format: "pct", tone: "good", trend: "up", prog: 72, detail: "+0.4 pts vs target" },
  { id: "change-orders", label: "Change orders", icon: FilePlus2, tags: ["budget", "owners"], metric: "stock", base: 23, format: "count", tone: "watch", trend: "up", prog: 41, detail: (n) => `${Math.max(1, Math.round(n * 0.3))} pending` },
  { id: "ctc", label: "Cost to complete", icon: Calculator, tags: ["budget"], metric: "money", base: 13_400_000, format: "usd", tone: "watch", trend: "down", prog: 53, detail: "remaining spend" },
  { id: "draws", label: "Draws ready", icon: ReceiptText, tags: ["budget"], metric: "money", base: 8_400_000, format: "usd", tone: "good", trend: "up", prog: 74, detail: "finance queue" },
  { id: "po", label: "PO commitments", icon: FileText, tags: ["budget"], metric: "money", base: 9_100_000, format: "usd", tone: "good", trend: "flat", prog: 61, detail: "open POs" },
  { id: "margin-review", label: "Margin review", icon: TrendingUp, tags: ["budget", "owners"], metric: "stock", base: 7, format: "count", tone: "watch", trend: "flat", prog: 46, detail: "jobs to review" },

  // Owners / follow-up
  { id: "selections", label: "Selections late", icon: ClipboardList, tags: ["owners", "schedule"], metric: "stock", base: 6, format: "count", tone: "risk", trend: "up", prog: 31, detail: "blocking starts" },
  { id: "flags", label: "Open flags", icon: AlertTriangle, tags: ["owners"], metric: "stock", base: 12, format: "count", tone: "risk", trend: "down", prog: 38, detail: "8 resolved this week" },
  { id: "punch", label: "Punch list", icon: ClipboardCheck, tags: ["owners"], metric: "stock", base: 22, format: "count", tone: "watch", trend: "up", prog: 52, detail: (n) => `${Math.max(1, Math.round(n * 0.36))} older than 7d` },
  { id: "warranty", label: "Warranty items", icon: Wrench, tags: ["owners"], metric: "stock", base: 18, format: "count", tone: "watch", trend: "flat", prog: 49, detail: (n) => `${Math.max(1, Math.round(n * 0.22))} overdue` },
];

// ── milestone job tracker ────────────────────────────────────────────────────
const MILESTONE_PHASES = ["Permit", "Foundation", "Framing", "MEP", "Finishes", "Closing"] as const;

type MilestoneJob = {
  id: string;
  community: string;
  lot: string;
  plan: string;
  phase: number; // index into MILESTONE_PHASES
  pct: number;
  days: number; // days in current phase
  tone: DashboardTone;
  next: string;
};

const MILESTONE_JOBS: MilestoneJob[] = [
  { id: "SH-1002", community: "sunshine", lot: "Lot 16", plan: "Avalon 1983", phase: 5, pct: 99, days: 6, tone: "good", next: "Closing · May 24" },
  { id: "SH-1007", community: "sunshine", lot: "Lot 52", plan: "Harmon 2100", phase: 3, pct: 54, days: 9, tone: "watch", next: "Finishes · Jun 12" },
  { id: "SH-1011", community: "sunshine", lot: "Lot 59", plan: "Harmon 2100", phase: 0, pct: 3, days: 28, tone: "risk", next: "Foundation · Jun 02" },
  { id: "SH-1023", community: "sunshine", lot: "Lot 2", plan: "Avalon 1983", phase: 0, pct: 9, days: 14, tone: "good", next: "Foundation · Jun 05" },
  { id: "SH-1024", community: "lake-nona", lot: "Lot 61", plan: "Seville 2306", phase: 1, pct: 19, days: 12, tone: "watch", next: "Framing · Jun 06" },
  { id: "SH-1004", community: "lake-nona", lot: "Lot 11", plan: "Catalina 1750", phase: 2, pct: 33, days: 22, tone: "risk", next: "MEP · Jun 09" },
  { id: "SH-1009", community: "lake-nona", lot: "Lot 74", plan: "Catalina 1750", phase: 3, pct: 71, days: 7, tone: "good", next: "Finishes · Jun 01" },
  { id: "SH-1003", community: "emerald", lot: "Lot 60", plan: "Avalon 1983", phase: 4, pct: 78, days: 14, tone: "watch", next: "Closing · Jun 18" },
  { id: "SH-1013", community: "emerald", lot: "Lot 65", plan: "Harmon 2100", phase: 1, pct: 12, days: 9, tone: "good", next: "Framing · Jun 20" },
  { id: "SH-1001", community: "magnolia", lot: "Lot 37", plan: "Seville 2306", phase: 2, pct: 34, days: 18, tone: "watch", next: "MEP · Jun 11" },
  { id: "SH-1008", community: "magnolia", lot: "Lot 28", plan: "Avalon 1983", phase: 4, pct: 78, days: 35, tone: "risk", next: "Closing · Jun 24" },
  { id: "SH-1005", community: "magnolia", lot: "Lot 24", plan: "Catalina 1750", phase: 2, pct: 27, days: 16, tone: "watch", next: "MEP · Jun 16" },
  { id: "SH-1021", community: "palm", lot: "Lot 53", plan: "Meridian 2450", phase: 5, pct: 98, days: 22, tone: "good", next: "Closing · May 28" },
  { id: "SH-1015", community: "palm", lot: "Lot 70", plan: "Meridian 2450", phase: 3, pct: 72, days: 11, tone: "watch", next: "Finishes · Jun 14" },
];

const categoryDefs: Array<{ key: Category; label: string }> = [
  { key: "all", label: "All" },
  { key: "schedule", label: "Schedule" },
  { key: "budget", label: "Budget" },
  { key: "pipeline", label: "Pipeline" },
  { key: "owners", label: "Owners" },
  { key: "milestones", label: "Milestones" },
];

const filterHeadings: Record<Category, string> = {
  all: "All KPIs",
  schedule: "Schedule KPIs",
  budget: "Budget KPIs",
  pipeline: "Pipeline KPIs",
  owners: "Follow-up KPIs",
  milestones: "Milestone tracker",
};

const communityLabel = (key: string) =>
  COMMUNITIES.find((c) => c.key === key)?.label ?? key;

// Inset focus ring: the chip row scrolls horizontally, which makes its
// overflow-y compute to `auto` and clip an outset ring.
const CHIP_BASE =
  "shrink-0 cursor-pointer touch-manipulation rounded-full border px-3.5 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] transition active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8df0ce]";

function formatUsd(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

// Metric-aware projection of a KPI onto the selected community + period, so the
// scope and review filters genuinely change the numbers (not just the labels):
// stocks/money scale by community share, flows by community × period, and
// rates/durations shift by small per-scope/per-period deltas.
function computeKpi(b: BaseKpi, scope: Community, period: Period): Kpi {
  let n = b.base;
  if (b.metric === "stock" || b.metric === "money") n = b.base * scope.share;
  else if (b.metric === "flow") n = b.base * scope.share * period.factor;
  else if (b.metric === "rate") n = Math.min(100, Math.max(0, b.base + scope.delta + period.delta));
  else if (b.metric === "duration") n = Math.max(1, b.base + scope.deltaD + period.deltaD);

  let value: string;
  if (b.format === "pct") {
    const decimals = b.base % 1 !== 0 ? 1 : 0;
    value = `${n.toFixed(decimals)}%`;
  } else if (b.format === "days") {
    value = `${Math.round(n)}d`;
  } else if (b.format === "usd") {
    value = formatUsd(n);
  } else {
    value = `${Math.round(n)}`;
  }

  const progress =
    b.prog != null ? b.prog : b.format === "pct" ? Math.round(n) : 50;
  const detail = typeof b.detail === "function" ? b.detail(n, scope, period) : b.detail;

  return {
    id: b.id,
    label: b.label,
    value,
    detail,
    tone: b.tone,
    icon: b.icon,
    progress,
    trend: b.trend,
    tags: b.tags,
  };
}

function computeKpis(scope: Community, period: Period): Kpi[] {
  return BASE_KPIS.map((b) => computeKpi(b, scope, period));
}

function kpisForCategory(kpis: Kpi[], category: Category): Kpi[] {
  if (category === "all" || category === "milestones") return kpis;
  return kpis.filter((kpi) => kpi.tags.includes(category));
}

function toneClasses(tone: DashboardTone) {
  if (tone === "risk") {
    return {
      card: "border-[#ffb86b]/24 bg-[#201a18]",
      icon: "bg-[#2d211d] text-[#ffb86b] ring-[#ffb86b]/20",
      bar: "from-[#ffb86b] to-[#ffd28f]",
      text: "text-[#ffcb88]",
      dot: "bg-[#ffb86b]",
    };
  }
  if (tone === "watch") {
    return {
      card: "border-[#9ed7ff]/18 bg-[#111c2b]",
      icon: "bg-[#19283a] text-[#9ed7ff] ring-[#9ed7ff]/18",
      bar: "from-[#77c8f2] to-[#b9e8ff]",
      text: "text-[#b9e8ff]",
      dot: "bg-[#77c8f2]",
    };
  }
  return {
    card: "border-[#78e0c0]/16 bg-[#0d201f]",
    icon: "bg-[#122d2c] text-[#78e0c0] ring-[#78e0c0]/18",
    bar: "from-[#43d19d] to-[#87e7d5]",
    text: "text-[#87e7d5]",
    dot: "bg-[#43d19d]",
  };
}

// Status conveyed as a word (not color alone) so it survives color-blindness
// and screen readers — the dashboard's whole job is triage.
const STATUS_LABEL: Record<DashboardTone, string> = {
  good: "On track",
  watch: "Watch",
  risk: "At risk",
};

const TREND_META: Record<TrendDirection, { Icon: LucideIcon; label: string }> = {
  up: { Icon: ArrowUpRight, label: "Trending up" },
  down: { Icon: ArrowDownRight, label: "Trending down" },
  flat: { Icon: ArrowRight, label: "Holding steady" },
};

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ParsedValue = {
  prefix: string;
  target: number;
  suffix: string;
  decimals: number;
};

function parseValue(value: string): ParsedValue | null {
  const match = value.match(/^(\D*?)(-?\d+(?:\.\d+)?)(\D*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { prefix, target: Number.parseFloat(numStr), suffix, decimals };
}

function formatParsed(parsed: ParsedValue, current: number): string {
  return `${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`;
}

// Animates the numeric portion of a KPI value. On first mount it counts up from
// zero with a staggered intro. On later changes (e.g. a scope/period filter) it
// tweens smoothly from the previous value to the new one — a live-data update,
// not a jarring reset back to zero.
function CountUpValue({ value, delay = 0 }: { value: string; delay?: number }) {
  const reduce = useReducedMotion();
  const parsed = useMemo(() => parseValue(value), [value]);
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(0);
  const mountedRef = useRef(false);

  useIsoLayoutEffect(() => {
    if (!parsed || reduce) {
      setDisplay(value);
      if (parsed) fromRef.current = parsed.target;
      mountedRef.current = true;
      return;
    }
    const from = fromRef.current;
    const to = parsed.target;
    const firstRun = !mountedRef.current;
    mountedRef.current = true;
    fromRef.current = to;

    if (from === to) {
      setDisplay(formatParsed(parsed, to));
      return;
    }
    setDisplay(formatParsed(parsed, from));
    const controls = animate(from, to, {
      duration: firstRun ? 0.85 : 0.55,
      delay: firstRun ? delay : 0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(formatParsed(parsed, latest)),
    });
    return () => controls.stop();
  }, [parsed, value, reduce, delay]);

  return <span className="tabular-nums">{display}</span>;
}

function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const Icon = kpi.icon;
  const tone = toneClasses(kpi.tone);
  const status = STATUS_LABEL[kpi.tone];
  const trend = TREND_META[kpi.trend];
  const TrendIcon = trend.Icon;
  const reduce = useReducedMotion();
  const delay = Math.min(index, 7) * 0.05;

  return (
    <article
      role="listitem"
      className={`relative flex min-h-[8.75rem] flex-col overflow-hidden rounded-[1.25rem] border p-3.5 shadow-[0_18px_54px_-42px_rgba(0,0,0,0.85)] ${tone.card}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="max-w-[7.5rem] text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#94adc1]">
          {kpi.label}
        </h3>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${tone.icon}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3.5 text-[1.85rem] font-bold leading-none tracking-[-0.05em]">
        <CountUpValue value={kpi.value} delay={delay} />
      </div>
      <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium leading-4 text-slate-400">
        <TrendIcon size={13} aria-hidden className={`mt-px shrink-0 ${tone.text}`} />
        <span className="sr-only">{trend.label}, </span>
        <span>{kpi.detail}</span>
      </p>
      <div className="mt-auto flex items-center gap-2.5 pt-4">
        <span
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[0.55rem] font-bold uppercase tracking-[0.1em] ${tone.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${tone.bar}`} />
          {status}
        </span>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={kpi.progress}
          aria-valuetext={`${status}, ${kpi.progress}%`}
          aria-label={`${kpi.label} status`}
        >
          <motion.div
            className={`h-1.5 rounded-full bg-gradient-to-r ${tone.bar}`}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${kpi.progress}%` }}
            transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </article>
  );
}

function MilestoneTrackerCard({ job, index }: { job: MilestoneJob; index: number }) {
  const tone = toneClasses(job.tone);
  const status = STATUS_LABEL[job.tone];
  const reduce = useReducedMotion();
  const delay = Math.min(index, 8) * 0.04;
  const phaseName = MILESTONE_PHASES[job.phase];

  return (
    <motion.article
      role="listitem"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-[1.25rem] border p-4 shadow-[0_18px_54px_-42px_rgba(0,0,0,0.85)] ${tone.card}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold tracking-[-0.01em] text-white">{job.id}</h3>
          <p className="mt-0.5 truncate text-[0.68rem] font-medium text-[#8ea7bb]">
            {communityLabel(job.community)} · {job.lot} · {job.plan}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-lg font-bold leading-none tracking-[-0.03em] ${tone.text}`}>{job.pct}%</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-slate-400">
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            {status}
          </p>
        </div>
      </div>

      {/* phase stepper: Permit → Closing */}
      <div className="mt-4 flex items-center" aria-hidden>
        {MILESTONE_PHASES.map((_phase, i) => {
          const done = i < job.phase;
          const current = i === job.phase;
          return (
            <div key={i} className="flex flex-1 items-center last:flex-none">
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                  done
                    ? "bg-gradient-to-r " + tone.bar
                    : current
                      ? "bg-[#0b1421] ring-2 ring-[#78e0c0]"
                      : "bg-white/12"
                }`}
              >
                {done ? <Check size={9} strokeWidth={3} className="text-[#06231a]" /> : null}
              </span>
              {i < MILESTONE_PHASES.length - 1 ? (
                <span
                  className={`mx-1 h-0.5 flex-1 rounded-full ${
                    i < job.phase ? "bg-gradient-to-r " + tone.bar : "bg-white/10"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[0.66rem] font-medium">
        <span className="text-slate-200">
          <span className="font-bold text-white">{phaseName}</span>
          <span className="text-slate-500"> · day {job.days}</span>
        </span>
        <span className="truncate text-slate-400">
          <span className="text-slate-500">Next:</span> {job.next}
        </span>
      </div>
    </motion.article>
  );
}

type PickerOption = { key: string; label: string; hint?: string };

function PickerSheet({
  open,
  title,
  Icon,
  options,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  Icon: LucideIcon;
  options: PickerOption[];
  selected: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-40 cursor-default bg-black/55 backdrop-blur-[2px]"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute inset-x-0 bottom-0 z-50 max-h-[80%] overflow-y-auto rounded-t-[1.75rem] border-t border-white/10 bg-[#0e1a28] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3.5 shadow-[0_-30px_80px_-30px_rgba(0,0,0,0.9)] outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/15" />
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#78e0c0]/12 text-[#78e0c0]">
                <Icon size={15} />
              </span>
              <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#8ea7bb]">
                {title}
              </h3>
            </div>
            <div role="radiogroup" aria-label={title} className="flex flex-col gap-1.5">
              {options.map((opt) => {
                const isSelected = opt.key === selected;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      onSelect(opt.key);
                      onClose();
                    }}
                    className={`flex touch-manipulation items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8df0ce] ${
                      isSelected
                        ? "border-[#78e0c0]/35 bg-[#78e0c0]/12"
                        : "border-white/8 bg-white/[0.03] hover:border-white/16"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold ${isSelected ? "text-white" : "text-slate-200"}`}>
                        {opt.label}
                      </span>
                      {opt.hint ? (
                        <span className="mt-0.5 block text-[0.62rem] font-medium text-slate-500">
                          {opt.hint}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isSelected ? "bg-[#78e0c0] text-[#06231a]" : "border border-white/15"
                      }`}
                    >
                      {isSelected ? <Check size={13} strokeWidth={3} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default function MobileKpiDashboard() {
  const [category, setCategory] = useState<Category>("all");
  const [scopeKey, setScopeKey] = useState<string>("all");
  const [periodKey, setPeriodKey] = useState<string>("week");
  const [sheet, setSheet] = useState<"scope" | "review" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scope = useMemo(
    () => COMMUNITIES.find((c) => c.key === scopeKey) ?? COMMUNITIES[0],
    [scopeKey],
  );
  const period = useMemo(
    () => PERIODS.find((p) => p.key === periodKey) ?? PERIODS[1],
    [periodKey],
  );

  const allKpis = useMemo(() => computeKpis(scope, period), [scope, period]);
  const visibleKpis = useMemo(
    () => kpisForCategory(allKpis, category),
    [allKpis, category],
  );

  const milestoneJobs = useMemo(
    () =>
      scopeKey === "all"
        ? MILESTONE_JOBS
        : MILESTONE_JOBS.filter((j) => j.community === scopeKey),
    [scopeKey],
  );

  const isMilestones = category === "milestones";

  const footerStats = useMemo(() => {
    if (isMilestones) {
      return [
        { label: "Jobs", value: milestoneJobs.length },
        { label: "On track", value: milestoneJobs.filter((j) => j.tone === "good").length },
        { label: "At risk", value: milestoneJobs.filter((j) => j.tone === "risk").length },
      ];
    }
    return [
      { label: "KPIs", value: visibleKpis.length },
      { label: "On track", value: visibleKpis.filter((k) => k.tone === "good").length },
      { label: "At risk", value: visibleKpis.filter((k) => k.tone === "risk").length },
    ];
  }, [isMilestones, milestoneJobs, visibleKpis]);

  const scrollTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function selectCategory(key: Category) {
    setCategory(key);
    scrollTop();
  }

  // Escape closes any open picker sheet.
  useEffect(() => {
    if (!sheet) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSheet(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const itemCount = isMilestones ? milestoneJobs.length : visibleKpis.length;
  const itemNoun = isMilestones ? "jobs" : "metrics";

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#07111d] text-white [-webkit-tap-highlight-color:transparent] sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: [
            "linear-gradient(90deg, rgba(126,161,190,0.12) 1px, transparent 1px)",
            "linear-gradient(rgba(126,161,190,0.1) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "72px 72px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-18rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-[#2c6b8e]/18 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-18rem] right-[-18rem] h-[36rem] w-[36rem] rounded-full bg-[#1d6a58]/16 blur-3xl"
      />

      <section className="relative mx-auto flex h-full w-full flex-col overflow-hidden border-white/10 bg-[#0b1421] shadow-[0_42px_130px_-54px_rgba(0,0,0,0.95)] sm:h-[820px] sm:max-h-[calc(100dvh-4rem)] sm:max-w-[430px] sm:rounded-[2rem] sm:border">
        <div className="border-b border-white/10 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-4">
            <a
              href="/"
              className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78e0c0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1421]"
              aria-label="Back to site"
            >
              <ArrowLeft size={18} />
            </a>
            <div className="min-w-0 text-center">
              <p className="truncate text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#8ea7bb]">
                AD ERP Systems
              </p>
              <h1 className="mt-1 truncate text-lg font-bold tracking-[-0.02em]">
                Daily KPI Review
              </h1>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#78e0c0]/20 bg-[#78e0c0]/10 text-[#78e0c0]">
              <ListChecks size={18} />
            </span>
          </div>

          {/* Scope + Review: now interactive filter pickers */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSheet("scope")}
              aria-haspopup="dialog"
              aria-expanded={sheet === "scope"}
              className="flex touch-manipulation items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-left transition active:scale-[0.98] hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8df0ce]"
            >
              <span className="min-w-0">
                <span className="block text-[0.56rem] font-bold uppercase tracking-[0.16em] text-[#71879b]">
                  Scope
                </span>
                <span className="mt-1 block truncate text-sm font-semibold text-slate-100">
                  {scope.label}
                </span>
              </span>
              <ChevronDown size={15} className="shrink-0 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => setSheet("review")}
              aria-haspopup="dialog"
              aria-expanded={sheet === "review"}
              className="flex touch-manipulation items-center justify-between gap-2 rounded-2xl border border-[#78e0c0]/18 bg-[#78e0c0]/[0.07] px-3 py-2.5 text-left transition active:scale-[0.98] hover:border-[#78e0c0]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8df0ce]"
            >
              <span className="min-w-0">
                <span className="block text-[0.56rem] font-bold uppercase tracking-[0.16em] text-[#71879b]">
                  Review
                </span>
                <span className="mt-1 block truncate text-sm font-semibold text-slate-100">
                  {period.label}
                </span>
              </span>
              <ChevronDown size={15} className="shrink-0 text-[#78e0c0]/70" />
            </button>
          </div>

          <div className="relative -mx-5 mt-4">
            <nav
              aria-label="KPI categories"
              className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categoryDefs.map(({ key, label }) => {
                const selected = category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectCategory(key)}
                    aria-pressed={selected}
                    className={`${CHIP_BASE} ${
                      selected
                        ? "border-[#78e0c0]/30 bg-[#78e0c0]/14 text-[#8df0ce]"
                        : "border-white/10 bg-white/[0.035] text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0b1421] to-transparent"
            />
          </div>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            className="mb-3 flex items-center justify-between"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2 className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#8ea7bb]">
              {isMilestones ? <Milestone size={12} className="text-[#78e0c0]" /> : null}
              {filterHeadings[category]}
            </h2>
            <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">
              {itemCount} {itemNoun}
            </span>
          </div>

          {isMilestones ? (
            <div
              className="flex flex-col gap-3"
              role="list"
              aria-label={`Milestone tracker, ${milestoneJobs.length} jobs`}
            >
              {milestoneJobs.map((job, index) => (
                <MilestoneTrackerCard key={job.id} job={job} index={index} />
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-3"
              role="list"
              aria-label={`${filterHeadings[category]}, ${visibleKpis.length} metrics`}
            >
              {visibleKpis.map((kpi, index) => (
                <KpiCard key={kpi.id} kpi={kpi} index={index} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-[#0a121d] px-5 py-[calc(0.85rem+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-3 gap-2">
            {footerStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-center"
              >
                <p className="text-sm font-bold text-slate-100">{item.value}</p>
                <p className="mt-0.5 text-[0.54rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <PickerSheet
          open={sheet === "scope"}
          title="Scope · community"
          Icon={Building2}
          options={COMMUNITIES.map((c) => ({ key: c.key, label: c.label, hint: c.hint }))}
          selected={scopeKey}
          onSelect={(key) => {
            setScopeKey(key);
            scrollTop();
          }}
          onClose={() => setSheet(null)}
        />
        <PickerSheet
          open={sheet === "review"}
          title="Review · period"
          Icon={CalendarDays}
          options={PERIODS.map((p) => ({ key: p.key, label: p.label }))}
          selected={periodKey}
          onSelect={(key) => {
            setPeriodKey(key);
            scrollTop();
          }}
          onClose={() => setSheet(null)}
        />
      </section>
    </div>
  );
}
