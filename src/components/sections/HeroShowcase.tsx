"use client";

import { useEffect, useState } from "react";
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
 *  left column — animated data pipeline schematic (SVG)
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
   Sources → Warehouse → Apps with traveling dots
   ════════════════════════════════════════════════════════════ */

function PipelineDiagram() {
  const reduceMotion = usePrefersReducedMotion();
  // Keep the diagram square-first so the same graphic works in hero crops and ad previews.
  const sources = [
    { x: 70, y: 100, label: "ERP", icon: Database },
    { x: 70, y: 210, label: "Sheets", icon: FileSpreadsheet },
    { x: 70, y: 320, label: "APIs", icon: Cloud },
  ];
  const warehouse = { x: 210, y: 210 };
  const apps = [
    { x: 350, y: 100, label: "Dashboards", icon: LayoutGrid },
    { x: 350, y: 210, label: "Reports", icon: BarChart3 },
    { x: 350, y: 320, label: "Alerts", icon: Bell },
  ];

  return (
    <div className="relative flex h-full flex-col">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-[0.62rem] uppercase tracking-[0.24em] text-accent-300/80">
            Data Pipeline
          </div>
          <div className="mt-1 font-heading text-[1.05rem] tracking-[-0.01em] text-slate-100 md:text-lg">
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

      <div className="relative mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/[0.04] bg-[radial-gradient(circle_at_50%_48%,rgba(52,211,153,0.12),transparent_32%),linear-gradient(180deg,rgba(8,13,24,0.2),rgba(8,13,24,0.72))]">
        <svg
          viewBox="0 0 420 420"
          className="h-full max-h-[430px] w-full max-w-[430px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Node glow */}
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.46" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>

            {/* Path gradient */}
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.12" />
              <stop offset="48%" stopColor="#34d399" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.46" />
            </linearGradient>

            {/* Traveling dot gradient */}
            <radialGradient id="dotGrad">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="30%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>

            {/* Grid pattern */}
            <pattern id="heroGrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect x="28" y="28" width="364" height="364" rx="24" fill="url(#heroGrid)" opacity="0.72" />
          <circle cx={warehouse.x} cy={warehouse.y} r="120" fill="url(#nodeGlow)" opacity="0.18" />

          {/* Source → Warehouse paths. Each lane lands on its own port to avoid tangled curves. */}
          {sources.map((s, i) => {
            const portY = warehouse.y + (i - 1) * 34;
            const d = connectorPath(s.x + 29, s.y, warehouse.x - 74, portY);
            return (
              <g key={`src-path-${i}`}>
                <path d={d} stroke="rgba(15,23,42,0.82)" strokeWidth="7" fill="none" />
                <path d={d} stroke="url(#pathGrad)" strokeWidth="2.1" fill="none" />
                <circle cx={warehouse.x - 74} cy={portY} r="3" fill="#34d399" opacity="0.75" />
                {!reduceMotion && (
                  <circle r="3.2" fill="url(#dotGrad)">
                    <animateMotion
                      dur={`${3.2 + i * 0.35}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.5}s`}
                      path={d}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Warehouse → Apps paths */}
          {apps.map((a, i) => {
            const portY = warehouse.y + (i - 1) * 34;
            const d = connectorPath(warehouse.x + 74, portY, a.x - 29, a.y);
            return (
              <g key={`app-path-${i}`}>
                <path d={d} stroke="rgba(15,23,42,0.82)" strokeWidth="7" fill="none" />
                <path d={d} stroke="url(#pathGrad)" strokeWidth="2.1" fill="none" />
                <circle cx={warehouse.x + 74} cy={portY} r="3" fill="#34d399" opacity="0.75" />
                {!reduceMotion && (
                  <circle r="3.2" fill="url(#dotGrad)">
                    <animateMotion
                      dur={`${3.4 + i * 0.35}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.65 + 1.15}s`}
                      path={d}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Source nodes */}
          {sources.map((s) => (
            <Node key={`src-${s.label}`} x={s.x} y={s.y} label={s.label} Icon={s.icon} align="left" />
          ))}

          {/* Warehouse node */}
          <g>
            <circle cx={warehouse.x} cy={warehouse.y} r="84" fill="none" stroke="rgba(52,211,153,0.12)" />
            <circle cx={warehouse.x} cy={warehouse.y} r="68" fill="url(#nodeGlow)" opacity="0.54" />
            <rect
              x={warehouse.x - 68}
              y={warehouse.y - 48}
              width="136"
              height="96"
              rx="18"
              fill="rgba(8,13,24,0.94)"
              stroke="rgba(52,211,153,0.48)"
              strokeWidth="1.5"
            />
            {/* pulse ring (skipped under reduced-motion) */}
            {!reduceMotion && (
              <circle
                cx={warehouse.x}
                cy={warehouse.y}
                r="70"
                fill="none"
                stroke="rgba(52,211,153,0.45)"
                strokeWidth="1"
              >
                <animate attributeName="r" from="70" to="98" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.55" to="0" dur="3s" repeatCount="indefinite" />
              </circle>
            )}

            <g transform={`translate(${warehouse.x - 12} ${warehouse.y - 28})`}>
              <Database size={24} className="text-accent-300" />
            </g>
            <text
              x={warehouse.x}
              y={warehouse.y + 15}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="15"
              fontWeight="700"
              fontFamily="var(--font-heading)"
              letterSpacing="0.08em"
            >
              WAREHOUSE
            </text>
            <text
              x={warehouse.x}
              y={warehouse.y + 34}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9.5"
              letterSpacing="0.16em"
            >
              CLIENT-OWNED
            </text>
          </g>

          {/* App nodes */}
          {apps.map((a) => (
            <Node key={`app-${a.label}`} x={a.x} y={a.y} label={a.label} Icon={a.icon} align="right" />
          ))}
        </svg>
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

function connectorPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(18, Math.min(58, Math.abs(x2 - x1) * 0.45));
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function Node({
  x,
  y,
  label,
  Icon,
}: {
  x: number;
  y: number;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  align: "left" | "right";
}) {
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
        x={x}
        y={y + 39}
        textAnchor="middle"
        fill="#cbd5e1"
        fontSize="9.5"
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
