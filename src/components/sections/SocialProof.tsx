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
    problem: "Spreadsheets everywhere, none of them match",
    solution: "One centralized source of truth for every metric — automatically updated",
  },
  {
    icon: <TrendingDown size={22} />,
    problem: "Margin erosion shows up at closing, not during construction",
    solution: "Real-time cost tracking and variance flags while you can still act",
  },
  {
    icon: <Clock size={22} />,
    problem: "Field and office are looking at two different sets of numbers",
    solution: "Shared operating views that keep every team on the same page",
  },
  {
    icon: <AlertTriangle size={22} />,
    problem: "Systems are expensive but underused — glorified filing cabinets",
    solution: "We unlock the value trapped in your tools and make it operational",
  },
];

export default function SocialProof() {
  return (
    <section className="section-space pt-0">
      <Container>
        <div className="reveal text-center">
          <span className="eyebrow">The Problem</span>
          <h2 className="mx-auto mt-5 max-w-3xl font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 sm:text-[3.2rem]">
            You don&apos;t have a software problem.{" "}
            <span className="text-gradient">You have a data structure problem.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Your builder systems store the data — but getting it out and
            making it useful is where everything breaks down. Most consultants
            slap a dashboard on top of messy data. We fix the structure
            underneath.
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
