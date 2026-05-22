"use client";

import type { SHJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import {
  avgPhaseDays,
  getAvgPhaseDays, getCycleTimeDistribution,
  getCycleTimeByCity, getCycleTimeTrend, getCompletionTrendlines,
  getMilestoneSparklines,
  buildQuarterTrend,
  formatTrendDelta,
  trendValues,
  fmtN,
  isActiveJob,
  STAGES,
} from "@/lib/sunshine-homes-data";

import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHCycleTimePipeline from "../SHCycleTimePipeline";
import SHHistogram from "../SHHistogram";
import SHStackedCycleBar from "../SHStackedCycleBar";
import SHMultiLineChart from "../SHMultiLineChart";
import SHSparklineCards from "../SHSparklineCards";
import { usePaletteColors } from "../chartPalette";

interface Props {
  jobs: SHJob[];
  onDrill: (detail: DrillDetail) => void;
  onCityClick?: (city: string) => void;
}

export default function ConstructionCycleTimeTab({ jobs, onDrill, onCityClick }: Props) {
  const palCols = usePaletteColors(STAGES.length);
  const completedJobs = jobs.filter(j => j.coDate);
  const avgCycleDays = completedJobs.length
    ? completedJobs.reduce((s, j) => s + j.totalCycleDays, 0) / completedJobs.length
    : 0;
  const avgCycleMonths = (avgCycleDays / 30.44); // days → months

  const actualPhaseDays = getAvgPhaseDays(jobs);
  const actualCycleDistribution = getCycleTimeDistribution(jobs);
  const totalPhaseDays = avgPhaseDays.reduce((s, p) => s + p.days, 0);
  const targetMonths = (totalPhaseDays / 30.44);
  const activeCount = jobs.filter(isActiveJob).length;
  const completionsThisPeriod = jobs.filter(j => j.coDate).length;

  /* Cycle Time derived data */
  const cycleByCity = getCycleTimeByCity(jobs);
  const cycleTrend = getCycleTimeTrend(jobs);
  const completionTrends = getCompletionTrendlines(jobs);
  const sparklines = getMilestoneSparklines(jobs);
  const completionsTrend = buildQuarterTrend(completedJobs, j => j.coDate, () => 1, { cumulative: false, maxPoints: 8 });
  const completionsDelta = formatTrendDelta(trendValues(completionsTrend));
  /* Multi-line chart data */
  const trendLines = [
    { label: "Foundation→CO", color: "#1e3a5f", data: completionTrends.map(t => ({ x: t.period, y: t.foundationToCompletion })) },
    { label: "Framing→CO", color: "#14b8a6", data: completionTrends.map(t => ({ x: t.period, y: t.framingToCompletion })) },
    { label: "Finishes→CO", color: "#ef8c3b", data: completionTrends.map(t => ({ x: t.period, y: t.finishesToCompletion })) },
  ];

  const cycleTimeLine = [{
    label: "Avg Cycle Time",
    color: "#14b8a6",
    data: cycleTrend.map(t => ({ x: t.period, y: Math.round(t.avgDays / 30.44 * 10) / 10 })),
  }];

  // Palette-aware phase colors. Map each construction phase to the active
  // palette by its canonical STAGES index, so the same phase reads as the same
  // color across the pipeline + stacked-bar charts. No palette → original.
  const phaseColor = (phase: string): string | null => {
    if (!palCols) return null;
    const idx = (STAGES as readonly string[]).indexOf(phase);
    return palCols[(idx >= 0 ? idx : 0) % palCols.length];
  };
  const phaseDays = palCols
    ? actualPhaseDays.map(p => ({ ...p, color: phaseColor(p.phase) ?? p.color }))
    : actualPhaseDays;
  const cityPhases = palCols
    ? cycleByCity.map(c => ({ ...c, phases: c.phases.map(p => ({ ...p, color: phaseColor(p.phase) ?? p.color })) }))
    : cycleByCity;

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Cycle Time</h2>
        <p className="sh-tab-desc">Phase duration analysis, milestone evolution, and completion trends. Click any element for job-level details.</p>
      </div>

      {/* KPIs */}
      <div className="sh-kpi-row">
        <SHKpiCard label="Average Cycle Time" value={`${avgCycleMonths.toFixed(1)} months`} sub="Start → CO" sparkline={cycleTrend.map(t => t.avgDays)} onClick={() => onDrill({ type: "cycle-metric", value: "avg-cycle", label: `Average Cycle Time — ${avgCycleMonths.toFixed(1)} months` })} />
        <SHKpiCard label="Target Cycle" value={`${targetMonths.toFixed(1)} months`} sub="Start → CO target" accent="#22d3ee" delta={avgCycleMonths > targetMonths ? `+${(avgCycleMonths - targetMonths).toFixed(1)}mo over` : `${(targetMonths - avgCycleMonths).toFixed(1)}mo under`} deltaDir={avgCycleMonths <= targetMonths ? "up" : "down"} onClick={() => onDrill({ type: "cycle-metric", value: "target-cycle", label: `Target Cycle — ${targetMonths.toFixed(1)} months` })} />
        <SHKpiCard label="Completions" value={fmtN(completionsThisPeriod)} sub="COs received" accent="#0f766e" sparkline={trendValues(completionsTrend)} delta={completionsDelta.delta} deltaDir={completionsDelta.deltaDir} onClick={() => onDrill({ type: "cycle-metric", value: "completions", label: `Completions — ${fmtN(completionsThisPeriod)}` })} />
        <SHKpiCard label="In Construction" value={fmtN(activeCount)} sub="Active jobs" accent="#3b82f6" progress={Math.round((activeCount / Math.max(jobs.length, 1)) * 100)} delta={`${Math.round((activeCount / Math.max(jobs.length, 1)) * 100)}% of total`} deltaDir="neutral" onClick={() => onDrill({ type: "cycle-metric", value: "in-construction", label: `In Construction — ${fmtN(activeCount)}` })} />
      </div>

      {/* Phase duration bar + histogram */}
      <div className="sh-panels-row">
        <SHPanel kicker="Phase Analysis" title="Average Phase Durations">
          <SHCycleTimePipeline phases={phaseDays} onPhaseClick={(phase) => onDrill({ type: "stage", value: phase, label: `${phase} Phase Jobs` })} />
        </SHPanel>
        <SHPanel kicker="Distribution" title="Cycle Time Distribution">
          <SHHistogram buckets={actualCycleDistribution} onBucketClick={(bucket) => onDrill({ type: "cycle-bucket", value: bucket, label: `Cycle Time Bucket — ${bucket}` })} />
        </SHPanel>
      </div>

      {/* CP-11: Stacked Cycle Time by City */}
      <div className="sh-panels-row single">
        <SHPanel kicker="CP-11" title="Cycle Time by City — Phase Breakdown">
          <SHStackedCycleBar
            cities={cityPhases}
            onPhaseClick={(city) => onCityClick ? onCityClick(city) : onDrill({ type: "community", value: city, label: city })}
          />
        </SHPanel>
      </div>

      {/* CP-12: Cycle Time Trendline */}
      {cycleTrend.length > 1 && (
        <div className="sh-panels-row single">
          <SHPanel kicker="CP-12" title="Cycle Time Trendline — by Start Date Cohort">
            <SHMultiLineChart
              lines={cycleTimeLine}
              goalLine={Math.round(targetMonths * 10) / 10}
              formatY={v => `${v.toFixed(1)}mo`}
              onPointClick={(_, x) => {
                const point = cycleTrend.find(t => t.period === x);
                if (point) onDrill({ type: "cycle-time-cohort", value: x, label: `${x} cohort (${point.jobCount} jobs)` });
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
              onPointClick={(lineLabel, x) => onDrill({ type: "cycle-time-cohort", value: x, label: `${lineLabel} — ${x}` })}
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

    </>
  );
}
