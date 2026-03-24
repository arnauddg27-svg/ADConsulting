"use client";

import type { SHJob } from "@/types/sunshine-homes";
import { avgPhaseDays, cycleTimeDistribution } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHCycleTimePipeline from "../SHCycleTimePipeline";
import SHHistogram from "../SHHistogram";

interface Props {
  jobs: SHJob[];
}

export default function ConstructionCycleTimeTab({ jobs }: Props) {
  const completedJobs = jobs.filter(j => j.totalCycleDays > 200);
  const avgCycle = completedJobs.length
    ? Math.round(completedJobs.reduce((s, j) => s + j.totalCycleDays, 0) / completedJobs.length)
    : 0;

  const fastest = completedJobs.length
    ? completedJobs.reduce((min, j) => j.totalCycleDays < min.totalCycleDays ? j : min, completedJobs[0])
    : null;
  const slowest = completedJobs.length
    ? completedJobs.reduce((max, j) => j.totalCycleDays > max.totalCycleDays ? j : max, completedJobs[0])
    : null;

  const totalPhaseDays = avgPhaseDays.reduce((s, p) => s + p.days, 0);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Cycle Time</h2>
        <p className="sh-tab-desc">Phase duration analysis and completion distribution.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Avg Cycle Time" value={`${avgCycle}d`} sub="Start to CO" />
        <SHKpiCard label="Target Cycle" value={`${totalPhaseDays}d`} sub="Sum of phase averages" accent="#22d3ee" />
        <SHKpiCard label="Fastest" value={fastest ? `${fastest.totalCycleDays}d` : "—"} sub={fastest?.community ?? ""} accent="#0f766e" />
        <SHKpiCard label="Slowest" value={slowest ? `${slowest.totalCycleDays}d` : "—"} sub={slowest?.community ?? ""} accent="#f46a6a" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Phase Analysis" title="Average Phase Durations">
          <SHCycleTimePipeline phases={avgPhaseDays} />
        </SHPanel>
        <SHPanel kicker="Distribution" title="Cycle Time Distribution">
          <SHHistogram buckets={cycleTimeDistribution} />
        </SHPanel>
      </div>
    </>
  );
}
