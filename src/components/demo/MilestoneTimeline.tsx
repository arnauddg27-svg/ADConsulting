import { clsx } from "clsx";
import { Check, Circle, Clock } from "lucide-react";
import { milestones } from "@/lib/mock-data";

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

export default function MilestoneTimeline() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Milestone Timeline · Lakewood Reserve Lot 42
      </h3>

      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-[640px] items-start">
          {milestones.map((milestone, index) => {
            const config = statusConfig[milestone.status];
            const isLast = index === milestones.length - 1;

            return (
              <div key={milestone.name} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <div className={clsx("h-0.5 flex-1", index === 0 ? "bg-transparent" : config.line)} />
                  <div
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06]",
                      config.bg,
                      config.text
                    )}
                  >
                    {config.icon}
                  </div>
                  <div
                    className={clsx(
                      "h-0.5 flex-1",
                      isLast ? "bg-transparent" : statusConfig[milestones[index + 1]?.status || "upcoming"].line
                    )}
                  />
                </div>

                <div className="mt-3 text-center">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                    {milestone.name}
                  </div>
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
