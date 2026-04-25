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
    problem: "Data is spread across ERP systems, spreadsheets, CRM tools, and draw trackers",
    solution: "One centralized warehouse brings sources together into a shared operating view",
  },
  {
    icon: <TrendingDown size={22} />,
    problem: "Margin visibility often arrives too late to prevent overruns",
    solution: "Builder KPI logic and exception flags refresh daily so teams can act earlier",
  },
  {
    icon: <Clock size={22} />,
    problem: "Finance teams spend time rebuilding exports and pivot reports",
    solution: "Automated ingestion and pre-computed metrics reduce manual report assembly",
  },
  {
    icon: <AlertTriangle size={22} />,
    problem: "Generic dashboards often miss builder workflows end to end",
    solution: "Client-owned reporting systems are tailored to your operating model",
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
            Most builders have the data they need — it&apos;s scattered across
            ERPs, spreadsheets, finance systems, and exports. We centralize it
            into one structured warehouse, apply KPI logic once, and deliver
            reporting systems teams can act on.
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
