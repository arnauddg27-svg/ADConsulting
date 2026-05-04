"use client";

import type { ComponentType } from "react";
import { Database, FileSpreadsheet, Cloud, BarChart3, Bell, LayoutGrid, Activity, TrendingUp } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import TiltCard from "@/components/ui/TiltCard";

/**
 * The Hero "showcase" block:
 *  left column — stage-based data pipeline schematic
 *  right column — live-looking dashboard mock (tickers, bars, sparkline)
 * Both tilt slightly toward cursor.
 */
const showcasePanel =
  "relative h-full min-h-[440px] overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(7,11,19,0.95))] shadow-[0_36px_110px_-46px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.06)] md:min-h-[500px]";

export default function HeroShowcase() {
  return (
    <div className="reveal mt-7 grid items-stretch gap-5 lg:grid-cols-2">
      <TiltCard
        className={`${showcasePanel} bg-[linear-gradient(135deg,rgba(21,80,67,0.34),rgba(15,23,42,0.72)_42%,rgba(7,11,19,0.96))] p-5 md:p-6`}
        tiltLimit={3}
        scale={1.01}
        spotlight={false}
        effect="gravitate"
      >
        <PipelineDiagram />
      </TiltCard>

      <TiltCard
        className={showcasePanel}
        tiltLimit={3}
        scale={1.01}
        spotlight={false}
        effect="gravitate"
      >
        <BorderBeam size={140} duration={10} colorFrom="#34d399" colorTo="#22d3ee" />
        <LiveDashboardMock />
      </TiltCard>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PIPELINE DIAGRAM
   Sources → Warehouse → Apps with a square-friendly stage layout
   ════════════════════════════════════════════════════════════ */

function PipelineDiagram() {
  const sources = [
    { label: "ERP", detail: "job + finance data", icon: Database },
    { label: "Sheets", detail: "manual trackers", icon: FileSpreadsheet },
    { label: "APIs", detail: "cloud systems", icon: Cloud },
  ];
  const apps = [
    { label: "Dashboards", detail: "operating views", icon: LayoutGrid },
    { label: "Reports", detail: "weekly packages", icon: BarChart3 },
    { label: "Alerts", detail: "exception flags", icon: Bell },
  ];

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative text-center">
        <div className="text-[0.62rem] uppercase tracking-[0.24em] text-accent-300/80">
          Data Pipeline
        </div>
        <div className="mt-1 font-heading text-[1.35rem] tracking-[-0.02em] text-white md:text-[1.55rem]">
          Sources → Warehouse → Apps
        </div>
        <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-accent-400/25 bg-accent-500/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-accent-200 sm:absolute sm:right-0 sm:top-0 sm:mt-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
          </span>
          Live
        </div>
      </div>

      <div className="relative mt-6 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/[0.055] bg-[radial-gradient(circle_at_50%_48%,rgba(52,211,153,0.12),transparent_33%),linear-gradient(180deg,rgba(8,13,24,0.34),rgba(8,13,24,0.82))] p-4">
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-300/10 bg-accent-400/[0.035] blur-[0.2px]" />

        <div className="relative z-10 grid w-full max-w-[650px] grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_44px_minmax(166px,1.08fr)_44px_minmax(0,1fr)] sm:items-center">
          <PipelineStage eyebrow="Input sources" items={sources} />
          <PipelineConnector label="Extract" />

          <div className="relative flex min-h-[230px] items-center justify-center rounded-[1.7rem] border border-accent-300/[0.18] bg-[linear-gradient(180deg,rgba(9,14,25,0.98),rgba(10,22,31,0.98))] p-4 text-center shadow-[0_24px_80px_-34px_rgba(52,211,153,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="absolute inset-4 rounded-[1.3rem] border border-accent-400/[0.08]" />
            <div className="absolute left-4 right-4 top-1/2 h-px bg-gradient-to-r from-transparent via-accent-300/30 to-transparent" />
            <div className="relative flex h-36 w-full max-w-[170px] flex-col items-center justify-center rounded-[1.35rem] border border-accent-400/45 bg-slate-950/80 px-5 shadow-[0_0_70px_-22px_rgba(52,211,153,0.95)]">
              <Database size={32} className="text-accent-300" />
              <div className="mt-4 font-heading text-[1.18rem] font-semibold uppercase tracking-[0.12em] text-white">
                Warehouse
              </div>
              <div className="mt-1 text-[0.66rem] uppercase tracking-[0.2em] text-slate-400">
                Client-owned
              </div>
            </div>
          </div>

          <PipelineConnector label="Deliver" />
          <PipelineStage eyebrow="Output apps" items={apps} align="right" />
        </div>
      </div>

      {/* bottom micro info */}
      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/[0.05] pt-3 text-[0.56rem] uppercase tracking-[0.18em] text-slate-500 sm:text-[0.62rem]">
        <span>Daily sync</span>
        <span>KPI logic</span>
        <span>Client-owned</span>
      </div>
    </div>
  );
}

function PipelineStage({
  eyebrow,
  items,
  align = "left",
}: {
  eyebrow: string;
  items: Array<{
    label: string;
    detail: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }>;
  align?: "left" | "right";
}) {
  return (
    <div className={`rounded-[1.35rem] border border-white/[0.07] bg-slate-950/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] ${align === "right" ? "text-right" : ""}`}>
      <div className="mb-3 text-[0.56rem] uppercase tracking-[0.18em] text-slate-500">{eyebrow}</div>
      <div className="space-y-2">
        {items.map(({ label, detail, icon: Icon }) => (
          <div
            key={label}
            className={`flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-2.5 py-2.5 ${align === "right" ? "flex-row-reverse" : ""}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent-400/30 bg-accent-500/10 text-accent-300">
              <Icon size={17} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold tracking-[0.02em] text-slate-100">{label}</div>
              <div className="mt-0.5 truncate text-[0.58rem] uppercase tracking-[0.12em] text-slate-500">
                {detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineConnector({ label }: { label: string }) {
  return (
    <div className="hidden h-full items-center justify-center sm:flex">
      <div className="relative flex h-[72%] w-full items-center justify-center">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-accent-300/10 via-accent-300/65 to-cyan-300/10" />
        <div className="relative rounded-full border border-accent-300/25 bg-slate-950 px-2 py-1 text-[0.48rem] uppercase tracking-[0.14em] text-accent-200 shadow-[0_0_26px_-14px_rgba(52,211,153,0.9)]">
          {label}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LIVE DASHBOARD MOCK
   Fake app chrome with animated tickers + sparkline
   ════════════════════════════════════════════════════════════ */

function LiveDashboardMock() {
  const kpis = [
    {
      label: "Active Jobs",
      value: 142,
      prefix: "",
      suffix: "",
      detail: "11 near close",
      tone: "text-slate-50",
      progress: 78,
    },
    {
      label: "On Schedule",
      value: 87,
      prefix: "",
      suffix: "%",
      detail: "+5 pts vs prior",
      tone: "text-accent-300",
      progress: 87,
    },
    {
      label: "Budget Used",
      value: 58,
      prefix: "",
      suffix: "%",
      detail: "$32.0M actual",
      tone: "text-cyan-300",
      progress: 58,
    },
    {
      label: "Open Flags",
      value: 12,
      prefix: "",
      suffix: "",
      detail: "8 resolved this week",
      tone: "text-amber-200",
      progress: 32,
    },
  ];

  const communities = [
    { name: "Sunshine Ridge", pct: 92, homes: 24 },
    { name: "Lake Nona Shores", pct: 76, homes: 19 },
    { name: "Emerald Bay", pct: 64, homes: 16 },
  ];

  return (
    <div className="relative flex h-full flex-col p-5 md:p-6">
      {/* Window chrome */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="font-space-grotesk text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">
          builder.ops · dashboard
        </div>
        <div className="flex h-4 w-4 items-center justify-center">
          <Activity size={11} className="text-accent-400" />
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl border border-accent-400/15 bg-gradient-to-br from-accent-500/[0.08] via-white/[0.035] to-cyan-400/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.22em] text-slate-500">
            Operating Overview
          </div>
          <div className="mt-0.5 font-heading text-base tracking-[-0.02em] text-slate-100">
            Construction health
          </div>
          <div className="mt-0.5 text-[0.64rem] text-slate-500">
            Data through Mar 25 · all communities
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/25 bg-accent-500/10 px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-accent-200">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, index) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div className="text-[0.54rem] uppercase tracking-[0.2em] text-slate-500">
              {kpi.label}
            </div>
            <div className={`mt-1 font-heading text-[1.15rem] tabular-nums ${kpi.tone}`}>
              {kpi.prefix}
              <NumberTicker
                value={kpi.value}
                decimalPlaces={0}
                delay={0.12 * index}
                className="inline-block"
              />
              {kpi.suffix}
            </div>
            <div className="mt-0.5 text-[0.56rem] text-slate-500">{kpi.detail}</div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-500 to-cyan-300"
                style={{ width: `${kpi.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bars — communities */}
      <div className="mt-3 flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[0.54rem] uppercase tracking-[0.2em] text-slate-500">
            Project Completion by Community
          </div>
          <TrendingUp size={10} className="text-accent-400" />
        </div>
        <div className="space-y-2">
          {communities.map((c, i) => (
            <div key={c.name}>
              <div className="flex justify-between text-[0.56rem]">
                <span className="text-slate-300">{c.name}</span>
                <span className="tabular-nums text-slate-500">
                  {c.homes} jobs · {c.pct}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-500 via-accent-400 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                  style={{
                    width: `${c.pct}%`,
                    animation: `bar-fill 1.4s cubic-bezier(0.2,0.8,0.2,1) ${0.1 * i}s both`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          ["Permits", "120", "5 pending"],
          ["Draws", "$8.4M", "ready"],
          ["Sales", "$18.4M", "backlog"],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
            <div className="text-[0.52rem] uppercase tracking-[0.18em] text-slate-500">
              {label}
            </div>
            <div className="mt-0.5 font-heading text-sm text-slate-100">{value}</div>
            <div className="mt-0.5 text-[0.55rem] text-accent-300/80">{detail}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes bar-fill {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
}
