import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  DollarSign,
  Layers,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  BlueprintCTA,
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";
import { PROCESS_STEPS, SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services | AD ERP SYSTEMS",
  description:
    "Builder reporting systems for residential construction teams that need clearer schedule, budget, margin, and owner follow-up visibility.",
};

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  DollarSign,
  Layers,
  TrendingUp,
  Users,
  Wrench,
};

export default function ServicesPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Services"
        title="Builder reporting systems for schedule, budget, and margin."
        description="We centralize builder data, define the exception logic, and deliver operating views your team can review every day."
        align="center"
      />

      <section className="pb-14 md:pb-20">
        <Container className="space-y-5">
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.icon] ?? Wrench;

            return (
              <BlueprintPanel key={service.id} className="overflow-hidden p-6 md:p-8">
                <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d5dde2] bg-[#f7f9fb] text-[#35647f]">
                      <Icon size={20} />
                    </div>
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#6f8190]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
                    {service.shortTitle}
                  </p>
                  <h2 className="mt-2 font-heading text-2xl leading-tight tracking-[-0.03em] text-[#17212c] md:text-3xl">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#58636b] md:text-base">
                    {service.description}
                  </p>

                  <Link
                    href={`/book/?source=services_${service.id}`}
                    className={liquidActionClass({
                      tone: "secondary",
                      size: "sm",
                      className: "mt-5",
                    })}
                  >
                    <span>Discuss this</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="mt-6 border-t border-[#e1e6e8] pt-6">
                  <div className="mx-auto grid max-w-4xl gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {service.deliverables.map((deliverable) => (
                      <div
                        key={deliverable}
                        className="flex h-full items-center justify-center gap-2.5 rounded-xl border border-[#d5dde2] bg-[#f7f9fb]/82 px-3.5 py-3 text-center"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#a8c8b8] bg-[#edf5f1] text-[#356b54]">
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span className="text-sm font-semibold leading-5 text-[#40515d]">
                          {deliverable}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </BlueprintPanel>
            );
          })}
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-[#c9d4da] bg-white/88 px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#2f5368]">
              Process
            </p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] sm:text-5xl">
              From source systems to daily operating views.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <BlueprintPanel key={step.step} className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9d4da] bg-[#edf5f1] font-heading text-sm font-bold text-[#356b54]">
                  {step.step}
                </div>
                <h3 className="mt-5 font-heading text-2xl leading-tight tracking-[-0.03em] text-[#17212c]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#58636b]">
                  {step.description}
                </p>
              </BlueprintPanel>
            ))}
          </div>
        </Container>
      </section>

      <BlueprintCTA
        title="Start with the first operating view."
        description="We review your source systems, pick the first schedule, budget, and owner follow-up signals, then outline a practical dashboard release."
        primary={{
          label: "Book a Discovery Call",
          href: "/book/?source=services_cta",
        }}
        secondary={{
          label: "View Sample",
          href: "/examples/",
        }}
      />
    </BlueprintPage>
  );
}
