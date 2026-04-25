"use client";

import { NumberTicker } from "@/components/magicui/number-ticker";
import { LayoutDashboard, ShieldCheck, Gauge, Cpu } from "lucide-react";
import Container from "@/components/ui/Container";

const stats = [
  {
    icon: <LayoutDashboard size={22} />,
    prefix: "Up to ",
    value: 45,
    suffix: "",
    label: "Dashboard KPIs",
    detail: "Across 7 lifecycle sections — scope to each engagement",
  },
  {
    icon: <ShieldCheck size={22} />,
    prefix: "Up to ",
    value: 105,
    suffix: "",
    label: "Nightly validation checks",
    detail: "Data drift flagged before 7am — subset run per client",
  },
  {
    icon: <Gauge size={22} />,
    prefix: "",
    value: 4,
    suffix: "-8 wks",
    label: "Typical kickoff to production",
    detail: "Fixed-price, milestone billed — varies by scope",
  },
  {
    icon: <Cpu size={22} />,
    prefix: "",
    value: 100,
    suffix: "%",
    label: "Client-owned infrastructure",
    detail: "Your cloud. Your data. Your code.",
  },
];

export default function StatsBand() {
  return (
    <section className="relative py-14 md:py-20">
      {/* top + bottom divider glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/30 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-400/30 to-transparent"
      />
      {/* soft accent wash behind */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 140% at 50% 50%, rgba(16,185,129,0.06), transparent 70%)",
        }}
      />

      <Container className="relative">
        {/* Eyebrow / clarifier — these are reference figures, not guarantees */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Reference figures
          </span>
          <p className="text-[0.78rem] leading-5 text-slate-500">
            Illustrative of the full-scope platform — exact counts, timeline,
            and coverage depend on the warehouse audit and KPI assessment.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative flex flex-col items-start rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-accent-400/25 bg-gradient-to-br from-accent-500/15 to-accent-500/[0.02] text-accent-200 transition-all duration-500 group-hover:border-accent-400/50 group-hover:shadow-[0_0_22px_-6px_rgba(52,211,153,0.45)]">
                {s.icon}
              </div>
              <div className="font-heading text-4xl leading-none tracking-[-0.02em] text-slate-50 sm:text-5xl">
                {s.prefix && (
                  <span className="text-[0.45em] font-semibold uppercase tracking-[0.18em] text-slate-400 align-middle mr-1.5">
                    {s.prefix}
                  </span>
                )}
                <NumberTicker value={s.value} className="tabular-nums" />
                <span className="text-gradient">{s.suffix}</span>
              </div>
              <div className="mt-3 text-[0.88rem] font-semibold text-slate-100">
                {s.label}
              </div>
              <div className="mt-1 text-[0.78rem] leading-5 text-slate-400">
                {s.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom footnote anchor */}
        <p className="mt-6 text-center text-[0.68rem] uppercase tracking-[0.18em] text-slate-600">
          Final product scoped per engagement · All figures subject to discovery audit
        </p>
      </Container>
    </section>
  );
}
