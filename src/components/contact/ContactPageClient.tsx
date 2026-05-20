import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
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
import { glassPanelClass } from "@/lib/cardStyles";
import { SITE_CONFIG } from "@/lib/constants";

const firstCallSteps = [
  {
    title: "Review current systems",
    description:
      "Walk through your systems of record, manual reporting points, and where KPI definitions break down.",
  },
  {
    title: "Prioritize the first dashboard",
    description:
      "Narrow the first release to the schedule, budget, and owner follow-up signals with the clearest value.",
  },
  {
    title: "Define next steps",
    description:
      "Leave with a plain-English view of the data path, a likely build sequence, and whether it is a fit.",
  },
];

const fitPoints = [
  "ERP, spreadsheet, finance, API, and export data live in too many places.",
  "Leadership needs clearer visibility across jobs, costs, owners, and margin.",
  "The team wants a client-owned reporting system, not another disconnected dashboard.",
];

const contactDetails = [
  { icon: Mail, label: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
  { icon: MapPin, label: SITE_CONFIG.location },
  { icon: Clock, label: "Response within 24 hours" },
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
          <h2 className="mt-6 font-heading text-3xl leading-[1.04] tracking-[-0.03em] text-[#17212c] md:text-4xl">
            Book a 30-minute discovery call.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#58636b]">
            Review source systems, reporting gaps, and the first dashboard your
            team could use in daily operations.
          </p>
          <TrackedCalendlyLink
            source="contact_hero"
            className={liquidActionClass({
              tone: "primary",
              size: "md",
              className: "mt-6 w-full sm:w-auto",
            })}
          >
            <span>Pick a time</span>
            <ArrowRight size={15} />
          </TrackedCalendlyLink>

          <div className="mt-7 space-y-3.5 border-t border-[#e1e6e8] pt-6 text-sm font-semibold text-[#40515d]">
            {contactDetails.map(({ icon: Icon, label, href }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={17} className="shrink-0 text-[#35647f]" />
                {href ? (
                  <a href={href} className="hover:text-[#17212c]">
                    {label}
                  </a>
                ) : (
                  <span>{label}</span>
                )}
              </div>
            ))}
          </div>
        </BlueprintPanel>
      </BlueprintHero>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
              What to expect
            </p>
            <h2 className="mt-4 font-heading text-3xl leading-[1.05] tracking-[-0.03em] text-[#17212c] md:text-4xl">
              A short call to find the first dashboard.
            </h2>
          </div>

          <BlueprintPanel className="mx-auto max-w-5xl overflow-hidden">
            <div className="grid divide-y divide-[#e1e6e8] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {firstCallSteps.map((step, index) => (
                <div key={step.title} className="p-6 md:p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9d4da] bg-[#edf5f1] font-heading text-sm font-bold text-[#356b54]">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 font-heading text-lg leading-tight tracking-[-0.02em] text-[#17212c]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#58636b]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </BlueprintPanel>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
              Is this a fit?
            </p>
            <h2 className="mt-4 font-heading text-3xl leading-[1.05] tracking-[-0.03em] text-[#17212c] md:text-4xl">
              You will get the most from a call if...
            </h2>
          </div>

          <ul className={glassPanelClass("mx-auto mt-8 max-w-2xl divide-y divide-[#e1e6e8] px-6")}>
            {fitPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 py-4 text-sm font-semibold leading-6 text-[#46515a]"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#356b54]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
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
