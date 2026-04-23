"use client";

import { Database, FileSpreadsheet, Cloud, BarChart3, Bell, LayoutGrid, Activity, TrendingUp } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import TiltCard from "@/components/ui/TiltCard";

/**
 * The Hero "showcase" block:
 *  left column — animated data pipeline schematic (SVG)
 *  right column — live-looking dashboard mock (tickers, bars, sparkline)
 * Both tilt slightly toward cursor.
 */
export default function HeroShowcase() {
  return (
    <div className="reveal mt-16 grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
      {/* ── Pipeline diagram ── */}
      <TiltCard className="premium-panel relative overflow-hidden p-6 md:p-8" maxTilt={3}>
        <PipelineDiagram />
      </TiltCard>

      {/* ── Live dashboard panel ── */}
      <TiltCard className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[linear-gradient(180deg,rgba(11,17,32,0.9),rgba(7,11,19,0.95))] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]" maxTilt={4}>
        <BorderBeam size={140} duration={10} colorFrom="#34d399" colorTo="#22d3ee" />
        <LiveDashboardMock />
      </TiltCard>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PIPELINE DIAGRAM
   Sources → Warehouse → Apps with traveling dots
   ════════════════════════════════════════════════════════════ */

function PipelineDiagram() {
  // Node positions (viewBox 600 x 280)
  const sources = [
    { x: 40, y: 50, label: "ERP", icon: Database },
    { x: 40, y: 130, label: "Sheets", icon: FileSpreadsheet },
    { x: 40, y: 210, label: "APIs", icon: Cloud },
  ];
  const warehouse = { x: 280, y: 130 };
  const apps = [
    { x: 520, y: 50, label: "Dashboards", icon: LayoutGrid },
    { x: 520, y: 130, label: "Reports", icon: BarChart3 },
    { x: 520, y: 210, label: "Alerts", icon: Bell },
  ];

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[0.62rem] uppercase tracking-[0.24em] text-accent-300/80">
            Data Pipeline
          </div>
          <div className="mt-1 font-heading text-lg tracking-[-0.01em] text-slate-100">
            Sources → Warehouse → Apps
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-accent-400/25 bg-accent-500/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-accent-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
          </span>
          Live
        </div>
      </div>

      <svg
        viewBox="0 0 600 280"
        className="h-auto w-full"
        style={{ maxHeight: 340 }}
      >
        <defs>
          {/* Node glow */}
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>

          {/* Path gradient */}
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
          </linearGradient>

          {/* Traveling dot gradient */}
          <radialGradient id="dotGrad">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#34d399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>

          {/* Grid pattern */}
          <pattern id="heroGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background grid */}
        <rect width="600" height="280" fill="url(#heroGrid)" />

        {/* Source → Warehouse paths */}
        {sources.map((s, i) => {
          const d = curvePath(s.x + 40, s.y, warehouse.x - 40, warehouse.y);
          return (
            <g key={`src-path-${i}`}>
              <path d={d} stroke="url(#pathGrad)" strokeWidth="1.5" fill="none" />
              <circle r="3" fill="url(#dotGrad)">
                <animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.6}s`} path={d} />
              </circle>
            </g>
          );
        })}

        {/* Warehouse → Apps paths */}
        {apps.map((a, i) => {
          const d = curvePath(warehouse.x + 40, warehouse.y, a.x - 40, a.y);
          return (
            <g key={`app-path-${i}`}>
              <path d={d} stroke="url(#pathGrad)" strokeWidth="1.5" fill="none" />
              <circle r="3" fill="url(#dotGrad)">
                <animateMotion dur={`${3.2 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.8 + 1.5}s`} path={d} />
              </circle>
            </g>
          );
        })}

        {/* Source nodes */}
        {sources.map((s) => (
          <Node key={`src-${s.label}`} x={s.x} y={s.y} label={s.label} Icon={s.icon} align="left" />
        ))}

        {/* Warehouse node (bigger) */}
        <g>
          <circle cx={warehouse.x} cy={warehouse.y} r="70" fill="url(#nodeGlow)" opacity="0.6" />
          <rect
            x={warehouse.x - 54}
            y={warehouse.y - 36}
            width="108"
            height="72"
            rx="14"
            fill="rgba(10,15,26,0.9)"
            stroke="rgba(52,211,153,0.4)"
            strokeWidth="1.5"
          />
          {/* pulse ring */}
          <circle
            cx={warehouse.x}
            cy={warehouse.y}
            r="56"
            fill="none"
            stroke="rgba(52,211,153,0.5)"
            strokeWidth="1"
          >
            <animate attributeName="r" from="56" to="78" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="3s" repeatCount="indefinite" />
          </circle>

          <g transform={`translate(${warehouse.x - 9} ${warehouse.y - 18})`}>
            <Database size={18} className="text-accent-300" />
          </g>
          <text
            x={warehouse.x}
            y={warehouse.y + 16}
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-heading)"
            letterSpacing="0.08em"
          >
            WAREHOUSE
          </text>
          <text
            x={warehouse.x}
            y={warehouse.y + 30}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="8"
            letterSpacing="0.16em"
          >
            BIGQUERY · SNOWFLAKE
          </text>
        </g>

        {/* App nodes */}
        {apps.map((a) => (
          <Node key={`app-${a.label}`} x={a.x} y={a.y} label={a.label} Icon={a.icon} align="right" />
        ))}
      </svg>

      {/* bottom micro info */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.66rem] uppercase tracking-[0.2em] text-slate-500">
        <span>Daily sync · 5:47 AM</span>
        <span>KPI logic · once</span>
        <span>All datasets · client-owned</span>
      </div>
    </div>
  );
}

function curvePath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function Node({
  x,
  y,
  label,
  Icon,
  align,
}: {
  x: number;
  y: number;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  align: "left" | "right";
}) {
  const labelX = align === "left" ? x - 42 : x + 42;
  const anchor = align === "left" ? "end" : "start";

  return (
    <g>
      {/* halo */}
      <circle cx={x} cy={y} r="28" fill="url(#nodeGlow)" opacity="0.45" />
      {/* chip */}
      <rect
        x={x - 18}
        y={y - 18}
        width="36"
        height="36"
        rx="10"
        fill="rgba(11,17,32,0.95)"
        stroke="rgba(52,211,153,0.35)"
        strokeWidth="1.2"
      />
      <g transform={`translate(${x - 9} ${y - 9})`}>
        <Icon size={18} className="text-accent-300" />
      </g>
      <text
        x={labelX}
        y={y + 4}
        textAnchor={anchor}
        fill="#cbd5e1"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.08em"
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
  return (
    <div className="relative p-5 md:p-6">
      {/* Window chrome */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="font-space-grotesk text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">
          builder.ops · dashboard
        </div>
        <div className="flex h-4 w-4 items-center justify-center">
          <Activity size={11} className="text-accent-400" />
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[0.6rem] uppercase tracking-[0.22em] text-slate-500">
            Operating Overview
          </div>
          <div className="mt-0.5 font-heading text-[0.95rem] text-slate-100">
            Today · March 25
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/25 bg-accent-500/10 px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-accent-200">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "Active Jobs", value: 142, prefix: "", suffix: "", tone: "text-slate-50" },
          { label: "On-Time", value: 87, prefix: "", suffix: "%", tone: "text-accent-300" },
          { label: "Avg Completion", value: 57, prefix: "", suffix: "%", tone: "text-cyan-400" },
          { label: "WIP", value: 39.6, prefix: "$", suffix: "M", tone: "text-slate-50", decimals: 1 },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
          >
            <div className="text-[0.54rem] uppercase tracking-[0.2em] text-slate-500">
              {kpi.label}
            </div>
            <div className={`mt-1.5 font-heading text-xl tabular-nums ${kpi.tone}`}>
              {kpi.prefix}
              <NumberTicker
                value={kpi.value}
                decimalPlaces={kpi.decimals ?? 0}
                delay={0.2}
                className="inline-block"
              />
              {kpi.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* Bars — communities */}
      <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[0.54rem] uppercase tracking-[0.2em] text-slate-500">
            By Community
          </div>
          <TrendingUp size={10} className="text-accent-400" />
        </div>
        <div className="space-y-2">
          {[
            { name: "Sunshine Ridge", pct: 92 },
            { name: "Lake Nona Shores", pct: 76 },
            { name: "Emerald Bay", pct: 64 },
            { name: "Cypress Landing", pct: 48 },
          ].map((c, i) => (
            <div key={c.name}>
              <div className="flex justify-between text-[0.58rem]">
                <span className="text-slate-300">{c.name}</span>
                <span className="tabular-nums text-slate-500">{c.pct}%</span>
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

      <style jsx>{`
        @keyframes bar-fill {
          from { width: 0%; }
        }
      `}</style>
    </div>
  );
}
