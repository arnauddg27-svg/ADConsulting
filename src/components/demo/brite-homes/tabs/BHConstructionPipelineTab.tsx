"use client";

import type { SHJob } from "@/types/sunshine-homes";
import { getJobsByStage, fmtN } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHPipelineBoard from "../../sunshine/SHPipelineBoard";

const STAGE_COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6", "#1e40af"];

interface Props {
  jobs: SHJob[];
}

export default function BHConstructionPipelineTab({ jobs }: Props) {
  const byStage = getJobsByStage(jobs);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Visual job board by construction phase. Click any card for job details.</p>
      </div>

      <div className="sh-kpi-row">
        {byStage.map((s, i) => (
          <SHKpiCard
            key={s.label}
            label={s.label}
            value={fmtN(s.value)}
            accent={STAGE_COLORS[i]}
          />
        ))}
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Pipeline" title="Jobs by Phase">
          <SHPipelineBoard jobs={jobs} />
        </SHPanel>
      </div>
    </>
  );
}
