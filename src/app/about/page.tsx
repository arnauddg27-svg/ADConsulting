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
          <BlueprintPanel className="p-6 md:p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
              <img
                src="/images/arnaud-durand.png"
                alt="Arnaud Durand, founder of AD ERP SYSTEMS"
                className="h-36 w-36 shrink-0 rounded-2xl border border-[#d5dde2] object-cover object-top shadow-[0_18px_44px_-32px_rgba(23,33,44,0.45)] md:h-44 md:w-44"
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
                  Founder
                </p>
                <h2 className="mt-3 font-heading text-3xl leading-[1.05] tracking-[-0.03em] text-[#17212c] md:text-4xl">
                  Arnaud Durand
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#58636b] md:text-lg md:leading-8">
                  I started AD ERP SYSTEMS after seeing the same problem across
                  residential builders: the data to run the business was spread
                  across ERPs, spreadsheets, and field updates that never lined
                  up. I build the reporting layer that pulls those sources into
                  daily operating views teams actually use — and you work
                  directly with me through discovery, build, and handoff.
                </p>
              </div>
            </div>
          </BlueprintPanel>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-[#c9d4da] bg-white/88 px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#2f5368]">
              Industry context
            </p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-5xl">
              Built around how builders actually work.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#58636b] md:text-lg">
              Builder reporting breaks when schedule, cost, and owner follow-up
              live in separate exports. AD ERP SYSTEMS maps those sources into
              one operating layer your team can review every day.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mx-auto mb-10 max-w-3xl text-center">
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
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
              Delivery model
            </p>
            <h2 className="mt-4 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-5xl">
              Ownership, directness, and practical scope.
            </h2>
          </div>

          <div className="mb-8 grid gap-5 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <BlueprintPanel key={title} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d5dde2] bg-[#edf5f1] text-[#356b54]">
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 font-bold text-[#17212c]">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#58636b]">{desc}</p>
              </BlueprintPanel>
            ))}
          </div>

          <BlueprintPanel className="mx-auto max-w-4xl overflow-hidden">
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
