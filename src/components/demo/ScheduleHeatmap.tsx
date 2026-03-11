import { clsx } from "clsx";
import { scheduleHeatmapData } from "@/lib/mock-data";

const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

function getCellColor(intensity: number) {
  if (intensity === 0) return "bg-white/[0.03]";
  if (intensity === 1) return "bg-accent-900";
  if (intensity === 2) return "bg-accent-800";
  if (intensity === 3) return "bg-accent-700";
  if (intensity === 4) return "bg-accent-600";
  return "bg-accent-400";
}

export default function ScheduleHeatmap() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Schedule Activity Heatmap · 12-week view
      </h3>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr>
              <th className="w-32 pb-3 text-left text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Project
              </th>
              {weeks.map((week) => (
                <th key={week} className="pb-3 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleHeatmapData.map((row) => (
              <tr key={row.project}>
                <td className="py-2 text-sm text-slate-200">{row.project}</td>
                {row.weeks.map((intensity, index) => (
                  <td key={index} className="p-1">
                    <div className={clsx("mx-auto h-6 w-full rounded", getCellColor(intensity))} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-slate-500">
        <span>Lower activity</span>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className={clsx("h-3 w-3 rounded", getCellColor(index))} />
        ))}
        <span>Higher activity</span>
      </div>
    </div>
  );
}
