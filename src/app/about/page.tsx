import type { Metadata } from "next";
import Image from "next/image";
import {
  Shield,
  Zap,
  Code2,
  Database,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Home,
  Building2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "About | Custom Data Platforms for Residential Builders and Developers",
  description:
    "About AD ERP SYSTEMS, a firm that builds custom data platforms for residential builders and developers with practical delivery.",
};

const credentials = [
  { icon: <Database size={18} />, label: "ERP systems and source data mapping" },
  { icon: <CheckCircle2 size={18} />, label: "Data cleanup, validation, and governance" },
  { icon: <BarChart3 size={18} />, label: "Reporting automation and dashboard delivery" },
  { icon: <TrendingUp size={18} />, label: "KPI definitions and metric documentation" },
  { icon: <Building2 size={18} />, label: "Spreadsheet, database, and API workflows" },
  { icon: <Home size={18} />, label: "Residential real estate development context" },
];

const pillars = [
  {
    icon: <Database size={22} />,
    title: "Data Infrastructure",
    desc: "Extraction, ingestion, transformation, and warehouse design to centralize ERP, spreadsheet, API, and operating data in one structured model.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Operational Reporting",
    desc: "Reporting systems and builder dashboards across land, development, permitting, lending and draws, construction, sales, and portfolio oversight.",
  },
  {
    icon: <Code2 size={22} />,
    title: "Builder Decision Tools",
    desc: "Pro formas, budget-vs-actual analysis, cost-to-complete, variance tracking, at-risk job flagging, sync monitoring, admin controls, and internal apps.",
  },
];

const benefits = [
  {
    icon: <Shield size={20} />,
    title: "Deployed to Your Accounts",
    desc: "The platform is deployed to your cloud, data, and hosting environment with documentation your team can keep using.",
  },
  {
    icon: <Users size={20} />,
    title: "Founder-Led Delivery",
    desc: "You work directly with Arnaud Durand on discovery, data mapping, KPI logic, and implementation, which keeps communication clear and delivery accountable.",
  },
  {
    icon: <Zap size={20} />,
    title: "Practical Delivery",
    desc: "Clear scope, practical milestones, and working releases focused on visibility, reporting quality, and day-to-day operational decisions.",
  },
];

const compared = [
  { them: "Multi-industry delivery model", us: "Residential builder and developer specialization" },
  { them: "Framework-first implementation", us: "Scope tailored to your systems and reporting priorities" },
  { them: "Limited handoff clarity", us: "Deployment to your cloud, data, and hosting environment" },
  { them: "Layered communication model", us: "Direct founder involvement throughout delivery" },
  { them: "Reporting outputs only", us: "Reporting systems with monitoring and admin controls" },
  { them: "Large fixed scopes", us: "Phased delivery aligned to operating priorities" },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="eyebrow">About the Firm</span>
                <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl">
                  Custom data platforms for residential builders and developers
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                  AD ERP SYSTEMS helps residential builders and developers
                  centralize data from ERPs, spreadsheets, APIs, and other
                  operating systems; move it into a structured warehouse; apply
                  builder KPI logic; and deliver reporting systems, dashboards,
                  and internal tools that support operational decision-making.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {credentials.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div className="mt-0.5 shrink-0 text-accent-300">{c.icon}</div>
                    <span className="text-sm leading-5 text-slate-300">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <span className="eyebrow">Industry Context</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Built around residential builder and developer operations
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <p className="text-base leading-7 text-slate-400">
                The firm is built around experience as a technology manager and
                data analyst for a top 200 residential builder. That background
                is supported by an MBA focused on Finance and Operations &
                Technology Management, and it informs how source data, KPI
                definitions, and reporting workflows are structured.
              </p>
              <p className="text-base leading-7 text-slate-400">
                Real estate development project experience adds practical
                context around budgets, schedules, and project tracking. The
                focus is practical system delivery: reliable data structure,
                KPI logic, and reporting tools teams can use every week.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <div className="grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="relative mx-auto w-full max-w-[14rem] sm:max-w-[16rem] lg:mx-auto">
                <div className="absolute -inset-4 rounded-[2rem] border border-accent-400/10 bg-accent-500/[0.03] blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-950">
                    <Image
                      src="/images/arnaud-durand.png"
                      alt="Arnaud Durand"
                      fill
                      className="object-cover object-top"
                      sizes="(min-width: 1024px) 256px, 58vw"
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

              <div className="min-w-0 text-center lg:text-left">
                <span className="eyebrow mx-auto lg:mx-0">Founder-Led Practice</span>
                <h2 className="mx-auto mt-4 max-w-3xl font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl lg:mx-0">
                  Led with residential builder and developer operating context
                </h2>
                <div className="mx-auto mt-6 max-w-3xl space-y-4 text-center text-base leading-7 text-slate-400 lg:mx-0 lg:text-left">
                  <p>
                    AD ERP SYSTEMS is led by Arnaud Durand. The firm is intentionally
                    direct: discovery, data mapping, KPI logic, dashboard design,
                    and implementation are handled with clear founder involvement.
                  </p>
                  <p>
                    Arnaud&apos;s background includes work as a technology manager
                    and data analyst for a top 200 residential builder. He also
                    holds an MBA focused on Finance and Operations & Technology
                    Management. His real estate development project experience
                    adds practical context around budgets, schedules, project
                    tracking, and development decisions.
                  </p>
                </div>
                <div className="mt-8 flex justify-center lg:justify-start">
                  <Link
                    href="/founder/"
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-100 transition-all hover:border-accent-400/40 hover:bg-accent-500/10 hover:text-accent-100"
                  >
                    Read Founder Bio <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <span className="eyebrow">What Gets Built</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Three connected solution categories
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
              Each engagement combines centralized builder data, operational
              reporting systems, and decision tools used by teams managing
              communities, jobs, costs, sales, and portfolio performance.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {pillars.map((p) => (
                <div key={p.title} className="glow-card p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/10 text-accent-200">
                    {p.icon}
                  </div>
                  <h3 className="mt-4 font-heading text-lg tracking-[-0.01em] text-slate-50">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <span className="eyebrow">Why Clients Choose Us</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Account-level deployment, directness, and practical delivery
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="flex flex-col">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-400/20 bg-accent-500/10 text-accent-200">
                    {b.icon}
                  </div>
                  <h3 className="mt-4 font-heading text-base tracking-[-0.01em] text-slate-50">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{b.desc}</p>
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
                <span className="eyebrow">Comparison</span>
                <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                  Delivery model differences
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  The key differences are specialization, deployment clarity, direct
                  involvement, and practical reporting depth.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                <div className="grid grid-cols-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Typical Approach
                  </div>
                  <div className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-accent-300">
                    AD ERP SYSTEMS
                  </div>
                </div>
                {compared.map((row, i) => (
                  <div
                    key={row.them}
                    className={`grid grid-cols-2 border-b border-white/[0.04] ${
                      i % 2 === 0 ? "" : "bg-white/[0.015]"
                    }`}
                  >
                    <div className="flex items-center gap-2 px-6 py-4 text-sm text-slate-500">
                      <span className="text-slate-600">&times;</span> {row.them}
                    </div>
                    <div className="flex items-center gap-2 px-6 py-4 text-sm text-slate-200">
                      <CheckCircle2 size={14} className="shrink-0 text-accent-400" /> {row.us}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="eyebrow">Process</span>
                <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                  How engagements work
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Projects move from system review to working delivery in clear
                  stages, with deployment and handoff kept clear throughout.
                </p>
                <div className="mt-8">
                  <Link
                    href="/book/?source=about_process"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Book a Discovery Call <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Discovery Call",
                    desc: "The first call reviews your current systems, reporting pain points, and operating priorities.",
                  },
                  {
                    step: "02",
                    title: "Architecture & Scope",
                    desc: "You receive a practical scope covering data sources, warehouse approach, reporting deliverables, timeline, and cost.",
                  },
                  {
                    step: "03",
                    title: "Build & Deploy",
                    desc: "Delivery covers extraction pipelines, warehouse models, KPI logic, dashboards, and internal tools in working increments.",
                  },
                  {
                    step: "04",
                    title: "Handoff & Support",
                    desc: "Everything is deployed to your accounts with documentation and training. Ongoing support is optional.",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex gap-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-400/20 bg-accent-500/10 font-heading text-sm text-accent-300">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-heading text-base tracking-[-0.01em] text-slate-50">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner
        headline="Discuss your current systems and reporting needs."
        description="The first call reviews your ERP, spreadsheets, and reporting workflow, then outlines a practical path to centralized builder data, reporting systems, and operational tools."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/book/?source=about_cta",
        }}
      />
    </>
  );
}
