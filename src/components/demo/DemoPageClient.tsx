"use client";

import dynamic from "next/dynamic";
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
  "Sales analytics",
  "Property management",
  "P&L audits",
];

export default function DemoPageClient() {
  return (
    <>
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

            <div className="flex flex-wrap gap-2.5 lg:justify-end">
              {demoHighlights.map((highlight) => (
                <span key={highlight} className="badge-dash">
                  {highlight}
                </span>
              ))}
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
        description="We can map your current systems and design a reporting system built on your data, deployed to your infrastructure, and owned by your team."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
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
