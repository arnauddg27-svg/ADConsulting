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
} from "lucide-react";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your Personal Data Architect | A.D. Homes & Consulting",
  description:
    "Skip the big-firm overhead. Get a dedicated consultant who builds, owns, and supports your entire data ecosystem — from ERP extraction to production dashboards.",
};

const pillars = [
  {
    icon: <Database size={22} />,
    title: "Cloud Data Engineering",
    desc: "BigQuery, Snowflake, ETL pipelines, and warehouse design — built around the way your operation actually works.",
  },
  {
    icon: <Code2 size={22} />,
    title: "Full-Stack Development",
    desc: "Next.js dashboards, APIs, and production deployments on Vercel. Real applications, not slide decks.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Builder Operations",
    desc: "KPI modeling, lifecycle analytics, and pro forma tools that span land through close-out.",
  },
];

const benefits = [
  {
    icon: <Users size={20} />,
    title: "One Person, Full Stack",
    desc: "No account managers, no hand-offs between teams. The person who designs your warehouse is the same person who builds your dashboards and deploys your platform.",
  },
  {
    icon: <Shield size={20} />,
    title: "You Own Everything",
    desc: "Code, data warehouse, hosting accounts, domain — it's all yours. If the engagement ends, the platform stays. Zero vendor lock-in.",
  },
  {
    icon: <Zap size={20} />,
    title: "Builder-Specific Expertise",
    desc: "Construction ERP systems, draw schedules, permit workflows, cost-to-complete — your consultant already speaks the language.",
  },
];

const compared = [
  { them: "6-month discovery phase", us: "Weeks to first dashboard" },
  { them: "Junior analysts doing the work", us: "Senior architect on every call" },
  { them: "Generic BI templates", us: "Custom-built for your operation" },
  { them: "Platform lock-in", us: "You own the code and data" },
  { them: "$200K+ annual contracts", us: "Project-based, transparent pricing" },
  { them: "Quarterly business reviews", us: "Direct Slack/call access anytime" },
];

export default function AboutPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Why a Personal Consultant</span>
            <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl">
              Your Dedicated Data Architect
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Big firms sell you a team. You get junior analysts, slow timelines,
              and a platform you don&apos;t own. Here, you get one senior
              consultant who builds the entire ecosystem — and hands you the keys.
            </p>
          </div>
        </Container>
      </section>

      {/* ─── What You Get ─── */}
      <section className="section-space pt-0">
        <Container>
          <div className="reveal mx-auto max-w-4xl">
            <div className="text-center">
              <span className="eyebrow">What You Get</span>
              <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                A complete data platform — built by one person
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
                Every engagement covers the full lifecycle: extracting data from
                your ERP, modeling it in a cloud warehouse, and delivering
                interactive dashboards your team actually uses.
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

      {/* ─── Why a Personal Consultant ─── */}
      <section className="section-space">
        <Container>
          <div className="reveal mx-auto max-w-4xl">
            <div className="text-center">
              <span className="eyebrow">The Advantage</span>
              <h2 className="mt-4 font-heading text-3xl tracking-[-0.01em] text-slate-50 sm:text-4xl">
                Why builders choose a personal consultant
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
                Big firm vs. personal consultant
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
                  desc: "We map your current systems — ERP, spreadsheets, accounting — and identify what data is available and what's missing.",
                },
                {
                  step: "02",
                  title: "Architecture & Scope",
                  desc: "You get a clear proposal: what gets built, what it costs, and when it ships. No ambiguity, no scope creep.",
                },
                {
                  step: "03",
                  title: "Build & Deploy",
                  desc: "Cloud warehouse, ETL pipelines, and interactive dashboards — built incrementally with weekly demos so you see progress.",
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
        headline="Ready to build your data ecosystem?"
        description="The discovery call maps your current systems, identifies what data is available, and outlines what a custom platform looks like for your operation."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
        }}
      />
    </>
  );
}
