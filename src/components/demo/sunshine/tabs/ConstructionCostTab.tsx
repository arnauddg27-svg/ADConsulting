"use client";

import type { SHJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getCostKPIs, getCostBreakdown, fmt$, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHAreaChart from "../SHAreaChart";

/* Monthly budget vs actual trend data */
const MONTHLY_TREND = [
  { label: "Jan", value: 320000, value2: 350000 },
  { label: "Feb", value: 380000, value2: 370000 },
  { label: "Mar", value: 410000, value2: 400000 },
  { label: "Apr", value: 450000, value2: 430000 },
  { label: "May", value: 420000, value2: 440000 },
  { label: "Jun", value: 480000, value2: 460000 },
  { label: "Jul", value: 510000, value2: 490000 },
  { label: "Aug", value: 470000, value2: 480000 },
  { label: "Sep", value: 520000, value2: 500000 },
  { label: "Oct", value: 490000, value2: 510000 },
  { label: "Nov", value: 540000, value2: 520000 },
  { label: "Dec", value: 530000, value2: 540000 },
];

interface Props {
  jobs: SHJob[];
  onDrill: (detail: DrillDetail) => void;
  onCommunityClick?: (community: string) => void;
}

export default function ConstructionCostTab({ jobs, onDrill }: Props) {
  const kpis = getCostKPIs(jobs);
  const breakdown = getCostBreakdown();
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
          progress={Math.round((kpis.totalActual / kpis.totalBudget) * 100)}
          sub={`${Math.round((kpis.totalActual / kpis.totalBudget) * 100)}% of budget`}
          delta={`${Math.round((kpis.totalActual / kpis.totalBudget) * 100)}% drawn`}
          deltaDir="neutral"
          onClick={() => onDrill({ type: "cost-category", value: "actual", label: "Total Actual — All Jobs" })}
        />
        <SHKpiCard
          label="Variance"
          value={fmt$(Math.abs(kpis.variance))}
          delta={kpis.variance <= 0 ? "Under budget" : "Over budget"}
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
            data={MONTHLY_TREND}
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
