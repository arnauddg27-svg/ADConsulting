import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Database,
  Mail,
  MapPin,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";
import { SITE_CONFIG } from "@/lib/constants";

const fitPoints = [
  "ERP, spreadsheet, finance, API, and export data live in too many places.",
  "Leadership needs cleaner visibility across land, permitting, construction, sales, and P&L.",
  "The team wants reporting built around its own systems, not another disconnected dashboard.",
];

const firstCallSteps = [
  {
    title: "Review current systems",
    description:
      "The first call identifies the systems of record, manual reporting points, and where KPI definitions break down.",
  },
  {
    title: "Prioritize the first phase",
    description:
      "The scope is narrowed to the reporting workflows with the clearest operational value.",
  },
  {
    title: "Outline practical next steps",
    description:
      "You leave with a plain-English view of the data path, likely build sequence, and fit.",
  },
];

const faqs = [
  {
    q: "What size builder is the best fit?",
    a: "The strongest fit is usually residential builders doing roughly 20-500+ homes per year where reporting relies on ERP exports, spreadsheets, and manual reconciliation.",
  },
  {
    q: "Do you replace our existing systems?",
    a: "No. The work usually connects to the systems already in place and centralizes the data into a structured warehouse, reporting system, and operational tools.",
  },
  {
    q: "What happens after the first call?",
    a: "If there is a fit, the next step defines the source systems, priority workflows, and first practical build phase so you can evaluate scope and cost clearly.",
  },
  {
    q: "Where is the platform deployed?",
    a: "The platform can be deployed to your cloud, data, and hosting environment with documentation your business can keep using and improving.",
  },
];

export default function ContactPageClient() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <span className="eyebrow">Book a Discovery Call</span>
              <h1 className="mt-6 max-w-4xl font-heading text-5xl leading-[0.9] tracking-[0.03em] text-slate-50 sm:text-6xl">
                Discuss your builder data, reporting, and operational tools.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                The first call is focused on fit and clarity: what systems you
                use, where reporting slows down, and what a practical first
                phase could look like.
              </p>
            </div>
            <Card padding="lg" className="bg-accent-500/[0.08]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-400/25 bg-accent-500/15 text-accent-200">
                <CalendarCheck size={22} />
              </div>
              <h2 className="mt-6 font-heading text-4xl leading-none tracking-[0.02em] text-slate-50">
                Book a 30-minute discovery call.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-200">
                The first call reviews your current reporting workflow, source
                systems, and decision priorities to confirm whether a custom
                data platform is the right fit.
              </p>
              <TrackedCalendlyLink
                source="contact_hero"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-accent-500 bg-accent-500 px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400"
              >
                Pick a Time
                <ArrowRight size={16} />
              </TrackedCalendlyLink>
            </Card>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="panel p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {firstCallSteps.map((step, index) => (
                  <div key={step.title} className="panel-soft p-5">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-accent-300">
                      Step {index + 1}
                    </div>
                    <h3 className="mt-4 font-heading text-2xl leading-none tracking-[0.03em] text-slate-50">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { icon: Database, label: "Centralized builder data" },
                  { icon: BarChart3, label: "Dashboards and reporting" },
                  { icon: Wrench, label: "Internal operational tools" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 text-sm font-semibold text-slate-200"
                  >
                    <Icon size={18} className="text-accent-300" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <Card padding="lg">
                <h2 className="font-heading text-3xl tracking-[0.04em] text-slate-50">
                  Contact details
                </h2>
                <div className="mt-6 space-y-4 text-sm text-slate-200">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 text-accent-300" />
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="hover:text-accent-100"
                    >
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-accent-300" />
                    <span>{SITE_CONFIG.businessAddress || SITE_CONFIG.location}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="mt-0.5 text-accent-300" />
                    <span>Response within 24 hours</span>
                  </div>
                </div>
              </Card>

              <Card padding="lg">
                <h3 className="font-heading text-3xl tracking-[0.04em] text-slate-50">
                  Strong fit if...
                </h3>
                <div className="mt-6 space-y-4">
                  {fitPoints.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent-300" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <SectionHeading
            label="FAQ"
            title="Questions teams usually ask before the first call."
            subtitle="If you are not sure whether the bottleneck is extraction, reporting design, data quality, or workflow alignment, that is exactly what the first conversation clarifies."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.q} padding="lg">
                <div className="flex items-start gap-4">
                  <ShieldCheck size={22} className="mt-1 shrink-0 text-accent-300" />
                  <div>
                    <h3 className="font-heading text-3xl leading-[0.95] tracking-[0.04em] text-slate-50">
                      {faq.q}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 rounded-[2rem] border border-accent-400/20 bg-accent-500/[0.06] p-6 text-center md:p-8">
            <h2 className="font-heading text-3xl tracking-[0.03em] text-slate-50">
              Ready to review your current reporting setup?
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Book the first call to walk through where your data lives, which
              reports matter most, and what a realistic first release could
              include.
            </p>
            <TrackedCalendlyLink
              source="contact_bottom"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-accent-500 bg-accent-500 px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_20px_40px_-20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-400"
            >
              Book a Discovery Call
              <ArrowRight size={16} />
            </TrackedCalendlyLink>
          </div>
        </Container>
      </section>
    </>
  );
}
