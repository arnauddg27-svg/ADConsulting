import type { Metadata } from "next";
import { ArrowRight, BarChart3, CalendarCheck, CheckCircle2, Database, ShieldCheck } from "lucide-react";

import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";
import {
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";

export const metadata: Metadata = {
  title: "Book a Discovery Call | AD ERP SYSTEMS",
  description:
    "Confirm fit for a discovery call about builder reporting systems for residential construction operations.",
};

const callFocus = [
  "Source systems and manual report handoffs",
  "Schedule, budget, margin, and owner follow-up signals",
  "The first dashboard your team can use in daily operations",
];

const outcomes = [
  {
    icon: Database,
    title: "Data path",
    body: "Which systems feed the first operating review.",
  },
  {
    icon: BarChart3,
    title: "Dashboard scope",
    body: "Which KPIs, filters, and exception lists matter first.",
  },
  {
    icon: ShieldCheck,
    title: "Fit and next step",
    body: "Whether a focused first release makes sense.",
  },
];

export default function BookPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Discovery Call"
        title="Start with the reporting view your team needs most."
        description="The call is a practical review of your current systems, where reporting slows down, and which dashboard should come first."
      >
        <BlueprintPanel className="p-6 md:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d5dde2] bg-[#f7f9fb] text-[#35647f]">
            <CalendarCheck size={22} />
          </div>
          <h2 className="mt-6 font-heading text-4xl leading-none tracking-[-0.04em] text-[#17212c]">
            Book a 30-minute call.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#58636b]">
            We will review your current reporting workflow and decide whether a
            focused builder dashboard release is a good fit.
          </p>
          <TrackedCalendlyLink
            source="book_page"
            className={liquidActionClass({
              tone: "primary",
              size: "lg",
              className: "mt-7 w-full sm:w-auto",
            })}
          >
            <span>Pick a time</span>
            <ArrowRight size={16} />
          </TrackedCalendlyLink>
        </BlueprintPanel>
      </BlueprintHero>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="inline-flex rounded-full border border-[#c9d4da] bg-white/88 px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#2f5368]">
                What we cover
              </p>
              <h2 className="mt-5 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-5xl">
                A short call, focused on the real bottleneck.
              </h2>
              <div className="mt-7 space-y-3">
                {callFocus.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-base font-semibold leading-7 text-[#40515d]">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#356b54]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
              {outcomes.map(({ icon: Icon, title, body }) => (
                <BlueprintPanel key={title} className="p-6">
                  <Icon size={22} className="text-[#35647f]" />
                  <h3 className="mt-4 font-heading text-2xl tracking-[-0.03em] text-[#17212c]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#58636b]">
                    {body}
                  </p>
                </BlueprintPanel>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </BlueprintPage>
  );
}
