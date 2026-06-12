import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  DollarSign,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  BlueprintCTA,
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";
import { glassTileClass } from "@/lib/cardStyles";
import { PROCESS_STEPS, SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services | AD ERP SYSTEMS",
  description:
    "Builder reporting systems and an AI data analyst for residential construction teams that need clearer schedule, budget, margin, and owner follow-up visibility. Delivered turnkey, fully client-owned.",
};

const iconMap: Record<string, LucideIcon> = {
  AlertTriangle,
  DollarSign,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
};

/* Compact dark-panel illustration per service — same visual language as the
   live dashboard demo. Static markup only (server-rendered). */
function ServiceVisual({ id }: { id: string }) {
  const frame =
    "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1622] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_-48px_rgba(23,33,44,0.8)]";
  const grid = {
    backgroundImage:
      "linear-gradient(90deg, rgba(139,215,255,0.18) 1px, transparent 1px), linear-gradient(rgba(139,215,255,0.14) 1px, transparent 1px)",
    backgroundSize: "28px 28px",
  } as const;

  if (id === "ingestion") {
    return (
      <div className={frame}>
        <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={grid} />
        <div className="relative flex items-center gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            {["ERP exports", "Spreadsheets", "Finance", "Field + PM"].map((s) => (
              <span
                key={s}
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-white/[0.72]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#8bd7ff]" />
                {s}
              </span>
            ))}
          </div>
          <div aria-hidden className="h-px w-8 shrink-0 border-t-2 border-dashed border-[#24c18d]/60" />
          <div className="shrink-0 rounded-xl border border-[#24c18d]/40 bg-[#24c18d]/10 px-4 py-5 text-center">
            <div className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-[#8df2c8]">
              One central
            </div>
            <div className="text-sm font-bold text-white">warehouse</div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "warehouse") {
    return (
      <div className={frame}>
        <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={grid} />
        <div className="relative space-y-1.5">
          <div className="flex gap-1.5">
            {["jobs", "costs", "sales", "leases"].map((t) => (
              <span
                key={t}
                className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[0.54rem] font-bold uppercase tracking-[0.12em] text-[#8bd7ff]"
              >
                {t}
              </span>
            ))}
          </div>
          {[88, 72, 94, 63].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#24c18d]/70" />
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#1d3a52] to-[#2a5878]"
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
          <p className="pt-1 text-[0.54rem] font-semibold uppercase tracking-[0.14em] text-white/[0.45]">
            Clean, joined, client-owned tables
          </p>
        </div>
      </div>
    );
  }

  if (id === "builder-ops") {
    return (
      <div className={frame}>
        <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={grid} />
        <div className="relative grid grid-cols-3 gap-2">
          {[
            { v: "4.9 mo", l: "cycle" },
            { v: "$310K", l: "variance" },
            { v: "24.6%", l: "margin" },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-center">
              <div className="text-sm font-bold text-white tabular-nums">{k.v}</div>
              <div className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-white/[0.5]">{k.l}</div>
            </div>
          ))}
        </div>
        <div className="relative mt-2.5 space-y-1.5">
          {[
            { w: 78, c: "#14b8a6" },
            { w: 52, c: "#22d3ee" },
            { w: 34, c: "#3b82f6" },
          ].map((b, i) => (
            <div key={i} className="h-2 rounded-full bg-white/[0.08]">
              <div className="h-2 rounded-full" style={{ width: `${b.w}%`, background: b.c }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "ai-analyst") {
    return (
      <div className={frame}>
        <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={grid} />
        <div className="relative space-y-2">
          <div className="w-fit rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[0.66rem] font-semibold text-white/[0.85]">
            &ldquo;Which jobs are over budget?&rdquo;
          </div>
          <div className="rounded-xl border border-[#24c18d]/30 bg-[#24c18d]/[0.07] p-2.5">
            {[
              { job: "Lot 231 · Emerald Bay", v: "+$14K", over: true },
              { job: "Lot 118 · Sunshine Ridge", v: "+$9K", over: true },
              { job: "136 others", v: "on budget", over: false },
            ].map((r) => (
              <div key={r.job} className="flex items-center justify-between py-0.5 text-[0.62rem] font-semibold">
                <span className="text-white/[0.75]">{r.job}</span>
                <span className={r.over ? "text-[#f2c66d]" : "text-[#8df2c8]"}>{r.v}</span>
              </div>
            ))}
          </div>
          <p className="text-[0.54rem] font-semibold uppercase tracking-[0.14em] text-white/[0.45]">
            Answered from your warehouse · SQL shown
          </p>
        </div>
      </div>
    );
  }

  // data-quality (default)
  return (
    <div className={frame}>
      <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={grid} />
      <div className="relative space-y-1.5">
        {[
          { l: "ERP sync", ok: true, t: "today 6:02 AM" },
          { l: "Sheets import", ok: true, t: "today 6:04 AM" },
          { l: "Field updates", ok: false, t: "2 stale records" },
          { l: "Access controls", ok: true, t: "12 users · roles set" },
        ].map((r) => (
          <div
            key={r.l}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5"
          >
            <span className="flex items-center gap-2 text-[0.62rem] font-bold text-white/[0.82]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: r.ok ? "#24c18d" : "#f2c66d" }}
              />
              {r.l}
            </span>
            <span className="text-[0.56rem] font-semibold text-white/[0.5]">{r.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Services"
        title="Builder, developer + property management reporting and an AI analyst on top."
        description="We centralize your builder, developer, and property management data, define the exception logic, deliver operating views your team can review every day, and layer on an AI data analyst that answers plain-English questions about your warehouse. Every piece is turnkey and ends up owned by you."
        align="center"
      />

      <section className="pb-14 md:pb-20">
        <Container className="space-y-5">
          {/* Mini dashboard-style visual per service, in the same dark panel
              language as the live demo — so each block shows, not just tells. */}
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.icon] ?? Wrench;
            // Alternate the layout direction so the page reads as a zig-zag
            // instead of six identical stacked blocks.
            const reversed = index % 2 === 1;

            return (
              <BlueprintPanel key={service.id} className="overflow-hidden p-6 md:p-8 lg:p-10">
                <div
                  className={`grid gap-8 lg:items-center lg:gap-12 ${
                    reversed
                      ? "lg:grid-cols-[1.18fr_0.82fr]"
                      : "lg:grid-cols-[0.82fr_1.18fr]"
                  }`}
                >
                  <div className={reversed ? "lg:order-2" : undefined}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d5dde2] bg-[#f7f9fb] text-[#35647f]">
                        <Icon size={26} />
                      </div>
                      <span className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#6f8190]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="mt-7 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
                      {service.shortTitle}
                    </p>
                    <h2 className="mt-3 max-w-2xl font-heading text-4xl leading-[0.98] tracking-[-0.04em] text-[#17212c] md:text-5xl">
                      {service.title}
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-[#58636b] md:text-lg">
                      {service.description}
                    </p>

                    <Link
                      href={`/book/?source=services_${service.id}`}
                      className={liquidActionClass({
                        tone: "secondary",
                        size: "sm",
                        className: "mt-7",
                      })}
                    >
                      <span>Discuss this</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className={reversed ? "lg:order-1" : undefined}>
                    <ServiceVisual id={service.id} />
                    <p className="mt-5 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
                      What you get
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {service.deliverables.map((deliverable) => (
                        <div
                          key={deliverable}
                          className={glassTileClass({
                            className:
                              "flex items-center gap-3 px-4 py-3.5 text-left",
                          })}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#a8c8b8] bg-[#edf5f1] text-[#356b54]">
                            <Check size={12} strokeWidth={3} />
                          </span>
                          <span className="text-sm font-semibold leading-snug text-[#40515d]">
                            {deliverable}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </BlueprintPanel>
            );
          })}
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-[#c9d4da] bg-white/88 px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#2f5368]">
              Process
            </p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] sm:text-5xl">
              From source systems to daily operating views.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <BlueprintPanel key={step.step} className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c9d4da] bg-[#edf5f1] font-heading text-sm font-bold text-[#356b54]">
                  {step.step}
                </div>
                <h3 className="mt-5 font-heading text-2xl leading-tight tracking-[-0.03em] text-[#17212c]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#58636b]">
                  {step.description}
                </p>
              </BlueprintPanel>
            ))}
          </div>
        </Container>
      </section>

      <BlueprintCTA
        title="Start with the first operating view."
        description="We review your source systems, pick the first schedule, budget, and owner follow-up signals, then outline a practical dashboard release."
        primary={{
          label: "Book a Discovery Call",
          href: "/book/?source=services_cta",
        }}
        secondary={{
          label: "View Sample",
          href: "/examples/",
        }}
      />
    </BlueprintPage>
  );
}
