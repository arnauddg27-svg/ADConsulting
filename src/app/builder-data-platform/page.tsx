import Link from "next/link";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import Container from "@/components/ui/Container";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";
import OperationsHeroCard from "@/components/sections/OperationsHeroCard";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { liquidActionClass } from "@/lib/buttonStyles";

// Hero #2 (the iPad dashboard) is below the fold — code-split it so its client
// JS loads after the hero is interactive. It still server-renders (no SEO/CLS
// loss); the placeholder only shows before hydration on slow connections.
const IpadDashboardShowcase = dynamic(
  () => import("@/components/sections/IpadDashboardShowcase"),
  {
    loading: () => (
      <section className="defer-section relative overflow-hidden border-b border-[#d9e1e6] bg-transparent py-16 md:py-24">
        <Container>
          <div className="mx-auto h-[28rem] max-w-5xl animate-pulse rounded-[2rem] border border-[#d9e1e6] bg-white/[0.58] shadow-[0_32px_90px_-74px_rgba(23,33,44,0.48)]" />
        </Container>
      </section>
    ),
  },
);

export const metadata: Metadata = {
  title: "Homebuilder Dashboards & ERP Reporting | AD ERP SYSTEMS",
  description:
    "Dashboards built on your builder data, not a template. Centralize ERP data, spreadsheets, finance systems, APIs, and exports in a structured warehouse.",
};

const heroChips = ["4–6 week delivery", "Turnkey, client-owned system"];

const heroCtaClass = liquidActionClass({
  tone: "primary",
  size: "lg",
  className:
    "w-full shrink-0 sm:w-auto sm:px-6 sm:text-[0.72rem] sm:tracking-[0.12em]",
});

const heroSecondaryCtaClass = liquidActionClass({
  tone: "secondary",
  size: "lg",
  className:
    "w-full shrink-0 sm:w-auto sm:px-6 sm:text-[0.72rem] sm:tracking-[0.12em]",
});

export default function BuilderDataPlatformLandingPage() {
  return (
    <div className="blueprint-page min-h-screen text-[#17212c]">
      <div aria-hidden className="blueprint-frame hidden lg:block" />

      {/* Hero #1 — value proposition first, with the operations dashboard card. */}
      <section className="relative overflow-hidden border-b border-[#d9e1e6]/80 bg-transparent pt-32 md:pt-40">
        <Container className="relative z-10">
          <div className="grid gap-10 pb-14 lg:min-h-[680px] lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:pb-20">
            <div className="max-w-3xl">
              <AnimatedGradientText className="max-w-full tracking-[0.14em] sm:text-[0.7rem] sm:tracking-[0.22em]">
                Builder Data Platform
              </AnimatedGradientText>
              <h1 className="mt-6 max-w-4xl font-heading text-[2.65rem] leading-[0.98] tracking-[-0.04em] text-[#111814] sm:text-6xl sm:tracking-[-0.045em] lg:text-[5.15rem]">
                Dashboards built on your data, not a template.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#46515a] md:text-xl">
                Centralize your ERP, spreadsheets, finance data, and field
                updates, apply builder-specific KPI logic, and give every team a
                daily operating view.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedCalendlyLink
                  source="builder_data_platform_hero"
                  className={heroCtaClass}
                >
                  <span>Book a Discovery Call</span>
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <Link href="/examples/" className={heroSecondaryCtaClass}>
                  <Sparkles size={15} />
                  <span>View Samples</span>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {heroChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8e1e6] bg-white/[0.7] px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#2f5368] shadow-[0_14px_40px_-32px_rgba(23,33,44,0.4)] backdrop-blur"
                  >
                    <CheckCircle2 size={14} className="text-[#4b9876]" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-4">
              <OperationsHeroCard />
            </div>
          </div>
        </Container>
      </section>

      {/* Hero #2 — the daily operating dashboard on the iPad. */}
      <IpadDashboardShowcase />

      {/* Closing CTA — uses TrackedCalendlyLink so the booking click routes to
          Calendly with UTM + analytics (BlueprintCTA's internal Link can't). */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="relative transform-gpu overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-gradient-to-br from-[#1c2a3a] to-[#141f2b] p-7 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_42px_130px_-82px_rgba(23,33,44,0.78)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_56px_150px_-76px_rgba(23,33,44,0.9)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#8bd7ff]/20 blur-3xl"
            />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[0.64rem] font-bold uppercase tracking-[0.2em] text-[#a7d7eb]">
                  Next step
                </p>
                <h2 className="mt-6 max-w-3xl font-heading text-4xl leading-[0.98] tracking-[-0.04em] md:text-[3.4rem]">
                  See whether your data can support better reporting.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg md:leading-8">
                  Book a short call to review your current systems, where
                  reporting breaks down, and what a practical first release
                  could include.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <TrackedCalendlyLink
                  source="builder_data_platform_cta"
                  className={liquidActionClass({
                    tone: "frost",
                    size: "lg",
                    className: "w-full sm:w-auto",
                  })}
                >
                  <span>Book a Discovery Call</span>
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <Link
                  href="/contact/"
                  className={liquidActionClass({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full sm:w-auto",
                  })}
                >
                  <span>Contact Details</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
