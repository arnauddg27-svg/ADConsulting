"use client";

import Link from "next/link";
import { useRef, useState } from "react";
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

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const tone = toneClasses(kpi.tone);

  return (
    <article
      className={`relative overflow-hidden rounded-[1.25rem] border p-3.5 shadow-[0_18px_54px_-42px_rgba(0,0,0,0.85)] ${tone.card}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[7.5rem] text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#8ea7bb]">
          {kpi.label}
        </p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${tone.icon}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3.5 text-[1.85rem] font-bold tracking-[-0.05em]">
        {kpi.value}
      </div>
      <p className="mt-1 min-h-8 text-xs font-medium leading-4 text-slate-400">
        {kpi.detail}
      </p>
      <div
        className="mt-4 h-1.5 rounded-full bg-white/[0.08]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={kpi.progress}
        aria-label={`${kpi.label} progress`}
      >
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${tone.bar}`}
          style={{ width: `${kpi.progress}%` }}
        />
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

      <section className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden border-white/10 bg-[#0b1421] shadow-[0_42px_130px_-54px_rgba(0,0,0,0.95)] sm:h-[820px] sm:max-h-[calc(100dvh-4rem)] sm:rounded-[2rem] sm:border">
        <div className="border-b border-white/10 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/examples/"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
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

          <nav
            aria-label="Dashboard review filters"
            className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filterDefs.map(({ key, label }) => {
              const selected = active === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectFilter(key)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? "shrink-0 cursor-pointer rounded-full border border-[#78e0c0]/30 bg-[#78e0c0]/14 px-3.5 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#8df0ce] transition"
                      : "shrink-0 cursor-pointer rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:border-white/20 hover:text-slate-200"
                  }
                >
                  {label}
                </button>
              );
            })}
          </nav>
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
            {visibleKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
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
