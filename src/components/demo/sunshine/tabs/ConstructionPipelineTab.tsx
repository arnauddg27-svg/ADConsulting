"use client";

import type { SHJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getJobsByStage, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHPipelineBoard from "../SHPipelineBoard";

interface Props {
  jobs: SHJob[];
  onDrill: (detail: DrillDetail) => void;
}

export default function ConstructionPipelineTab({ jobs, onDrill }: Props) {
  const byStage = getJobsByStage(jobs);
  const activeJobs = jobs.filter(j => j.stage !== "Closing" && j.completionPct < 95).length;
  const avgCompletion = jobs.length ? Math.round(jobs.reduce((s, j) => s + j.completionPct, 0) / jobs.length) : 0;
  const closingCount = jobs.filter(j => j.stage === "Closing").length;

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Visual job board by construction phase. Click any card for job details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Jobs" value={fmtN(jobs.length)} sparkline={[22, 24, 23, 25, 26, 27, 26, 28, 29, 30]} delta="+3 vs prior" deltaDir="up" />
        <SHKpiCard label="Active Jobs" value={fmtN(activeJobs)} sub="In construction" progress={Math.round((activeJobs / Math.max(jobs.length, 1)) * 100)} delta={`${byStage.length} stages`} deltaDir="neutral" />
        <SHKpiCard label="Avg Completion" value={`${avgCompletion}%`} accent="#22d3ee" progress={avgCompletion} delta="+5% vs Q3" deltaDir="up" />
        <SHKpiCard label="Near Closing" value={fmtN(closingCount)} accent="#1e40af" sparkline={[2, 3, 2, 4, 3, 5, 4, 6, 5, 7]} delta={`${closingCount} in closing`} deltaDir="up" />
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Pipeline" title="Jobs by Phase">
          <SHPipelineBoard jobs={jobs} onDrill={onDrill} />
        </SHPanel>
      </div>
    </>
  );
}
