import {
  BarChart3,
  CheckCircle2,
  DatabaseZap,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface ClientImprovementCardProps {
  title: string;
  description: string;
  label: string;
  metric: string;
  metricLabel: string;
  proof: string;
  icon: LucideIcon;
  focus: string[];
  signal: string;
  className?: string;
}

const clientImprovementCards: ClientImprovementCardProps[] = [
  {
    title: "Improve cycle time by 15%",
    description:
      "Stalled stages, aging follow-ups, and owner handoffs were flagged earlier so teams could move work faster.",
    label: "Cycle time",
    metric: "15%",
    metricLabel: "Improvement",
    proof: "Top 200 builder environment",
    icon: BarChart3,
    focus: ["Stage visibility", "Owner follow-up", "KPI reporting"],
    signal: "Earlier stage flags help construction teams protect cycle time.",
  },
  {
    title: "Hold the budget at $0 over",
    description:
      "Budget movement and cost-to-complete variance were tracked before closeout, while the job was still controllable.",
    label: "Budget control",
    metric: "$0",
    metricLabel: "Over budget",
    proof: "ERP and spreadsheet workflows",
    icon: DatabaseZap,
    focus: ["Cost movement", "Variance flags", "Refresh process"],
    signal: "Cost movement is visible before closeout, while jobs are still controllable.",
  },
  {
    title: "Reduce days on market by 20 days",
    description:
      "Sales pipeline reporting made stale inventory, pricing follow-ups, and status easier to review before homes sat too long.",
    label: "Sales pipeline",
    metric: "20",
    metricLabel: "Fewer days",
    proof: "Builder operations context",
    icon: GitBranch,
    focus: ["Inventory status", "Pricing follow-up", "Sales reporting"],
    signal: "Pipeline review makes stale inventory and pricing follow-up easier to spot.",
  },
];

function ClientImprovementCard({
  title,
  description,
  label,
  metric,
  metricLabel,
  proof,
  icon: Icon,
  focus,
  signal,
  className,
}: ClientImprovementCardProps) {
  return (
    <article className={cn("h-full", className)}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#d7e0e5] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,251,253,0.78))] p-5 shadow-[0_28px_78px_-66px_rgba(23,33,44,0.58)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#9eb6c8] hover:bg-white">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7fb8d3] via-[#5bbf98] to-[#17212c] opacity-75"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.26]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(32,68,98,0.08) 1px, transparent 1px), linear-gradient(rgba(32,68,98,0.06) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d6e0e5] bg-[#f8fafc] text-[#2f5368] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
                <Icon size={20} />
              </span>
              <div>
                <div className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#2f5368]">
                  {label}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#66727a]">
                  {proof}
                </div>
              </div>
            </div>
            <span className="rounded-full border border-[#d7e0e5] bg-[#edf5f1] px-3 py-1.5 text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#285d47]">
              Outcome
            </span>
          </div>

          <div className="my-5 rounded-[1.2rem] border border-[#d7e0e5] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,246,250,0.86))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-heading text-[3.15rem] font-semibold leading-none tracking-[-0.06em] text-[#17212c]">
                  {metric}
                  <sup className="ml-1 align-super text-xl leading-none text-[#2f5368]">
                    *
                  </sup>
                </div>
                <div className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#2f5368]">
                  {metricLabel}
                </div>
              </div>
              <div className="h-14 w-14 shrink-0 rounded-full border border-[#c9d9e2] bg-[conic-gradient(from_220deg,#8bd7ff,#5bbf98,#172433,#8bd7ff)] p-[3px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[#2f5368]">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-[1.35rem] font-bold leading-tight tracking-[-0.025em] text-[#17212c]">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#58636b]">
            {description}
          </p>

          <div className="mt-5 grid gap-2 border-t border-[#dce4e8] pt-5">
            {focus.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-full border border-[#dce4e8] bg-white/[0.64] px-3 py-2 text-sm font-bold text-[#344650]"
              >
                <CheckCircle2 size={14} className="shrink-0 text-[#4b9876]" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-5">
            <div className="rounded-[1rem] border border-[#d7e0e5] bg-[#f7f9fb]/80 p-3 text-sm font-semibold leading-5 text-[#40515d]">
              {signal}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ClientImprovementCards() {
  return (
    <section className="defer-section relative overflow-hidden border-b border-[#d9e1e6]/75 bg-transparent py-14 md:py-20">
      <Container className="relative z-10">
        <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#2f5368]">
              Past expertise applied
            </p>
            <h2 className="mt-4 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-6xl">
              Prior builder work, clearer operating outcomes.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#58636b]">
              Compact examples of the operating signals dashboards make easier
              to review: cycle time, budget control, inventory movement, and
              reporting cadence.
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-[#d7e0e5] bg-white/[0.62] p-4 shadow-[0_24px_70px_-58px_rgba(23,33,44,0.42)] backdrop-blur">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#35647f]">
              Display audit
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#58636b]">
              This section now favors scannable metrics over oversized gauges,
              with each card ending in the dashboard signal it supports.
            </p>
          </div>
        </div>

        <div className="grid auto-rows-fr gap-5 lg:grid-cols-3">
          {clientImprovementCards.map((card) => (
            <ClientImprovementCard
              key={card.title}
              {...card}
            />
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-[#6b747b]">
          * Past client performance on some jobs may not reflect future performance.
        </p>
      </Container>
    </section>
  );
}
