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
  title: "Your Personal Data Architect | A.D. Homes & Consulting",
  description:
    "Founded by a real estate developer turned data architect. A.D. Homes & Consulting builds custom cloud data platforms for residential homebuilders — with firsthand construction experience behind every engagement.",
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
    title: "Your Assigned Consultant",
    desc: "No account managers, no hand-offs between teams. Your dedicated consultant knows your systems, your data, and your goals — from kickoff through production.",
  },
  {
    icon: <Shield size={20} />,
    title: "You Own Everything",
    desc: "Code, data warehouse, hosting accounts, domain — it's all yours. If the engagement ends, the platform stays. Zero vendor lock-in.",
  },
  {
    icon: <Zap size={20} />,
    title: "Construction-Native Expertise",
    desc: "Your consultant doesn't need to learn your industry. They've worked inside the builder lifecycle — from dirt to doors — and understand the data problems firsthand.",
  },
];

const compared = [
  { them: "6-month discovery phase", us: "Weeks to first dashboard" },
  { them: "Consultants who've never been on a job site", us: "Firsthand construction & real estate experience" },
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
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Built for Builders</span>
            <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl">
              Construction-First Data Platform
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Most data consultants learn your industry on your dime. Our
              founder came up through real estate development and residential
              construction — then earned a Master&apos;s in data analytics
              and built the technical platform to match.
            </p>
          </div>
        </Container>
      </section>

      {/* ─── Founder Origin ─── */}
      <section className="section-space pt-0">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <span className="eyebrow">Our Origin</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Rooted in real estate &amp; construction
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400">
              A.D. Homes &amp; Consulting was founded by Arnaud Durand — a
              consultant whose career started in residential real estate
              development and construction operations before moving into data
              architecture. The firm exists because Arnaud lived inside the
              builder lifecycle first, then built the technology to modernize it.
            </p>
          </div>
        </Container>
      </section>

      {/* ─── Founder Credentials ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <span className="eyebrow">Industry Experience</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Real estate &amp; construction background
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400">
              Before founding the firm, Arnaud&apos;s work spanned land
              acquisition, subdivision development, construction project
              management, builder financial reporting, and real estate
              operations — giving him firsthand exposure to the ERP systems,
              draw processes, permit timelines, and cost structures that
              define homebuilder workflows.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
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
        </Container>
      </section>

      {/* ─── Technical Training ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <span className="eyebrow">Technical Foundation</span>
            <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
              Construction experience meets data science
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400">
              Arnaud holds a Master&apos;s degree with a concentration in data
              analytics and technology management. That combination — hands-on
              construction and real estate experience plus graduate-level data
              training — is what sets the firm apart. We already understand
              cost-to-complete variance, absorption rates, subdivision phasing,
              and the metrics that drive a builder&apos;s P&amp;L.
            </p>
          </div>
        </Container>
      </section>

      {/* ─── What You Get ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-4xl">
            <div className="text-center">
              <span className="eyebrow">What You Get</span>
              <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                A complete builder data platform
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400">
                Every platform is structured around how builders actually
                operate — not how a generic BI tool thinks they should. We
                cover the full lifecycle from land acquisition to close-out
                audits.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {pillars.map((p) => (
                <div key={p.title} className="glow-card p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/10 text-accent-200">
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

      {/* ─── Why Builders Choose Us ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-4xl">
            <div className="text-center">
              <span className="eyebrow">The Advantage</span>
              <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                Why builders choose us
              </h2>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
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

      {/* ─── Compared ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-3xl">
            <div className="text-center">
              <span className="eyebrow">Comparison</span>
              <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                Big firm vs. dedicated consultant
              </h2>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.06]">
              <div className="grid grid-cols-2 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Typical Consulting Firm
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
        </Container>
      </section>

      {/* ─── How It Works ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-3xl">
            <div className="text-center">
              <span className="eyebrow">Process</span>
              <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                From discovery call to production
              </h2>
            </div>

            <div className="mt-12 space-y-8">
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
                <div key={s.step} className="flex gap-6">
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

            <div className="mt-12 text-center">
              <Link
                href="/contact/"
                className="btn-primary inline-flex items-center gap-2"
              >
                Book a Discovery Call <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner
        headline="Ready to centralize your builder data?"
        description="The discovery call maps your current construction and real estate systems, identifies what data is available, and outlines what a custom platform looks like for your operation."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
        }}
      />
    </>
  );
}
