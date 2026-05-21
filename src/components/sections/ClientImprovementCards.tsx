"use client";

import { CheckCircle2 } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useId, useRef, type ComponentType, type ReactNode } from "react";

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
    metricLabel: "Cycle time reduction",
    proof: "Top-200 builder environment",
    Icon: ClockIcon,
    chart: "area",
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
    chart: "donut",
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

const GREEN = "#2f9e6f";

function ChartFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-[#e1e9ed] bg-[linear-gradient(180deg,#fbfdfe,#f3f8fa)] px-4 py-3">
      {children}
    </div>
  );
}

/* Chart 1: smooth downward area sparkline = cycle time getting shorter
   (cut cycle time). Endpoint dot sits at the low/right end. */
function AreaChart({ play, reduce, id }: { play: boolean; reduce: boolean; id: string }) {
  const line =
    "M4 12 C 44 16 64 20 104 28 C 150 37 178 47 224 54 C 262 60 286 66 316 70";
  const area = `${line} L316 76 L4 76 Z`;
  return (
    <ChartFrame>
      <svg
        viewBox="0 0 320 80"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity="0.26" />
            <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 40, 60].map((y) => (
          <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#000" strokeOpacity="0.04" strokeWidth="1" />
        ))}
        <motion.path
          d={area}
          fill={`url(#${id}-fill)`}
          initial={reduce ? false : { opacity: 0 }}
          animate={play || reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: reduce ? 0 : 0.45 }}
        />
        <motion.path
          d={line}
          stroke={GREEN}
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={play || reduce ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut", delay: reduce ? 0 : 0.1 }}
        />
      </svg>
      <motion.span
        className="absolute bottom-3.5 right-4 h-2.5 w-2.5 rounded-full bg-[#2f9e6f] ring-4 ring-[#2f9e6f]/15"
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        animate={play || reduce ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ delay: reduce ? 0 : 1, type: "spring", stiffness: 300, damping: 18 }}
      />
    </ChartFrame>
  );
}

/* Chart 2: full donut ring sweeping to complete, with a center check (hold the budget) */
function DonutChart({ play, reduce }: { play: boolean; reduce: boolean; id: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <ChartFrame>
      <div className="flex h-full items-center gap-4">
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle cx="40" cy="40" r={r} fill="none" stroke="#dbe6ea" strokeWidth="8" />
            <motion.circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={GREEN}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={reduce ? false : { strokeDashoffset: c }}
              animate={play || reduce ? { strokeDashoffset: 0 } : { strokeDashoffset: c }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-[#2f9e6f]" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-[#17212c]">
            On budget
          </p>
          <p className="mt-0.5 text-xs leading-4 text-[#66727a]">
            Variance held to plan
          </p>
        </div>
      </div>
    </ChartFrame>
  );
}

/* Chart 3: clean descending bars that grow in with a stagger (move inventory faster) */
function BarsChart({ play, reduce }: { play: boolean; reduce: boolean; id: string }) {
  const bars = [92, 80, 70, 58, 48, 38];
  return (
    <ChartFrame>
      <div className="flex h-full items-end gap-2">
        {bars.map((value, i) => (
          <motion.div
            key={i}
            className="flex-1 origin-bottom rounded-md bg-gradient-to-t from-[#7fb8d3] to-[#5bbf98]"
            style={{ height: `${value}%` }}
            initial={reduce ? false : { scaleY: 0 }}
            animate={play || reduce ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.07, ease: "easeOut" }}
          />
        ))}
      </div>
    </ChartFrame>
  );
}

const CHARTS = {
  area: AreaChart,
  donut: DonutChart,
  bars: BarsChart,
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
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const Chart = CHARTS[chart];
  const rawId = useId();
  const chartId = `ci-${rawId.replace(/:/g, "")}`;

  return (
    <article ref={ref} className={cn("h-full", className)}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#d4dee4] bg-gradient-to-br from-white/96 via-white/90 to-[#eef4f7]/82 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.92),0_2px_4px_-2px_rgba(23,33,44,0.06),0_28px_64px_-46px_rgba(23,33,44,0.42)] backdrop-blur-xl backdrop-saturate-[140%] transition duration-300 hover:-translate-y-0.5 hover:border-[#c6d3da] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.96),0_30px_72px_-44px_rgba(23,33,44,0.5)]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7fb8d3] via-[#5bbf98] to-[#17212c] opacity-75"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d6e0e5] bg-[#f8fafc]">
              <Icon animate={inView && !reduceMotion} />
            </span>
            <span className="max-w-[8.5rem] text-[0.58rem] font-bold uppercase leading-tight tracking-[0.16em] text-[#66727a]">
              {proof}
            </span>
          </div>
          <span className="rounded-full border border-[#d7e0e5] bg-[#edf5f1] px-3 py-1 text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#285d47]">
            Outcome
          </span>
        </div>

        <div className="mt-6 flex items-baseline gap-3">
          <div className="font-heading text-[3.2rem] font-semibold leading-none tracking-[-0.06em] text-[#17212c]">
            {metric}
            <sup className="ml-1 align-super text-xl leading-none text-[#2f5368]">
              *
            </sup>
          </div>
          <div className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#2f5368]">
            {metricLabel}
          </div>
        </div>

        <div className="mt-5">
          <Chart play={inView} reduce={!!reduceMotion} id={chartId} />
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
    <section className="relative overflow-hidden border-b border-[#d9e1e6]/75 bg-transparent py-14 md:py-20">
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
