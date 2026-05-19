import {
  Clock,
  CircleDollarSign,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface ClientImprovementCardProps {
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  icon: LucideIcon;
  className?: string;
}

const clientImprovementCards: ClientImprovementCardProps[] = [
  {
    title: "Cut cycle time",
    description:
      "Stalled stages and aging follow-ups flagged early so teams can move work faster.",
    metric: "15%",
    metricLabel: "Cycle gain",
    icon: Clock,
  },
  {
    title: "Hold the budget",
    description:
      "Cost-to-complete variance visible before closeout, while the job is still controllable.",
    metric: "$0",
    metricLabel: "Over budget",
    icon: CircleDollarSign,
  },
  {
    title: "Move inventory faster",
    description:
      "Aging inventory and pricing follow-ups surfaced before homes sit too long.",
    metric: "20",
    metricLabel: "Fewer days on market",
    icon: KeyRound,
  },
];

function ClientImprovementCard({
  title,
  description,
  metric,
  metricLabel,
  icon: Icon,
  className,
}: ClientImprovementCardProps) {
  return (
    <article className={cn("h-full", className)}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#d7e0e5] bg-white p-6 shadow-[0_20px_60px_-50px_rgba(23,33,44,0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-[#9eb6c8]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7fb8d3] via-[#5bbf98] to-[#17212c] opacity-75"
        />

        <div className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d6e0e5] bg-[#f8fafc] text-[#2f5368]">
            <Icon size={20} />
          </span>
          <span className="rounded-full border border-[#d7e0e5] bg-[#edf5f1] px-3 py-1 text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#285d47]">
            Outcome
          </span>
        </div>

        <div className="mt-6">
          <div className="font-heading text-[3.4rem] font-semibold leading-none tracking-[-0.06em] text-[#17212c]">
            {metric}
            <sup className="ml-1 align-super text-xl leading-none text-[#2f5368]">
              *
            </sup>
          </div>
          <div className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#2f5368]">
            {metricLabel}
          </div>
        </div>

        <h3 className="mt-6 text-[1.25rem] font-bold leading-snug tracking-[-0.02em] text-[#17212c]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#58636b]">
          {description}
        </p>
      </div>
    </article>
  );
}

export default function ClientImprovementCards() {
  return (
    <section className="defer-section relative overflow-hidden border-b border-[#d9e1e6]/75 bg-transparent py-14 md:py-20">
      <Container className="relative z-10">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#2f5368]">
            Past expertise applied
          </p>
          <h2 className="mt-4 font-heading text-3xl leading-[1.05] tracking-[-0.03em] text-[#17212c] md:text-5xl">
            Prior builder work, clearer outcomes.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#58636b] md:text-lg">
            Operating signals dashboards make easier to review.
          </p>
        </div>

        <div className="grid auto-rows-fr items-stretch gap-5 lg:grid-cols-3">
          {clientImprovementCards.map((card) => (
            <ClientImprovementCard key={card.title} {...card} />
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-[#6b747b]">
          * Past client performance on some jobs may not reflect future
          performance.
        </p>
      </Container>
    </section>
  );
}
