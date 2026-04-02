"use client";

import dynamic from "next/dynamic";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";

const SunshineDashboard = dynamic(
  () => import("@/components/demo/sunshine/SunshineDashboard"),
  {
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: 600,
        borderRadius: 12,
        background: "#08111a",
        border: "1px solid #1e2d3d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#5a6b7e",
        fontSize: 13,
        gap: 8,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          border: "2px solid #24c18d",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }} />
        Loading dashboard...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  "Property mgmt",
  "P&L audits",
];

export default function DemoPageClient() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <span className="eyebrow">Live Dashboard Demo</span>
              <h1 className="mt-6 max-w-4xl font-heading text-5xl leading-[0.9] tracking-[0.05em] text-slate-50 sm:text-6xl">
                See what a{" "}
                <span className="text-gradient">client dashboard</span>{" "}
                looks like.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Every platform we deliver is a fully interactive Next.js
                application connected to your BigQuery or Snowflake warehouse.
                Below is Sunshine Homes — a working example with 7 lifecycle
                sections, 18 interactive views, cross-filtering, pipeline boards, and drill-downs.
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
      <section className="section-space pt-0">
        <Container className="max-w-[96rem]">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Next.js
            </span>
            <span className="text-sm text-slate-400">
              Sunshine Homes — full lifecycle dashboard with 18 interactive views
            </span>
          </div>
          <SunshineDashboard />
        </Container>
      </section>

      <CTABanner
        headline="Want a platform like this for your operation?"
        description="Every dashboard is built on your data, deployed to your infrastructure, and fully owned by your team. Start with a 30-minute discovery call."
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
