"use client";

import type { SHJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import {
  avgPhaseDays, cycleTimeDistribution,
  getCycleTimeByCity, getCycleTimeTrend, getCompletionTrendlines,
  getMilestoneSparklines, getStageOutliers,
  fmtN,
} from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHCycleTimePipeline from "../SHCycleTimePipeline";
import SHHistogram from "../SHHistogram";
import SHStackedCycleBar from "../SHStackedCycleBar";
import SHMultiLineChart from "../SHMultiLineChart";
import SHSparklineCards from "../SHSparklineCards";
import SHCompactTable from "../SHCompactTable";
import SHPill from "../SHPill";

interface Props {
  jobs: SHJob[];
  onDrill: (detail: DrillDetail) => void;
}

export default function ConstructionCycleTimeTab({ jobs, onDrill }: Props) {
  const completedJobs = jobs.filter(j => j.totalCycleDays > 200);
  const avgCycle = completedJobs.length
    ? Math.round(completedJobs.reduce((s, j) => s + j.totalCycleDays, 0) / completedJobs.length)
    : 0;

  const totalPhaseDays = avgPhaseDays.reduce((s, p) => s + p.days, 0);
  const activeCount = jobs.filter(j => j.stage !== "Closing" && j.completionPct < 95).length;
  const completionsThisPeriod = jobs.filter(j => j.coDate).length;

  /* Cycle Time derived data */
  const cycleByCity = getCycleTimeByCity(jobs);
  const cycleTrend = getCycleTimeTrend(jobs);
  const completionTrends = getCompletionTrendlines(jobs);
  const sparklines = getMilestoneSparklines(jobs);
  const outliers = getStageOutliers(jobs);

  /* Multi-line chart data */
  const trendLines = [
    { label: "Foundation→CO", color: "#1e3a5f", data: completionTrends.map(t => ({ x: t.period, y: t.foundationToCompletion })) },
    { label: "Framing→CO", color: "#14b8a6", data: completionTrends.map(t => ({ x: t.period, y: t.framingToCompletion })) },
    { label: "Finishes→CO", color: "#ef8c3b", data: completionTrends.map(t => ({ x: t.period, y: t.finishesToCompletion })) },
  ];

  const cycleTimeLine = [{
    label: "Avg Cycle Time",
    color: "#14b8a6",
    data: cycleTrend.map(t => ({ x: t.period, y: t.avgDays })),
  }];

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Cycle Time</h2>
        <p className="sh-tab-desc">Phase duration analysis, milestone evolution, and completion trends. Click any element for job-level details.</p>
      </div>

      {/* KPIs */}
      <div className="sh-kpi-row">
        <SHKpiCard label="Avg Cycle Time" value={`${avgCycle}d`} sub="Start to CO" sparkline={cycleTrend.map(t => t.avgDays)} />
        <SHKpiCard label="Target Cycle" value={`${totalPhaseDays}d`} sub="Sum of phase averages" accent="#22d3ee" />
        <SHKpiCard label="Completions" value={fmtN(completionsThisPeriod)} sub="COs received" accent="#0f766e" />
        <SHKpiCard label="In Construction" value={fmtN(activeCount)} sub="Active jobs" accent="#3b82f6" />
      </div>

      {/* Phase duration bar + histogram */}
      <div className="sh-panels-row">
        <SHPanel kicker="Phase Analysis" title="Average Phase Durations">
          <SHCycleTimePipeline phases={avgPhaseDays} />
        </SHPanel>
        <SHPanel kicker="Distribution" title="Cycle Time Distribution">
          <SHHistogram buckets={cycleTimeDistribution} />
        </SHPanel>
      </div>

      {/* CP-11: Stacked Cycle Time by City */}
      <div className="sh-panels-row single">
        <SHPanel kicker="CP-11" title="Cycle Time by City — Phase Breakdown">
          <SHStackedCycleBar
            cities={cycleByCity}
            onPhaseClick={(city, phase) => onDrill({ type: "community", value: city, label: `${city} — ${phase}` })}
          />
        </SHPanel>
      </div>

      {/* CP-12: Cycle Time Trendline */}
      {cycleTrend.length > 1 && (
        <div className="sh-panels-row single">
          <SHPanel kicker="CP-12" title="Cycle Time Trendline — by Start Date Cohort">
            <SHMultiLineChart
              lines={cycleTimeLine}
              goalLine={totalPhaseDays}
              formatY={v => `${v}d`}
              onPointClick={(_, x) => {
                const point = cycleTrend.find(t => t.period === x);
                if (point) onDrill({ type: "stage", value: x, label: `${x} cohort (${point.jobCount} jobs)` });
              }}
            />
          </SHPanel>
        </div>
      )}

      {/* CP-18: Completion Trendlines (3 lines) */}
      {completionTrends.length > 1 && (
        <div className="sh-panels-row single">
          <SHPanel kicker="CP-18" title="Completion Cycle Time Trendline — by Start Date">
            <SHMultiLineChart
              lines={trendLines}
              formatY={v => `${v}d`}
              onPointClick={(lineLabel, x) => onDrill({ type: "stage", value: x, label: `${lineLabel} — ${x}` })}
            />
          </SHPanel>
        </div>
      )}

      {/* CP-16: Milestone Sparkline Cards by City */}
      {sparklines.length > 0 && (
        <div className="sh-panels-row single">
          <SHPanel kicker="CP-16" title="Average Days Between Milestones — by City">
            <SHSparklineCards
              cards={sparklines.map(s => ({
                label: s.city,
                current: s.current,
                goal: s.goal,
                data: s.data,
                status: s.status,
                unit: "days",
              }))}
              onCardClick={label => onDrill({ type: "community", value: label, label })}
              columns={2}
            />
          </SHPanel>
        </div>
      )}

      {/* CP-10: Stage Duration Outliers */}
      {outliers.length > 0 && (
        <div className="sh-panels-row single">
          <SHPanel kicker="CP-10" title="Stage Duration Outliers — Jobs Exceeding Community Average">
            <SHCompactTable
              columns={[
                { key: "jobCode", label: "Job", width: "80px" },
                { key: "community", label: "Community", width: "1fr" },
                { key: "stage", label: "Stage", width: "100px" },
                { key: "daysInCurrentPhase", label: "Days", width: "60px", align: "right", render: r => {
                  const d = Number(r.daysInCurrentPhase);
                  return <span style={{ color: d > 30 ? "var(--sh-danger)" : "var(--sh-warning)", fontWeight: 700 }}>{d}d</span>;
                }},
                { key: "completionPct", label: "Comp %", width: "65px", align: "right", render: r => `${r.completionPct}%` },
                { key: "superintendent", label: "Super", width: "100px" },
                { key: "city", label: "City", width: "90px" },
                { key: "plan", label: "Plan", width: "100px" },
                { key: "marginPct", label: "Margin", width: "65px", align: "right", render: r => {
                  const m = Number(r.marginPct);
                  const tone = m >= 24 ? "good" : m >= 20 ? "watch" : "alert";
                  return <SHPill tone={tone} label={`${m}%`} />;
                }},
              ]}
              rows={outliers as unknown as Record<string, unknown>[]}
              onRowClick={r => onDrill({ type: "job", value: String(r.jobCode), label: String(r.jobCode) })}
            />
          </SHPanel>
        </div>
      )}
    </>
  );
}
