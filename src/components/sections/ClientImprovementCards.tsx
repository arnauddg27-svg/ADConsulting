"use client";

import { CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentType } from "react";

import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const ACCENT = "#2f5368";
const ACCENT_GREEN = "#2f9e6f";

/* ── Animated icon 1: ticking clock (cycle time) ───────────────── */
function ClockIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="14" stroke={ACCENT} strokeWidth="2.4" />
      <circle cx="20" cy="20" r="1.8" fill={ACCENT} />
      {/* hour hand */}
      <motion.line
        x1="20"
        y1="20"
        x2="20"
        y2="13"
        stroke={ACCENT}
        strokeWidth="2.4"
        strokeLinecap="round"
        style={{ transformOrigin: "20px 20px" }}
        animate={animate ? { rotate: 360 } : undefined}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      />
      {/* minute hand */}
      <motion.line
        x1="20"
        y1="20"
        x2="27"
        y2="20"
        stroke={ACCENT_GREEN}
        strokeWidth="2.4"
        strokeLinecap="round"
        style={{ transformOrigin: "20px 20px" }}
        animate={animate ? { rotate: 360 } : undefined}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      />
    </svg>
  );
}

/* ── Animated icon 2: stacked coins bobbing (budget) ───────────── */
function CoinsIcon({ animate }: { animate: boolean }) {
  const coins = [
    { cy: 28, fill: false },
    { cy: 22, fill: false },
    { cy: 16, fill: true },
  ];
  return (
    <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" aria-hidden>
      {coins.map((coin, i) => (
        <motion.g
          key={i}
          animate={animate ? { y: [0, -2, 0] } : undefined}
          transition={{
            duration: 2.4,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.22,
          }}
        >
          <ellipse
            cx="20"
            cy={coin.cy}
            rx="12"
            ry="4.4"
            stroke={coin.fill ? ACCENT_GREEN : ACCENT}
            strokeWidth="2.4"
            fill={coin.fill ? "rgba(47,158,111,0.12)" : "none"}
          />
          {coin.fill && (
            <line
              x1="20"
              y1="12.4"
              x2="20"
              y2="19.6"
              stroke={ACCENT_GREEN}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          )}
        </motion.g>
      ))}
    </svg>
  );
}

/* ── Animated icon 3: house with a drawing-in sold check (inventory) */
function HouseIcon({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" aria-hidden>
      {/* roof + walls */}
      <path
        d="M8 19 L20 9 L32 19"
        stroke={ACCENT}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 17.5 V31 H29 V17.5"
        stroke={ACCENT}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* sold check that draws in on a loop */}
      <motion.path
        d="M16 24.5 L19 27.5 L25 21"
        stroke={ACCENT_GREEN}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={
          animate
            ? { pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }
            : { pathLength: 1, opacity: 1 }
        }
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          times: [0, 0.35, 0.8, 1],
        }}
      />
    </svg>
  );
}

interface ClientImprovementCardProps {
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  proof: string;
  Icon: ComponentType<{ animate: boolean }>;
  chart: ChartKind;
  focus: string[];
  className?: string;
}

const clientImprovementCards: ClientImprovementCardProps[] = [
  {
    title: "Cut cycle time",
    description:
      "Stalled stages and aging follow-ups flagged early so teams can move work faster.",
    metric: "15%",
    metricLabel: "Cycle gain",
    proof: "Top-200 builder environment",
    Icon: ClockIcon,
    chart: "line",
    focus: ["Stage visibility", "Owner follow-up"],
  },
  {
    title: "Hold the budget",
    description:
      "Cost-to-complete variance visible before closeout, while the job is still controllable.",
    metric: "$0",
    metricLabel: "Over budget",
    proof: "ERP + spreadsheet workflows",
    Icon: CoinsIcon,
    chart: "gauge",
    focus: ["Cost movement", "Variance flags"],
  },
  {
    title: "Move inventory faster",
    description:
      "Aging inventory and pricing follow-ups surfaced before homes sit too long.",
    metric: "20",
    metricLabel: "Fewer days on market",
    Icon: HouseIcon,
    proof: "Builder operations context",
    chart: "bars",
    focus: ["Inventory status", "Pricing follow-up"],
  },
];

const viewport = { once: true, amount: 0.6 } as const;

/* Chart 1: upward area + line that draws in (cut cycle time) */
function LineChart({ animate }: { animate: boolean }) {
  const line = "M2 42 L20 36 L38 38 L56 27 L74 20 L92 13 L116 5";
  const area = `${line} L116 46 L2 46 Z`;
  return (
    <svg viewBox="0 0 118 48" className="h-12 w-full" fill="none" aria-hidden>
      <defs>
        <linearGradient id="ci-line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5bbf98" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#5bbf98" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#ci-line-fill)"
        initial={animate ? { opacity: 0 } : false}
        whileInView={animate ? { opacity: 1 } : undefined}
        viewport={viewport}
        transition={{ duration: 0.6, delay: 0.5 }}
      />
      <motion.path
        d={line}
        stroke="#2f9e6f"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : false}
        whileInView={animate ? { pathLength: 1 } : undefined}
        viewport={viewport}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* Chart 2: semicircle gauge sweeping to near-full (hold the budget) */
function GaugeChart({ animate }: { animate: boolean }) {
  const arc = "M8 44 A38 38 0 0 1 110 44";
  return (
    <svg viewBox="0 0 118 50" className="h-12 w-full" fill="none" aria-hidden>
      <path d={arc} stroke="#dbe6ea" strokeWidth="7" strokeLinecap="round" />
      <motion.path
        d={arc}
        stroke="#2f9e6f"
        strokeWidth="7"
        strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : { pathLength: 0.94 }}
        whileInView={animate ? { pathLength: 0.94 } : undefined}
        viewport={viewport}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

/* Chart 3: descending bars that grow in with a stagger (move inventory faster) */
function DescendingBars({ animate }: { animate: boolean }) {
  const bars = [86, 76, 66, 55, 46, 38];
  return (
    <div className="flex h-12 items-end gap-1.5" aria-hidden>
      {bars.map((value, i) => (
        <motion.div
          key={i}
          className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-[#7fb8d3]/45 to-[#5bbf98]"
          style={{ height: `${value}%` }}
          initial={animate ? { scaleY: 0 } : false}
          whileInView={animate ? { scaleY: 1 } : undefined}
          viewport={viewport}
          transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

const CHARTS = {
  line: LineChart,
  gauge: GaugeChart,
  bars: DescendingBars,
} as const;

type ChartKind = keyof typeof CHARTS;

function ClientImprovementCard({
  title,
  description,
  metric,
  metricLabel,
  proof,
  Icon,
  chart,
  focus,
  className,
}: ClientImprovementCardProps) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;
  const Chart = CHARTS[chart];

  return (
    <article className={cn("h-full", className)}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#d7e0e5] bg-white p-6 shadow-[0_20px_60px_-50px_rgba(23,33,44,0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-[#9eb6c8]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7fb8d3] via-[#5bbf98] to-[#17212c] opacity-75"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d6e0e5] bg-[#f8fafc]">
              <Icon animate={animate} />
            </span>
            <span className="max-w-[8.5rem] text-[0.58rem] font-bold uppercase leading-tight tracking-[0.16em] text-[#66727a]">
              {proof}
            </span>
          </div>
          <span className="rounded-full border border-[#d7e0e5] bg-[#edf5f1] px-3 py-1 text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#285d47]">
            Outcome
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-heading text-[3.2rem] font-semibold leading-none tracking-[-0.06em] text-[#17212c]">
              {metric}
              <sup className="ml-1 align-super text-xl leading-none text-[#2f5368]">
                *
              </sup>
            </div>
            <div className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#2f5368]">
              {metricLabel}
            </div>
          </div>
          <div className="w-28 shrink-0">
            <Chart animate={animate} />
          </div>
        </div>

        <h3 className="mt-6 text-[1.25rem] font-bold leading-snug tracking-[-0.02em] text-[#17212c]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#58636b]">{description}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {focus.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dce4e8] bg-[#f7f9fb] px-3 py-1.5 text-xs font-semibold text-[#40515d]"
            >
              <CheckCircle2 size={13} className="text-[#4b9876]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ClientImprovementCards() {
  return (
    <section className="defer-section relative overflow-hidden border-b border-[#d9e1e6]/75 bg-transparent py-14 md:py-20">
      <Container className="relative z-10">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#2f5368]">
            Past expertise applied
          </p>
          <h2 className="mt-4 font-heading text-3xl leading-[1.05] tracking-[-0.03em] text-[#17212c] md:text-5xl">
            Prior builder work, clearer outcomes.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#58636b] md:text-lg">
            Operating signals dashboards make easier to review.
          </p>
        </div>

        <div className="grid auto-rows-fr items-stretch gap-5 lg:grid-cols-3">
          {clientImprovementCards.map((card) => (
            <ClientImprovementCard key={card.title} {...card} />
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-[#6b747b]">
          * Past client performance on some jobs may not reflect future
          performance.
        </p>
      </Container>
    </section>
  );
}
