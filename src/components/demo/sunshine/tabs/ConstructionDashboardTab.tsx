"use client";

import type { SHJob, SHTab } from "@/types/sunshine-homes";
import { getConstructionKPIs, getJobsByStage, getCommunityBreakdown, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

const STAGE_COLORS: Record<string, string> = {
  "Permit": "#0f766e", "Foundation": "#0d9488", "Framing": "#14b8a6",
  "MEP / Drywall": "#22d3ee", "Finishes": "#3b82f6", "Closing": "#1e40af",
};

/* Fake sparkline data for KPIs */
const SPARKLINE_JOBS = [22, 24, 23, 25, 26, 27, 26, 28, 29, 30];
const SPARKLINE_WIP = [3.8, 4.1, 4.0, 4.3, 4.5, 4.7, 4.9, 5.0, 5.1, 5.3];

/** Inline completion bar for table */
function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#14b8a6" : pct >= 50 ? "#22d3ee" : pct >= 25 ? "#3b82f6" : "#5a6b7e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 40 }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 2,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          boxShadow: `0 0 6px ${color}33`,
        }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color, minWidth: 32, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

interface Props {
  jobs: SHJob[];
  onCommunityClick: (community: string) => void;
  onTabChange: (tab: SHTab) => void;
}

export default function ConstructionDashboardTab({ jobs, onCommunityClick, onTabChange }: Props) {
  const kpis = getConstructionKPIs(jobs);
  const byStage = getJobsByStage(jobs).map(s => ({ ...s, color: STAGE_COLORS[s.label] ?? "#14b8a6" }));
  const byCommunity = getCommunityBreakdown(jobs);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">KPI snapshot, job status, and community breakdown.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard
          label="Total Jobs" value={fmtN(kpis.totalJobs)}
          sub={`${byCommunity.length} communities`}
          sparkline={SPARKLINE_JOBS}
          delta="+3 vs last month" deltaDir="up"
        />
        <SHKpiCard
          label="Active Jobs" value={fmtN(kpis.activeJobs)}
          sub="In construction"
          progress={Math.round((kpis.activeJobs / kpis.totalJobs) * 100)}
          onClick={() => onTabChange("construction-pipeline")}
        />
        <SHKpiCard
          label="Avg Completion" value={fmtPct(kpis.avgCompletion)}
          accent="#22d3ee"
          progress={Math.round(kpis.avgCompletion)}
          delta="+5% vs Q3" deltaDir="up"
        />
        <SHKpiCard
          label="Total WIP" value={fmt$(kpis.totalWip)}
          accent="#3b82f6"
          sparkline={SPARKLINE_WIP}
          onClick={() => onTabChange("construction-cost")}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Portfolio" title="Jobs by Stage">
          <SHDonutChart segments={byStage} />
        </SHPanel>
        <SHPanel kicker="Communities" title="Active Jobs by Community">
          <SHRankedBars items={byCommunity} onBarClick={onCommunityClick} showRank />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Construction Milestones">
          <SHSpreadsheetTable
            columns={[
              { key: "jobCode", label: "Job", width: "90px", frozen: true, mono: true },
              { key: "community", label: "Community", width: "150px", frozen: true },
              { key: "lot", label: "Lot", width: "70px" },
              { key: "plan", label: "Plan", width: "110px" },
              { key: "superintendent", label: "Super", width: "110px" },
              { key: "stage", label: "Stage", width: "110px", render: (r) => {
                const stage = r.stage as string;
                const tone = stage === "Closing" ? "good" : stage === "Permit" ? "watch" : undefined;
                return tone ? <SHPill tone={tone} label={stage} /> : <span style={{ color: STAGE_COLORS[stage] }}>{stage}</span>;
              }},
              { key: "completionPct", label: "Completion", width: "120px", render: (r) => <CompletionBar pct={Number(r.completionPct)} /> },
              { key: "wipBalance", label: "WIP", width: "80px", align: "right", render: (r) => fmt$(Number(r.wipBalance)) },
              { key: "daysInCurrentPhase", label: "Days Idle", width: "70px", align: "right", render: (r) => {
                const d = Number(r.daysInCurrentPhase);
                const isAlert = d > 30;
                const isWarn = d > 20;
                return (
                  <span style={{
                    color: isAlert ? "var(--sh-danger)" : isWarn ? "var(--sh-warning)" : "var(--sh-text-secondary)",
                    fontWeight: isAlert || isWarn ? 700 : 400,
                  }}>
                    {d}d
                  </span>
                );
              }},
              { key: "estCompletion", label: "Est. Close", width: "90px" },
            ]}
            rows={jobs as unknown as Record<string, unknown>[]}
            maxRows={30}
          />
        </SHPanel>
      </div>
    </>
  );
}
