"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";

const SunshineDashboard = dynamic(
  () => import("@/components/demo/sunshine/SunshineDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center gap-2 rounded-xl border border-[#1e2d3d] bg-[#08111a] text-[13px] text-[#5a6b7e]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        Loading dashboard...
      </div>
    ),
  }
);

const demoHighlights = [
  "Land acquisition",
  "Permitting",
  "Loans & draws",
  "Construction",
  "Sales",
  "Property mgmt",
  "P&L audits",
];

export default function DemoPageClient() {
  return (
    <>
      {/* Floating back-to-site link (since site header is hidden on /demo) */}
      <Link
        href="/"
        className="fixed left-5 top-5 z-40 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-black/45 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-200 backdrop-blur-xl transition-all hover:border-accent-400/40 hover:bg-black/65 hover:text-accent-200"
      >
        <ArrowLeft size={12} />
        AD ERP SYSTEMS
      </Link>

      <section className="page-hero">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <span className="eyebrow">Sample Dashboard</span>
              <h1 className="mt-6 max-w-4xl font-heading text-5xl leading-[0.9] tracking-[0.05em] text-slate-50 sm:text-6xl">
                See what a{" "}
                <span className="text-gradient">builder reporting system</span>{" "}
                can look like.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                This sample shows how centralized builder data can become
                operational reporting and internal tools. It is an illustrative
                example of the kind of dashboards, workflow views, and drill-downs
                delivered in client implementations.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 backdrop-blur-sm">
              <div className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Coverage
              </div>
              <div className="flex flex-wrap gap-1.5">
                {demoHighlights.map((highlight, i) => (
                  <span
                    key={highlight}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-300 transition-colors hover:border-accent-400/30 hover:text-accent-200"
                  >
                    <span className="font-space-grotesk text-[0.58rem] text-slate-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Sunshine Homes Dashboard ── */}
      <section className="section-space pt-0" style={{ position: "relative" }}>
        <Container className="max-w-[96rem]">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Sample
            </span>
            <span className="text-sm text-slate-400">
              Sunshine Homes sample — 18 interactive views across core residential builder workflows
            </span>
          </div>
          <SunshineDashboard />
        </Container>
      </section>

      <CTABanner
        headline="Want a platform like this for your operation?"
        description="We can map your current systems and design a reporting system built on your data, deployed in your operating environment, and ready for your team to use."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/book/?source=demo_cta",
        }}
        secondaryCTA={{
          label: "View All Services",
          href: "/services/",
        }}
        variant="accent"
      />
    </>
  );
}
