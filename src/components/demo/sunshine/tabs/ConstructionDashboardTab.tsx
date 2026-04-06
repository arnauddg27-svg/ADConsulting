"use client";

import type { SHJob, SHTab } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
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

const SPARKLINE_JOBS = [22, 24, 23, 25, 26, 27, 26, 28, 29, 30];
const SPARKLINE_WIP = [3.8, 4.1, 4.0, 4.3, 4.5, 4.7, 4.9, 5.0, 5.1, 5.3];

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#14b8a6" : pct >= 50 ? "#22d3ee" : pct >= 25 ? "#3b82f6" : "#5a6b7e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 40 }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 6px ${color}33` }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color, minWidth: 32, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

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

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Construction Milestones">
          <SHSpreadsheetTable
            columns={[
              { key: "jobCode", label: "Job", width: "80px", frozen: true, mono: true },
              { key: "community", label: "Community", width: "130px", frozen: true },
              { key: "lot", label: "Lot", width: "60px" },
              { key: "county", label: "County", width: "90px" },
              { key: "entity", label: "Entity", width: "150px" },
              { key: "jobType", label: "Job Type", width: "90px", render: r => { const jt = String(r.jobType); return <SHPill tone={jt === "Closed" || jt === "Completed" ? "good" : jt === "Construction" ? "watch" : "alert"} label={jt} />; } },
              { key: "plan", label: "Plan", width: "100px" },
              { key: "superintendent", label: "Super", width: "110px" },
              { key: "stage", label: "Stage", width: "100px", render: (r) => {
                const stage = r.stage as string;
                const tone = stage === "Closing" ? "good" : stage === "Permit" ? "watch" : undefined;
                return tone ? <SHPill tone={tone} label={stage} /> : <span style={{ color: STAGE_COLORS[stage] }}>{stage}</span>;
              }},
              { key: "completionPct", label: "Comp %", width: "100px", align: "right", render: (r) => <CompletionBar pct={Number(r.completionPct)} /> },
              { key: "startDate", label: "Start", width: "85px" },
              { key: "permitDate", label: "Permit", width: "85px", render: r => String(r.permitDate ?? "\u2014") },
              { key: "foundationDate", label: "Foundation", width: "85px", render: r => String(r.foundationDate ?? "\u2014") },
              { key: "framingDate", label: "Framing", width: "85px", render: r => String(r.framingDate ?? "\u2014") },
              { key: "mepDate", label: "MEP", width: "85px", render: r => String(r.mepDate ?? "\u2014") },
              { key: "drywallDate", label: "Drywall", width: "85px", render: r => String(r.drywallDate ?? "\u2014") },
              { key: "finishesDate", label: "Finishes", width: "85px", render: r => String(r.finishesDate ?? "\u2014") },
              { key: "coDate", label: "CO Date", width: "85px", render: r => String(r.coDate ?? "\u2014") },
              { key: "estCompletion", label: "Est. Close", width: "85px" },
              { key: "totalCycleDays", label: "Cycle Days", width: "75px", align: "right" },
              { key: "contractValue", label: "Contract", width: "80px", align: "right", render: r => fmt$(Number(r.contractValue)) },
              { key: "lotCost", label: "Lot Cost", width: "80px", align: "right", render: r => fmt$(Number(r.lotCost)) },
              { key: "originalBudget", label: "Budget", width: "80px", align: "right", render: r => fmt$(Number(r.originalBudget)) },
              { key: "actualCostToDate", label: "Actual", width: "80px", align: "right", render: r => fmt$(Number(r.actualCostToDate)) },
              { key: "projectedFinalCost", label: "Proj. Final", width: "85px", align: "right", render: r => fmt$(Number(r.projectedFinalCost)) },
              { key: "variance", label: "Variance", width: "80px", align: "right", render: r => {
                const v = Number(r.actualCostToDate) - Number(r.originalBudget);
                return <span style={{ color: v > 0 ? "var(--sh-danger)" : "var(--sh-accent)", fontWeight: 700 }}>{fmt$(v)}</span>;
              }},
              { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: (r) => fmt$(Number(r.wipBalance)) },
              { key: "marginPct", label: "Margin", width: "60px", align: "right", render: r => {
                const m = Number(r.marginPct);
                return <SHPill tone={m >= 24 ? "good" : m >= 20 ? "watch" : "alert"} label={fmtPct(m)} />;
              }},
              { key: "daysInCurrentPhase", label: "Days Idle", width: "65px", align: "right", render: (r) => {
                const d = Number(r.daysInCurrentPhase);
                return <span style={{ color: d > 30 ? "var(--sh-danger)" : d > 20 ? "var(--sh-warning)" : "var(--sh-text-secondary)", fontWeight: d > 20 ? 700 : 400 }}>{d}d</span>;
              }},
            ]}
            rows={jobs as unknown as Record<string, unknown>[]}
            maxRows={30}
            onRowClick={r => onDrill({ type: "job", value: String(r.jobCode), label: String(r.jobCode) })}
          />
        </SHPanel>
      </div>
    </>
  );
}
