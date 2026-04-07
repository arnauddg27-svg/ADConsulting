"use client";

import { useMemo } from "react";
import type { SHJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getCostKPIs, getCostBreakdown, fmt$, fmtPct } from "@/lib/sunshine-homes-data";
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
  const breakdown = getCostBreakdown();
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
          sparkline={[3.2, 3.5, 3.8, 4.1, 4.4, 4.7, 5.0, 5.2, 5.5, 5.8]}
          delta="+12% YoY" deltaDir="up"
          onClick={() => onDrill({ type: "cost-category", value: "budget", label: "Total Budget — All Jobs" })}
        />
        <SHKpiCard
          label="Total Actual"
          value={fmt$(kpis.totalActual)}
          progress={Math.round((kpis.totalActual / Math.max(kpis.budgetToDate, 1)) * 100)}
          sub={`${Math.round((kpis.totalActual / Math.max(kpis.budgetToDate, 1)) * 100)}% of budget-to-date`}
          delta={`${Math.round((kpis.totalActual / Math.max(kpis.totalBudget, 1)) * 100)}% of total budget`}
          deltaDir="neutral"
          onClick={() => onDrill({ type: "cost-category", value: "actual", label: "Total Actual — All Jobs" })}
        />
        <SHKpiCard
          label="Forecast Variance"
          value={fmt$(Math.abs(kpis.variance))}
          sub={`Projected final: ${fmt$(kpis.forecastFinal)}`}
          delta={kpis.variance <= 0 ? "Forecast under budget" : "Forecast over budget"}
          deltaDir={kpis.variance <= 0 ? "up" : "down"}
          accent={kpis.variance <= 0 ? "#24c18d" : "#f46a6a"}
          sparkline={[1.2, -0.5, 0.8, -1.0, 0.3, -0.8, 0.5, -0.3, 0.2, Math.abs(kpis.variance / 1000)]}
          onClick={() => onDrill({ type: "cost-category", value: "variance", label: "Variance — All Jobs" })}
        />
        <SHKpiCard
          label="Avg Margin"
          value={fmtPct(kpis.avgMargin)}
          accent="#22d3ee"
          sparkline={[22.1, 23.0, 22.8, 23.5, 24.0, 23.8, 24.2, 24.5, 24.3, 24.6]}
          delta="Healthy" deltaDir="up"
          onClick={() => onDrill({ type: "cost-category", value: "margin", label: "Margin — All Jobs" })}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Trend" title="Budget vs. Actual Spend">
          <SHAreaChart
            data={monthlyTrend}
            color="#14b8a6"
            color2="#3b82f6"
            label1="Actual"
            label2="Planned"
            formatY={v => `$${(v / 1000).toFixed(0)}K`}
            onPointClick={(month, monthIndex) =>
              onDrill({
                type: "cost-trend-month",
                value: `month-${monthIndex + 1}`,
                label: `Budget vs. Actual — ${month}`,
                scopedJobCodes: jobs.map(j => j.jobCode),
              })
            }
          />
        </SHPanel>
        <SHPanel kicker="Breakdown" title="Cost Distribution">
          <SHDonutChart
            segments={breakdown}
            onSegmentClick={label => onDrill({ type: "cost-category", value: label, label: `${label} — Cost Detail` })}
          />
        </SHPanel>
      </div>

    </>
  );
}
