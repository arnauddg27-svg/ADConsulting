"use client";

import { useState } from "react";
import { clsx } from "clsx";
import Container from "@/components/ui/Container";
import DashboardShell from "@/components/demo/DashboardShell";
import ConstructionPipeline from "@/components/demo/ConstructionPipeline";
import RetoolPipelinePreview from "@/components/demo/RetoolPipelinePreview";
import CTABanner from "@/components/sections/CTABanner";

const demoHighlights = [
  "Project status",
  "Cost tracking",
  "Schedule review",
];

const platforms = [
  {
    id: "nextjs" as const,
    label: "Next.js",
    description: "Polished, branded dashboards for leadership reviews and stakeholder presentations. Mobile-friendly, shareable, and visually tuned to your company.",
  },
  {
    id: "retool" as const,
    label: "Retool",
    description: "Functional, data-connected tools where your team actually works — search, filter, edit, and write back to your systems in real time.",
  },
];

export default function DemoPageClient() {
  const [platform, setPlatform] = useState<"nextjs" | "retool">("nextjs");

  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <span className="eyebrow">Illustrative Example</span>
              <h1 className="mt-6 max-w-4xl font-heading text-5xl leading-[0.9] tracking-[0.05em] text-slate-50 sm:text-6xl">
                Your data,{" "}
                <span className="text-gradient">your way.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                We build custom dashboards and operating tools tailored to how
                your team actually works — whether that&apos;s a polished
                executive view or an internal tool your ops team lives in
                every day.
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

      {/* ── Platform Toggle ── */}
      <section className="section-space pt-0 pb-8 md:pb-10">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Choose a platform to preview
            </p>
            <div className="mt-4 inline-flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={clsx(
                    "rounded-lg px-6 py-2.5 text-sm font-semibold transition-all",
                    platform === p.id
                      ? "bg-accent-500 text-white shadow-lg shadow-accent-500/25"
                      : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {platforms.find((p) => p.id === platform)?.description}
            </p>
          </div>
        </Container>
      </section>

      {/* ── Dashboard Preview ── */}
      {platform === "nextjs" && (
        <>
          <section className="section-space pt-0">
            <Container className="max-w-[90rem]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Next.js
                </span>
                <span className="text-sm text-slate-400">
                  Executive dashboard — KPIs, charts, and cross-filtering
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
        </>
      )}

      {platform === "retool" && (
        <section className="section-space pt-0">
          <Container className="max-w-[90rem]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex rounded-lg bg-blue-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
                Retool
              </span>
              <span className="text-sm text-slate-400">
                Operations tool — searchable, filterable, editable
              </span>
            </div>
            <RetoolPipelinePreview />
          </Container>
        </section>
      )}

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
