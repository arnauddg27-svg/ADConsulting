"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CircleDollarSign,
  Clock3,
  ClipboardList,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import Container from "@/components/ui/Container";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { cn } from "@/lib/utils";

const tabletKpis = [
  {
    label: "Active jobs",
    value: "142",
    note: "11 need action",
    icon: LayoutDashboard,
  },
  {
    label: "Cycle time",
    value: "64d",
    note: "avg cycle time",
    icon: Clock3,
  },
  {
    label: "Budget variance",
    value: "$284K",
    note: "flagged early",
    icon: CircleDollarSign,
  },
  {
    label: "Follow-ups",
    value: "38",
    note: "owner assigned",
    icon: ClipboardList,
  },
  {
    label: "Aging permits",
    value: "12",
    note: "over target",
    icon: Clock3,
  },
  {
    label: "Pipeline views",
    value: "8",
    note: "by department",
    icon: BarChart3,
  },
];

const tabletRows = [
  {
    job: "Lot 184",
    department: "Construction",
    signal: "Stage date slipping",
    owner: "Construction PM",
    action: "Confirm crew date",
    status: "Behind plan",
  },
  {
    job: "Lot 231",
    department: "Finance",
    signal: "Cost movement",
    owner: "Finance",
    action: "Review variance",
    status: "Review",
  },
  {
    job: "Lot 097",
    department: "Permitting",
    signal: "Approval pending",
    owner: "Permit lead",
    action: "Resolve approval",
    status: "At risk",
  },
  {
    job: "Lot 142",
    department: "Sales",
    signal: "Inventory aging",
    owner: "Sales",
    action: "Update pricing",
    status: "Review",
  },
];

const tabletPipelines = [
  { label: "Land", value: 72 },
  { label: "Permitting", value: 48 },
  { label: "Construction", value: 86 },
  { label: "Draws", value: 61 },
  { label: "Sales", value: 64 },
  { label: "Purchasing", value: 69 },
  { label: "Closeout", value: 52 },
  { label: "Warranty", value: 37 },
];

function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: ReactNode;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

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
      <div
        className="relative w-full"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          style={{ translateY: translate }}
          className="mx-auto max-w-4xl text-center"
        >
          {titleComponent}
        </motion.div>
        <TabletCard rotate={rotate} scale={scale}>
          {children}
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
      className="relative mt-8 mx-auto h-[30rem] md:h-[40rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-2 shadow-2xl md:p-5"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#07111b]">
        {children}
      </div>
    </motion.div>
  );
}

function KpiTile({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1620] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.56rem] font-bold uppercase tracking-[0.18em] text-white/[0.42]">
          {label}
        </p>
        <Icon size={17} className="text-[#8bd7ff]" />
      </div>
      <div className="mt-3 text-3xl font-bold leading-none text-white">
        {value}
      </div>
      <p className="mt-2 text-xs font-semibold text-white/[0.45]">{note}</p>
    </div>
  );
}

function DashboardOnTablet() {
  return (
    <div className="relative h-full overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
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
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6 md:py-4">
          <div>
            <div className="text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[#8bd7ff]/70">
              Builder operations dashboard
            </div>
            <h3 className="mt-0.5 text-lg font-bold tracking-[-0.02em] md:text-xl">
              Daily operating dashboard
            </h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#24c18d]/35 bg-[#24c18d]/10 px-3 py-1.5 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[#8df2c8]">
            <span className="h-2 w-2 rounded-full bg-[#24c18d]" />
            Sample data
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 p-3 md:grid-cols-[0.82fr_1.18fr] md:gap-4 md:p-5">
          <div className="grid grid-cols-2 gap-2.5 md:gap-3">
            {tabletKpis.slice(0, 4).map((kpi) => (
              <KpiTile key={kpi.label} {...kpi} />
            ))}
          </div>

          <div className="flex flex-col gap-3 md:gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#0d1620] p-4 md:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.56rem] font-bold uppercase tracking-[0.2em] text-white/[0.38]">
                    Organized pipelines
                  </p>
                  <h4 className="mt-1 text-base font-bold md:text-lg">
                    Pipeline views by department
                  </h4>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-white/[0.58]">
                  Sample
                </span>
              </div>

              <div className="mt-4 grid gap-x-5 gap-y-3 md:grid-cols-2">
                {tabletPipelines.map((pipeline) => (
                  <div key={pipeline.label}>
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="font-bold text-white/[0.78]">
                        {pipeline.label}
                      </span>
                      <span className="text-white/[0.42]">{pipeline.value}%</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-white/[0.08]">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#24c18d] to-[#8bd7ff]"
                        style={{ width: `${pipeline.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1620]">
              <div className="grid grid-cols-[0.7fr_1.1fr_0.9fr_0.7fr] border-b border-white/10 px-4 py-2.5 text-[0.52rem] font-bold uppercase tracking-[0.16em] text-white/[0.35]">
                <span>Job</span>
                <span>Signal</span>
                <span>Owner</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-white/10">
                {tabletRows.slice(0, 2).map((row) => (
                  <div
                    key={row.job}
                    className="grid grid-cols-[0.7fr_1.1fr_0.9fr_0.7fr] items-center gap-3 px-4 py-3 text-xs md:text-sm"
                  >
                    <div>
                      <div className="font-bold">{row.job}</div>
                      <div className="mt-0.5 text-[0.5rem] font-bold uppercase tracking-[0.16em] text-[#8df2c8]">
                        {row.department}
                      </div>
                    </div>
                    <div className="font-bold text-white/[0.84]">{row.signal}</div>
                    <div className="font-semibold text-white/[0.62]">
                      {row.owner}
                    </div>
                    <div>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.12em]",
                          row.status === "Behind plan"
                            ? "border-[#f2c66d]/35 bg-[#f2c66d]/10 text-[#f2c66d]"
                            : row.status === "At risk"
                              ? "border-[#f37b7b]/35 bg-[#f37b7b]/10 text-[#f37b7b]"
                              : "border-[#8df2c8]/35 bg-[#8df2c8]/10 text-[#8df2c8]",
                        )}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
                Daily dashboard preview
              </AnimatedGradientText>
              <h2 className="mx-auto mt-5 max-w-4xl font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-6xl">
                Daily dashboard views for every department.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#58636b]">
                KPI cards, detailed pipelines, and next-action queues stay in
                one place for construction, finance, sales, permitting,
                purchasing, warranty, and leadership.
              </p>
            </div>
          }
        >
          <DashboardOnTablet />
        </ContainerScroll>
      </Container>
    </section>
  );
}
