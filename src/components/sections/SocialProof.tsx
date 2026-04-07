import {
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import Container from "@/components/ui/Container";

const painPoints = [
  {
    icon: <FileSpreadsheet size={22} />,
    problem: "Fragmented data across ERP, spreadsheets, CRM, and loan trackers",
    solution: "One warehouse pulling every source into a single operating view",
  },
  {
    icon: <TrendingDown size={22} />,
    problem: "Margin reports arrive after the damage is already done",
    solution: "Daily KPI logic and exception flags while you can still act",
  },
  {
    icon: <Clock size={22} />,
    problem: "Finance loses 10-20 hours a week rebuilding exports and pivots",
    solution: "Automated ingestion and pre-computed metrics instead of manual report assembly",
  },
  {
    icon: <AlertTriangle size={22} />,
    problem: "Off-the-shelf dashboards miss the full lifecycle and trap your data",
    solution: "A client-owned platform spanning land, construction, sales, and audits",
  },
];

export default function SocialProof() {
  return (
    <section className="section-space pt-0">
      <Container>
        <div className="reveal text-center">
          <span className="eyebrow">The Problem</span>
          <h2 className="mx-auto mt-5 max-w-3xl font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 sm:text-[3.2rem]">
            The data exists. <span className="text-gradient">It just isn&apos;t connected.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Most builders have the data they need — it&apos;s scattered across
            ERPs, spreadsheets, loan trackers, and email. We centralize it
            into one structured warehouse and deliver it as reporting and
            tools the team can act on.
          </p>
        </div>

        <div className="reveal-stagger mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {painPoints.map((item) => (
            <div key={item.problem} className="reveal glow-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
                {item.icon}
              </div>
              <div className="mt-4 text-[0.95rem] font-medium leading-6 text-red-500/80 line-through decoration-red-500/30">
                {item.problem}
              </div>
              <div className="mt-3 text-[0.95rem] font-medium leading-7 text-slate-100">
                {item.solution}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
