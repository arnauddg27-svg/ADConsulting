"use client";

import Container from "@/components/ui/Container";
import SunshineDashboard from "@/components/demo/sunshine/SunshineDashboard";
import CTABanner from "@/components/sections/CTABanner";

const demoHighlights = [
  "Lifecycle navigation",
  "KPI tracking",
  "Construction pipeline",
  "Sales analytics",
  "Loan management",
  "Property mgmt",
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
                sections, cross-filtering, pipeline boards, and drill-downs.
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
              Sunshine Homes — full lifecycle dashboard with 9 interactive views
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
