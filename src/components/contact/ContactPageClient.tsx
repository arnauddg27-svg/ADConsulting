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

import {
  BlueprintCTA,
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";
import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";
import { SITE_CONFIG } from "@/lib/constants";

const fitPoints = [
  "ERP, spreadsheet, finance, API, and export data live in too many places.",
  "Leadership needs clearer visibility across jobs, costs, owners, and margin.",
  "The team wants a client-owned reporting system, not another disconnected dashboard.",
];

const firstCallSteps = [
  {
    title: "Review current systems",
    description:
      "Identify the systems of record, manual reporting points, and where KPI definitions break down.",
  },
  {
    title: "Prioritize the first dashboard",
    description:
      "Narrow the first release to the schedule, budget, and owner follow-up signals with the clearest value.",
  },
  {
    title: "Define next steps",
    description:
      "Leave with a plain-English view of the data path, likely build sequence, and fit.",
  },
];

const faqs = [
  {
    q: "What size builder is the best fit?",
    a: "The strongest fit is usually a residential builder or developer where reporting relies on ERP exports, spreadsheets, and manual reconciliation.",
  },
  {
    q: "Do you replace our existing systems?",
    a: "No. The work connects to the systems already in place and centralizes the data into reporting views your team can trust.",
  },
  {
    q: "What happens after the first call?",
    a: "If there is a fit, we define the source systems, priority workflows, and a practical first build phase.",
  },
  {
    q: "Who owns the platform?",
    a: "The client owns the code, data, hosting, and infrastructure. The system is meant to stay with your business.",
  },
];

export default function ContactPageClient() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Contact"
        title="Talk through your builder reporting setup."
        description="The first call is focused on fit: current systems, where reporting slows down, and which operating view should come first."
      >
        <BlueprintPanel className="p-6 md:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d5dde2] bg-[#f7f9fb] text-[#35647f]">
            <CalendarCheck size={22} />
          </div>
          <h2 className="mt-6 font-heading text-4xl leading-none tracking-[-0.04em] text-[#17212c]">
            Book a 30-minute discovery call.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#58636b]">
            Review source systems, reporting gaps, and the first dashboard your
            team could use in daily operations.
          </p>
          <TrackedCalendlyLink
            source="contact_hero"
            className={liquidActionClass({
              tone: "primary",
              size: "md",
              className: "mt-7",
            })}
          >
            <span>Pick a time</span>
            <ArrowRight size={15} />
          </TrackedCalendlyLink>
        </BlueprintPanel>
      </BlueprintHero>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <BlueprintPanel className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {firstCallSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[1rem] border border-[#d5dde2] bg-[#f7f9fb]/82 p-5"
                  >
                    <div className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-[#35647f]">
                      Step {index + 1}
                    </div>
                    <h3 className="mt-4 font-heading text-2xl leading-tight tracking-[-0.03em] text-[#17212c]">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#58636b]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { icon: Database, label: "Centralized builder data" },
                  { icon: BarChart3, label: "Dashboards and reporting" },
                  { icon: Wrench, label: "Internal operating tools" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-[1rem] border border-[#d5dde2] bg-white px-4 py-3 text-sm font-bold text-[#40515d]"
                  >
                    <Icon size={18} className="text-[#35647f]" />
                    {label}
                  </div>
                ))}
              </div>
            </BlueprintPanel>

            <div className="space-y-5">
              <BlueprintPanel className="p-6 md:p-7">
                <h2 className="font-heading text-3xl tracking-[-0.04em] text-[#17212c]">
                  Contact details
                </h2>
                <div className="mt-6 space-y-4 text-sm font-semibold text-[#40515d]">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 text-[#35647f]" />
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="hover:text-[#17212c]"
                    >
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-[#35647f]" />
                    <span>{SITE_CONFIG.location}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="mt-0.5 text-[#35647f]" />
                    <span>Response within 24 hours</span>
                  </div>
                </div>
              </BlueprintPanel>

              <BlueprintPanel className="p-6 md:p-7">
                <h3 className="font-heading text-3xl tracking-[-0.04em] text-[#17212c]">
                  Strong fit if...
                </h3>
                <div className="mt-6 space-y-4">
                  {fitPoints.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#58636b]">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#356b54]" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </BlueprintPanel>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-[#c9d4da] bg-white/88 px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#2f5368]">
              FAQ
            </p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] sm:text-5xl">
              Questions teams ask before the first call.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#58636b] md:text-lg">
              If the bottleneck is extraction, data quality, reporting design,
              or workflow alignment, that is what the first conversation clarifies.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <BlueprintPanel key={faq.q} className="p-6 md:p-7">
                <div className="flex items-start gap-4">
                  <ShieldCheck size={22} className="mt-1 shrink-0 text-[#35647f]" />
                  <div>
                    <h3 className="font-heading text-2xl leading-tight tracking-[-0.03em] text-[#17212c]">
                      {faq.q}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#58636b] md:text-base">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </BlueprintPanel>
            ))}
          </div>
        </Container>
      </section>

      <BlueprintCTA
        title="Ready to review the reporting flow?"
        description="Book the first call and we will walk through where your data lives, which reports matter most, and what a realistic first release could include."
        primary={{
          label: "Book a Discovery Call",
          href: "/book/?source=contact_bottom",
        }}
        secondary={{
          label: "View Services",
          href: "/services/",
        }}
      />
    </BlueprintPage>
  );
}
