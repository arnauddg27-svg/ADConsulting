"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  CircleDollarSign,
  Clock3,
  Home,
  LayoutDashboard,
  Percent,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  type MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import Container from "@/components/ui/Container";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { cn } from "@/lib/utils";

type Kpi = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  note: string;
  icon: LucideIcon;
  tone?: "good" | "neutral" | "warn";
};

// Eight exec metrics across the pillars the dashboard tracks: schedule,
// milestone progress, budget, and margin. The first four render on mobile
// (a clean 2x2); the rest are desktop-only context.
const tabletKpis: Kpi[] = [
  {
    label: "Avg cycle time",
    value: 4.9,
    decimals: 1,
    suffix: " mo",
    note: "vs 5.5 mo target",
    icon: Clock3,
    tone: "good",
  },
  {
    label: "Avg completion",
    value: 71,
    suffix: "%",
    note: "138 active jobs",
    icon: BarChart3,
    tone: "neutral",
  },
  {
    label: "Budget variance",
    value: 310,
    prefix: "$",
    suffix: "K",
    note: "under budget",
    icon: CircleDollarSign,
    tone: "good",
  },
  {
    label: "Avg margin",
    value: 24.6,
    decimals: 1,
    suffix: "%",
    note: "gross at closeout",
    icon: Percent,
    tone: "good",
  },
  {
    label: "On-time starts",
    value: 92,
    suffix: "%",
    note: "starts hit schedule",
    icon: CalendarCheck,
    tone: "good",
  },
  {
    label: "At-risk jobs",
    value: 11,
    note: "behind plan",
    icon: TriangleAlert,
    tone: "warn",
  },
  {
    label: "Active jobs",
    value: 138,
    note: "across 8 communities",
    icon: LayoutDashboard,
    tone: "neutral",
  },
  {
    label: "Closings QTD",
    value: 27,
    note: "this quarter",
    icon: Home,
    tone: "neutral",
  },
];

// Milestone progress: active jobs by construction stage (sums to 138).
// Stage colors follow the real sample-dashboard teal -> blue ramp.
const milestoneStages = [
  { label: "Permit", value: 9, color: "#0f766e" },
  { label: "Foundation", value: 17, color: "#0d9488" },
  { label: "Framing", value: 31, color: "#14b8a6" },
  { label: "MEP / Drywall", value: 34, color: "#22d3ee" },
  { label: "Finishes", value: 28, color: "#3b82f6" },
  { label: "Closing", value: 19, color: "#1e40af" },
];
const stageMax = Math.max(...milestoneStages.map((s) => s.value));

// Cycle-time tracking: avg days-to-complete by quarter, trending toward goal.
const cycleTrend = [177, 170, 163, 156, 152, 149];
const CYCLE_GOAL = 167;
const cycleDrop = cycleTrend[0] - cycleTrend[cycleTrend.length - 1];

// Budget tracking per job — flagged variance vs budget.
const budgetByJob = [
  { job: "Lot 184", community: "Sunshine Ridge", variance: "$6K", over: false },
  { job: "Lot 231", community: "Emerald Bay", variance: "$14K", over: true },
  { job: "Lot 097", community: "Palm Coast", variance: "$2K", over: false },
];

// — Interactive demo tabs: each tab is a different operating view, all sample data. —
const DEMO_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", icon: CalendarCheck },
  { id: "budget", label: "Budget", icon: CircleDollarSign },
  { id: "sales", label: "Sales", icon: Home },
] as const;
type DemoTabId = (typeof DEMO_TABS)[number]["id"];

const atRiskJobs = [
  { job: "Lot 118", community: "Sunshine Ridge", behind: "9d behind", stage: "Framing" },
  { job: "Lot 052", community: "Emerald Bay", behind: "6d behind", stage: "MEP / Drywall" },
  { job: "Lot 203", community: "Palm Coast", behind: "5d behind", stage: "Finishes" },
  { job: "Lot 091", community: "Cypress Creek", behind: "3d behind", stage: "Closing" },
];

const costByCategory = [
  { label: "Sitework", delta: "+$38K", over: true, pct: 62 },
  { label: "Framing", delta: "+$21K", over: true, pct: 41 },
  { label: "MEP", delta: "−$12K", over: false, pct: 24 },
  { label: "Finishes", delta: "−$54K", over: false, pct: 78 },
];

const budgetKpis: Kpi[] = [
  {
    label: "Budget variance",
    value: 310,
    prefix: "$",
    suffix: "K",
    note: "under budget",
    icon: CircleDollarSign,
    tone: "good",
  },
  {
    label: "Avg margin",
    value: 24.6,
    decimals: 1,
    suffix: "%",
    note: "gross at closeout",
    icon: Percent,
    tone: "good",
  },
  {
    label: "Jobs flagged",
    value: 3,
    note: "of 138 tracked",
    icon: TriangleAlert,
    tone: "warn",
  },
  {
    label: "Change orders",
    value: 12,
    note: "open this month",
    icon: BarChart3,
    tone: "neutral",
  },
];

const salesKpis: Kpi[] = [
  {
    label: "Closings QTD",
    value: 27,
    note: "vs 24 plan",
    icon: Home,
    tone: "good",
  },
  {
    label: "Avg days on market",
    value: 34,
    note: "down 20 days",
    icon: Clock3,
    tone: "good",
  },
  {
    label: "Backlog",
    value: 61,
    note: "homes under contract",
    icon: BarChart3,
    tone: "neutral",
  },
  {
    label: "Absorption",
    value: 2.4,
    decimals: 1,
    suffix: "/mo",
    note: "per community",
    icon: Percent,
    tone: "neutral",
  },
];

const inventoryAging = [
  { label: "0–30 days", value: 14, color: "#14b8a6" },
  { label: "31–60 days", value: 9, color: "#22d3ee" },
  { label: "61–90 days", value: 5, color: "#3b82f6" },
  { label: "90+ days", value: 3, color: "#f2c66d" },
];
const inventoryMax = Math.max(...inventoryAging.map((r) => r.value));

function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  run,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  run: boolean;
}) {
  const reduce = useReducedMotion();
  // Initialize at the real value so server-rendered HTML (crawlers, no-JS,
  // pre-hydration paints) shows real numbers instead of zeros; the count-up
  // still plays from 0 once the card scrolls into view.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [run, value, reduce]);

  return (
    <span>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: ReactNode;
  children: (revealed: boolean) => ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Track the card across the whole time it's on screen (enters from the
  // bottom -> leaves at the top) so there's a long, smooth scroll range.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  // Spring-smooth the raw progress for buttery motion instead of step-by-step.
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  // Bring the dashboard data "alive" as the card tilts into view.
  useMotionValueEvent(progress, "change", (v) => {
    if (v > 0.4) setRevealed(true);
  });
  useEffect(() => {
    if (shouldReduceMotion) {
      setRevealed(true);
      return;
    }
    // Fallback so the data always animates in even if scroll events are sparse.
    const t = setTimeout(() => setRevealed(true), 1600);
    return () => clearTimeout(t);
  }, [shouldReduceMotion]);

  // Tilt + scale ease from "entering" (progress ~0.12) to "centered"
  // (progress ~0.55), then hold flat (useTransform clamps past the range).
  const rotate = useTransform(
    progress,
    [0.12, 0.55],
    shouldReduceMotion ? [0, 0] : [22, 0],
  );
  const scale = useTransform(
    progress,
    [0.12, 0.55],
    shouldReduceMotion ? [1, 1] : isMobile ? [0.86, 1] : [0.92, 1],
  );
  const translate = useTransform(
    progress,
    [0.12, 0.6],
    shouldReduceMotion ? [0, 0] : [60, -10],
  );

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[42rem] items-center justify-center px-2 py-8 md:min-h-[56rem] md:px-8 md:py-16"
    >
      <div className="relative w-full" style={{ perspective: "1000px" }}>
        <motion.div
          style={{ translateY: translate }}
          className="mx-auto max-w-4xl text-center"
        >
          {titleComponent}
        </motion.div>
        <TabletCard rotate={rotate} scale={scale}>
          {children(revealed)}
        </TabletCard>
      </div>
    </div>
  );
}

function TabletCard({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: ReactNode;
}) {
  return (
    <motion.div
      data-ipad-card
      style={{
        rotateX: rotate,
        scale,
        willChange: "transform",
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="relative mt-8 mx-auto h-[34rem] md:h-[40rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-2 shadow-2xl md:p-5"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#07111b]">
        {children}
      </div>
    </motion.div>
  );
}

function KpiTile({
  kpi,
  index,
  revealed,
  className,
}: {
  kpi: Kpi;
  index: number;
  revealed: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const Icon = kpi.icon;
  const tone = kpi.tone ?? "neutral";
  const toneIcon =
    tone === "good"
      ? "border-[#24c18d]/25 bg-[#24c18d]/10 text-[#8df2c8]"
      : tone === "warn"
        ? "border-[#f2c66d]/30 bg-[#f2c66d]/12 text-[#f4cf83]"
        : "border-[#8bd7ff]/20 bg-[#8bd7ff]/10 text-[#8bd7ff]";
  const toneNote =
    tone === "good"
      ? "text-[#8df2c8]/80"
      : tone === "warn"
        ? "text-[#f4cf83]/85"
        : "text-white/[0.6]";

  return (
    <motion.div
      // Tiles stay visible (dimmed) before the scroll reveal — an opacity-0
      // start left half the tablet looking like an empty black screen.
      initial={reduce ? false : { opacity: 0.55, y: 10 }}
      animate={
        revealed || reduce ? { opacity: 1, y: 0 } : { opacity: 0.55, y: 10 }
      }
      transition={{
        duration: 0.5,
        delay: reduce ? 0 : 0.05 + index * 0.07,
        ease: "easeOut",
      }}
      className={cn(
        "flex flex-col justify-between rounded-xl border border-white/[0.12] bg-[#101b27] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:p-3.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.5rem] font-bold uppercase leading-tight tracking-[0.16em] text-white/[0.58]">
          {kpi.label}
        </p>
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border",
            toneIcon,
          )}
        >
          <Icon size={13} />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold leading-none text-white tabular-nums">
        <CountUp
          value={kpi.value}
          prefix={kpi.prefix}
          suffix={kpi.suffix}
          decimals={kpi.decimals}
          run={revealed}
        />
      </div>
      <p
        className={cn(
          "mt-1 text-[0.68rem] font-semibold leading-tight",
          toneNote,
        )}
      >
        {kpi.note}
      </p>
    </motion.div>
  );
}

function MilestoneBars({
  revealed,
  compact = false,
}: {
  revealed: boolean;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-white/10 bg-[#0d1620]",
        compact ? "h-full p-3.5" : "p-4 md:p-5",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-white/[0.55] md:text-[0.56rem]">
            Construction milestones
          </p>
          <h4 className="mt-1 text-sm font-bold md:text-lg">
            Active jobs by stage
          </h4>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.14em] text-white/[0.58] md:px-3 md:text-[0.55rem] md:tracking-[0.16em]">
          71% avg
        </span>
      </div>

      <div
        className={cn(
          "grid",
          compact
            ? "mt-3 flex-1 grid-cols-2 content-between gap-x-4 gap-y-2.5"
            : "mt-4 gap-x-5 gap-y-2.5 md:grid-cols-2",
        )}
      >
        {milestoneStages.map((stage, i) => {
          const pct = (stage.value / stageMax) * 100;
          return (
            <div key={stage.label}>
              <div
                className={cn(
                  "flex items-center justify-between",
                  compact ? "text-[0.7rem]" : "text-xs md:text-sm",
                )}
              >
                <span className="flex items-center gap-1.5 font-bold text-white/[0.88]">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ background: stage.color }}
                  />
                  {stage.label}
                </span>
                <span className="text-white/[0.58]">{stage.value} jobs</span>
              </div>
              <div className="mt-1.5 h-2.5 rounded-full bg-white/[0.1]">
                <motion.div
                  className="h-2.5 rounded-full"
                  style={{
                    background: stage.color,
                    boxShadow: `0 0 10px ${stage.color}55`,
                  }}
                  // Partially filled before the reveal so the panel never
                  // reads as empty, then grows to the real value.
                  initial={reduce ? false : { width: `${pct * 0.3}%` }}
                  animate={{
                    width: revealed || reduce ? `${pct}%` : `${pct * 0.3}%`,
                  }}
                  transition={{
                    duration: 0.9,
                    delay: reduce ? 0 : 0.2 + i * 0.08,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(
      `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
    );
  }
  return d.join(" ");
}

function CycleTrend({ revealed }: { revealed: boolean }) {
  const reduce = useReducedMotion();
  const n = cycleTrend.length;
  const W = 200;
  const H = 60;
  const padX = 6;
  const top = 8;
  const bot = 54;
  const minV = 143;
  const maxV = 181;
  const x = (i: number) => padX + (i / (n - 1)) * (W - padX * 2);
  const y = (v: number) => bot - ((v - minV) / (maxV - minV)) * (bot - top);
  const pts = cycleTrend.map((d, i) => ({ x: x(i), y: y(d) }));
  const last = pts[n - 1];
  const line = smoothPath(pts);
  const area = `${line} L ${last.x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;
  const goalPct = (y(CYCLE_GOAL) / H) * 100;
  const lastLeftPct = (last.x / W) * 100;
  const lastTopPct = (last.y / H) * 100;

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1620] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.2em] text-white/[0.55]">
            Cycle time
          </p>
          <h4 className="mt-1 text-sm font-bold md:text-base">
            Avg days to complete
          </h4>
        </div>
        <span className="rounded-full border border-[#24c18d]/30 bg-[#24c18d]/10 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#8df2c8]">
          ▼ {cycleDrop}d
        </span>
      </div>

      <div className="relative mt-3 flex-1">
        {/* target / goal line */}
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#8bd7ff]/35"
          style={{ top: `${goalPct}%` }}
        />
        <span
          className="pointer-events-none absolute right-0 -translate-y-1/2 rounded bg-[#0d1620] px-1 text-[0.46rem] font-bold uppercase tracking-[0.12em] text-[#8bd7ff]/55"
          style={{ top: `${goalPct}%` }}
        >
          Target
        </span>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="cycle-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#24c18d" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#24c18d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill="url(#cycle-fill)"
            initial={reduce ? false : { opacity: 0.35 }}
            animate={{ opacity: revealed || reduce ? 1 : 0.35 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.55 }}
          />
          <motion.path
            d={line}
            stroke="#24c18d"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 2px 6px rgba(36,193,141,0.45))" }}
            // Partially drawn pre-reveal so the panel never reads as empty.
            initial={reduce ? false : { pathLength: 0.45 }}
            animate={{ pathLength: revealed || reduce ? 1 : 0.45 }}
            transition={{ duration: 1.1, ease: "easeInOut", delay: reduce ? 0 : 0.3 }}
          />
        </svg>

        {/* current value marker (sits below target = good) */}
        <motion.span
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#24c18d] shadow-[0_0_12px_rgba(36,193,141,0.85)] ring-4 ring-[#24c18d]/20"
          style={{ left: `${lastLeftPct}%`, top: `${lastTopPct}%` }}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={
            revealed || reduce
              ? { scale: 1, opacity: 1 }
              : { scale: 0, opacity: 0 }
          }
          transition={{
            delay: reduce ? 0 : 1.2,
            type: "spring",
            stiffness: 320,
            damping: 18,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[0.6rem] font-semibold text-white/[0.58]">
        <span>
          <span className="text-[#8df2c8]">149d now</span> · 4.9 mo
        </span>
        <span>target {CYCLE_GOAL}d</span>
      </div>
    </div>
  );
}

function BudgetPanel({ revealed }: { revealed: boolean }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1620] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.2em] text-white/[0.55]">
            Budget tracking
          </p>
          <h4 className="mt-1 text-sm font-bold md:text-base">Variance by job</h4>
        </div>
        <span className="rounded-full border border-[#24c18d]/30 bg-[#24c18d]/10 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#8df2c8]">
          ▼ $310K total
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col divide-y divide-white/[0.07]">
        {budgetByJob.map((row, i) => (
          <motion.div
            key={row.job}
            className="flex items-center justify-between gap-3 py-1.5"
            initial={reduce ? false : { opacity: 0.5, y: 5 }}
            animate={
              revealed || reduce ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 5 }
            }
            transition={{
              duration: 0.45,
              delay: reduce ? 0 : 0.4 + i * 0.12,
              ease: "easeOut",
            }}
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-white/[0.84] md:text-sm">
                {row.job}
              </div>
              <div className="mt-0.5 text-[0.5rem] font-bold uppercase tracking-[0.16em] text-[#8df2c8]">
                {row.community}
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[0.56rem] font-bold",
                row.over
                  ? "border-[#f2c66d]/35 bg-[#f2c66d]/10 text-[#f2c66d]"
                  : "border-[#24c18d]/35 bg-[#24c18d]/10 text-[#8df2c8]",
              )}
            >
              {row.over ? "▲" : "▼"} {row.variance} {row.over ? "over" : "under"}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-white/[0.07] pt-2 text-[0.58rem] font-semibold text-white/[0.58]">
        <span>3 of 138 flagged</span>
        <span>24.6% avg margin</span>
      </div>
    </div>
  );
}

function AtRiskPanel({ revealed }: { revealed: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1620] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.2em] text-white/[0.55]">
            Schedule risk
          </p>
          <h4 className="mt-1 text-sm font-bold md:text-base">
            Jobs behind plan
          </h4>
        </div>
        <span className="rounded-full border border-[#f2c66d]/35 bg-[#f2c66d]/10 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#f4cf83]">
          11 at risk
        </span>
      </div>
      <div className="mt-3 flex flex-1 flex-col divide-y divide-white/[0.07]">
        {atRiskJobs.map((row, i) => (
          <motion.div
            key={row.job}
            className="flex items-center justify-between gap-3 py-2"
            initial={reduce ? false : { opacity: 0.5, y: 5 }}
            animate={
              revealed || reduce ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 5 }
            }
            transition={{
              duration: 0.4,
              delay: reduce ? 0 : 0.12 + i * 0.08,
              ease: "easeOut",
            }}
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-white/[0.84] md:text-sm">
                {row.job}
              </div>
              <div className="mt-0.5 text-[0.5rem] font-bold uppercase tracking-[0.16em] text-[#8df2c8]">
                {row.community}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[0.54rem] font-semibold text-white/[0.6] md:inline">
                {row.stage}
              </span>
              <span className="rounded-full border border-[#f2c66d]/35 bg-[#f2c66d]/10 px-2 py-0.5 text-[0.56rem] font-bold text-[#f2c66d]">
                ▲ {row.behind}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-white/[0.07] pt-2 text-[0.58rem] font-semibold text-white/[0.58]">
        <span>Owner + next action on each job</span>
        <span>4 of 11 shown</span>
      </div>
    </div>
  );
}

function CostCategoryPanel({ revealed }: { revealed: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1620] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.2em] text-white/[0.55]">
            Cost movement
          </p>
          <h4 className="mt-1 text-sm font-bold md:text-base">
            Variance by category
          </h4>
        </div>
        <span className="rounded-full border border-[#24c18d]/30 bg-[#24c18d]/10 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#8df2c8]">
          ▼ net under
        </span>
      </div>
      <div className="mt-3 space-y-2.5">
        {costByCategory.map((row, i) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="font-bold text-white/[0.88]">{row.label}</span>
              <span
                className={cn(
                  "font-bold",
                  row.over ? "text-[#f2c66d]" : "text-[#8df2c8]",
                )}
              >
                {row.delta}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-white/[0.1]">
              <motion.div
                className="h-2.5 rounded-full"
                style={{
                  background: row.over ? "#f2c66d" : "#24c18d",
                  boxShadow: `0 0 10px ${row.over ? "#f2c66d" : "#24c18d"}55`,
                }}
                initial={reduce ? false : { width: `${row.pct * 0.3}%` }}
                animate={{
                  width: revealed || reduce ? `${row.pct}%` : `${row.pct * 0.3}%`,
                }}
                transition={{
                  duration: 0.8,
                  delay: reduce ? 0 : 0.15 + i * 0.08,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2 text-[0.58rem] font-semibold text-white/[0.58]">
        <span>vs current budget, this month</span>
        <span>$310K net under</span>
      </div>
    </div>
  );
}

function InventoryAgingPanel({ revealed }: { revealed: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0d1620] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.2em] text-white/[0.55]">
            Inventory aging
          </p>
          <h4 className="mt-1 text-sm font-bold md:text-base">
            Unsold homes by age
          </h4>
        </div>
        <span className="rounded-full border border-[#f2c66d]/35 bg-[#f2c66d]/10 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#f4cf83]">
          3 over 90d
        </span>
      </div>
      <div className="mt-3 space-y-2.5">
        {inventoryAging.map((row, i) => {
          const pct = (row.value / inventoryMax) * 100;
          return (
            <div key={row.label}>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="flex items-center gap-1.5 font-bold text-white/[0.88]">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ background: row.color }}
                  />
                  {row.label}
                </span>
                <span className="text-white/[0.58]">{row.value} homes</span>
              </div>
              <div className="mt-1.5 h-2.5 rounded-full bg-white/[0.1]">
                <motion.div
                  className="h-2.5 rounded-full"
                  style={{
                    background: row.color,
                    boxShadow: `0 0 10px ${row.color}55`,
                  }}
                  initial={reduce ? false : { width: `${pct * 0.3}%` }}
                  animate={{
                    width: revealed || reduce ? `${pct}%` : `${pct * 0.3}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: reduce ? 0 : 0.15 + i * 0.08,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2 text-[0.58rem] font-semibold text-white/[0.58]">
        <span>31 unsold homes</span>
        <span>aging flags on 90d+</span>
      </div>
    </div>
  );
}

function ScheduleTab({ revealed }: { revealed: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:grid md:grid-cols-[1.12fr_0.88fr] md:gap-4 md:p-4">
      <div className="flex min-h-0 flex-col gap-3 md:gap-4">
        <MilestoneBars revealed={revealed} />
        <div className="hidden min-h-0 flex-1 flex-col md:flex">
          <CycleTrend revealed={revealed} />
        </div>
      </div>
      <AtRiskPanel revealed={revealed} />
    </div>
  );
}

function BudgetTab({ revealed }: { revealed: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:grid md:grid-cols-[0.92fr_1.08fr] md:gap-4 md:p-4">
      <div className="grid auto-rows-min grid-cols-2 gap-2.5 md:h-full md:auto-rows-fr md:gap-3">
        {budgetKpis.map((kpi, i) => (
          <KpiTile key={kpi.label} kpi={kpi} index={i} revealed={revealed} />
        ))}
      </div>
      <div className="flex min-h-0 flex-col gap-3 md:gap-4">
        <CostCategoryPanel revealed={revealed} />
        <div className="hidden min-h-0 flex-1 flex-col md:flex">
          <BudgetPanel revealed={revealed} />
        </div>
      </div>
    </div>
  );
}

function SalesTab({ revealed }: { revealed: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:grid md:grid-cols-[0.92fr_1.08fr] md:gap-4 md:p-4">
      <div className="grid auto-rows-min grid-cols-2 gap-2.5 md:h-full md:auto-rows-fr md:gap-3">
        {salesKpis.map((kpi, i) => (
          <KpiTile key={kpi.label} kpi={kpi} index={i} revealed={revealed} />
        ))}
      </div>
      <InventoryAgingPanel revealed={revealed} />
    </div>
  );
}

function DashboardOnTablet({ revealed }: { revealed: boolean }) {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<DemoTabId>("overview");
  const [touched, setTouched] = useState(false);
  return (
    <div className="relative h-full overflow-hidden bg-[#07111b] text-white">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(139,215,255,0.32) 1px, transparent 1px), linear-gradient(rgba(139,215,255,0.24) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#24c18d]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-[#62d7ff]/[0.12] blur-3xl"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-6 md:py-4">
          <div className="min-w-0">
            <div className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-[#8bd7ff]/70 md:text-[0.58rem] md:tracking-[0.22em]">
              Builder operations dashboard
            </div>
            <h3 className="mt-0.5 text-base font-bold tracking-[-0.02em] md:text-xl">
              Daily operating dashboard
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#24c18d]/35 bg-[#24c18d]/10 px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.14em] text-[#8df2c8] md:px-3 md:py-1.5 md:text-[0.55rem] md:tracking-[0.16em]">
            <motion.span
              className="h-2 w-2 rounded-full bg-[#24c18d]"
              animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            Sample data
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Demo dashboard views"
          className="flex items-center gap-1.5 overflow-x-auto border-b border-white/10 px-3 py-2 md:px-4"
        >
          {DEMO_TABS.map((t) => {
            const TabIcon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id);
                  setTouched(true);
                }}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9e6f]",
                  tab === t.id
                    ? "border-[#24c18d]/40 bg-[#24c18d]/15 text-[#8df2c8]"
                    : "border-white/10 bg-white/[0.04] text-white/[0.6] hover:bg-white/[0.07] hover:text-white/[0.85]",
                )}
              >
                <TabIcon size={12} />
                {t.label}
              </button>
            );
          })}
          {!touched && (
            <motion.span
              className="ml-auto hidden shrink-0 items-center gap-1.5 text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[#8bd7ff]/80 md:inline-flex"
              animate={reduce ? undefined : { opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              ← Click the tabs — it&apos;s interactive
            </motion.span>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-visible"
          >
            {tab === "schedule" && <ScheduleTab revealed={revealed} />}
            {tab === "budget" && <BudgetTab revealed={revealed} />}
            {tab === "sales" && <SalesTab revealed={revealed} />}
            {tab === "overview" && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:grid md:grid-cols-[0.82fr_1.18fr] md:gap-4 md:p-4">
          <div className="grid auto-rows-min grid-cols-2 gap-2.5 md:flex-none md:auto-rows-auto md:gap-3">
            {tabletKpis.map((kpi, i) => (
              <KpiTile
                key={kpi.label}
                kpi={kpi}
                index={i}
                revealed={revealed}
                className={i >= 4 ? "hidden md:flex" : undefined}
              />
            ))}
          </div>

          {/* Mobile-only graph so the iPad reads as a real dashboard on phones */}
          <div className="min-h-0 flex-1 md:hidden">
            <MilestoneBars revealed={revealed} compact />
          </div>

          <div className="hidden flex-col gap-3 md:flex">
            <MilestoneBars revealed={revealed} />
            <div className="grid flex-1 grid-cols-2 gap-3 md:gap-4">
              <CycleTrend revealed={revealed} />
              <BudgetPanel revealed={revealed} />
            </div>
          </div>
        </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function IpadDashboardShowcase() {
  return (
    <section
      id="operating-review"
      className="defer-section relative overflow-hidden border-b border-[#d9e1e6]/75 bg-transparent"
    >
      <Container className="relative z-10">
        <ContainerScroll
          titleComponent={
            <div>
              <AnimatedGradientText className="mx-auto text-[0.68rem] tracking-[0.22em]">
                Interactive dashboard demo
              </AnimatedGradientText>
              <h2 className="mx-auto mt-5 max-w-4xl font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-6xl">
                Milestone progress, cycle time, and budget in one view.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#58636b]">
                A daily operating dashboard that tracks construction milestones,
                cycle-time trends, and budget variance — the signals that decide
                whether jobs close on time and on margin. Click through the
                tabs: this is a working sample, not a screenshot.
              </p>
            </div>
          }
        >
          {(revealed) => <DashboardOnTablet revealed={revealed} />}
        </ContainerScroll>
      </Container>
    </section>
  );
}
