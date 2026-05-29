import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  DollarSign,
  Layers,
  Sparkles,
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
import { glassTileClass } from "@/lib/cardStyles";
import { PROCESS_STEPS, SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services | AD ERP SYSTEMS",
  description:
    "Builder reporting systems and an AI data analyst for residential construction teams that need clearer schedule, budget, margin, and owner follow-up visibility. Delivered turnkey, fully client-owned.",
};

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  DollarSign,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
};

export default function ServicesPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Services"
        title="Builder, developer + property management reporting and an AI analyst on top."
        description="We centralize your builder, developer, and property management data, define the exception logic, deliver operating views your team can review every day, and layer on an AI data analyst that answers plain-English questions about your warehouse. Every piece is turnkey and ends up owned by you."
        align="center"
      />

      <section className="pb-14 md:pb-20">
        <Container className="space-y-5">
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.icon] ?? Wrench;

            return (
              <BlueprintPanel key={service.id} className="overflow-hidden p-6 md:p-8 lg:p-10">
                <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-12">
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d5dde2] bg-[#f7f9fb] text-[#35647f]">
                        <Icon size={26} />
                      </div>
                      <span className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#6f8190]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="mt-7 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
                      {service.shortTitle}
                    </p>
                    <h2 className="mt-3 max-w-2xl font-heading text-4xl leading-[0.98] tracking-[-0.04em] text-[#17212c] md:text-5xl">
                      {service.title}
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-[#58636b] md:text-lg">
                      {service.description}
                    </p>

                    <Link
                      href={`/book/?source=services_${service.id}`}
                      className={liquidActionClass({
                        tone: "secondary",
                        size: "sm",
                        className: "mt-7",
                      })}
                    >
                      <span>Discuss this</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div>
                    <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
                      What you get
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {service.deliverables.map((deliverable) => (
                        <div
                          key={deliverable}
                          className={glassTileClass({
                            className:
                              "flex items-center gap-3 px-4 py-3.5 text-left",
                          })}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#a8c8b8] bg-[#edf5f1] text-[#356b54]">
                            <Check size={12} strokeWidth={3} />
                          </span>
                          <span className="text-sm font-semibold leading-snug text-[#40515d]">
                            {deliverable}
                          </span>
                        </div>
                      ))}
                    </div>
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
