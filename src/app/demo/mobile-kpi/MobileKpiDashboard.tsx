"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  DollarSign,
  FileCheck2,
  Home,
  KeyRound,
  ListChecks,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";

type DashboardTone = "good" | "watch" | "risk";

type KpiTag = "schedule" | "budget" | "pipeline" | "owners";
type FilterKey = "today" | KpiTag;

type Kpi = {
  label: string;
  value: string;
  detail: string;
  tone: DashboardTone;
  icon: LucideIcon;
  progress: number;
  tags: KpiTag[];
};

const kpis: Kpi[] = [
  {
    label: "Active jobs",
    value: "142",
    detail: "11 near close",
    tone: "good",
    icon: Home,
    progress: 72,
    tags: ["pipeline"],
  },
  {
    label: "On schedule",
    value: "87%",
    detail: "+5 pts vs prior",
    tone: "good",
    icon: Clock3,
    progress: 87,
    tags: ["schedule"],
  },
  {
    label: "Cycle time",
    value: "64d",
    detail: "-3 days vs prior",
    tone: "good",
    icon: TrendingDown,
    progress: 66,
    tags: ["schedule"],
  },
  {
    label: "Budget used",
    value: "58%",
    detail: "$32.0M actual",
    tone: "watch",
    icon: DollarSign,
    progress: 58,
    tags: ["budget"],
  },
  {
    label: "Cost variance",
    value: "$284K",
    detail: "flagged early",
    tone: "risk",
    icon: CircleDollarSign,
    progress: 36,
    tags: ["budget"],
  },
  {
    label: "Starts this week",
    value: "18",
    detail: "4 delayed",
    tone: "watch",
    icon: CalendarDays,
    progress: 62,
    tags: ["schedule", "pipeline"],
  },
  {
    label: "Closings due",
    value: "14",
    detail: "3 need signoff",
    tone: "watch",
    icon: KeyRound,
    progress: 57,
    tags: ["pipeline", "schedule"],
  },
  {
    label: "Permits aging",
    value: "9",
    detail: "3 over 14 days",
    tone: "risk",
    icon: FileCheck2,
    progress: 34,
    tags: ["schedule", "owners"],
  },
  {
    label: "Selections late",
    value: "6",
    detail: "blocking starts",
    tone: "risk",
    icon: ClipboardList,
    progress: 31,
    tags: ["owners", "schedule"],
  },
  {
    label: "Draws ready",
    value: "$8.4M",
    detail: "finance queue",
    tone: "good",
    icon: ReceiptText,
    progress: 74,
    tags: ["budget"],
  },
  {
    label: "Margin review",
    value: "7",
    detail: "jobs to review",
    tone: "watch",
    icon: TrendingUp,
    progress: 46,
    tags: ["budget", "owners"],
  },
  {
    label: "Open flags",
    value: "12",
    detail: "8 resolved this week",
    tone: "risk",
    icon: AlertTriangle,
    progress: 38,
    tags: ["owners"],
  },
  {
    label: "Inventory homes",
    value: "31",
    detail: "5 need action",
    tone: "watch",
    icon: Building2,
    progress: 56,
    tags: ["pipeline"],
  },
  {
    label: "Punch list",
    value: "22",
    detail: "8 older than 7d",
    tone: "watch",
    icon: ClipboardCheck,
    progress: 52,
    tags: ["owners"],
  },
  {
    label: "Warranty items",
    value: "18",
    detail: "4 overdue",
    tone: "watch",
    icon: Wrench,
    progress: 49,
    tags: ["owners"],
  },
];

const filterDefs: Array<{ key: FilterKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "schedule", label: "Schedule" },
  { key: "budget", label: "Budget" },
  { key: "pipeline", label: "Pipeline" },
  { key: "owners", label: "Owners" },
];

const filterHeadings: Record<FilterKey, string> = {
  today: "All KPIs",
  schedule: "Schedule KPIs",
  budget: "Budget KPIs",
  pipeline: "Pipeline KPIs",
  owners: "Follow-up KPIs",
};

// Inset focus ring: the chip row scrolls horizontally, which makes its
// overflow-y compute to `auto` and clip an outset ring.
const CHIP_BASE =
  "shrink-0 cursor-pointer rounded-full border px-3.5 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] transition active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8df0ce]";

function kpisForFilter(key: FilterKey): Kpi[] {
  if (key === "today") return kpis;
  return kpis.filter((kpi) => kpi.tags.includes(key));
}

function toneClasses(tone: DashboardTone) {
  if (tone === "risk") {
    return {
      card: "border-[#ffb86b]/24 bg-[#201a18]",
      icon: "bg-[#2d211d] text-[#ffb86b] ring-[#ffb86b]/20",
      bar: "from-[#ffb86b] to-[#ffd28f]",
      text: "text-[#ffcb88]",
      wash: "bg-[#ffb86b]/10",
    };
  }
  if (tone === "watch") {
    return {
      card: "border-[#9ed7ff]/18 bg-[#111c2b]",
      icon: "bg-[#19283a] text-[#9ed7ff] ring-[#9ed7ff]/18",
      bar: "from-[#77c8f2] to-[#b9e8ff]",
      text: "text-[#b9e8ff]",
      wash: "bg-[#9ed7ff]/10",
    };
  }
  return {
    card: "border-[#78e0c0]/16 bg-[#0d201f]",
    icon: "bg-[#122d2c] text-[#78e0c0] ring-[#78e0c0]/18",
    bar: "from-[#43d19d] to-[#87e7d5]",
    text: "text-[#87e7d5]",
    wash: "bg-[#78e0c0]/10",
  };
}

// Status conveyed as a word (not color alone) so it survives color-blindness
// and screen readers — the dashboard's whole job is triage.
const STATUS_LABEL: Record<DashboardTone, string> = {
  good: "On track",
  watch: "Watch",
  risk: "At risk",
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

function formatValue(parsed: ParsedValue, current: number): string {
  return `${parsed.prefix}${current.toFixed(parsed.decimals)}${parsed.suffix}`;
}

// Counts the numeric portion of a KPI value up from zero on mount. The server
// (and no-JS / reduced-motion) render the final value so the dashboard is never
// shown empty; the layout effect overwrites it before paint to avoid a flash.
function CountUpValue({ value, delay = 0 }: { value: string; delay?: number }) {
  const reduce = useReducedMotion();
  const parsed = useMemo(() => parseValue(value), [value]);
  const [display, setDisplay] = useState(value);

  useIsoLayoutEffect(() => {
    if (!parsed || reduce) {
      setDisplay(value);
      return;
    }
    setDisplay(formatValue(parsed, 0));
    const controls = animate(0, parsed.target, {
      duration: 0.9,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(formatValue(parsed, latest)),
    });
    return () => controls.stop();
  }, [parsed, value, reduce, delay]);

  return <span className="tabular-nums">{display}</span>;
}

function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const Icon = kpi.icon;
  const tone = toneClasses(kpi.tone);
  const status = STATUS_LABEL[kpi.tone];
  const reduce = useReducedMotion();
  const delay = Math.min(index, 7) * 0.05;

  return (
    <article
      className={`relative flex min-h-[8.75rem] flex-col overflow-hidden rounded-[1.25rem] border p-3.5 shadow-[0_18px_54px_-42px_rgba(0,0,0,0.85)] ${tone.card}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[7.5rem] text-[0.58rem] font-bold uppercase tracking-[0.13em] text-[#94adc1]">
          {kpi.label}
        </p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${tone.icon}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3.5 text-[1.85rem] font-bold leading-none tracking-[-0.05em]">
        <CountUpValue value={kpi.value} delay={delay} />
      </div>
      <p className="mt-1.5 text-xs font-medium leading-4 text-slate-400">
        {kpi.detail}
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
            transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </article>
  );
}

export default function MobileKpiDashboard() {
  const [active, setActive] = useState<FilterKey>("today");
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleKpis = kpisForFilter(active);
  const onTrack = visibleKpis.filter((kpi) => kpi.tone === "good").length;
  const atRisk = visibleKpis.filter((kpi) => kpi.tone === "risk").length;

  const footerStats = [
    { label: "KPIs", value: visibleKpis.length },
    { label: "On track", value: onTrack },
    { label: "At risk", value: atRisk },
  ];

  function selectFilter(key: FilterKey) {
    setActive(key);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#07111d] text-white sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-8">
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
            <Link
              href="/examples/"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78e0c0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1421]"
              aria-label="Back to dashboard examples"
            >
              <ArrowLeft size={18} />
            </Link>
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

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2.5">
              <p className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-[#71879b]">
                Scope
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                All communities
              </p>
            </div>
            <div className="rounded-2xl border border-[#78e0c0]/18 bg-[#78e0c0]/[0.07] px-3 py-2.5 text-right">
              <p className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-[#71879b]">
                Review
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                This week
              </p>
            </div>
          </div>

          <div className="relative -mx-5 mt-4">
            <nav
              aria-label="Dashboard review filters"
              className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filterDefs.map(({ key, label }) => {
                const selected = active === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectFilter(key)}
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

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#8ea7bb]">
              {filterHeadings[active]}
            </p>
            <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">
              {visibleKpis.length} metrics
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {visibleKpis.map((kpi, index) => (
              <KpiCard key={kpi.label} kpi={kpi} index={index} />
            ))}
          </div>
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
      </section>
    </div>
  );
}
