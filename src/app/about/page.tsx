import type { Metadata } from "next";
import {
  Shield,
  Zap,
  Code2,
  Database,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  HardHat,
  Home,
  MapPin,
  Landmark,
  Building2,
  TrendingUp,
} from "lucide-react";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | A.D. Homes & Consulting",
  description:
    "A.D. Homes & Consulting builds custom data platforms for residential homebuilders — data infrastructure, operational reporting, and builder decision tools, backed by direct experience in construction and real estate.",
};

const credentials = [
  { icon: <HardHat size={18} />, label: "Residential construction operations" },
  { icon: <Home size={18} />, label: "Real estate development lifecycle" },
  { icon: <MapPin size={18} />, label: "Land acquisition & entitlement" },
  { icon: <Landmark size={18} />, label: "Construction lending & draws" },
  { icon: <Building2 size={18} />, label: "Subdivision development & lot delivery" },
  { icon: <TrendingUp size={18} />, label: "Builder financial reporting & audits" },
];

const pillars = [
  {
    icon: <Database size={22} />,
    title: "Cloud Data Engineering",
    desc: "BigQuery, Snowflake, ETL pipelines, and warehouse design — structured around how builders actually track jobs, draws, and closings.",
  },
  {
    icon: <Code2 size={22} />,
    title: "Full-Stack Development",
    desc: "Next.js dashboards, APIs, and production deployments. Interactive tools your PMs, supers, and executives actually use in the field.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Builder Operations Analytics",
    desc: "KPI modeling, cost-to-complete tracking, cycle-time analysis, and pro forma tools that span land acquisition through close-out.",
  },
];

const benefits = [
  {
    icon: <Users size={20} />,
    title: "Direct Engagement",
    desc: "No account managers, no hand-offs between teams. The people who design your warehouse are the same people who build your dashboards and deploy your platform.",
  },
  {
    icon: <Shield size={20} />,
    title: "You Own Everything",
    desc: "Code, data warehouse, hosting accounts, domain — it's all yours. If the engagement ends, the platform stays. Zero vendor lock-in.",
  },
  {
    icon: <Zap size={20} />,
    title: "Construction-Native Expertise",
    desc: "The firm's experience comes from inside residential construction and real estate — not from a generic consulting background. We already understand the data problems because we've seen them firsthand.",
  },
];

const compared = [
  { them: "6-month discovery phase", us: "Weeks to first dashboard" },
  { them: "Generalist analysts staffed to your project", us: "Team with direct construction & real estate experience" },
  { them: "Generic BI templates", us: "Custom-built for homebuilder operations" },
  { them: "Platform lock-in", us: "You own the code and data" },
  { them: "$200K+ annual contracts", us: "Project-based, transparent pricing" },
  { them: "Quarterly business reviews", us: "Direct access to your consultant anytime" },
];

export default function AboutPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="eyebrow">About the Firm</span>
                <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl">
                  Construction-First Data Platform
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                  A.D. Homes &amp; Consulting builds data infrastructure,
                  operational reporting, and decision tools for residential
                  homebuilders — backed by direct experience in construction
                  and real estate development.
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

      {/* ─── Founder Origin — left/right split ─── */}
      <section className="section-space pt-0">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <span className="eyebrow">Our Background</span>
                <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                  Rooted in real estate &amp; construction
                </h2>
                <p className="mt-6 text-base leading-7 text-slate-400">
                  The firm was founded out of residential real estate
                  development and construction operations — not a software
                  company. That background shapes every platform we build:
                  the data models, the KPI logic, and the way reporting is
                  organized all reflect how builders actually run their
                  operations.
                </p>
              </div>
              <div>
                <span className="eyebrow">Technical Foundation</span>
                <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                  Construction experience, engineering delivery
                </h2>
                <p className="mt-6 text-base leading-7 text-slate-400">
                  The team combines graduate-level training in data analytics
                  and technology management with hands-on construction and
                  real estate experience. We already understand
                  cost-to-complete variance, absorption rates, draw
                  processes, and the operational metrics that drive a
                  builder&apos;s P&amp;L.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Industry Experience — full-width badges ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <span className="eyebrow">Industry Experience</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Direct experience across builder operations
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              The firm&apos;s experience spans land acquisition, subdivision
              development, construction management, builder financial
              reporting, and real estate operations — which means firsthand
              familiarity with the ERP systems, draw processes, permit
              timelines, and cost structures every platform is built around.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {credentials.map((c) => (
                <div
                  key={c.label}
                  className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-400/20 bg-accent-500/10 text-accent-300">
                    {c.icon}
                  </div>
                  <span className="text-xs font-medium leading-4 text-slate-300">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── What You Get — full-width cards ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <span className="eyebrow">What You Get</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              A complete builder data platform
            </h2>
            <p className="mt-4 max-w-2xl text-base text-slate-400">
              Each engagement delivers three layers: centralized data
              infrastructure, operational dashboards for every department,
              and builder-specific tools for financial analysis and daily
              operations.
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

      {/* ─── Why Builders Choose Us — full-width cards ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <span className="eyebrow">The Advantage</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Why builders choose us
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

      {/* ─── Compared — left heading, right table ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="eyebrow">Comparison</span>
                <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                  Big firm vs. dedicated consultant
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Large firms charge enterprise rates for generalist teams.
                  Here&apos;s how a construction-focused data firm compares.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                <div className="grid grid-cols-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Typical Firm
                  </div>
                  <div className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-accent-300">
                    A.D. Homes &amp; Consulting
                  </div>
                </div>
                {compared.map((row, i) => (
                  <div
                    key={i}
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

      {/* ─── How It Works — left heading, right steps ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-5xl">
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="eyebrow">Process</span>
                <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                  From discovery call to production
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Every engagement follows the same proven path — scoped to
                  your operation, delivered incrementally, and fully owned by
                  you at the end.
                </p>
                <div className="mt-8">
                  <Link
                    href="/contact/"
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
                    desc: "We map your current systems — ERP, spreadsheets, accounting — and identify what construction and real estate data is available across your operation.",
                  },
                  {
                    step: "02",
                    title: "Architecture & Scope",
                    desc: "You get a clear proposal scoped to your builder workflow: what gets built, what it costs, and when it ships.",
                  },
                  {
                    step: "03",
                    title: "Build & Deploy",
                    desc: "Cloud warehouse, ETL pipelines, and interactive dashboards — structured around the builder lifecycle with weekly demos.",
                  },
                  {
                    step: "04",
                    title: "Handoff & Support",
                    desc: "Everything deploys to your accounts. You own it all. Ongoing support is available but never required.",
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
        headline="Start with a discovery call."
        description="We map your current systems, identify where data breaks down, and outline what a centralized platform looks like for your operation."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
        }}
      />
    </>
  );
}
