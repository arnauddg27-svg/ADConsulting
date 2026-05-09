import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  Layers3,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";

export const metadata: Metadata = {
  title: "Builder & Developer Data Platform | Residential Dashboards",
  description:
    "A competitively priced custom data platform for residential homebuilders and residential real estate developers. Centralize ERP, spreadsheet, finance, API, and export data into dashboards, reporting systems, and internal tools.",
};

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-accent-500 bg-accent-500 px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400";

const sourceSystems = [
  "ERP systems",
  "Finance systems",
  "Spreadsheets",
  "APIs",
  "CSV and Excel exports",
  "Operating systems",
];

const heroProof = [
  "Built for residential builders and developers",
  "Configured around your systems and reporting workflow",
  "Competitive project-based pricing",
];

const dataProblems = [
  "Reports are rebuilt manually from multiple exports.",
  "Finance, sales, construction, and leadership use different KPI definitions.",
  "Key operating questions require spreadsheet cleanup before anyone can answer them.",
  "Dashboards show summaries but do not drill into the jobs, lots, permits, or cost records behind the number.",
];

const platformLayers = [
  {
    icon: Database,
    title: "Centralize the data",
    body: "Extract from ERP systems, spreadsheets, finance tools, APIs, and exports into a structured warehouse.",
  },
  {
    icon: Layers3,
    title: "Apply operating logic",
    body: "Normalize communities, jobs, lots, budgets, stages, permits, draws, contracts, and KPI definitions for residential operations.",
  },
  {
    icon: BarChart3,
    title: "Deliver operating views",
    body: "Turn the warehouse into dashboards, reporting systems, drilldowns, alerts, and internal tools.",
  },
];

const whatYouBuy = [
  {
    title: "A custom data platform",
    body: "A working data layer that pulls from the systems you already use, organizes the data, and gives your team one source for reporting.",
  },
  {
    title: "Dashboards and reporting",
    body: "Executive and operating views for land, permitting, construction, loans, sales, property management, job cost, and margin.",
  },
  {
    title: "Internal tools and drilldowns",
    body: "Per-job views, exception lists, admin controls, variance tracking, cost-to-complete views, and drilldowns behind every key metric.",
  },
  {
    title: "A documented handoff",
    body: "Your team receives the platform, architecture notes, operating documentation, and support options after delivery.",
  },
];

const dashboardSamples = [
  {
    label: "Construction WIP",
    value: "142 active jobs",
    detail: "Stage, superintendent, completion %, cycle time, budget status",
  },
  {
    label: "Job Cost",
    value: "$32.0M actual to date",
    detail: "Budget vs actual, forecast variance, category spend, margin",
  },
  {
    label: "Permitting",
    value: "120 permit records",
    detail: "Submitted, approved, issued, rejected, in-review, cycle time",
  },
  {
    label: "Sales Backlog",
    value: "$18.4M open contracts",
    detail: "Contracts, closings, community absorption, buyer status",
  },
  {
    label: "Land Pipeline",
    value: "583 lots tracked",
    detail: "Acres, entitlement, due diligence, lots, cost per lot",
  },
  {
    label: "Loan and Draws",
    value: "$21.7M exposure",
    detail: "Draws, maturities, utilization, lender, maturity risk",
  },
];

const operatingViews = [
  "Land acquisition and subdivision pipeline",
  "Permitting status, cycle time, and stuck-item visibility",
  "Loan exposure, draw tracking, and expiration monitoring",
  "Construction WIP, cycle time, budget, and cost-to-complete",
  "Sales backlog, open contracts, closings, and portfolio oversight",
  "Per-job pro forma, variance tracking, and margin visibility",
];

const firstPhase = [
  {
    title: "Map the current systems",
    body: "Review source systems, exports, spreadsheets, owners, refresh frequency, and reporting pain points.",
  },
  {
    title: "Define the first operating release",
    body: "Choose the highest-value workflow first, usually construction WIP, land pipeline, sales backlog, or job cost.",
  },
  {
    title: "Build and hand off a working platform",
    body: "Deliver the warehouse, dashboards, drilldowns, admin logic, and documentation in the agreed operating environment.",
  },
];

const fitSignals = [
  "You manage roughly 20-500+ homes, lots, or closings per year.",
  "Critical reports still depend on exports, manual cleanup, or linked spreadsheets.",
  "Your ERP has useful data, but it does not give leadership the operating view they need.",
  "You want dashboards and tools built around your workflow, not a generic reporting template.",
];

const faq = [
  {
    question: "Does this replace our ERP?",
    answer:
      "No. The platform sits on top of the systems you already use. The goal is to make the data inside those systems usable for reporting, KPI logic, and operational decisions.",
  },
  {
    question: "What happens after the discovery call?",
    answer:
      "If there is a fit, the next step is a focused scope review so the first phase can be priced around real systems, priority workflows, and data access requirements.",
  },
  {
    question: "How is pricing handled?",
    answer:
      "Pricing is competitive and project-based. The first phase is scoped around the source systems, priority workflows, and dashboards that will create the most value without turning the project into an open-ended enterprise BI program.",
  },
  {
    question: "What happens after the finished system is delivered?",
    answer:
      "The build is delivered with documentation, architecture notes, and support options so the platform can be maintained, extended, and audited without turning into a black box.",
  },
];

function SectionIntro({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="mb-10 max-w-3xl md:mb-14">
      <h2 className="font-heading text-4xl leading-[0.95] tracking-[0.01em] text-slate-50 sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
        {body}
      </p>
    </div>
  );
}

export default function BuilderDataPlatformLandingPage() {
  return (
    <>
      <section className="page-hero pb-12 md:pb-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <h1 className="max-w-5xl font-heading text-[3.1rem] leading-[0.9] tracking-[-0.03em] text-slate-50 sm:text-6xl md:text-7xl">
                Turn scattered project data into reporting your team can run on.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                We build competitively priced custom data platforms for
                residential homebuilders and residential real estate developers.
                The product is a custom
                reporting system: data extraction, a structured warehouse,
                builder and developer KPI logic, dashboards, drilldowns, and
                internal tools.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <TrackedCalendlyLink
                  source="ad_landing_hero"
                  className={primaryCtaClass}
                >
                  Book a Discovery Call
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <Button href="/demo/" variant="secondary" size="lg">
                  See Sample Dashboard
                </Button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {heroProof.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm leading-6 text-slate-200"
                  >
                    <CheckCircle2
                      size={16}
                      className="mb-2 text-accent-300"
                    />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-panel overflow-hidden p-5 md:p-7">
              <div className="relative z-10 rounded-[1.5rem] border border-white/[0.08] bg-[#07111d]/80 p-5">
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="font-heading text-2xl leading-tight text-slate-50">
                      Builder & Developer Data Platform
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      One clean path from source systems to operating decisions.
                    </p>
                  </div>
                  <Building2 className="shrink-0 text-accent-300" size={28} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {sourceSystems.map((system) => (
                    <div
                      key={system}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-200"
                    >
                      {system}
                    </div>
                  ))}
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent" />

                <div className="grid gap-3">
                  {[
                    "Structured warehouse",
                    "Builder and developer KPI logic",
                    "Dashboards, reporting, and internal tools",
                    "Competitive project-based scope",
                  ].map((output) => (
                    <div
                      key={output}
                      className="flex items-center gap-3 rounded-2xl border border-accent-400/20 bg-accent-500/[0.08] px-4 py-3 text-sm font-semibold text-slate-100"
                    >
                      <CheckCircle2 size={16} className="text-accent-300" />
                      {output}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-8">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <SectionIntro
                title="The problem is not a lack of data."
                body="The problem is that the data lives in too many places, follows different definitions, and takes too much manual work to turn into decisions."
              />
              <TrackedCalendlyLink
                source="ad_landing_problem"
                className="hidden lg:inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.04] px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-100 transition-all duration-300 hover:border-accent-400 hover:bg-accent-500/10"
              >
                Talk through your reporting gaps
                <ArrowRight size={15} />
              </TrackedCalendlyLink>
            </div>

            <div className="grid gap-4">
              {dataProblems.map((problem, index) => (
                <Card key={problem} padding="md" className="bg-white/[0.035]">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-sm font-bold text-accent-300">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="pt-1 text-base leading-7 text-slate-200">
                      {problem}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <SectionIntro
            title="What you are buying."
            body="This is not a generic consulting report or a dashboard template. It is a custom data platform for residential builders and developers that your team can use and expand."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {whatYouBuy.map((item) => (
              <Card key={item.title} padding="lg" className="bg-white/[0.035]">
                <h2 className="font-heading text-3xl leading-none tracking-[0.01em] text-slate-50">
                  {item.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <SectionIntro
            title="What the platform does."
            body="The first build is organized around the practical path from source data to reporting your team can trust."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {platformLayers.map(({ icon: Icon, title, body }) => (
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
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <SectionIntro
                title="The dashboard data is practical, not decorative."
                body="A sample platform should show the kind of operating data builders actually ask for: WIP, job cost, permitting, sales, land, loans, draws, and margin."
              />
              <Button href="/demo/" variant="secondary" size="lg">
                View Interactive Sample
              </Button>
            </div>

            <div className="grid gap-3">
              {dashboardSamples.map((sample) => (
                <div
                  key={sample.label}
                  className="grid gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 sm:grid-cols-[0.85fr_0.7fr_1.45fr] sm:items-center"
                >
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-accent-300">
                    {sample.label}
                  </div>
                  <div className="font-heading text-3xl leading-none text-slate-50">
                    {sample.value}
                  </div>
                  <div className="text-sm leading-7 text-slate-300">
                    {sample.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <Card padding="lg" className="overflow-hidden bg-white/[0.035]">
              <div className="flex items-center gap-3 text-accent-300">
                <LineChart size={22} />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
                  Operating Coverage
                </span>
              </div>
              <h2 className="mt-5 max-w-3xl font-heading text-4xl leading-none tracking-[0.01em] text-slate-50">
                Built around the workflows residential builders actually report
                on.
              </h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {operatingViews.map((view) => (
                  <div
                    key={view}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-4 text-sm leading-6 text-slate-200"
                  >
                    {view}
                  </div>
                ))}
              </div>
            </Card>

            <Card
              padding="lg"
              className="border-accent-300/20 bg-[linear-gradient(135deg,rgba(52,211,153,0.14),rgba(255,255,255,0.04)_52%,rgba(15,23,42,0.68))]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-300/25 bg-accent-500/15 text-accent-200">
                <ShieldCheck size={22} />
              </div>
              <h2 className="mt-6 font-heading text-4xl leading-[0.95] tracking-[0.01em] text-slate-50">
                Built around your operating environment.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-200">
                The code, warehouse, hosting, documentation, and infrastructure
                are delivered in your environment. The goal is practical
                visibility without creating another black box.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <SectionIntro
                title="What a first phase can look like."
                body="The first engagement should be narrow enough to ship, but structured enough to become the foundation for the next reporting layer."
              />
            </div>

            <div className="grid gap-4">
              {firstPhase.map((step, index) => (
                <Card key={step.title} padding="md">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent-400/25 bg-accent-500/15 text-sm font-bold text-accent-200">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl leading-tight text-slate-50">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300 md:text-base">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card padding="lg" className="bg-white/[0.035]">
              <div className="flex items-center gap-3 text-accent-300">
                <ClipboardCheck size={22} />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
                  Fit Signals
                </span>
              </div>
              <h2 className="mt-5 font-heading text-4xl leading-none tracking-[0.01em] text-slate-50">
                This is usually a fit when:
              </h2>
              <div className="mt-7 space-y-4">
                {fitSignals.map((signal) => (
                  <div key={signal} className="flex gap-3 text-slate-200">
                    <CheckCircle2
                      size={18}
                      className="mt-1 shrink-0 text-accent-300"
                    />
                    <span className="text-sm leading-7 md:text-base">
                      {signal}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg" className="bg-white/[0.035]">
              <div className="flex items-center gap-3 text-accent-300">
                <CalendarCheck size={22} />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
                  Discovery Call
                </span>
              </div>
              <h2 className="mt-5 font-heading text-4xl leading-none tracking-[0.01em] text-slate-50">
                Use the call to find the practical starting point.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                We will review current systems, reporting gaps, data access,
                priority decisions, and whether a focused first phase makes
                sense.
              </p>
              <div className="mt-7">
                <TrackedCalendlyLink
                  source="ad_landing_fit"
                  className={primaryCtaClass}
                >
                  Pick a Time
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <SectionIntro
            title="Common questions before booking."
            body="Short answers for the questions that usually come up before a first conversation."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {faq.map((item) => (
              <Card key={item.question} padding="lg">
                <FileCheck2 size={22} className="text-accent-300" />
                <h3 className="mt-5 font-heading text-2xl leading-tight text-slate-50">
                  {item.question}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                  {item.answer}
                </p>
              </Card>
            ))}
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
                  className={primaryCtaClass}
                >
                  Book a Discovery Call
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <Link
                  href="/demo/"
                  className="inline-flex items-center justify-center rounded-full border border-white/[0.16] bg-transparent px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-slate-100 transition-all duration-300 hover:border-accent-400 hover:bg-accent-500/10"
                >
                  View Sample Dashboard
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
