"use client";

import type { SHJob } from "@/types/sunshine-homes";
import { getCostKPIs, getCostBreakdown, fmt$, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHAreaChart from "../SHAreaChart";
import SHCompactTable from "../SHCompactTable";
import SHPill from "../SHPill";

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
}

export default function ConstructionCostTab({ jobs }: Props) {
  const kpis = getCostKPIs(jobs);
  const breakdown = getCostBreakdown();

  const varianceRows = jobs
    .map(j => ({
      jobCode: j.jobCode,
      community: j.community,
      budget: j.originalBudget,
      actual: j.actualCostToDate,
      variance: j.actualCostToDate - j.originalBudget,
      marginPct: j.marginPct,
    }))
    .sort((a, b) => a.variance - b.variance);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Cost Metrics</h2>
        <p className="sh-tab-desc">Budget vs actual, variance analysis, and margin tracking.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Budget" value={fmt$(kpis.totalBudget)} progress={100} />
        <SHKpiCard
          label="Total Actual"
          value={fmt$(kpis.totalActual)}
          progress={Math.round((kpis.totalActual / kpis.totalBudget) * 100)}
          sub={`${Math.round((kpis.totalActual / kpis.totalBudget) * 100)}% of budget`}
        />
        <SHKpiCard
          label="Variance"
          value={fmt$(Math.abs(kpis.variance))}
          delta={kpis.variance <= 0 ? "Under budget" : "Over budget"}
          deltaDir={kpis.variance <= 0 ? "up" : "down"}
          accent={kpis.variance <= 0 ? "#24c18d" : "#f46a6a"}
        />
        <SHKpiCard
          label="Avg Margin"
          value={fmtPct(kpis.avgMargin)}
          accent="#22d3ee"
          sparkline={[22.1, 23.0, 22.8, 23.5, 24.0, 23.8, 24.2, 24.5, 24.3, 24.6]}
          delta="Healthy" deltaDir="up"
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
          />
        </SHPanel>
        <SHPanel kicker="Breakdown" title="Cost Distribution">
          <SHDonutChart segments={breakdown} />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Variance" title="Budget vs Actual by Job">
          <SHCompactTable
            columns={[
              { key: "jobCode", label: "Job", width: "90px" },
              { key: "community", label: "Community", width: "1fr" },
              { key: "budget", label: "Budget", width: "90px", align: "right", render: r => fmt$(Number(r.budget)) },
              { key: "actual", label: "Actual", width: "90px", align: "right", render: r => fmt$(Number(r.actual)) },
              { key: "variance", label: "Var", width: "80px", align: "right", render: r => {
                const v = Number(r.variance);
                return <span style={{ color: v > 0 ? "var(--sh-danger)" : "var(--sh-accent)", fontWeight: 600 }}>{fmt$(v)}</span>;
              }},
              { key: "marginPct", label: "Margin", width: "70px", align: "right", render: r => {
                const m = Number(r.marginPct);
                const tone = m >= 24 ? "good" : m >= 20 ? "watch" : "alert";
                return <SHPill tone={tone} label={fmtPct(m)} />;
              }},
            ]}
            rows={varianceRows as unknown as Record<string, unknown>[]}
          />
        </SHPanel>
      </div>
    </>
  );
}
