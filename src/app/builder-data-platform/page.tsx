import Link from "next/link";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ArrowRight, CheckCircle2, Database, Lock, Sparkles } from "lucide-react";

import Container from "@/components/ui/Container";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";
import OperationsHeroCard from "@/components/sections/OperationsHeroCard";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { ShineBorder } from "@/components/magicui/shine-border";
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
  title: "Builder, Developer + Property Management Dashboards + AI Data Analyst | AD ERP SYSTEMS",
  description:
    "Dashboards and an AI data analyst built on your builder, developer, and property management data — not a template. Centralize ERP, spreadsheets, finance, field, and property management feeds in a warehouse, then ask it anything in plain English. Turnkey, fully client-owned.",
};

const heroChips = [
  "4–6 week delivery",
  "Turnkey, client-owned system",
  "AI analyst included",
  "Construction + property management coverage",
];

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
                Know which jobs are slipping — before they cost you.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#46515a] md:text-xl">
                Dashboards + an AI analyst, built on your data — for
                residential builders, developers, and their property
                management arms. We pull your ERP, spreadsheets, finance,
                field, and property management data into one place and give
                every team a daily operating view, plus an AI analyst that
                answers questions about it in plain English.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedCalendlyLink
                  source="builder_data_platform_hero"
                  className={heroCtaClass}
                >
                  <span>Book a Discovery Call</span>
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <a href="#ai-analyst-demo" className={heroSecondaryCtaClass}>
                  <Sparkles size={15} />
                  <span>Watch the 75-sec Demo</span>
                </a>
                <Link href="/examples/" className={heroSecondaryCtaClass}>
                  <span>View Samples</span>
                  <ArrowRight size={16} />
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

      {/* Proof — recent engagement with concrete outcomes. */}
      <section className="relative overflow-hidden border-b border-[#d9e1e6]/80 bg-transparent py-16 md:py-20">
        <Container className="relative z-10">
          <div className="overflow-hidden rounded-[1.5rem] border border-[#d4dee4] bg-white/[0.82] p-7 shadow-[0_36px_110px_-78px_rgba(23,33,44,0.55)] backdrop-blur md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#2f5368]">
                  Recent engagement
                </p>
                <h2 className="mt-4 font-heading text-3xl leading-[1.02] tracking-[-0.03em] text-[#17212c] md:text-[2.6rem]">
                  Built inside a top-200 builder environment.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[#46515a] md:text-lg">
                  ERP exports, estimating spreadsheets, and finance feeds
                  pulled into one central system, with daily operating views
                  for construction, finance, and leadership on top — the same
                  platform this page describes, run on real builder data.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "ERP + spreadsheet workflows",
                    "Daily operating views",
                    "AI analyst included",
                  ].map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4e8] bg-[#f7f9fb] px-3 py-1.5 text-xs font-semibold text-[#40515d]"
                    >
                      <CheckCircle2 size={13} className="text-[#4b9876]" />
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
                {[
                  { value: "15%", label: "Cycle-time reduction" },
                  { value: "$0", label: "Over budget on tracked jobs" },
                  { value: "20", label: "Fewer days on market" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.25rem] border border-[#d8e1e6] bg-white px-5 py-6 text-center shadow-[0_18px_44px_-36px_rgba(23,33,44,0.45)]"
                  >
                    <div className="font-heading text-4xl tracking-[-0.04em] text-[#17212c] tabular-nums">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#2f5368]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-8 text-xs leading-5 text-[#6b747b]">
              Results from a prior builder engagement; every operation is
              different and scope is shaped to yours.
            </p>
          </div>
        </Container>
      </section>

      {/* Hero #3 — AI Data Analyst on top of the warehouse. */}
      <section className="relative overflow-hidden border-b border-[#d9e1e6]/80 bg-transparent py-16 md:py-20 lg:py-24">
        <Container className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
            <div className="relative order-2 lg:order-1 lg:pr-2">
              <ShineBorder
                borderRadius={36}
                borderWidth={3}
                duration={8}
                color={["#24c18d", "#8bd7ff", "#24c18d"]}
                className="mx-auto max-w-[46rem]"
              >
                <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#080a0c] shadow-[0_18px_48px_-36px_rgba(23,33,44,0.42)]">
                  <video
                    id="ai-analyst-demo"
                    src="/videos/ai-data-analyst-demo.mp4"
                    poster="/videos/ai-data-analyst-poster.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="block h-auto w-full scroll-mt-28"
                    aria-label="AI Data Analyst demo — natural-language question answered with table, chart, and SQL exposed"
                  />
                </div>
              </ShineBorder>
            </div>

            <div className="order-1 max-w-2xl lg:order-2">
              <AnimatedGradientText className="max-w-full tracking-[0.14em] sm:text-[0.7rem] sm:tracking-[0.22em]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles size={12} />
                  New · AI Data Analyst
                </span>
              </AnimatedGradientText>
              <h2 className="mt-6 font-heading text-[2.4rem] leading-[0.98] tracking-[-0.04em] text-[#111814] sm:text-5xl lg:text-[4rem]">
                Ask your business data anything.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#46515a]">
                A natural-language analyst layered on the same warehouse we
                build for you. Operators ask in plain English. No waiting on a
                report — it answers from your own numbers and shows how it got
                there.
              </p>

              <ul className="mt-7 space-y-3.5 text-sm leading-6 text-[#40515d]">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#a8c8b8] bg-[#edf5f1] text-[#356b54]">
                    <Lock size={13} strokeWidth={2.4} />
                  </span>
                  <span>
                    <strong className="font-bold text-[#17212c]">
                      Client-owned end-to-end.
                    </strong>{" "}
                    Bot, prompts, domain context, audit log — all live in your
                    cloud accounts and stay with you.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#a8c8b8] bg-[#edf5f1] text-[#356b54]">
                    <CheckCircle2 size={13} strokeWidth={2.4} />
                  </span>
                  <span>
                    <strong className="font-bold text-[#17212c]">
                      Turnkey delivery.
                    </strong>{" "}
                    Configured against your warehouse, branded to your team,
                    deployed in the same 4–6 week window as the dashboards.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#a8c8b8] bg-[#edf5f1] text-[#356b54]">
                    <Database size={13} strokeWidth={2.4} />
                  </span>
                  <span>
                    <strong className="font-bold text-[#17212c]">
                      Read-only and audited.
                    </strong>{" "}
                    Every query capped, logged, and shown in the answer — no
                    data leaves your warehouse.
                  </span>
                </li>
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedCalendlyLink
                  source="builder_data_platform_ai_hero"
                  className={heroCtaClass}
                >
                  <span>See it on Your Data</span>
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <Link
                  href="/services/#ai-analyst"
                  className={heroSecondaryCtaClass}
                >
                  <span>How It Works</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

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
                  See whether your data can support better reporting — and an AI analyst.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg md:leading-8">
                  Book a short call to review your current systems, where
                  reporting breaks down, what a practical first release could
                  include, and where the AI bot pays off. Everything we ship
                  ends up running in your cloud, owned by your team.
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
