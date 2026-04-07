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
  const onScheduleJobs = jobs.filter(j => j.stage === "Closing" || j.daysInCurrentPhase <= 35).length;
  const withinBudgetJobs = jobs.filter(j => j.projectedFinalCost <= j.originalBudget * 1.08).length;
  const healthyProgressJobs = jobs.filter(j => j.stage === "Permit" || j.completionPct >= 55).length;
  const pct = (count: number) => Math.round((count / Math.max(jobs.length, 1)) * 100);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Visual job board by construction phase. Click any card for job details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard
          label="Total Jobs"
          value={fmtN(jobs.length)}
          sparkline={[22, 24, 23, 25, 26, 27, 26, 28, 29, 30]}
          delta="+3 vs prior"
          deltaDir="up"
          tone="good"
          onClick={() => onDrill({ type: "job", value: "all", label: "All Construction Jobs" })}
        />
        <SHKpiCard
          label="Active Jobs"
          value={fmtN(activeJobs)}
          sub="In construction"
          progress={Math.round((activeJobs / Math.max(jobs.length, 1)) * 100)}
          delta={`${byStage.length} stages`}
          deltaDir="neutral"
          tone="good"
          onClick={() => onDrill({ type: "job", value: "active", label: "Active Construction Jobs" })}
        />
        <SHKpiCard
          label="Avg Completion"
          value={`${avgCompletion}%`}
          progress={avgCompletion}
          delta="+5% vs Q3"
          deltaDir="up"
          tone="good"
          onClick={() => onDrill({ type: "job", value: "completion", label: "Construction Completion Overview" })}
        />
        <SHKpiCard
          label="Near Closing"
          value={fmtN(closingCount)}
          sparkline={[2, 3, 2, 4, 3, 5, 4, 6, 5, 7]}
          delta={`${closingCount} in closing`}
          deltaDir="up"
          tone="good"
          onClick={() => onDrill({ type: "stage", value: "Closing", label: "Closing Stage Jobs" })}
        />
      </div>

      <SHExceptionSummary
        items={[
          {
            label: "On Schedule",
            value: `${fmtN(onScheduleJobs)} (${pct(onScheduleJobs)}%)`,
            tone: onScheduleJobs >= Math.round(jobs.length * 0.8) ? "good" : onScheduleJobs >= Math.round(jobs.length * 0.65) ? "watch" : "alert",
            onClick: () => onDrill({ type: "job", value: "on-schedule", label: "On-Schedule Construction Jobs" }),
          },
          {
            label: "Within Budget",
            value: `${fmtN(withinBudgetJobs)} (${pct(withinBudgetJobs)}%)`,
            tone: withinBudgetJobs >= Math.round(jobs.length * 0.85) ? "good" : withinBudgetJobs >= Math.round(jobs.length * 0.7) ? "watch" : "alert",
            onClick: () => onDrill({ type: "job", value: "within-budget", label: "Within-Budget Construction Jobs" }),
          },
          {
            label: "Healthy Progress",
            value: `${fmtN(healthyProgressJobs)} (${pct(healthyProgressJobs)}%)`,
            tone: healthyProgressJobs >= Math.round(jobs.length * 0.8) ? "good" : healthyProgressJobs >= Math.round(jobs.length * 0.65) ? "watch" : "alert",
            onClick: () => onDrill({ type: "job", value: "healthy-progress", label: "Healthy-Progress Construction Jobs" }),
          },
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
