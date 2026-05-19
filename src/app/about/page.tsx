import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Code2,
  Database,
  HardHat,
  Home,
  Landmark,
  MapPin,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import {
  BlueprintCTA,
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";

export const metadata: Metadata = {
  title: "About | AD ERP SYSTEMS",
  description:
    "About AD ERP SYSTEMS, a builder reporting firm focused on residential construction data, operating dashboards, and client-owned reporting systems.",
};

const credentials = [
  { icon: HardHat, label: "Residential construction operations" },
  { icon: Home, label: "Builder ERP and spreadsheet reporting" },
  { icon: MapPin, label: "Land, lot, and community pipelines" },
  { icon: Landmark, label: "Permitting, lending, and draw workflows" },
  { icon: Building2, label: "Construction cost and schedule reporting" },
  { icon: TrendingUp, label: "Portfolio and executive review" },
];

const pillars = [
  {
    icon: Database,
    title: "Data infrastructure",
    desc: "Extraction, validation, transformation, and warehouse design for ERP, spreadsheet, API, and operating data.",
  },
  {
    icon: BarChart3,
    title: "Operating reporting",
    desc: "Daily views across land, permitting, draws, construction, sales, warranty, and leadership review.",
  },
  {
    icon: Code2,
    title: "Decision tools",
    desc: "Pro formas, cost-to-complete reviews, at-risk flags, sync monitors, admin controls, and internal apps.",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Client-owned systems",
    desc: "Your team owns the code, data, hosting, and reporting infrastructure after handoff.",
  },
  {
    icon: Users,
    title: "Direct working model",
    desc: "You work directly with the people designing the data model and operating views.",
  },
  {
    icon: Zap,
    title: "Practical delivery",
    desc: "Scope is organized around the first reports your team can actually use in daily operations.",
  },
];

const compared = [
  { them: "Generic BI implementation", us: "Residential builder reporting focus" },
  { them: "Template-first dashboards", us: "Logic matched to your source systems" },
  { them: "Vendor-owned platform", us: "Client ownership of code, data, and hosting" },
  { them: "Static reporting outputs", us: "Dashboards with alerts, monitoring, and admin controls" },
  { them: "Large fixed scope", us: "Phased delivery around operating priorities" },
];

const process = [
  {
    step: "01",
    title: "Discovery call",
    desc: "Review current systems, reporting pain points, and the operating decisions that need better visibility.",
  },
  {
    step: "02",
    title: "Architecture and scope",
    desc: "Define source systems, warehouse approach, KPI logic, dashboard priorities, timeline, and cost.",
  },
  {
    step: "03",
    title: "Build and deploy",
    desc: "Deliver extraction pipelines, warehouse models, KPI logic, dashboards, and tools in working increments.",
  },
  {
    step: "04",
    title: "Handoff and support",
    desc: "Deploy to your accounts with documentation, training, and optional support for ongoing reporting needs.",
  },
];

export default function AboutPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="About AD ERP SYSTEMS"
        title="Builder reporting built around residential operations."
        description="We help residential builders turn scattered ERP, spreadsheet, finance, and field data into daily operating views for schedule, budget, margin, and owner follow-up."
      >
        <BlueprintPanel className="p-5 md:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {credentials.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-[1rem] border border-[#d5dde2] bg-[#f7f9fb]/82 px-4 py-3"
              >
                <Icon size={18} className="mt-0.5 shrink-0 text-[#35647f]" />
                <span className="text-sm font-semibold leading-5 text-[#40515d]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </BlueprintPanel>
      </BlueprintHero>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="inline-flex rounded-full border border-[#c9d4da] bg-white/88 px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#2f5368]">
                Industry context
              </p>
              <h2 className="mt-5 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-5xl">
                Built for the way builder teams review work.
              </h2>
            </div>
            <div className="grid gap-5 text-base leading-8 text-[#58636b] md:text-lg">
              <p>
                Builder reporting breaks when schedule updates, cost movement,
                owner follow-up, and stale inventory live in separate exports.
                AD ERP SYSTEMS maps those sources into one operating layer.
              </p>
              <p>
                The work is practical: clean data flow, clear exception logic,
                dashboards by department, and a handoff model that keeps the
                platform on the client side.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mb-10 max-w-4xl">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
              What we build
            </p>
            <h2 className="mt-4 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-5xl">
              Three connected layers, one review rhythm.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <BlueprintPanel key={title} className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d5dde2] bg-[#f7f9fb] text-[#35647f]">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 font-heading text-2xl leading-tight tracking-[-0.03em] text-[#17212c]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#58636b]">
                  {desc}
                </p>
              </BlueprintPanel>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
                Delivery model
              </p>
              <h2 className="mt-4 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-5xl">
                Ownership, directness, and practical scope.
              </h2>
              <div className="mt-7 grid gap-4">
                {benefits.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d5dde2] bg-[#edf5f1] text-[#356b54]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#17212c]">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#58636b]">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BlueprintPanel className="overflow-hidden">
              <div className="grid grid-cols-2 border-b border-[#d5dde2] bg-[#f7f9fb]">
                <div className="px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6f8190]">
                  Typical approach
                </div>
                <div className="px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#35647f]">
                  AD ERP SYSTEMS
                </div>
              </div>
              {compared.map((row) => (
                <div key={row.them} className="grid grid-cols-2 border-b border-[#d5dde2]/70 last:border-b-0">
                  <div className="px-5 py-4 text-sm font-semibold leading-6 text-[#7a8791]">
                    {row.them}
                  </div>
                  <div className="flex items-start gap-2 px-5 py-4 text-sm font-bold leading-6 text-[#40515d]">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#356b54]" />
                    {row.us}
                  </div>
                </div>
              ))}
            </BlueprintPanel>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
                Process
              </p>
              <h2 className="mt-4 max-w-3xl font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-5xl">
                From discovery call to production handoff.
              </h2>
            </div>
            <Link
              href="/book/?source=about_process"
              className={liquidActionClass({ tone: "secondary", size: "sm" })}
            >
              <span>Book a Discovery Call</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {process.map((step) => (
              <BlueprintPanel key={step.step} className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9d4da] bg-[#edf5f1] font-heading text-sm font-bold text-[#356b54]">
                  {step.step}
                </div>
                <h3 className="mt-5 font-heading text-2xl leading-tight tracking-[-0.03em] text-[#17212c]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#58636b]">
                  {step.desc}
                </p>
              </BlueprintPanel>
            ))}
          </div>
        </Container>
      </section>

      <BlueprintCTA
        title="Review the reporting setup you have now."
        description="We will look at your ERP exports, spreadsheets, and operating reports, then outline the first dashboard your team can use."
        primary={{
          label: "Book a Discovery Call",
          href: "/book/?source=about_cta",
        }}
        secondary={{
          label: "View Services",
          href: "/services/",
        }}
      />
    </BlueprintPage>
  );
}
