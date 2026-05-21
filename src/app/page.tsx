import Link from "next/link";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Database,
  DollarSign,
  LayoutDashboard,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import TrackedCalendlyLink from "@/components/analytics/TrackedCalendlyLink";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { ShineBorder } from "@/components/magicui/shine-border";
import GlassOperationsCards from "@/components/sections/GlassOperationsCards";
import ClientImprovementCards from "@/components/sections/ClientImprovementCards";
import { liquidActionClass } from "@/lib/buttonStyles";
import { glassTileClass } from "@/lib/cardStyles";

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
  title: "Builder Operations Reporting | AD ERP SYSTEMS",
  description:
    "Builder operating reviews that help residential builders spot overruns early, improve cycle times, protect margin, and keep jobs moving.",
};

const workflowSteps = [
  {
    icon: Database,
    title: "Centralize data from different systems",
    body: "ERP exports, spreadsheets, finance data, and field updates land in one place so every report works off the same source.",
    output: "Unified source",
  },
  {
    icon: BarChart3,
    title: "Organize relevant data into KPI dashboards",
    body: "Builder-specific logic turns the source data into KPIs and pipelines for construction, finance, sales, permitting, and leadership.",
    output: "KPI dashboards",
  },
  {
    icon: LayoutDashboard,
    title: "Use it daily and in leadership meetings",
    body: "Each team checks their dashboard during the day. Leadership reviews the same numbers in weekly operating meetings.",
    output: "Daily + weekly use",
  },
];

const finalFocus: Array<{
  label: string;
  body: string;
  icon: LucideIcon;
}> = [
  {
    label: "Schedule risk",
    body: "Which jobs are slipping?",
    icon: CalendarDays,
  },
  {
    label: "Budget movement",
    body: "Which costs changed?",
    icon: DollarSign,
  },
  {
    label: "Daily dashboard",
    body: "What should each team review today?",
    icon: LayoutDashboard,
  },
];

const heroDashboardItems: Array<{
  label: string;
  detail: string;
  icon: LucideIcon;
}> = [
  {
    label: "Schedule drift",
    detail: "Delayed stages and closeout blockers",
    icon: CalendarDays,
  },
  {
    label: "Cost movement",
    detail: "Budget changes and cost-to-complete risk",
    icon: DollarSign,
  },
  {
    label: "Owner follow-up",
    detail: "Next action tied to an owner, date, and department",
    icon: UserCheck,
  },
];

const heroConstructionStats = [
  { label: "Stage risk", value: "11", unit: "jobs behind" },
  { label: "Cost variance", value: "$284K", unit: "flagged" },
  { label: "Owner actions", value: "38", unit: "due now" },
];

const reviewSignals = [
  {
    label: "Schedule",
    value: "Slipping stages",
    detail: "Jobs behind plan, stalled tasks, and closeout blockers.",
  },
  {
    label: "Budget",
    value: "Cost movement",
    detail: "Variance, cost-to-complete movement, and margin exposure.",
  },
  {
    label: "Owners",
    value: "Next actions",
    detail: "Follow-ups tied to an owner, department, and review date.",
  },
  {
    label: "Data",
    value: "Freshness",
    detail: "Sync health, missing updates, and unreliable source records.",
  },
];

const ctaClass =
  liquidActionClass({
    tone: "primary",
    size: "lg",
    className:
      "w-full shrink-0 sm:w-auto sm:px-6 sm:text-[0.72rem] sm:tracking-[0.12em]",
  });

const secondaryCtaClass =
  liquidActionClass({
    tone: "secondary",
    size: "lg",
    className:
      "w-full shrink-0 sm:w-auto sm:px-6 sm:text-[0.72rem] sm:tracking-[0.12em]",
  });

export default function Home() {
  return (
    <div className="blueprint-page min-h-screen text-[#17212c]">
      <div aria-hidden className="blueprint-frame hidden lg:block" />
      <section className="relative overflow-hidden border-b border-[#d9e1e6]/80 bg-transparent pt-32 md:pt-40">
        <Container className="relative z-10">
          <div className="grid gap-10 pb-14 lg:min-h-[680px] lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:pb-20">
            <div className="max-w-3xl">
              <AnimatedGradientText className="max-w-full text-center tracking-[0.14em] sm:text-[0.7rem] sm:tracking-[0.22em]">
                <span className="sm:hidden">Builder Operations</span>
                <span className="hidden sm:inline">Residential Construction Operations</span>
              </AnimatedGradientText>
              <h1 className="mt-6 max-w-4xl font-heading text-[2.65rem] leading-[0.98] tracking-[-0.04em] text-[#111814] sm:text-6xl sm:tracking-[-0.045em] lg:text-[5.45rem]">
                Catch overruns early. Keep jobs moving.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#46515a] md:text-xl">
                Turn ERP exports, spreadsheets, finance data, and field updates
                into daily operating views that show which jobs are slipping,
                which costs moved, and who needs to act next.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedCalendlyLink source="home_light_hero" className={ctaClass}>
                  <span>Book a Discovery Call</span>
                  <ArrowRight size={16} />
                </TrackedCalendlyLink>
                <Link href="/examples/" className={secondaryCtaClass}>
                  <span>View Example Dashboards</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {["4–6 week delivery", "Turnkey, client-owned system"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d8e1e6] bg-white/[0.7] px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#2f5368] shadow-[0_14px_40px_-32px_rgba(23,33,44,0.4)] backdrop-blur"
                    >
                      <CheckCircle2 size={14} className="text-[#4b9876]" />
                      {chip}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative lg:pl-4">
              <ShineBorder
                borderRadius={36}
                borderWidth={3}
                duration={8}
                color={["#24c18d", "#8bd7ff", "#24c18d"]}
                className="mx-auto max-w-[46rem]"
              >
              <div className="relative min-h-[34rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#17212c] text-white shadow-[0_18px_48px_-36px_rgba(23,33,44,0.42)]">
                <img
                  src="https://images.unsplash.com/photo-1692229079965-d3ae0e25f3f7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78&w=1100"
                  alt="Residential homes under construction on a jobsite"
                  width={1100}
                  height={900}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  style={{ objectPosition: "center" }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,28,0.18)_0%,rgba(10,18,28,0.62)_48%,rgba(8,13,20,0.92)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.18),transparent_28%)]" />

                <div className="relative flex min-h-[34rem] flex-col justify-between p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-full border border-white/[0.24] bg-white/[0.72] px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#17212c] shadow-[0_14px_32px_-24px_rgba(23,33,44,0.8)] backdrop-blur-md">
                      Residential jobsite view
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#66d9b2]/[0.36] bg-[#07111b]/[0.68] px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#b8f5df] backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-[#66d9b2]" />
                      Data sync healthy
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-end">
                    <div>
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#cce6f4]">
                        Construction operations dashboard
                      </p>
                      <h3 className="mt-3 max-w-xl text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl">
                        Track every job from permit to closing.
                      </h3>
                      <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-white/[0.72]">
                        Stage dates, cost movement, and owner follow-up stay
                        connected to the jobsite work your team is trying to
                        move every day.
                      </p>

                      <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-2">
                        {heroConstructionStats.map((stat) => (
                          <div
                            key={stat.label}
                            className="relative overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-b from-[#0c1a28]/75 to-[#060d16]/85 p-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_22px_46px_-30px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#8bd7ff]/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_28px_56px_-28px_rgba(0,0,0,0.95),0_0_22px_-6px_rgba(139,215,255,0.4)]"
                          >
                            <span
                              aria-hidden
                              className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#24c18d]/0 via-[#8bd7ff]/70 to-[#24c18d]/0"
                            />
                            <p className="text-[0.5rem] font-bold uppercase tracking-[0.18em] text-white/[0.6]">
                              {stat.label}
                            </p>
                            <p className="mt-2 text-xl font-bold leading-none tracking-[-0.02em] text-white sm:text-2xl">
                              {stat.value}
                            </p>
                            <p className="mt-1 text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#8bd7ff]/75">
                              {stat.unit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/[0.16] bg-[#07111b]/[0.72] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_60px_-42px_rgba(0,0,0,0.78)] backdrop-blur-md">
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#8bd8f7]">
                        Today&apos;s flags
                      </p>
                      <div className="mt-4 space-y-3">
                        {heroDashboardItems.map(({ label, detail, icon: ItemIcon }) => (
                          <div key={label} className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#66d9b2]/[0.2] bg-[#66d9b2]/[0.1] text-[#9ee7c9]">
                              <ItemIcon size={16} />
                            </span>
                            <span>
                              <span className="block text-sm font-bold text-white">
                                {label}
                              </span>
                              <span className="mt-0.5 block text-xs font-semibold leading-5 text-white/[0.52]">
                                {detail}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </ShineBorder>
            </div>
          </div>

          <div className="grid gap-3 border-t border-[#d8e1e6] py-5 sm:grid-cols-2 lg:grid-cols-4">
            {reviewSignals.map((signal) => (
              <div
                key={`strip-${signal.label}`}
                className={glassTileClass({
                  className: "flex items-start gap-3 p-3",
                })}
              >
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#35647f]" size={17} />
                <div>
                  <p className="text-sm font-bold text-[#17212c]">
                    {signal.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#66727a]">
                    {signal.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <IpadDashboardShowcase />
      <GlassOperationsCards />

      <section className="defer-section relative overflow-hidden border-y border-[#d9e1e6]/70 bg-transparent py-16 md:py-24">
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full border border-[#cbd6dc] bg-[#f7f9fa] px-4 py-2 text-[0.64rem] font-bold uppercase tracking-[0.2em] text-[#2f5368]">
                How it works
              </p>
              <h2 className="mt-5 font-heading text-4xl leading-[1.02] tracking-[-0.04em] md:text-6xl">
                Centralized data. Clear KPIs. Daily dashboards.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#58636b]">
                Centralize the source data, define builder-specific KPI logic,
                organize detailed pipelines, and give each department a daily
                dashboard view that helps improve cycle time and control cost.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-[#d4dee4] bg-white shadow-[0_2px_4px_-2px_rgba(23,33,44,0.06),0_30px_70px_-44px_rgba(23,33,44,0.42)]">
              <div className="flex items-center justify-between border-b border-[#e1e6e8] bg-[#17212c] px-5 py-4 text-white sm:px-6">
                <div>
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#d7eaf5]">
                    Dashboard operating path
                  </p>
                  <div className="mt-1 text-lg font-bold">
                    Source data, KPI logic, department dashboards
                  </div>
                </div>
              </div>
              {workflowSteps.map((step, index) => {
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="group relative grid gap-4 border-b border-[#e1e6e8] bg-white p-5 transition hover:bg-[#f7f9fa] last:border-b-0 sm:grid-cols-[3rem_1fr_auto] sm:items-start sm:p-6"
                  >
                    {index < workflowSteps.length - 1 ? (
                      <span
                        aria-hidden
                        className="absolute left-[2.45rem] top-[4.7rem] hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-[#d8e1e6] via-[#9eb6c8] to-transparent sm:block"
                      />
                    ) : null}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d8e1e6] bg-[#f7f9fa] text-[#2f5368] shadow-[0_16px_34px_-30px_rgba(23,33,44,0.45)] transition group-hover:-translate-y-0.5 group-hover:bg-white">
                      <StepIcon size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#35647f]">
                          Step {index + 1}
                        </span>
                        <span className="rounded-full border border-[#d8e1e6] bg-[#f8fafc] px-2.5 py-1 text-[0.54rem] font-bold uppercase tracking-[0.14em] text-[#435766]">
                          {step.output}
                        </span>
                      </div>
                      <h3 className="mt-2 text-2xl font-bold leading-tight text-[#17212c]">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-[#66727a]">
                        {step.body}
                      </p>
                    </div>
                    <div className="hidden text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#a8b2ba] sm:block">
                      0{index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <ClientImprovementCards />

      <section className="defer-section relative overflow-hidden border-y border-[#d9e1e6]/75 bg-transparent py-16 md:py-24">
        <Container className="relative z-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#cfdbe3] bg-[#111b26] text-white shadow-[0_36px_120px_-82px_rgba(23,33,44,0.9)]">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(207,231,247,0.34) 1px, transparent 1px), linear-gradient(rgba(207,231,247,0.24) 1px, transparent 1px)",
                backgroundSize: "38px 38px",
              }}
            />
            <div
              aria-hidden
              className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#6ee7b7]/[0.18] blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-28 right-8 h-64 w-80 rounded-full bg-[#9bd8ff]/[0.14] blur-3xl"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a7f3d0]/80 to-transparent"
            />
            <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:p-10">
              <div className="flex min-h-[22rem] flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] px-4 py-2 text-[0.64rem] font-bold uppercase tracking-[0.24em] text-[#cce6f4] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6ee7b7] shadow-[0_0_16px_rgba(110,231,183,0.7)]" />
                    Practical next step
                  </div>
                  <h2 className="mt-5 max-w-3xl font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-white md:text-6xl">
                    Start with one dashboard your team can use next week.
                  </h2>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-white/[0.72]">
                    We identify the schedule, budget, and margin signals to make
                    visible first, then outline one practical dashboard your team
                    can use in daily operations.
                  </p>
                </div>

                <div className="mt-8 grid gap-2 sm:grid-cols-3">
                  {finalFocus.map((item) => {
                    const FocusIcon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#8edbbd]/20 bg-[#6ee7b7]/10 text-[#9ce4c7]">
                          <FocusIcon size={16} />
                        </div>
                        <p className="mt-4 text-sm font-bold text-white">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-white/[0.58]">
                          {item.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.45rem] border border-white/[0.12] bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_-54px_rgba(0,0,0,0.8)] backdrop-blur-md">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-[#6ee7b7]/10"
                />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#9ce4c7]">
                        Discovery brief
                      </p>
                      <h3 className="mt-2 text-2xl font-bold leading-tight text-white">
                        What gets clarified on the call
                      </h3>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border border-white/[0.12] bg-black/[0.18] text-center leading-none text-white/[0.72]">
                      <span className="text-base font-bold">30</span>
                      <span className="mt-0.5 text-[0.5rem] font-bold uppercase tracking-[0.16em]">
                        min
                      </span>
                    </span>
                  </div>

                  <div className="divide-y divide-white/10">
                    {finalFocus.map((item, index) => {
                      const FocusIcon = item.icon;

                      return (
                        <div
                          key={`brief-${item.label}`}
                          className="grid grid-cols-[2.25rem_1fr_auto] gap-3 py-5"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/[0.16] text-[#9ce4c7]">
                            <FocusIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {item.label}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-white/[0.58]">
                              {item.body}
                            </p>
                          </div>
                          <span className="pt-1 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/[0.32]">
                            0{index + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <TrackedCalendlyLink
                    source="home_light_closing"
                    className={liquidActionClass({
                      tone: "frost",
                      size: "lg",
                      className:
                        "mt-1 w-full justify-between px-6 text-[#17212c]",
                    })}
                  >
                    <span>Book a Discovery Call</span>
                    <ArrowRight size={16} />
                  </TrackedCalendlyLink>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
