import { AlertTriangle, ArrowRight, DollarSign, Layers, TrendingUp } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

const heroModules = [
  {
    icon: <DollarSign size={20} />,
    title: "Job profitability",
    detail: "Budget vs. actuals, cost variances, and margin flags",
  },
  {
    icon: <Layers size={20} />,
    title: "Pipeline visibility",
    detail: "Starts, phase tracking, backlog, and bottleneck status",
  },
  {
    icon: <AlertTriangle size={20} />,
    title: "Exception center",
    detail: "Delayed work, stale data, and missing update alerts",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Operating rhythm",
    detail: "KPIs, reports, and internal tools your team can use",
  },
];

const heroKPIs = [
  { label: "Active Jobs", value: "24" },
  { label: "On-Time Rate", value: "87%" },
  { label: "Budget Used", value: "$4.2M" },
  { label: "Open Exceptions", value: "12" },
];

const completionRows = [
  { name: "Lakewood Reserve", pct: 76 },
  { name: "Winter Garden", pct: 88 },
  { name: "Cypress Creek", pct: 64 },
  { name: "Clermont Heights", pct: 45 },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-12 pt-28 md:pb-16 md:pt-32">
      {/* Mouse spotlight is handled globally by <PageAmbient> in layout. */}

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="aurora-blob left-[-8%] top-[4%] h-[620px] w-[760px] bg-accent-500/[0.16]"
          style={{ animation: "var(--animate-aurora)" }}
        />
        <div
          className="aurora-blob right-[-12%] top-[8%] h-[520px] w-[620px] bg-indigo-500/[0.08]"
          style={{ animation: "var(--animate-gradient-shift)", animationDelay: "-8s" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 42% at 50% 0%, rgba(16,185,129,0.08), transparent 70%)",
          }}
        />
      </div>

      <Container className="relative">
        <div className="animate-rise-in panel relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] border border-accent-400/20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-accent-400/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 bottom-8 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl"
          />

          <div className="grid lg:min-h-[640px] lg:grid-cols-[0.46fr_0.54fr]">
            <div className="relative flex flex-col justify-center p-7 md:p-10 lg:p-12">
              <span className="eyebrow eyebrow-dot w-full justify-start sm:w-auto">
                Illustrative Example
              </span>

              <h1 className="mt-7 max-w-2xl font-heading text-[2.85rem] leading-[0.95] tracking-[-0.035em] text-slate-50 sm:text-6xl lg:text-[4.8rem]">
                Dashboards built on your data, not a template.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                Centralize your systems, apply operating logic, and turn the data
                into dashboards, reporting, and internal tools.
              </p>

              <p className="mt-3 max-w-xl text-xs italic leading-5 text-slate-500">
                Illustrative only. Every implementation is shaped around actual data,
                workflows, and operating questions.
              </p>

              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {heroModules.map((module) => (
                  <div key={module.title} className="flex items-start gap-3">
                    <div className="mt-0.5 text-accent-300">{module.icon}</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-100">
                        {module.title}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-400">
                        {module.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button href="/contact/" size="lg">
                  Book a Discovery Call
                  <ArrowRight size={16} />
                </Button>
                <Button href="/demo/" variant="secondary" size="lg">
                  Explore the Example
                </Button>
              </div>
            </div>

            <div className="relative border-t border-white/[0.08] bg-[#080e18] p-5 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <div className="flex h-full flex-col justify-center rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Operating Overview
                  </div>
                  <span className="badge-dash text-accent-100">Illustrative Example</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {heroKPIs.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-[1.15rem] border border-white/[0.07] bg-white/[0.035] p-4"
                    >
                      <div className="text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">
                        {kpi.label}
                      </div>
                      <div className="mt-3 font-heading text-2xl text-slate-50 md:text-3xl">
                        {kpi.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.35rem] border border-white/[0.07] bg-white/[0.035] p-5">
                  <div className="text-[0.64rem] uppercase tracking-[0.18em] text-slate-500">
                    Project Completion by Community
                  </div>

                  <div className="mt-5 space-y-4">
                    {completionRows.map((row) => (
                      <div key={row.name}>
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-slate-300">{row.name}</span>
                          <span className="text-slate-500">{row.pct}%</span>
                        </div>
                        <div className="mt-2 h-2.5 rounded-full bg-white/[0.07]">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-accent-600 to-accent-300"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    Daily sync
                    <div className="mt-1 font-semibold text-slate-200">5:47 AM</div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    KPI logic
                    <div className="mt-1 font-semibold text-slate-200">Builder-specific</div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    Output
                    <div className="mt-1 font-semibold text-slate-200">
                      Dashboards + tools
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
