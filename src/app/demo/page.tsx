import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import DashboardShell from "@/components/demo/DashboardShell";
import ConstructionPipeline from "@/components/demo/ConstructionPipeline";
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

export default function DemoPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <span className="eyebrow">Illustrative Example</span>
              <h1 className="mt-6 max-w-4xl font-heading text-5xl leading-[0.9] tracking-[0.05em] text-slate-50 sm:text-6xl">
                A sample operating review built for builders.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                This example shows how project status, cost movement, schedule
                pressure, and open issues can be reviewed in one place.
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

      <section className="section-space pt-0">
        <Container className="max-w-[90rem]">
          <DashboardShell />
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container className="max-w-[90rem]">
          <ConstructionPipeline />
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
