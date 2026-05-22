"use client";

import { useMemo } from "react";
import type { SHJob, SHTab } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getConstructionKPIs, getJobsByStage, getCommunityBreakdown, buildCrossTab, fmt$, fmtN, fmtPct, getQuarter, getMonthLabel, getDayLabel, buildQuarterTrend, buildQuarterAverageTrend, formatTrendDelta, trendValues } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHHistogram from "../SHHistogram";
import SHAreaChart from "../SHAreaChart";
import SHCrossTab from "../SHCrossTab";
import { useChartRamp } from "../chartPalette";

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
  const TEAL_BLUE_PALETTE = useChartRamp(["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6"]);
  const stageRamp = useChartRamp(["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6", "#1e40af"]);
  const STAGE_COLORS: Record<string, string> = Object.fromEntries(STAGE_ORDER.map((s, i) => [s, stageRamp[i]]));
  const kpis = getConstructionKPIs(jobs);
  const byStage = getJobsByStage(jobs).map(s => ({ ...s, color: STAGE_COLORS[s.label] ?? stageRamp[2] }));
  const byCommunity = getCommunityBreakdown(jobs);
  const jobTrend = useMemo(() => buildQuarterTrend(jobs, j => j.startDate, () => 1, { cumulative: false, maxPoints: 8 }), [jobs]);
  const completionTrend = useMemo(() => buildQuarterAverageTrend(jobs, j => j.startDate, j => j.completionPct, { maxPoints: 8 }), [jobs]);
  const wipTrendData = useMemo(() => (
    buildQuarterTrend(
      jobs,
      j => j.startDate,
      j => j.wipBalance,
      { cumulative: false, maxPoints: 8 },
    ).map(p => ({ label: p.label, value: Math.round((p.value / 1_000_000) * 10) / 10 }))
  ), [jobs]);
  const jobDelta = formatTrendDelta(trendValues(jobTrend));
  const completionDelta = formatTrendDelta(trendValues(completionTrend), { unit: "pct" });
  const wipDelta = formatTrendDelta(wipTrendData.map(p => p.value * 1_000_000), { unit: "money" });

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

  // --- Ranked Bars: Avg Completion % by Community ---
  const commCompletionMap = new Map<string, { total: number; count: number }>();
  for (const job of jobs) {
    const e = commCompletionMap.get(job.community) ?? { total: 0, count: 0 };
    e.total += job.completionPct;
    e.count++;
    commCompletionMap.set(job.community, e);
  }
  const avgCompletionByCommunity = Array.from(commCompletionMap.entries())
    .map(([label, e]) => {
      const v = Math.round(e.total / e.count);
      return {
        label,
        value: v,
        status: v >= 75 ? "good" as const : v >= 40 ? "watch" as const : "alert" as const,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">KPI snapshot, job status, and community breakdown. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Jobs" value={fmtN(kpis.totalJobs)} sub={`${byCommunity.length} communities`} sparkline={trendValues(jobTrend)} delta={jobDelta.delta} deltaDir={jobDelta.deltaDir} onClick={() => onDrill({ type: "job", value: "all", label: `Total Jobs — ${fmtN(kpis.totalJobs)}` })} />
        <SHKpiCard label="Active Jobs" value={fmtN(kpis.activeJobs)} sub="In construction" progress={Math.round((kpis.activeJobs / kpis.totalJobs) * 100)} onClick={() => onDrill({ type: "job", value: "active", label: `Active Jobs — ${fmtN(kpis.activeJobs)}` })} />
        <SHKpiCard label="Avg Completion" value={fmtPct(kpis.avgCompletion)} accent="#22d3ee" progress={Math.round(kpis.avgCompletion)} sparkline={trendValues(completionTrend)} delta={completionDelta.delta} deltaDir={completionDelta.deltaDir} onClick={() => onDrill({ type: "job", value: "completion", label: `Avg Completion — ${fmtPct(kpis.avgCompletion)}` })} />
        <SHKpiCard label="Total WIP" value={fmt$(kpis.totalWip)} accent="#3b82f6" sparkline={wipTrendData.map(p => p.value)} delta={wipDelta.delta} deltaDir={wipDelta.deltaDir} onClick={() => onDrill({ type: "cost-category", value: "wip", label: `Total WIP — ${fmt$(kpis.totalWip)}` })} />
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
              drillQuarter ? (col) => {
                onMonthClick(new Date(Date.parse(col + " 1, 2000")).getMonth() + 1);
                onDrill({ type: "construction-city-time", value: `|${col}`, label: `All Cities — ${col}`, metric: "Month header" });
              } :
              drillYear ? (col) => {
                onQuarterClick(Number(col.replace("Q", "")));
                onDrill({ type: "construction-city-time", value: `|${col}`, label: `All Cities — ${col}`, metric: "Quarter header" });
              } :
              (col) => {
                onYearClick(Number(col));
                onDrill({ type: "construction-city-time", value: `|${col}`, label: `All Cities — ${col}`, metric: "Year header" });
              }
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

      {/* Row 6: Avg Days in Phase by Stage + Avg Completion by Community */}
      <div className="sh-panels-row">
        <SHPanel kicker="Cycle Time" title="Avg Days in Phase by Stage">
          <SHRankedBars
            items={avgDaysByStage}
            showRank
            formatValue={(v: number) => `${v}d`}
            onBarClick={label => { onStageClick(label); onDrill({ type: "stage", value: label, label: `Avg Days — ${label}` }); }}
          />
        </SHPanel>
        <SHPanel kicker="Progress" title="Avg Completion by Community">
          <SHRankedBars
            items={avgCompletionByCommunity}
            showRank
            formatValue={(v: number) => `${v}%`}
            onBarClick={label => { onCommunityClick(label); onDrill({ type: "community", value: label, label }); }}
          />
        </SHPanel>
      </div>

    </>
  );
}
