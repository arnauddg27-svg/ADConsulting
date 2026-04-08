"use client";

import { useMemo } from "react";
import type { SHJob, SHTab } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getConstructionKPIs, getJobsByStage, getCommunityBreakdown, buildCrossTab, fmt$, fmtN, fmtPct, getQuarter, getMonthLabel, getDayLabel, buildQuarterTrend } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHHistogram from "../SHHistogram";
import SHAreaChart from "../SHAreaChart";
import SHCrossTab from "../SHCrossTab";

const STAGE_COLORS: Record<string, string> = {
  "Permit": "#0f766e", "Foundation": "#0d9488", "Framing": "#14b8a6",
  "MEP / Drywall": "#22d3ee", "Finishes": "#3b82f6", "Closing": "#1e40af",
};

// Teal-blue palette for histogram and job-type donut
const TEAL_BLUE_PALETTE = ["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6"];

const SPARKLINE_JOBS = [22, 24, 23, 25, 26, 27, 26, 28, 29, 30];
const SPARKLINE_WIP = [3.8, 4.1, 4.0, 4.3, 4.5, 4.7, 4.9, 5.0, 5.1, 5.3];

const STAGE_ORDER = ["Permit", "Foundation", "Framing", "MEP / Drywall", "Finishes", "Closing"];

interface Props {
  jobs: SHJob[];
  onCommunityClick: (community: string) => void;
  onStageClick: (stage: string) => void;
  onStatusClick: (status: string) => void;
  onTabChange: (tab: SHTab) => void;
  onDrill: (detail: DrillDetail) => void;
  drillYear: number | null;
  drillQuarter: number | null;
  drillMonth: number | null;
  onYearClick: (year: number) => void;
  onQuarterClick: (quarter: number) => void;
  onMonthClick: (month: number) => void;
}

export default function ConstructionDashboardTab({ jobs, onCommunityClick, onStageClick, onStatusClick, onTabChange, onDrill, drillYear, drillQuarter, drillMonth, onYearClick, onQuarterClick, onMonthClick }: Props) {
  const kpis = getConstructionKPIs(jobs);
  const byStage = getJobsByStage(jobs).map(s => ({ ...s, color: STAGE_COLORS[s.label] ?? "#14b8a6" }));
  const byCommunity = getCommunityBreakdown(jobs);
  const wipTrendData = useMemo(() => (
    buildQuarterTrend(
      jobs,
      j => j.startDate,
      j => j.wipBalance,
      { cumulative: false, maxPoints: 8 },
    ).map(p => ({ label: p.label, value: Math.round((p.value / 1_000_000) * 10) / 10 }))
  ), [jobs]);

  // --- Histogram: Completion Distribution ---
  const completionBuckets = [
    { bucket: "0–20%", min: 0, max: 20 },
    { bucket: "20–40%", min: 20, max: 40 },
    { bucket: "40–60%", min: 40, max: 60 },
    { bucket: "60–80%", min: 60, max: 80 },
    { bucket: "80–100%", min: 80, max: 101 },
  ].map((b, i) => ({
    bucket: b.bucket,
    count: jobs.filter(j => j.completionPct >= b.min && j.completionPct < b.max).length,
    color: TEAL_BLUE_PALETTE[i],
  }));

  // --- Ranked Bars: WIP by Superintendent ---
  const wipBySuperMap = new Map<string, number>();
  for (const job of jobs) {
    wipBySuperMap.set(job.superintendent, (wipBySuperMap.get(job.superintendent) ?? 0) + job.wipBalance);
  }
  const wipBySuper = Array.from(wipBySuperMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // --- CrossTab: Community x Stage ---
  const crossTab = buildCrossTab(jobs, "community", "stage");

  // Sort crossTab cols by stage order
  const sortedCols = [...crossTab.cols].sort(
    (a, b) => (STAGE_ORDER.indexOf(a) ?? 99) - (STAGE_ORDER.indexOf(b) ?? 99)
  );

  // --- CrossTab: City x Time (drill-aware) ---
  const cityTimeCross = (() => {
    if (drillMonth) {
      const withDay = jobs
        .filter(j => j.startDate)
        .map(j => ({ ...j, day: getDayLabel(j.startDate) }));
      return buildCrossTab(withDay, "city", "day" as keyof typeof withDay[0]);
    }
    if (drillQuarter) {
      const withMonth = jobs
        .filter(j => j.startDate)
        .map(j => ({ ...j, month: getMonthLabel(j.startDate) }));
      return buildCrossTab(withMonth, "city", "month" as keyof typeof withMonth[0]);
    }
    if (drillYear) {
      const withQuarter = jobs
        .filter(j => j.startDate)
        .map(j => ({ ...j, quarter: `Q${getQuarter(j.startDate)}` }));
      return buildCrossTab(withQuarter, "city", "quarter" as keyof typeof withQuarter[0]);
    }
    return buildCrossTab(jobs, "city", "year");
  })();

  // --- Donut: Jobs by Job Type ---
  const jobTypeMap = new Map<string, number>();
  for (const job of jobs) {
    jobTypeMap.set(job.jobType, (jobTypeMap.get(job.jobType) ?? 0) + 1);
  }
  const byJobType = Array.from(jobTypeMap.entries())
    .map(([label, value], i) => ({ label, value, color: TEAL_BLUE_PALETTE[i % TEAL_BLUE_PALETTE.length] }))
    .sort((a, b) => b.value - a.value);

  // --- Ranked Bars: Avg Days in Phase by Stage ---
  const stageDaysMap = new Map<string, { total: number; count: number }>();
  for (const job of jobs) {
    const e = stageDaysMap.get(job.stage) ?? { total: 0, count: 0 };
    e.total += job.daysInCurrentPhase;
    e.count++;
    stageDaysMap.set(job.stage, e);
  }
  const avgDaysByStage = STAGE_ORDER
    .filter(s => stageDaysMap.has(s))
    .map(s => {
      const e = stageDaysMap.get(s)!;
      return { label: s, value: Math.round(e.total / e.count) };
    });

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">KPI snapshot, job status, and community breakdown. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Jobs" value={fmtN(kpis.totalJobs)} sub={`${byCommunity.length} communities`} sparkline={SPARKLINE_JOBS} delta="+3 vs last month" deltaDir="up" onClick={() => onDrill({ type: "job", value: "all", label: `Total Jobs — ${fmtN(kpis.totalJobs)}` })} />
        <SHKpiCard label="Active Jobs" value={fmtN(kpis.activeJobs)} sub="In construction" progress={Math.round((kpis.activeJobs / kpis.totalJobs) * 100)} onClick={() => onDrill({ type: "job", value: "active", label: `Active Jobs — ${fmtN(kpis.activeJobs)}` })} />
        <SHKpiCard label="Avg Completion" value={fmtPct(kpis.avgCompletion)} accent="#22d3ee" progress={Math.round(kpis.avgCompletion)} delta="+5% vs Q3" deltaDir="up" onClick={() => onDrill({ type: "job", value: "completion", label: `Avg Completion — ${fmtPct(kpis.avgCompletion)}` })} />
        <SHKpiCard label="Total WIP" value={fmt$(kpis.totalWip)} accent="#3b82f6" sparkline={SPARKLINE_WIP} onClick={() => onDrill({ type: "cost-category", value: "wip", label: `Total WIP — ${fmt$(kpis.totalWip)}` })} />
      </div>

      {/* Row 1: Jobs by Stage + Active Jobs by Community */}
      <div className="sh-panels-row">
        <SHPanel kicker="Portfolio" title="Jobs by Stage">
          <SHDonutChart
            segments={byStage}
            onSegmentClick={label => { onStageClick(label); onDrill({ type: "stage", value: label, label }); }}
          />
        </SHPanel>
        <SHPanel kicker="Communities" title="Active Jobs by Community">
          <SHRankedBars
            items={byCommunity}
            onBarClick={label => { onCommunityClick(label); onDrill({ type: "community", value: label, label }); }}
            showRank
          />
        </SHPanel>
      </div>

      {/* Row 2: Completion Distribution (Histogram) + WIP by Superintendent */}
      <div className="sh-panels-row">
        <SHPanel kicker="Distribution" title="Completion Distribution">
          <SHHistogram buckets={completionBuckets} onBucketClick={bucket => onDrill({ type: "construction-completion-bucket", value: bucket, label: `Completion ${bucket}` })} />
        </SHPanel>
        <SHPanel kicker="Workload" title="WIP by Superintendent">
          <SHRankedBars
            items={wipBySuper.map(item => ({ ...item, value: Math.round(item.value / 1000) }))}
            showRank
            formatValue={(v: number) => `$${v}K`}
            onBarClick={label => onDrill({ type: "super", value: label, label })}
          />
        </SHPanel>
      </div>

      {/* Row 3: Community × Stage CrossTab (full width) */}
      <div className="sh-panels-row single">
        <SHPanel kicker="Matrix" title="Job Count by Community & Stage">
          <SHCrossTab
            rows={crossTab.rows}
            cols={sortedCols}
            data={crossTab.data}
            rowTotals={crossTab.rowTotals}
            colTotals={crossTab.colTotals}
            grandTotal={crossTab.grandTotal}
            onCellClick={(row, col) => { onCommunityClick(row); onStageClick(col); onDrill({ type: "community", value: row, label: `${row} — ${col}` }); }}
            onRowLabelClick={(row) => { onCommunityClick(row); onDrill({ type: "community", value: row, label: row }); }}
          />
        </SHPanel>
      </div>

      {/* Row 4: Completions by Year — City × Time drill-down */}
      <div className="sh-panels-row single">
        <SHPanel kicker="City × Time" title={
          drillMonth ? `Completions: City by Day (${new Date(2000, drillMonth - 1).toLocaleString("en-US", { month: "short" })} ${drillYear})` :
          drillQuarter ? `Completions: City by Month (Q${drillQuarter} ${drillYear})` :
          drillYear ? `Completions: City by Quarter (${drillYear})` :
          "Completions by Year"
        }>
          <SHCrossTab
            {...cityTimeCross}
            onCellClick={(row, col) => { onCommunityClick(row); onDrill({ type: "construction-city-time", value: `${row}|${col}`, label: `${row} — ${col}` }); }}
            onRowLabelClick={(row) => { onCommunityClick(row); onDrill({ type: "construction-city-time", value: `${row}|`, label: row }); }}
            onColHeaderClick={
              drillMonth ? undefined :
              drillQuarter ? (col) => onMonthClick(new Date(Date.parse(col + " 1, 2000")).getMonth() + 1) :
              drillYear ? (col) => onQuarterClick(Number(col.replace("Q", ""))) :
              (col) => onYearClick(Number(col))
            }
          />
        </SHPanel>
      </div>

      {/* Row 5: WIP Trend (Area) + Jobs by Job Type (Donut) */}
      <div className="sh-panels-row">
        <SHPanel kicker="Trend" title="WIP Balance Trend">
          <SHAreaChart
            data={wipTrendData}
            color="#14b8a6"
            label1="WIP ($M)"
            formatY={(v: number) => `$${v.toFixed(1)}M`}
            onPointClick={label => {
              const m = label.match(/^Q([1-4])\s*'(\d{2})$/i);
              const value = m ? `20${m[2]} Q${m[1]}` : label;
              onDrill({ type: "cycle-time-cohort", value, label: `WIP Trend — ${label}` });
            }}
          />
        </SHPanel>
        <SHPanel kicker="Mix" title="Jobs by Type">
          <SHDonutChart
            segments={byJobType}
            onSegmentClick={label => onDrill({ type: "job", value: label, label })}
          />
        </SHPanel>
      </div>

      {/* Row 5: Avg Days in Phase by Stage */}
      <div className="sh-panels-row">
        <SHPanel kicker="Cycle Time" title="Avg Days in Phase by Stage">
          <SHRankedBars
            items={avgDaysByStage}
            showRank
            formatValue={(v: number) => `${v}d`}
            onBarClick={label => { onStageClick(label); onDrill({ type: "stage", value: label, label: `Avg Days — ${label}` }); }}
          />
        </SHPanel>
      </div>

    </>
  );
}
