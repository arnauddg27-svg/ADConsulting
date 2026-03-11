import type { Metadata } from "next";
import {
  BarChart3,
  Calculator,
  Settings,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CTABanner from "@/components/sections/CTABanner";
import { SERVICES, PROCESS_STEPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services | Homebuilder Operations Consulting",
  description:
    "Dashboards, KPI systems, financial modeling, ERP optimization, and process improvement for Central Florida builders and development firms.",
};

const iconMap: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 size={28} />,
  Calculator: <Calculator size={28} />,
  Settings: <Settings size={28} />,
};

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Services</span>
            <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[0.04em] text-slate-50 sm:text-6xl">
              Services
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Each service is designed to remove a different source of drag:
              unclear reporting, weak underwriting, or day-to-day process
              drift.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0 pb-8 md:pb-10">
        <Container className="space-y-6">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              className="panel overflow-hidden p-6 md:p-8 lg:p-10"
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

                  <h2 className="mt-6 font-heading text-3xl leading-[0.95] tracking-[0.04em] text-slate-50 md:text-4xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-300">
                    {service.description}
                  </p>

                  <Button href="/contact/" variant="outline" size="sm" className="mt-6">
                    Discuss This Service
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

      <section className="section-space pt-6 md:pt-8">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Process</span>
            <h2 className="mt-5 font-heading text-4xl leading-[0.95] tracking-[0.04em] text-slate-50 sm:text-5xl">
              How engagements typically unfold.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="panel-soft p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-400/30 bg-accent-500/10 font-heading text-lg text-accent-200">
                  {step.step}
                </div>
                <h3 className="mt-5 font-heading text-2xl tracking-[0.04em] text-slate-50">
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
        headline="Start with the actual bottleneck."
        description="The first conversation is about identifying the real constraint, whether it is reporting, underwriting, or a process issue slowing the team down."
        primaryCTA={{
          label: "Schedule a Free Consultation",
          href: "/contact/",
        }}
      />
    </>
  );
}
