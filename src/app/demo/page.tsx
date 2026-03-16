import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import DashboardShell from "@/components/demo/DashboardShell";
import ConstructionPipeline from "@/components/demo/ConstructionPipeline";
import RetoolPipelinePreview from "@/components/demo/RetoolPipelinePreview";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "Builder Dashboard Sample | Construction Reporting & KPI Demo — Orlando",
  description:
    "Explore a sample construction operations dashboard with project tracking, cost reporting, budget analysis, and schedule visibility built for Central Florida home builders.",
};

const demoHighlights = [
  "Project status",
  "Cost tracking",
  "Schedule review",
];

const platformComparison = [
  {
    platform: "Next.js",
    label: "Client-Facing Reports",
    description: "Polished, read-only dashboards designed for leadership reviews and stakeholder presentations. Fast, mobile-friendly, and branded to your company.",
    traits: ["Executive summaries", "Branded visuals", "Mobile-responsive", "Shareable links"],
    color: "emerald" as const,
  },
  {
    platform: "Retool",
    label: "Internal Operating Tools",
    description: "Functional, data-connected applications where your team actually works — with search, filters, edits, and write-back to your systems.",
    traits: ["Editable fields", "Search & filter", "Bulk actions", "Connected to live data"],
    color: "blue" as const,
  },
];

export default function DemoPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <span className="eyebrow">Illustrative Example</span>
              <h1 className="mt-6 max-w-4xl font-heading text-5xl leading-[0.9] tracking-[0.05em] text-slate-50 sm:text-6xl">
                Two layers.{" "}
                <span className="text-gradient">One operating system.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Every build ships with two platforms: polished Next.js dashboards
                for leadership visibility, and Retool apps for day-to-day
                operations where your team actually works.
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

      {/* ── Platform Comparison ── */}
      <section className="section-space pt-0 pb-8 md:pb-10">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {platformComparison.map((item) => (
              <div key={item.platform} className="glow-card p-6">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                    item.color === "emerald"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-blue-500/15 text-blue-400"
                  }`}>
                    {item.platform}
                  </span>
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {item.label}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {item.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.traits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-slate-400"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Next.js Dashboard ── */}
      <section className="section-space pt-0">
        <Container className="max-w-[90rem]">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Next.js
            </span>
            <span className="text-sm text-slate-400">
              Executive dashboard — read-only, polished, branded
            </span>
          </div>
          <DashboardShell />
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container className="max-w-[90rem]">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Next.js
            </span>
            <span className="text-sm text-slate-400">
              Construction pipeline — visual status at a glance
            </span>
          </div>
          <ConstructionPipeline />
        </Container>
      </section>

      {/* ── Retool App ── */}
      <section className="section-space pt-0">
        <Container className="max-w-[90rem]">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex rounded-lg bg-blue-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
              Retool
            </span>
            <span className="text-sm text-slate-400">
              Internal operations tool — searchable, filterable, editable
            </span>
          </div>
          <RetoolPipelinePreview />
        </Container>
      </section>

      <CTABanner
        headline="Want this kind of operating system for your business?"
        description="We build custom data ecosystems tailored to your operation, your workflows, and the decisions your team makes every day."
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
