import type { Metadata } from "next";
import {
  DollarSign,
  Layers,
  Users,
  AlertTriangle,
  TrendingUp,
  Wrench,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CTABanner from "@/components/sections/CTABanner";
import { SERVICES, PROCESS_STEPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services | Data Platforms for Residential Homebuilders",
  description:
    "Explore A.D. Homes & Consulting services for residential homebuilders: data extraction, warehouse design, lifecycle dashboards, pro forma tools, and ongoing platform support.",
};

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign size={28} />,
  Layers: <Layers size={28} />,
  Users: <Users size={28} />,
  AlertTriangle: <AlertTriangle size={28} />,
  TrendingUp: <TrendingUp size={28} />,
  Wrench: <Wrench size={28} />,
};


export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">What We Build</span>
            <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl">
              Custom data platforms for residential homebuilders
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              We build the stack behind better builder decisions: extraction,
              warehousing, KPI logic, and interactive applications organized
              around the operational lifecycle.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0 pb-8 md:pb-10">
        <Container className="space-y-6">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              className="reveal panel overflow-hidden p-6 md:p-8 lg:p-10"
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

                  <h2 className="mt-6 font-heading text-3xl leading-[0.95] tracking-[-0.01em] text-slate-50 md:text-4xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-300">
                    {service.description}
                  </p>

                  <Button href="/contact/" variant="outline" size="sm" className="mt-6">
                    Discuss This
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
                        className="flex items-start gap-3 rounded-[1rem] border border-white/[0.06] bg-black/20 px-4 py-3.5"
                      >
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-300" />
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

      <section className="section-space">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Process</span>
            <h2 className="mt-5 font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 sm:text-5xl">
              From discovery call to production handoff.
            </h2>
          </div>

          <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="reveal glow-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-400/30 bg-accent-500/10 font-heading text-lg text-accent-200">
                  {step.step}
                </div>
                <h3 className="mt-5 font-heading text-2xl tracking-[-0.01em] text-slate-50">
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
        headline="Ready to see what your data can do?"
        description="The discovery call maps your current systems and outlines what a custom data platform looks like for your operation."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
        }}
      />
    </>
  );
}
