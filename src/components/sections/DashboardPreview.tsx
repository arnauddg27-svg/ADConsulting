import { ArrowRight, BarChart3, DollarSign, CalendarClock, FolderOpen } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

const previewModules = [
  {
    icon: <FolderOpen size={20} />,
    title: "Project review",
    detail: "Community status, phase visibility, and production pacing",
  },
  {
    icon: <DollarSign size={20} />,
    title: "Budget control",
    detail: "Spend movement, draw tracking, and exceptions",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Cost movement",
    detail: "Category mix, variance trends, and pressure points",
  },
  {
    icon: <CalendarClock size={20} />,
    title: "Schedule risk",
    detail: "Milestones, critical dates, and job pacing",
  },
];

const sampleKPIs = [
  { label: "Active Projects", value: "24" },
  { label: "On-Time Rate", value: "87%" },
  { label: "Budget Used", value: "$4.2M" },
  { label: "Change Orders", value: "12" },
];

export default function DashboardPreview() {
  return (
    <section className="section-space">
      <Container>
        <div className="panel overflow-hidden">
          <div className="grid lg:grid-cols-[0.45fr_0.55fr]">
            <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
              <span className="eyebrow">Illustrative Example</span>
              <h2 className="mt-5 font-heading text-4xl leading-[0.95] tracking-[0.04em] text-slate-50 md:text-5xl">
                A clear operating view of projects, costs, and schedules.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
                This example brings production pace, cost movement, schedule
                pressure, and open issues into one place so leadership can
                review the business faster and act earlier.
              </p>
              <p className="mt-2 text-xs italic text-slate-500">
                Illustrative only. Every engagement is shaped around the
                communities, workflows, and operating questions that matter
                most to the business.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {previewModules.map((module) => (
                  <div key={module.title} className="flex items-start gap-3">
                    <div className="mt-0.5 text-accent-300">{module.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-slate-100">{module.title}</div>
                      <div className="text-xs text-slate-400">{module.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button href="/demo/" size="lg" className="mt-10 self-start">
                Explore the Example
                <ArrowRight size={16} />
              </Button>
            </div>

            <div className="border-t border-white/[0.08] bg-[#0a0f1a] p-6 md:p-8 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Operating Overview
                </div>
                <span className="badge-dash text-accent-100">Illustrative Example</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {sampleKPIs.map((kpi) => (
                  <div key={kpi.label} className="rounded-[1.25rem] border border-white/[0.06] bg-white/[0.03] p-4">
                    <div className="text-[0.64rem] uppercase tracking-[0.18em] text-slate-500">
                      {kpi.label}
                    </div>
                    <div className="mt-2 font-heading text-2xl tracking-[0.04em] text-slate-50">
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.03] p-5">
                <div className="text-[0.64rem] uppercase tracking-[0.18em] text-slate-500">
                  Project Completion by Community
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { name: "Lakewood Reserve", pct: 76 },
                    { name: "Winter Garden", pct: 88 },
                    { name: "Cypress Creek", pct: 64 },
                    { name: "Clermont Heights", pct: 45 },
                  ].map((project) => (
                    <div key={project.name}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{project.name}</span>
                        <span className="text-slate-500">{project.pct}%</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-white/[0.06]">
                        <div
                          className="h-2 rounded-full bg-accent-400"
                          style={{ width: `${project.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
