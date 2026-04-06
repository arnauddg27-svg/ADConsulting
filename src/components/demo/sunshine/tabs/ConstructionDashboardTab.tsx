"use client";

import type { SHJob, SHTab } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getConstructionKPIs, getJobsByStage, getCommunityBreakdown, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";

const STAGE_COLORS: Record<string, string> = {
  "Permit": "#0f766e", "Foundation": "#0d9488", "Framing": "#14b8a6",
  "MEP / Drywall": "#22d3ee", "Finishes": "#3b82f6", "Closing": "#1e40af",
};

const SPARKLINE_JOBS = [22, 24, 23, 25, 26, 27, 26, 28, 29, 30];
const SPARKLINE_WIP = [3.8, 4.1, 4.0, 4.3, 4.5, 4.7, 4.9, 5.0, 5.1, 5.3];

interface Props {
  jobs: SHJob[];
  onCommunityClick: (community: string) => void;
  onStageClick: (stage: string) => void;
  onTabChange: (tab: SHTab) => void;
  onDrill: (detail: DrillDetail) => void;
}

export default function ConstructionDashboardTab({ jobs, onCommunityClick, onStageClick, onTabChange, onDrill }: Props) {
  const kpis = getConstructionKPIs(jobs);
  const byStage = getJobsByStage(jobs).map(s => ({ ...s, color: STAGE_COLORS[s.label] ?? "#14b8a6" }));
  const byCommunity = getCommunityBreakdown(jobs);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">KPI snapshot, job status, and community breakdown. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Jobs" value={fmtN(kpis.totalJobs)} sub={`${byCommunity.length} communities`} sparkline={SPARKLINE_JOBS} delta="+3 vs last month" deltaDir="up" />
        <SHKpiCard label="Active Jobs" value={fmtN(kpis.activeJobs)} sub="In construction" progress={Math.round((kpis.activeJobs / kpis.totalJobs) * 100)} onClick={() => onTabChange("construction-pipeline")} />
        <SHKpiCard label="Avg Completion" value={fmtPct(kpis.avgCompletion)} accent="#22d3ee" progress={Math.round(kpis.avgCompletion)} delta="+5% vs Q3" deltaDir="up" />
        <SHKpiCard label="Total WIP" value={fmt$(kpis.totalWip)} accent="#3b82f6" sparkline={SPARKLINE_WIP} onClick={() => onTabChange("construction-cost")} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Portfolio" title="Jobs by Stage">
          <SHDonutChart
            segments={byStage}
            onSegmentClick={label => onStageClick(label)}
          />
        </SHPanel>
        <SHPanel kicker="Communities" title="Active Jobs by Community">
          <SHRankedBars
            items={byCommunity}
            onBarClick={label => onCommunityClick(label)}
            showRank
          />
        </SHPanel>
      </div>

    </>
  );
}
