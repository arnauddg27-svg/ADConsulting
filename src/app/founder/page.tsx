import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Database,
  Home,
  TrendingUp,
} from "lucide-react";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "Founder | AD ERP SYSTEMS",
  description:
    "Founder background for AD ERP SYSTEMS, a consulting practice building custom data platforms for residential builders and developers.",
};

const operatingContext = [
  { icon: <Database size={18} />, label: "ERP systems and source data mapping" },
  { icon: <CheckCircle2 size={18} />, label: "Data cleanup and validation" },
  { icon: <BarChart3 size={18} />, label: "Reporting automation and dashboard delivery" },
  { icon: <TrendingUp size={18} />, label: "KPI definitions and metric documentation" },
  { icon: <Building2 size={18} />, label: "Spreadsheet, database, and API workflows" },
  { icon: <Home size={18} />, label: "Residential real estate development context" },
];

const bioHighlights = [
  "Technology management for a top 200 residential builder",
  "ERP data, reporting automation, and dashboards",
  "KPI definitions, variance tracking, and executive reporting",
  "MBA in Finance and Operations & Technology Management",
  "Residential real estate development project experience",
];

const principles = [
  {
    icon: <Database size={22} />,
    title: "Start With Source Data",
    desc: "Every engagement starts by understanding the real ERP exports, spreadsheets, finance files, APIs, and operating tools behind the reports.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Apply Builder-Specific KPI Logic",
    desc: "Metrics are shaped around the builder workflows behind the data: land, permitting, draws, construction, sales, and portfolio reporting.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "Keep Delivery Direct",
    desc: "Discovery, data mapping, reporting priorities, implementation, and rollout stay connected through one working process.",
  },
];

const workingModel = [
  {
    step: "01",
    title: "Understand the current workflow",
    desc: "Review where the numbers come from, who uses them, and where cleanup happens.",
  },
  {
    step: "02",
    title: "Map systems and definitions",
    desc: "Document source data, field meaning, status logic, KPI definitions, and exceptions.",
  },
  {
    step: "03",
    title: "Build working releases",
    desc: "Deliver warehouse structure, KPI logic, dashboards, drilldowns, alerts, and admin controls in increments.",
  },
  {
    step: "04",
    title: "Hand off clearly",
    desc: "Leave documentation and optional support so the system can keep improving.",
  },
];

export default function FounderPage() {
  return (
    <>
      <section className="page-hero !pb-12 md:!pb-16">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="min-w-0 text-center lg:text-left">
                <span className="eyebrow mx-auto lg:mx-0">Founder</span>
                <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl">
                  Practical builder reporting experience
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 lg:mx-0">
                  AD ERP SYSTEMS helps residential builders and developers turn
                  scattered operating data into usable reporting systems. Work
                  stays direct from discovery through implementation: source
                  mapping, KPI logic, dashboards, and rollout.
                </p>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400 lg:mx-0">
                  Builder reporting depends on real source data, system-specific
                  definitions, and manual reporting workarounds. The platform has
                  to match how the business actually operates.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link
                    href="/book/?source=founder_hero"
                    className="btn-primary inline-flex items-center justify-center gap-2"
                  >
                    Book a Discovery Call <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/about/"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-100 transition-all hover:border-accent-400/40 hover:bg-accent-500/10 hover:text-accent-100"
                  >
                    About the Firm
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[14rem] sm:max-w-[16rem] lg:max-w-[17rem] lg:justify-self-center">
                <div className="absolute -inset-4 rounded-[2rem] border border-accent-400/10 bg-accent-500/[0.035] blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.85)]">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-950">
                    <Image
                      src="/images/arnaud-durand.png"
                      alt="Arnaud Durand"
                      fill
                      priority
                      loading="eager"
                      className="object-cover object-top"
                      sizes="(min-width: 1024px) 272px, 58vw"
                    />
                  </div>
                  <div className="px-2 pb-2 pt-4">
                    <div className="font-heading text-lg tracking-[0.04em] text-slate-50">
                      Arnaud Durand
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      Founder and data platform lead
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="reveal mx-auto max-w-5xl text-center lg:text-left">
            <span className="eyebrow mx-auto lg:mx-0">Background</span>
            <h2 className="mx-auto mt-4 max-w-3xl font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl lg:mx-0">
              Builder reporting experience
            </h2>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="mx-auto max-w-3xl space-y-4 text-center text-base leading-7 text-slate-400 lg:mx-0 lg:text-left">
                <p>
                  Arnaud Durand founded AD ERP SYSTEMS to help residential
                  builders and developers turn scattered operating data into
                  usable reporting systems. His background includes work as a
                  technology manager and data analyst for a top 200 residential
                  builder, supported by an MBA in Finance and Operations &
                  Technology Management.
                </p>
                <p>
                  His work focuses on ERP data, reporting automation, KPI
                  definitions, and dashboards that leadership teams can use.
                  Real estate development project experience adds practical
                  context around budgets, schedules, and project tracking.
                </p>
              </div>

              <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center lg:max-w-none lg:text-left">
                <h3 className="font-heading text-lg tracking-[-0.01em] text-slate-50">
                  Relevant Skills
                </h3>
                <div className="mt-5 space-y-4">
                  {bioHighlights.map((highlight) => (
                    <div key={highlight} className="flex items-start justify-center gap-3 lg:justify-start">
                      <CheckCircle2
                        size={16}
                        className="mt-1 shrink-0 text-accent-400"
                      />
                      <span className="text-sm leading-6 text-slate-300">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {operatingContext.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="mt-0.5 shrink-0 text-accent-300">{item.icon}</div>
                  <span className="text-sm leading-5 text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <span className="eyebrow">Why It Matters</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Why the background matters
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
              The work benefits from someone who understands how the numbers
              will be used by finance, development, construction, sales, and
              leadership. The goal is simple: turn scattered source data into
              clear reporting and useful internal tools.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {principles.map((item) => (
                <div key={item.title} className="glow-card p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/10 text-accent-200">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 font-heading text-lg tracking-[-0.01em] text-slate-50">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="eyebrow">Working Model</span>
                <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                  Direct, practical, and accountable
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  The engagement stays clear because discovery, data modeling,
                  KPI logic, and delivery are connected instead of passed
                  between layers.
                </p>
              </div>

              <div className="space-y-8">
                {workingModel.map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-400/20 bg-accent-500/10 font-heading text-sm text-accent-300">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-heading text-base tracking-[-0.01em] text-slate-50">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner
        headline="Talk through your current data and reporting workflow."
        description="The first call is a practical review of your systems, current reporting gaps, and whether a custom builder data platform is the right fit."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/book/?source=founder_cta",
        }}
      />
    </>
  );
}
