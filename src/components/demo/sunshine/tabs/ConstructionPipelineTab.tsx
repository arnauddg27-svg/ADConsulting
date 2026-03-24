"use client";

import type { SHJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getJobsByStage, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHPipelineBoard from "../SHPipelineBoard";

const STAGE_COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6", "#1e40af"];

interface Props {
  jobs: SHJob[];
  onDrill: (detail: DrillDetail) => void;
}

export default function ConstructionPipelineTab({ jobs, onDrill }: Props) {
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
            onClick={() => onDrill({ type: "stage", value: s.label, label: s.label })}
          />
        ))}
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Pipeline" title="Jobs by Phase">
          <SHPipelineBoard jobs={jobs} onDrill={onDrill} />
        </SHPanel>
      </div>
    </>
  );
}
