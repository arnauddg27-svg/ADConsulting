import type { Metadata } from "next";
import {
  DollarSign,
  Layers,
  Users,
  AlertTriangle,
  TrendingUp,
  Wrench,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CTABanner from "@/components/sections/CTABanner";
import { SERVICES, PROCESS_STEPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Custom Builder Operating Systems | Job Profitability, Pipeline, Vendor Scorecard — Orlando",
  description:
    "We build custom data ecosystems for residential home builders: job profitability consoles, lot pipeline boards, vendor scorecards, exception centers, and sales dashboards.",
};

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign size={28} />,
  Layers: <Layers size={28} />,
  Users: <Users size={28} />,
  AlertTriangle: <AlertTriangle size={28} />,
  TrendingUp: <TrendingUp size={28} />,
  Wrench: <Wrench size={28} />,
};

const pricingTiers = [
  {
    segment: "Small Builders",
    volume: "25 – 100 homes / year",
    painPoint:
      "Manual Excel exports, disjointed ERP modules, no single source of truth for margin or cycle time.",
    range: "$30,000 – $70,000",
    note: "Standardized operating system with core applications and automated data ingestion.",
  },
  {
    segment: "Mid-Size Builders",
    volume: "100 – 300 homes / year",
    painPoint:
      "Processes breaking at scale, executive visibility gaps, multiple departments working from different numbers.",
    range: "$70,000 – $150,000",
    note: "Full data ecosystem with multi-department workflows, custom applications, and executive reporting.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">What We Build</span>
            <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl">
              Custom operating systems for home builders
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              We extract data from your ERP, centralize it into a single source
              of truth, and build functional applications that your construction,
              purchasing, and finance teams actually use every day.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Core Deliverables ── */}
      <section className="section-space pt-0 pb-8 md:pb-10">
        <Container className="space-y-6">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              className="reveal panel overflow-hidden p-6 md:p-8 lg:p-10"
            >
              <div className="grid items-center gap-8 lg:grid-cols-[0.5fr_0.5fr] lg:gap-12">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-400/20 bg-accent-500/10 text-accent-200">
                      {iconMap[service.icon]}
                    </div>
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      0{index + 1}
                    </span>
                  </div>

                  <h2 className="mt-6 font-heading text-3xl leading-[0.95] tracking-[-0.01em] text-slate-50 md:text-4xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-300">
                    {service.description}
                  </p>

                  <Button href="/contact/" variant="outline" size="sm" className="mt-6">
                    Discuss This
                    <ArrowRight size={14} />
                  </Button>
                </div>

                <div>
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    What you get
                  </div>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {service.deliverables.map((deliverable) => (
                      <div
                        key={deliverable}
                        className="flex items-center gap-3 rounded-[1rem] border border-white/[0.06] bg-black/20 px-4 py-3"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-300" />
                        <span className="text-sm leading-6 text-slate-200">
                          {deliverable}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ── Pricing Tiers ── */}
      <section className="section-space pt-6 md:pt-8">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Investment</span>
            <h2 className="mt-5 font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 sm:text-5xl">
              Priced by builder size, not by the hour.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Implementation fees are based on the complexity of your operation.
              Post-launch retainers keep your system maintained and evolving.
            </p>
          </div>

          <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-2">
            {pricingTiers.map((tier) => (
              <div key={tier.segment} className="reveal glow-card p-8">
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-300">
                  {tier.segment}
                </div>
                <div className="mt-1 text-sm text-slate-400">{tier.volume}</div>
                <div className="mt-6 font-heading text-4xl tracking-[-0.02em] text-slate-50">
                  {tier.range}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {tier.painPoint}
                </p>
                <div className="mt-5 border-t border-white/[0.08] pt-5 text-sm leading-6 text-slate-300">
                  {tier.note}
                </div>
              </div>
            ))}
          </div>

          <div className="reveal mt-5 glow-card mx-auto max-w-md p-6 text-center">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-300">
              Ongoing Retainer
            </div>
            <div className="mt-3 font-heading text-3xl tracking-[-0.02em] text-slate-50">
              $3,000 / month
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Pipeline maintenance, application updates, and fractional data
              engineering support post-launch.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Process ── */}
      <section className="section-space">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Process</span>
            <h2 className="mt-5 font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 sm:text-5xl">
              From discovery call to operating system.
            </h2>
          </div>

          <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="reveal glow-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-400/30 bg-accent-500/10 font-heading text-lg text-accent-200">
                  {step.step}
                </div>
                <h3 className="mt-5 font-heading text-2xl tracking-[-0.01em] text-slate-50">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTABanner
        headline="The first call is free. The insight isn't."
        description="We'll look under the hood at your actual workflows and data quality. If it's an easy fix, we'll tell you how to do it for free. If it requires a full build, you'll get a precise roadmap and budget."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
        }}
      />
    </>
  );
}
