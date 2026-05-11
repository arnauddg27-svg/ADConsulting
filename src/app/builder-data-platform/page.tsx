import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";
import MouseSpotlight from "@/components/ui/MouseSpotlight";
import HeroShowcase from "@/components/sections/HeroShowcase";

export const metadata: Metadata = {
  title: "Homebuilder Dashboards & ERP Reporting | AD ERP SYSTEMS",
  description:
    "Dashboards built on your builder data, not a template. Centralize ERP data, spreadsheets, finance systems, APIs, and exports in a structured warehouse. Turn that data into dashboards your team can use.",
};

const offerBuckets = [
  {
    icon: Database,
    title: "Centralize the data",
    body: "Bring ERP data, spreadsheets, finance-system exports, APIs, and operating files into a structured reporting warehouse.",
  },
  {
    icon: BarChart3,
    title: "Apply builder KPI logic",
    body: "Define the calculations, statuses, date rules, and workflow logic that match how residential builders and developers actually operate.",
  },
  {
    icon: Wrench,
    title: "Deliver usable reporting",
    body: "Turn the warehouse into dashboards, recurring reports, alerts, drilldowns, and internal tools your team can use.",
  },
];

const searchIntentUseCases = [
  "Homebuilder dashboards and KPI reporting",
  "Builder ERP, spreadsheet, and export reporting",
  "Construction WIP, job cost, and cost-to-complete views",
  "Residential developer and land pipeline reporting",
];

const primaryCtaClass =
  "group inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-full border text-center font-semibold uppercase tracking-[0.08em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 cursor-pointer border-accent-500 bg-accent-500 text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-[0_24px_50px_-16px_rgba(16,185,129,0.6)] px-5 py-4 text-[0.66rem] sm:px-6 sm:text-[0.78rem] sm:tracking-[0.18em]";

export default function BuilderDataPlatformLandingPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-24 md:pb-16 md:pt-32">
        <MouseSpotlight color="rgba(52, 211, 153, 0.14)" size={620} />

        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="aurora-blob left-[-10%] top-[2%] h-[620px] w-[760px] bg-accent-500/[0.14]"
            style={{ animation: "var(--animate-aurora)" }}
          />
          <div
            className="aurora-blob right-[-12%] top-[12%] h-[520px] w-[620px] bg-indigo-500/[0.08]"
            style={{ animation: "var(--animate-gradient-shift)", animationDelay: "-8s" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 82% 38% at 50% 0%, rgba(16,185,129,0.08), transparent 72%)",
            }}
          />
        </div>

        <Container className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-4 h-44 w-44 rounded-full bg-accent-400/20 blur-3xl md:-left-16 md:top-8 md:h-56 md:w-56"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 top-[24rem] h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl md:right-0 md:top-[16rem] md:h-64 md:w-64"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[18rem] h-56 w-56 -translate-x-1/2 rounded-full bg-accent-500/10 blur-[80px] md:top-[22rem] md:h-80 md:w-80"
          />

          <div className="relative z-10">
            <div className="mx-auto max-w-6xl text-center">
              <div className="mb-6 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-accent-300">
                Builder Data Platform
              </div>
              <h1 className="mx-auto max-w-6xl text-balance font-heading text-[2.65rem] leading-[0.96] tracking-[-0.025em] text-slate-50 sm:text-5xl lg:text-[5rem] lg:tracking-[-0.04em]">
                Dashboards built on your data, not a template.
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Centralize your systems into a warehouse, apply
                builder-specific KPI logic, and deliver reporting your team can
                use.
              </p>
            </div>

            <div className="mx-auto mt-7 flex min-w-0 max-w-3xl flex-col justify-center gap-3 sm:flex-row">
              <TrackedCalendlyLink
                source="ad_landing_hero"
                className={`${primaryCtaClass} w-full sm:w-auto`}
              >
                Book a Discovery Call
                <ArrowRight size={16} className="hidden sm:block" />
              </TrackedCalendlyLink>
              <Button href="/demo/" variant="secondary" size="lg" className="w-full sm:w-auto">
                <Sparkles size={16} className="hidden text-accent-300 sm:block" />
                Explore the Example
                <ArrowRight size={16} className="hidden sm:block" />
              </Button>
            </div>

            <HeroShowcase className="mt-6 md:mt-8" />
          </div>
        </Container>
      </section>

      <section className="section-space pt-0 md:pt-12">
        <Container>
          <div className="mb-8 rounded-[1.75rem] border border-white/[0.08] bg-white/[0.035] p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
              <div>
                <h2 className="font-heading text-2xl leading-[1.05] tracking-[-0.01em] text-slate-50 sm:text-3xl md:text-4xl">
                  Built for ERP exports, job cost data, and disconnected spreadsheets.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">
                  The work starts with the systems already in use, then maps the reporting
                  layer around the decisions your team needs to make.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {searchIntentUseCases.map((useCase) => (
                  <div
                    key={useCase}
                    className="rounded-2xl border border-accent-400/15 bg-accent-500/[0.06] px-4 py-3 text-sm font-semibold text-slate-200"
                  >
                    {useCase}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {offerBuckets.map(({ icon: Icon, title, body }) => (
              <Card key={title} padding="lg" hover>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-400/25 bg-accent-500/15 text-accent-200">
                  <Icon size={22} />
                </div>
                <h2 className="mt-6 font-heading text-2xl leading-none tracking-[0.02em] text-slate-50 md:text-3xl">
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
              <h2 className="mt-6 font-heading text-3xl leading-[1.05] tracking-[0.01em] text-slate-50 md:text-4xl">
                Best fit: builders and developers with real reporting friction.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                The strongest fit is a residential builder, residential
                developer, or builder-developer managing enough volume that
                manual reporting, spreadsheet reconciliation, and inconsistent
                KPI logic are slowing down decisions.
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
                <h2 className="max-w-3xl font-heading text-3xl leading-[1.02] tracking-[-0.015em] text-slate-50 md:text-[3.4rem] md:leading-[0.98]">
                  See whether your current data can support better reporting.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg md:leading-8">
                  Book a 30-minute call to review your current systems, where
                  reporting breaks down, and what a practical first reporting
                  phase could include.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <TrackedCalendlyLink
                  source="ad_landing_bottom"
                  className={primaryCtaClass}
                >
                  Book a Discovery Call
                  <ArrowRight size={16} className="hidden sm:block" />
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
