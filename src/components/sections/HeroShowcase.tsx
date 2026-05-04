"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Database, FileSpreadsheet, Cloud, BarChart3, Bell, LayoutGrid, Activity, TrendingUp } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import TiltCard from "@/components/ui/TiltCard";

/** Reads the user's prefers-reduced-motion preference. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

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
   Sources (LEFT) → Warehouse (CENTER) → Apps (RIGHT)
   with traveling dots along curved bezier paths.
   ════════════════════════════════════════════════════════════ */

function PipelineDiagram() {
  const reduceMotion = usePrefersReducedMotion();
  const sources = [
    { label: "ERP", icon: Database },
    { label: "Sheets", icon: FileSpreadsheet },
    { label: "APIs", icon: Cloud },
  ];
  const apps = [
    { label: "Dashboards", icon: LayoutGrid },
    { label: "Reports", icon: BarChart3 },
    { label: "Alerts", icon: Bell },
  ];

  // Horizontal layout — viewBox 600×320, sources at x=70 left,
  // warehouse centered at x=300, apps at x=530 right. The viewBox
  // is intentionally not padded; chip + label both render inside.
  const sourcePositions = [
    { x: 70, y: 70 },
    { x: 70, y: 160 },
    { x: 70, y: 250 },
  ];
  const appPositions = [
    { x: 530, y: 70 },
    { x: 530, y: 160 },
    { x: 530, y: 250 },
  ];
  const wh = { x: 300, y: 160 };
  const sourceNodes = sources.map((s, i) => ({ ...s, ...sourcePositions[i] }));
  const appNodes = apps.map((a, i) => ({ ...a, ...appPositions[i] }));

  return (
    <div className="relative flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.62rem] uppercase tracking-[0.24em] text-accent-300/80">
            Data Pipeline
          </div>
          <div className="mt-1 font-heading text-[1.2rem] tracking-[-0.02em] text-white md:text-[1.35rem]">
            Sources → Warehouse → Apps
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-accent-400/25 bg-accent-500/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-accent-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
          </span>
          Live
        </div>
      </div>

      {/* Diagram canvas */}
      <div className="relative mt-5 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/[0.055] bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.1),transparent_55%),linear-gradient(180deg,rgba(8,13,24,0.4),rgba(8,13,24,0.85))] p-4 md:p-5">
        <svg
          viewBox="0 0 600 320"
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Subtle grid pattern */}
            <pattern id="heroGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
            {/* Path gradient — green → cyan, fades at endpoints */}
            <linearGradient id="pathFlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
            </linearGradient>
            {/* Glowing dot */}
            <radialGradient id="flowDot">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#6ee7b7" stopOpacity="1" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
            {/* Warehouse pulse glow */}
            <radialGradient id="whGlow">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
            {/* Chip glow under hover */}
            <radialGradient id="chipGlow">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background grid */}
          <rect width="600" height="320" fill="url(#heroGrid)" />

          {/* Source → Warehouse curved paths + traveling dots */}
          {sourceNodes.map((s, i) => {
            const d = `M ${s.x + 24} ${s.y} C ${(s.x + wh.x) / 2} ${s.y}, ${(s.x + wh.x) / 2} ${wh.y}, ${wh.x - 60} ${wh.y}`;
            return (
              <g key={`in-${i}`}>
                <path d={d} stroke="url(#pathFlow)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                {!reduceMotion && (
                  <circle r="3.2" fill="url(#flowDot)">
                    <animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.6}s`} path={d} />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Warehouse → Apps curved paths + traveling dots */}
          {appNodes.map((a, i) => {
            const d = `M ${wh.x + 60} ${wh.y} C ${(wh.x + a.x) / 2} ${wh.y}, ${(wh.x + a.x) / 2} ${a.y}, ${a.x - 24} ${a.y}`;
            return (
              <g key={`out-${i}`}>
                <path d={d} stroke="url(#pathFlow)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                {!reduceMotion && (
                  <circle r="3.2" fill="url(#flowDot)">
                    <animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.6 + 1.5}s`} path={d} />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Source nodes (left) — labels render to the RIGHT, inward */}
          {sourceNodes.map((s) => (
            <NodeChip key={`src-${s.label}`} x={s.x} y={s.y} label={s.label} Icon={s.icon} align="right" />
          ))}

          {/* Warehouse — central, larger, with pulsing ring */}
          <g>
            <circle cx={wh.x} cy={wh.y} r="78" fill="url(#whGlow)" />
            {!reduceMotion && (
              <circle cx={wh.x} cy={wh.y} r="60" fill="none" stroke="rgba(52,211,153,0.55)" strokeWidth="1.2">
                <animate attributeName="r" from="60" to="86" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.7" to="0" dur="3s" repeatCount="indefinite" />
              </circle>
            )}
            <rect
              x={wh.x - 60}
              y={wh.y - 38}
              width="120"
              height="76"
              rx="14"
              fill="rgba(8,13,24,0.96)"
              stroke="rgba(52,211,153,0.55)"
              strokeWidth="1.4"
            />
            <g transform={`translate(${wh.x - 11} ${wh.y - 22})`}>
              <Database size={22} className="text-accent-300" />
            </g>
            <text
              x={wh.x}
              y={wh.y + 10}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="13"
              fontWeight="800"
              fontFamily="var(--font-heading), ui-sans-serif, system-ui"
              letterSpacing="0.14em"
            >
              WAREHOUSE
            </text>
            <text
              x={wh.x}
              y={wh.y + 26}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
              fontWeight="700"
              letterSpacing="0.2em"
            >
              CLIENT-OWNED
            </text>
          </g>

          {/* App nodes (right) — labels render to the LEFT, inward */}
          {appNodes.map((a) => (
            <NodeChip key={`app-${a.label}`} x={a.x} y={a.y} label={a.label} Icon={a.icon} align="left" />
          ))}
        </svg>
      </div>

      {/* Bottom micro strip */}
      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/[0.05] pt-3 text-[0.56rem] uppercase tracking-[0.18em] text-slate-500 sm:text-[0.62rem]">
        <span>Daily sync</span>
        <span>KPI logic</span>
        <span>Client-owned</span>
      </div>
    </div>
  );
}

/* Reusable chip used for source + app nodes.
 * align="right" → label sits to the right of the chip (sources on left side)
 * align="left"  → label sits to the left  of the chip (apps on right side)
 * Either way the label ends up pointing INWARD toward the warehouse. */
function NodeChip({
  x,
  y,
  label,
  Icon,
  align,
}: {
  x: number;
  y: number;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  align: "left" | "right";
}) {
  const labelX = align === "right" ? x + 30 : x - 30;
  const anchor = align === "right" ? "start" : "end";
  return (
    <g>
      <circle cx={x} cy={y} r="32" fill="url(#chipGlow)" opacity="0.7" />
      <rect
        x={x - 22}
        y={y - 22}
        width="44"
        height="44"
        rx="12"
        fill="rgba(11,17,32,0.96)"
        stroke="rgba(52,211,153,0.45)"
        strokeWidth="1.2"
      />
      <g transform={`translate(${x - 11} ${y - 11})`}>
        <Icon size={22} className="text-accent-300" />
      </g>
      <text
        x={labelX}
        y={y + 5}
        textAnchor={anchor}
        fill="#cbd5e1"
        fontSize="13"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui"
        letterSpacing="0.04em"
      >
        {label}
      </text>
    </g>
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
