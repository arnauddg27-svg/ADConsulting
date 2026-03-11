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
    problem: "The process breaks down in daily use",
    solution: "Clearer workflows and better follow-through",
  },
  {
    icon: <Clock size={22} />,
    problem: "Margin issues show up too late",
    solution: "Earlier visibility and tighter cost control",
  },
  {
    icon: <AlertTriangle size={22} />,
    problem: "Teams are not working from the same playbook",
    solution: "Better coordination across purchasing, schedules, and approvals",
  },
  {
    icon: <TrendingDown size={22} />,
    problem: "Leadership does not get a clear weekly read",
    solution: "Cleaner decisions on jobs, cash, and execution",
  },
];

export default function SocialProof() {
  return (
    <section className="section-space pt-0">
      <Container>
        <div className="text-center">
          <span className="eyebrow">Common Problems</span>
          <h2 className="mx-auto mt-5 max-w-2xl font-heading text-4xl leading-[0.95] tracking-[0.04em] text-slate-50 sm:text-[3.2rem]">
            Where builder operations usually start slipping.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Most problems start in the same places: weak process control,
            inconsistent numbers, and teams working without a clean operating
            rhythm.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {painPoints.map((item) => (
            <div key={item.problem} className="panel-soft p-5">
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
