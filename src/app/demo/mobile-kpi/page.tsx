import Link from "next/link";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  DollarSign,
  FileCheck2,
  Hammer,
  Home,
  KeyRound,
  Landmark,
  ListChecks,
  MapPinned,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UsersRound,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mobile KPI Dashboard | AD ERP SYSTEMS",
  description:
    "A phone-first KPI-only sample dashboard for builder schedule, budget, margin, and follow-up review.",
};

type DashboardTone = "good" | "watch" | "risk";

type Kpi = {
  label: string;
  value: string;
  detail: string;
  tone: DashboardTone;
  icon: LucideIcon;
  progress: number;
};

type AttentionItem = {
  label: string;
  detail: string;
  owner: string;
  due: string;
  tone: DashboardTone;
};

type Category = Kpi;

const prioritySignal: AttentionItem = {
  label: "Cost-to-complete changed",
  detail: "Review variance before the weekly draw is submitted.",
  owner: "Finance",
  due: "24h",
  tone: "risk",
};

const kpis: Kpi[] = [
  {
    label: "Active jobs",
    value: "142",
    detail: "11 near close",
    tone: "good",
    icon: Home,
    progress: 72,
  },
  {
    label: "On schedule",
    value: "87%",
    detail: "+5 pts vs prior",
    tone: "good",
    icon: Clock3,
    progress: 87,
  },
  {
    label: "Cycle time",
    value: "64d",
    detail: "-3 days vs prior",
    tone: "good",
    icon: TrendingDown,
    progress: 66,
  },
  {
    label: "Budget used",
    value: "58%",
    detail: "$32.0M actual",
    tone: "watch",
    icon: DollarSign,
    progress: 58,
  },
  {
    label: "Cost variance",
    value: "$284K",
    detail: "flagged early",
    tone: "risk",
    icon: CircleDollarSign,
    progress: 36,
  },
  {
    label: "Starts this week",
    value: "18",
    detail: "4 delayed",
    tone: "watch",
    icon: CalendarDays,
    progress: 62,
  },
  {
    label: "Closings due",
    value: "14",
    detail: "3 need signoff",
    tone: "watch",
    icon: KeyRound,
    progress: 57,
  },
  {
    label: "Permits aging",
    value: "9",
    detail: "3 over 14 days",
    tone: "risk",
    icon: FileCheck2,
    progress: 34,
  },
  {
    label: "Selections late",
    value: "6",
    detail: "blocking starts",
    tone: "risk",
    icon: ClipboardList,
    progress: 31,
  },
  {
    label: "Draws ready",
    value: "$8.4M",
    detail: "finance queue",
    tone: "good",
    icon: ReceiptText,
    progress: 74,
  },
  {
    label: "Margin review",
    value: "7",
    detail: "jobs to review",
    tone: "watch",
    icon: TrendingUp,
    progress: 46,
  },
  {
    label: "Open flags",
    value: "12",
    detail: "8 resolved this week",
    tone: "risk",
    icon: AlertTriangle,
    progress: 38,
  },
  {
    label: "Inventory homes",
    value: "31",
    detail: "5 need action",
    tone: "watch",
    icon: Building2,
    progress: 56,
  },
  {
    label: "Punch list",
    value: "22",
    detail: "8 older than 7d",
    tone: "watch",
    icon: ClipboardCheck,
    progress: 52,
  },
  {
    label: "Warranty items",
    value: "18",
    detail: "4 overdue",
    tone: "watch",
    icon: Wrench,
    progress: 49,
  },
];

const attentionItems: AttentionItem[] = [
  {
    label: "Stage dates moved twice",
    detail: "Construction needs a crew-date confirmation.",
    owner: "Construction",
    due: "Today",
    tone: "watch",
  },
  {
    label: "Cost-to-complete changed",
    detail: "Review variance before the weekly draw.",
    owner: "Finance",
    due: "24h",
    tone: "risk",
  },
  {
    label: "Permit follow-up missing owner",
    detail: "Assign responsibility before it delays start.",
    owner: "Permitting",
    due: "Today",
    tone: "risk",
  },
];

const categories: Category[] = [
  {
    label: "Land",
    value: "8 communities",
    detail: "3 approvals and takedown dates tracked",
    tone: "good",
    icon: MapPinned,
    progress: 71,
  },
  {
    label: "Permitting",
    value: "19 open permits",
    detail: "6 waiting on city response",
    tone: "risk",
    icon: FileCheck2,
    progress: 42,
  },
  {
    label: "Purchasing",
    value: "11 cost changes",
    detail: "Buyout movement tied to affected jobs",
    tone: "watch",
    icon: PackageCheck,
    progress: 61,
  },
  {
    label: "Construction",
    value: "142 active jobs",
    detail: "24 with schedule or cost signals",
    tone: "watch",
    icon: Hammer,
    progress: 68,
  },
  {
    label: "Finance",
    value: "$8.4M draw queue",
    detail: "$284K cost variance flagged",
    tone: "good",
    icon: BadgeDollarSign,
    progress: 76,
  },
  {
    label: "Sales",
    value: "31 inventory homes",
    detail: "5 homes need follow-up",
    tone: "watch",
    icon: UsersRound,
    progress: 58,
  },
  {
    label: "Warranty",
    value: "18 open items",
    detail: "4 past service target",
    tone: "watch",
    icon: ShieldCheck,
    progress: 54,
  },
  {
    label: "Leadership",
    value: "12 exceptions",
    detail: "Owners, next actions, and due dates visible",
    tone: "good",
    icon: Landmark,
    progress: 82,
  },
];

const footerStats = [
  {
    label: "KPIs",
    value: String(kpis.length),
  },
  {
    label: "Views",
    value: String(categories.length),
  },
  {
    label: "Flags",
    value: String(attentionItems.length),
  },
];

const summaryMetrics: Array<
  Pick<Kpi, "label" | "value" | "detail" | "tone">
> = [
  {
    label: "On schedule",
    value: "87%",
    detail: "+5 pts",
    tone: "good",
  },
  {
    label: "Cost risk",
    value: "$284K",
    detail: "flagged",
    tone: "risk",
  },
  {
    label: "Open flags",
    value: "12",
    detail: "3 urgent",
    tone: "watch",
  },
];

const reviewFilters = ["Today", "Schedule", "Budget", "Pipeline", "Owners"];
const primaryKpis = kpis.slice(0, 4);
const secondaryKpis = kpis.slice(4);

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

function KpiCard({
  kpi,
  compact = false,
}: {
  kpi: Kpi;
  compact?: boolean;
}) {
  const Icon = kpi.icon;
  const tone = toneClasses(kpi.tone);

  return (
    <article
      className={`relative overflow-hidden rounded-[1.25rem] border shadow-[0_18px_54px_-42px_rgba(0,0,0,0.85)] ${
        compact ? "min-h-[8rem] p-3" : "min-h-[9.25rem] p-3.5"
      } ${tone.card}`}
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
      <div
        className={
          compact
            ? "mt-3 text-2xl font-bold tracking-[-0.05em]"
            : "mt-3.5 text-[1.85rem] font-bold tracking-[-0.05em]"
        }
      >
        {kpi.value}
      </div>
      <p className="mt-1 min-h-8 text-xs font-medium leading-4 text-slate-400">
        {kpi.detail}
      </p>
      <div
        className={
          compact
            ? "mt-3 h-1.5 rounded-full bg-white/[0.08]"
            : "mt-4 h-1.5 rounded-full bg-white/[0.08]"
        }
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

function PrioritySignalCard({ item }: { item: AttentionItem }) {
  const tone = toneClasses(item.tone);

  return (
    <article className={`mt-4 rounded-[1.15rem] border p-3.5 ${tone.card}`}>
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ring-1 ${tone.icon}`}
        >
          <AlertTriangle size={17} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#8ea7bb]">
              Priority signal
            </p>
            <span
              className={`rounded-full px-2 py-1 text-[0.52rem] font-bold uppercase tracking-[0.12em] ${tone.wash} ${tone.text}`}
            >
              {item.due}
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-bold leading-5 text-slate-50">
            {item.label}
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {item.detail}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="rounded-xl border border-white/10 bg-black/15 px-2 py-1.5">
              <span className="block text-[0.48rem] font-bold uppercase tracking-[0.14em] text-[#71879b]">
                Owner
              </span>
              <span className="mt-0.5 block text-xs font-bold text-slate-100">
                {item.owner}
              </span>
            </span>
            <span className="rounded-xl border border-white/10 bg-black/15 px-2 py-1.5">
              <span className="block text-[0.48rem] font-bold uppercase tracking-[0.14em] text-[#71879b]">
                Due
              </span>
              <span className={`mt-0.5 block text-xs font-bold ${tone.text}`}>
                {item.due}
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;
  const tone = toneClasses(category.tone);

  return (
    <article className="min-h-[8.25rem] rounded-2xl border border-white/10 bg-white/[0.035] p-3 shadow-[0_16px_46px_-42px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ${tone.icon}`}
        >
          <Icon size={15} />
        </span>
        <span
          className={`rounded-full px-2 py-1 text-[0.56rem] font-bold tabular-nums ${tone.wash} ${tone.text}`}
        >
          {category.progress}%
        </span>
      </div>
      <h4 className="mt-3 text-sm font-bold text-slate-100">
        {category.label}
      </h4>
      <p className="mt-1 text-xs font-semibold leading-4 text-slate-400">
        {category.value}
      </p>
      <div
        className="mt-3 h-1.5 rounded-full bg-white/[0.08]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={category.progress}
        aria-label={`${category.label} category health`}
      >
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${tone.bar}`}
          style={{ width: `${category.progress}%` }}
        />
      </div>
    </article>
  );
}

export default function MobileKpiDashboardPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#07111d] px-3 py-3 text-white sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-8">
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

      <section className="relative mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1421] shadow-[0_42px_130px_-54px_rgba(0,0,0,0.95)] sm:min-h-[820px]">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/examples/"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
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
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#78e0c0]/20 bg-[#78e0c0]/10 text-[#78e0c0]">
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
            {reviewFilters.map((filter, index) => (
              <span
                key={filter}
                className={
                  index === 0
                    ? "shrink-0 rounded-full border border-[#78e0c0]/25 bg-[#78e0c0]/12 px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#8df0ce]"
                    : "shrink-0 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-400"
                }
              >
                {filter}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="rounded-[1.5rem] border border-[#78e0c0]/20 bg-[linear-gradient(135deg,rgba(120,224,192,0.13),rgba(119,200,242,0.055)_48%,rgba(255,255,255,0.035))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#78e0c0]">
                  Operating snapshot
                </p>
                <h2 className="mt-2 text-[1.7rem] font-bold leading-[1.02] tracking-[-0.045em]">
                  What needs action today.
                </h2>
              </div>
              <CalendarDays className="mt-1 text-[#8ea7bb]" size={20} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Schedule, cost, permits, closings, and owner follow-up in one
              phone scan before small variances become losses.
            </p>
            <PrioritySignalCard item={prioritySignal} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {summaryMetrics.map((metric) => {
                const tone = toneClasses(metric.tone);

                return (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3"
                  >
                    <p className="text-[0.5rem] font-bold uppercase tracking-[0.13em] text-[#71879b]">
                      {metric.label}
                    </p>
                    <p
                      className={`mt-1 text-lg font-bold tracking-[-0.04em] ${tone.text}`}
                    >
                      {metric.value}
                    </p>
                    <p className="mt-0.5 text-[0.62rem] font-semibold text-slate-500">
                      {metric.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-3 mt-5 flex items-center justify-between">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#8ea7bb]">
              Core KPIs
            </p>
            <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">
              Daily review
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {primaryKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-[#111c2b] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#8ea7bb]">
                  Action queue
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-white">
                  Owner follow-ups
                </h3>
              </div>
              <span className="rounded-full border border-[#ffb86b]/20 bg-[#ffb86b]/10 px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#ffcb88]">
                3 flags
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {attentionItems.map((item) => {
                const tone = toneClasses(item.tone);

                return (
                  <div
                    key={item.label}
                    className="grid grid-cols-[1.8rem_1fr_auto] items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3"
                  >
                    <CheckCircle2 className={`mt-0.5 ${tone.text}`} size={16} />
                    <span>
                      <span className="block text-sm font-bold leading-5 text-slate-100">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                        {item.detail}
                      </span>
                      <span className="mt-2 block text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#8ea7bb]">
                        Owner: {item.owner}
                      </span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-slate-300">
                      {item.due}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-[#0d1a29] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#8ea7bb]">
                  Department scan
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-white">
                  Pipeline views
                </h3>
              </div>
              <span className="rounded-full border border-[#78e0c0]/20 bg-[#78e0c0]/10 px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#78e0c0]">
                {categories.length} views
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Compact health checks by workflow so each team sees the pipeline
              slice that matters to their day.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <CategoryCard key={category.label} category={category} />
              ))}
            </div>
          </div>

          <div className="mt-4 [contain-intrinsic-size:720px] [content-visibility:auto]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#8ea7bb]">
                Secondary KPIs
              </p>
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                {secondaryKpis.length} metrics
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {secondaryKpis.map((kpi) => (
                <KpiCard key={kpi.label} kpi={kpi} compact />
              ))}
            </div>
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
    </main>
  );
}
