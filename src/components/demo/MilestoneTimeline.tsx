import { useMemo } from "react";
import { clsx } from "clsx";
import { Check, Circle, Clock } from "lucide-react";
import { milestones, projects } from "@/lib/mock-data";
import type { DashboardFilters, Milestone } from "@/types";

const statusConfig = {
  complete: {
    icon: <Check size={14} />,
    bg: "bg-emerald-500/90",
    text: "text-white",
    line: "bg-emerald-500/50",
  },
  "in-progress": {
    icon: <Clock size={14} />,
    bg: "bg-accent-400",
    text: "text-white",
    line: "bg-white/[0.06]",
  },
  upcoming: {
    icon: <Circle size={14} />,
    bg: "bg-white/[0.06]",
    text: "text-slate-400",
    line: "bg-white/[0.06]",
  },
};

/* Phase names from projects mapped to milestone names */
const phaseToMilestone: Record<string, string> = {
  Permits: "Permits",
  Foundation: "Foundation",
  Framing: "Framing",
  "Rough-In": "Rough-In",
  Drywall: "Drywall",
  "MEP Trim": "Drywall",       // MEP Trim maps closest to post-drywall
  Finishes: "Finishes",
  "Punch List": "Punch List",
  Closing: "Closing",
};

const milestoneOrder = milestones.map((m) => m.name);

interface MilestoneTimelineProps {
  filters?: DashboardFilters;
  onFilterToggle?: (key: keyof DashboardFilters, value: string) => void;
}

export default function MilestoneTimeline({ filters, onFilterToggle }: MilestoneTimelineProps) {
  const getCommunity = (name: string) => name.split(" - ")[0];

  const titleLabel = filters?.project
    ? filters.project
    : filters?.community
      ? filters.community
      : "Lakewood Reserve - Lot 42";

  /* Derive milestone statuses from filtered project's current phase */
  const derivedMilestones = useMemo((): Milestone[] => {
    // Find the filtered project(s)
    let matchedProject = null;
    if (filters?.project) {
      matchedProject = projects.find((p) => p.name === filters.project);
    } else if (filters?.community) {
      // Pick the most advanced project in the community
      const communityProjects = projects.filter(
        (p) => getCommunity(p.name) === filters.community
      );
      if (communityProjects.length > 0) {
        matchedProject = communityProjects.reduce((best, p) =>
          p.percentComplete > best.percentComplete ? p : best
        );
      }
    }

    if (!matchedProject) return milestones;

    const currentMilestoneName = phaseToMilestone[matchedProject.phase] || matchedProject.phase;
    const currentIndex = milestoneOrder.indexOf(currentMilestoneName);

    if (currentIndex === -1) return milestones;

    return milestones.map((m, i) => ({
      ...m,
      status: i < currentIndex ? "complete" : i === currentIndex ? "in-progress" : "upcoming",
    }));
  }, [filters?.project, filters?.community]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Milestone Timeline · {titleLabel}
      </h3>

      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-[640px] items-start">
          {derivedMilestones.map((milestone, index) => {
            const config = statusConfig[milestone.status];
            const isLast = index === derivedMilestones.length - 1;
            const isPhaseMatch = filters?.phase === milestone.name;
            const hasPhaseFilter = !!filters?.phase;

            return (
              <div
                key={milestone.name}
                className={clsx(
                  "flex flex-1 flex-col items-center transition-opacity duration-300",
                  hasPhaseFilter && !isPhaseMatch && "opacity-30"
                )}
              >
                <div className="flex w-full items-center">
                  <div className={clsx("h-0.5 flex-1", index === 0 ? "bg-transparent" : config.line)} />
                  <div
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                      isPhaseMatch
                        ? "border-accent-300 ring-2 ring-accent-400/40"
                        : "border-white/[0.06]",
                      config.bg,
                      config.text
                    )}
                  >
                    {config.icon}
                  </div>
                  <div
                    className={clsx(
                      "h-0.5 flex-1",
                      isLast ? "bg-transparent" : statusConfig[derivedMilestones[index + 1]?.status || "upcoming"].line
                    )}
                  />
                </div>

                <div className="mt-3 text-center">
                  <button
                    onClick={() => onFilterToggle?.("phase", milestone.name)}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 cursor-pointer hover:text-accent-300 transition-colors"
                  >
                    {milestone.name}
                  </button>
                  <div className="mt-1 text-[0.68rem] text-slate-500">{milestone.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
