import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  Layers3,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";

export const metadata: Metadata = {
  title: "Custom Data Platforms for Homebuilders | A.D. Homes & Consulting",
  description:
    "Centralize ERP, spreadsheet, finance, API, and export data into dashboards, reporting systems, and internal tools for residential homebuilders.",
};

const sourceSystems = [
  "ERP systems",
  "Spreadsheets",
  "Finance data",
  "APIs",
  "CSV and Excel exports",
  "Operating systems",
];

const offerBuckets = [
  {
    icon: Database,
    title: "Data Infrastructure",
    body: "Extraction, ingestion, transformation, warehouse design, KPI logic, and centralized builder data.",
  },
  {
    icon: BarChart3,
    title: "Operational Reporting",
    body: "Dashboards across land, development, permitting, lending, construction, sales, backlog, and portfolio oversight.",
  },
  {
    icon: Wrench,
    title: "Builder Decision Tools",
    body: "Pro formas, budget-vs-actual analysis, cost-to-complete, variance tracking, exception monitoring, and internal apps.",
  },
];

const proofPoints = [
  "Client-owned code, data, hosting, and infrastructure.",
  "Built around residential builder workflows, not generic BI templates.",
  "Designed for practical reporting releases instead of long discovery cycles.",
];

export default function BuilderDataPlatformLandingPage() {
  return (
    <>
      <section className="page-hero pb-12 md:pb-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <h1 className="max-w-5xl font-heading text-[3rem] leading-[0.92] tracking-[-0.02em] text-slate-50 sm:text-6xl md:text-7xl">
                Custom data platforms for residential homebuilders.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                Centralize ERP, spreadsheet, finance, API, and export data into
                one structured warehouse, then turn it into dashboards,
                reporting systems, and internal tools your team can use.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <TrackedCalendlyLink
                  source="ad_landing_hero"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-500 bg-accent-500 px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400"
                >
                  Book a Discovery Call
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <Button href="/demo/" variant="secondary" size="lg">
                  See Sample Dashboard
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {proofPoints.map((point) => (
                  <span key={point} className="badge-dash normal-case tracking-normal">
                    <CheckCircle2 size={14} className="text-accent-300" />
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div className="premium-panel p-5 md:p-7">
              <div className="relative z-10 rounded-[1.5rem] border border-white/[0.08] bg-[#07111d]/80 p-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-300">
                      Builder Data Flow
                    </div>
                    <div className="mt-1 font-heading text-2xl text-slate-50">
                      From scattered systems to working reporting
                    </div>
                  </div>
                  <Layers3 className="text-accent-300" size={28} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {sourceSystems.map((system) => (
                    <div key={system} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-200">
                      {system}
                    </div>
                  ))}
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent" />

                <div className="rounded-2xl border border-accent-400/20 bg-accent-500/[0.08] p-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-300">
                    Output
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
                    <span>Dashboards</span>
                    <span>KPI reporting</span>
                    <span>Internal tools</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-8">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {offerBuckets.map(({ icon: Icon, title, body }) => (
              <Card key={title} padding="lg" hover>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-400/25 bg-accent-500/15 text-accent-200">
                  <Icon size={22} />
                </div>
                <h2 className="mt-6 font-heading text-3xl leading-none tracking-[0.03em] text-slate-50">
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                  {body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <Card padding="lg" className="bg-white/[0.035]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-400/25 bg-accent-500/15 text-accent-200">
                <ShieldCheck size={22} />
              </div>
              <h2 className="mt-6 font-heading text-4xl leading-none tracking-[0.02em] text-slate-50">
                Built for builders who need cleaner operational visibility.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                The strongest fit is a residential builder managing enough
                volume that manual reporting, spreadsheet reconciliation, and
                inconsistent KPI logic are slowing down decisions.
              </p>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Land acquisition and subdivision pipeline reporting",
                "Permitting status, cycle time, and stuck-item visibility",
                "Construction WIP, cycle time, budget, and cost-to-complete reporting",
                "Sales, backlog, portfolio, and per-job P&L visibility",
              ].map((item) => (
                <div key={item} className="panel-soft p-5">
                  <CheckCircle2 size={20} className="text-accent-300" />
                  <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container>
          <div className="premium-panel overflow-hidden p-7 md:p-10">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="max-w-3xl font-heading text-4xl leading-[0.98] tracking-[-0.015em] text-slate-50 md:text-[3.4rem]">
                  See whether your current data can support better reporting.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg md:leading-8">
                  Book a 30-minute call to review your current systems, where
                  reporting breaks down, and what a practical first build phase
                  could include.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <TrackedCalendlyLink
                  source="ad_landing_bottom"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-500 bg-accent-500 px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400"
                >
                  Book a Discovery Call
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <Link
                  href="/contact/"
                  className="inline-flex items-center justify-center rounded-full border border-white/[0.16] bg-transparent px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-slate-100 transition-all duration-300 hover:border-accent-400 hover:bg-accent-500/10"
                >
                  Contact Details
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
