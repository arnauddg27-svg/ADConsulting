"use client";

import type { SHJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getJobsByStage, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHPipelineBoard from "../SHPipelineBoard";
import SHExceptionSummary from "../SHExceptionSummary";

interface Props {
  jobs: SHJob[];
  onDrill: (detail: DrillDetail) => void;
  onStageClick?: (stage: string) => void;
}

export default function ConstructionPipelineTab({ jobs, onDrill, onStageClick }: Props) {
  const byStage = getJobsByStage(jobs);
  const activeJobs = jobs.filter(j => j.stage !== "Closing" && j.completionPct < 95).length;
  const avgCompletion = jobs.length ? Math.round(jobs.reduce((s, j) => s + j.completionPct, 0) / jobs.length) : 0;
  const closingCount = jobs.filter(j => j.stage === "Closing").length;
  const stalledJobs = jobs.filter(j => j.daysInCurrentPhase >= 28 && j.stage !== "Closing").length;
  const overBudgetJobs = jobs.filter(j => j.projectedFinalCost > j.originalBudget * 1.05).length;
  const laggingJobs = jobs.filter(j => j.completionPct < 55 && j.stage !== "Permit").length;

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Visual job board by construction phase. Click any card for job details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Jobs" value={fmtN(jobs.length)} sparkline={[22, 24, 23, 25, 26, 27, 26, 28, 29, 30]} delta="+3 vs prior" deltaDir="up" tone="good" />
        <SHKpiCard label="Active Jobs" value={fmtN(activeJobs)} sub="In construction" progress={Math.round((activeJobs / Math.max(jobs.length, 1)) * 100)} delta={`${byStage.length} stages`} deltaDir="neutral" tone="good" />
        <SHKpiCard label="Avg Completion" value={`${avgCompletion}%`} progress={avgCompletion} delta="+5% vs Q3" deltaDir="up" tone={avgCompletion >= 70 ? "good" : avgCompletion >= 55 ? "watch" : "alert"} />
        <SHKpiCard label="Near Closing" value={fmtN(closingCount)} sparkline={[2, 3, 2, 4, 3, 5, 4, 6, 5, 7]} delta={`${closingCount} in closing`} deltaDir="up" tone={closingCount >= 10 ? "good" : "watch"} />
      </div>

      <SHExceptionSummary
        items={[
          { label: "Stalled > 28d", value: fmtN(stalledJobs), tone: stalledJobs >= 16 ? "alert" : stalledJobs >= 9 ? "watch" : "good" },
          { label: "Over Budget > 5%", value: fmtN(overBudgetJobs), tone: overBudgetJobs >= 12 ? "alert" : overBudgetJobs >= 6 ? "watch" : "good" },
          { label: "Lagging Progress", value: fmtN(laggingJobs), tone: laggingJobs >= 18 ? "alert" : laggingJobs >= 10 ? "watch" : "good" },
        ]}
      />

      <div className="sh-panels-row single">
        <SHPanel kicker="Pipeline" title="Jobs by Phase">
          <SHPipelineBoard jobs={jobs} onDrill={onDrill} onStageClick={onStageClick} />
        </SHPanel>
      </div>
    </>
  );
}
