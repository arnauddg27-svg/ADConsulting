"use client";

import { useMemo } from "react";
import type { SHJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getCostKPIs, getCostBreakdown, fmt$, fmtPct, buildQuarterTrend, buildQuarterAverageTrend, formatTrendDelta, trendValues } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHAreaChart from "../SHAreaChart";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  jobs: SHJob[];
  onDrill: (detail: DrillDetail) => void;
  onCommunityClick?: (community: string) => void;
}

export default function ConstructionCostTab({ jobs, onDrill }: Props) {
  const kpis = getCostKPIs(jobs);
  const breakdown = getCostBreakdown(jobs);
  const isUnderBudgetToDate = kpis.varianceToDate <= 0;
  const budgetStatusValue = fmt$(Math.abs(kpis.varianceToDate));
  const budgetStatusText = isUnderBudgetToDate ? "Under budget-to-date" : "Over budget-to-date";
  const monthlyTrend = useMemo(() => {
    const buckets = MONTH_LABELS.map((label) => ({ label, value: 0, value2: 0, count: 0 }));
    for (const job of jobs) {
      const month = new Date(job.startDate).getMonth();
      if (month < 0 || month > 11) continue;
      buckets[month].value += job.actualCostToDate;
      buckets[month].value2 += job.originalBudget;
      buckets[month].count += 1;
    }
    return buckets;
  }, [jobs]);
  const budgetTrend = useMemo(() => buildQuarterTrend(jobs, j => j.startDate, j => j.originalBudget, { cumulative: true, maxPoints: 8 }), [jobs]);
  const actualTrend = useMemo(() => buildQuarterTrend(jobs, j => j.startDate, j => j.actualCostToDate, { cumulative: true, maxPoints: 8 }), [jobs]);
  const marginTrend = useMemo(() => buildQuarterAverageTrend(jobs, j => j.startDate, j => j.marginPct, { maxPoints: 8 }), [jobs]);
  const budgetDelta = formatTrendDelta(trendValues(budgetTrend), { unit: "money" });
  const actualDelta = formatTrendDelta(trendValues(actualTrend), { unit: "money", goodWhen: "down" });
  const marginDelta = formatTrendDelta(trendValues(marginTrend), { unit: "pct" });

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Cost Metrics</h2>
        <p className="sh-tab-desc">Budget vs actual, category variance analysis, and margin tracking. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard
          label="Total Budget"
          value={fmt$(kpis.totalBudget)}
          sparkline={budgetTrend.map(p => p.value / 1_000_000)}
          delta={budgetDelta.delta} deltaDir={budgetDelta.deltaDir}
          onClick={() => onDrill({ type: "cost-category", value: "budget", label: "Total Budget — All Jobs" })}
        />
        <SHKpiCard
          label="Total Actual"
          value={fmt$(kpis.totalActual)}
          progress={Math.round((kpis.totalActual / Math.max(kpis.budgetToDate, 1)) * 100)}
          sub={`${Math.round((kpis.totalActual / Math.max(kpis.budgetToDate, 1)) * 100)}% of budget-to-date`}
          delta={`${actualDelta.delta}; ${Math.round((kpis.totalActual / Math.max(kpis.totalBudget, 1)) * 100)}% of total budget`}
          deltaDir={actualDelta.deltaDir}
          sparkline={actualTrend.map(p => p.value / 1_000_000)}
          onClick={() => onDrill({ type: "cost-category", value: "actual", label: "Total Actual — All Jobs" })}
        />
        <SHKpiCard
          label="Budget Status"
          value={budgetStatusValue}
          sub={budgetStatusText}
          delta={`Projected final: ${fmt$(kpis.forecastFinal)}`}
          deltaDir={isUnderBudgetToDate ? "up" : "down"}
          accent={isUnderBudgetToDate ? "#24c18d" : "#f46a6a"}
          sparkline={isUnderBudgetToDate
            ? [1.2, 1.6, 2.1, 2.6, 3.0, 3.5, 4.2, 4.8, 5.4, 6.0]
            : [1.2, 1.6, 1.3, 1.8, 1.5, 1.9, 1.6, 2.1, 1.8, 2.2]}
          onClick={() => onDrill({ type: "cost-category", value: "variance", label: "Budget Status — All Jobs" })}
        />
        <SHKpiCard
          label="Avg Margin"
          value={fmtPct(kpis.avgMargin)}
          accent="#22d3ee"
          sparkline={trendValues(marginTrend)}
          delta={marginDelta.delta} deltaDir={marginDelta.deltaDir}
          onClick={() => onDrill({ type: "cost-category", value: "margin", label: "Margin — All Jobs" })}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Trend" title="Started Jobs: Budget vs. Actual">
          <SHAreaChart
            data={monthlyTrend}
            color="#14b8a6"
            color2="#3b82f6"
            label1="Actual"
            label2="Planned"
            formatY={v => `$${(v / 1000).toFixed(0)}K`}
            onPointClick={(month, monthIndex, series) =>
              onDrill({
                type: "cost-trend-month",
                value: `month-${monthIndex + 1}`,
                label: `${series === "value2" ? "Planned Budget" : series === "value" ? "Actual Spend" : "Budget vs. Actual"} — ${month}`,
                scopedJobCodes: jobs.map(j => j.jobCode),
                series: series === "value2" ? "planned" : series === "value" ? "actual" : "all",
                dateBasis: "Job start date",
              })
            }
          />
        </SHPanel>
        <SHPanel kicker="Breakdown" title="Projected Cost Distribution">
          <SHDonutChart
            segments={breakdown}
            onSegmentClick={label => onDrill({ type: "cost-category", value: label, label: `${label} — Cost Detail` })}
          />
        </SHPanel>
      </div>

    </>
  );
}
