"use client";

import { ArrowRight, DollarSign, Layers, AlertTriangle, TrendingUp } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";

const previewModules = [
  {
    icon: <DollarSign size={20} />,
    title: "Job Profitability",
    detail: "Budget vs. actuals, cost code variances, and margin flags",
  },
  {
    icon: <Layers size={20} />,
    title: "Lot Pipeline",
    detail: "Starts, completions, phase tracking, and bottleneck visibility",
  },
  {
    icon: <AlertTriangle size={20} />,
    title: "Exception Center",
    detail: "Delayed jobs, missing data, and stale update alerts",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Sales & Backlog",
    detail: "Sales pace, backlog health, and community performance",
  },
];

const sampleKPIs = [
  { label: "Active Jobs", value: 24, prefix: "", suffix: "" },
  { label: "On-Time Rate", value: 87, prefix: "", suffix: "%" },
  { label: "Budget Used", value: 4.2, prefix: "$", suffix: "M", decimals: 1 },
  { label: "Open Exceptions", value: 12, prefix: "", suffix: "" },
];

export default function DashboardPreview() {
  return (
    <section className="section-space">
      <Container>
        <div className="reveal panel relative overflow-hidden">
          <BorderBeam
            size={120}
            duration={8}
            colorFrom="#34d399"
            colorTo="#10b981"
            borderWidth={1}
          />
          <div className="grid lg:grid-cols-[0.45fr_0.55fr]">
            <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
              <span className="eyebrow">Illustrative Example</span>
              <h2 className="mt-5 font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 md:text-5xl">
                This is what your operating system looks like.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
                Job profitability, pipeline status, exception flags, and schedule
                pressure — unified in one system that your entire team can work
                from. No more exporting data to do your actual job.
              </p>
              <p className="mt-2 text-xs italic text-slate-500">
                Illustrative only. Every implementation is shaped around the
                builder&apos;s actual data, workflows, and operating questions.
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
                    <div className="mt-2 font-heading text-2xl text-slate-50">
                      {kpi.prefix}
                      <NumberTicker
                        value={kpi.value}
                        decimalPlaces={kpi.decimals ?? 0}
                        delay={0.3}
                        className="text-slate-50"
                      />
                      {kpi.suffix}
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
                          className="h-2 rounded-full bg-gradient-to-r from-accent-600 to-accent-400"
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
