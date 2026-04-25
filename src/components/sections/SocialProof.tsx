import {
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { TiltCard } from "@/components/ui/TiltCard";

const painPoints = [
  {
    icon: <FileSpreadsheet size={22} />,
    problem: "The data lives in ten different places — ERP, sheets, CRM, draw trackers — and none of them agree",
    solution: "One warehouse, one set of definitions, one number per question",
  },
  {
    icon: <TrendingDown size={22} />,
    problem: "Margin trouble shows up in the closing report, after the damage is done",
    solution: "Builder KPIs and exception flags refresh nightly — issues surface before the morning huddle",
  },
  {
    icon: <Clock size={22} />,
    problem: "Finance burns hours every week rebuilding exports and pivot tables",
    solution: "Ingestion runs on a schedule, KPIs are computed once, reports are already there in the morning",
  },
  {
    icon: <AlertTriangle size={22} />,
    problem: "Off-the-shelf dashboards weren't designed for how a builder actually runs",
    solution: "Reporting built around your operating model — and yours to keep",
  },
];

export default function SocialProof() {
  return (
    <section className="section-space pt-0">
      <Container>
        <div className="reveal text-center">
          <span className="eyebrow eyebrow-dot">Why It Matters</span>
          <h2 className="mx-auto mt-6 max-w-3xl font-heading text-4xl leading-[0.98] tracking-[-0.015em] text-slate-50 sm:text-[3.2rem] md:text-[3.4rem]">
            The data exists.{" "}
            <span className="text-gradient">It just needs to be connected.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Numbers land differently in finance, construction, and sales because
            every team pulls from a different export. We pull every source into
            one warehouse, define each KPI once, and put the answer in front of
            whoever needs it.
          </p>
        </div>

        <div className="reveal-stagger mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {painPoints.map((item) => (
            <TiltCard
              key={item.problem}
              tiltLimit={6}
              scale={1.02}
              spotlight={false}
              className="reveal h-full rounded-2xl"
            >
              <div className="glow-card group flex h-full flex-col p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-400/25 bg-gradient-to-br from-accent-500/15 to-accent-500/[0.02] text-accent-300 transition-all duration-500 group-hover:border-accent-400/50 group-hover:shadow-[0_0_20px_-6px_rgba(52,211,153,0.45)]">
                  {item.icon}
                </div>

                <div className="mt-5 text-[0.88rem] leading-6 text-slate-400 line-through decoration-slate-600/70 decoration-1">
                  {item.problem}
                </div>

                <div className="mt-3 flex items-start gap-2 text-accent-300">
                  <ArrowRight
                    size={14}
                    className="mt-1 shrink-0 transition-transform duration-500 group-hover:translate-x-0.5"
                  />
                  <div className="text-[0.95rem] font-medium leading-6 text-slate-100">
                    {item.solution}
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
