"use client";

import type { SHJob } from "@/types/sunshine-homes";
import { getCostKPIs, getCostBreakdown, getCommunityBreakdown, fmt$, fmtPct } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHDonutChart from "../../sunshine/SHDonutChart";
import SHRankedBars from "../../sunshine/SHRankedBars";
import SHCompactTable from "../../sunshine/SHCompactTable";
import SHPill from "../../sunshine/SHPill";

interface Props {
  jobs: SHJob[];
}

export default function BHConstructionCostTab({ jobs }: Props) {
  const kpis = getCostKPIs(jobs);
  const breakdown = getCostBreakdown();
  const wipByComm = getCommunityBreakdown(jobs).map(c => ({
    label: c.label,
    value: jobs.filter(j => j.community === c.label).reduce((s, j) => s + j.wipBalance, 0),
  }));

  const budgetRows = jobs
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
        <SHKpiCard label="Total WIP" value={fmt$(jobs.reduce((s, j) => s + j.wipBalance, 0))} progress={100} />
        <SHKpiCard label="WIP w/o Lot" value={fmt$(jobs.reduce((s, j) => s + (j.wipBalance - j.lotCost), 0))} sub="Excluding land costs" />
        <SHKpiCard label="Total Lot Cost" value={fmt$(jobs.reduce((s, j) => s + j.lotCost, 0))} accent="#22d3ee" />
        <SHKpiCard label="Avg Margin" value={fmtPct(kpis.avgMargin)} accent="#3b82f6" delta="Healthy" deltaDir="up" sparkline={[22.1, 23.0, 22.8, 23.5, 24.0, 23.8, 24.2, 24.5, 24.3, 24.6]} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Distribution" title="WIP by Community">
          <SHRankedBars items={wipByComm} formatValue={v => fmt$(v)} showRank />
        </SHPanel>
        <SHPanel kicker="Status" title="Budget Status">
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
            rows={budgetRows as unknown as Record<string, unknown>[]}
          />
        </SHPanel>
      </div>
    </>
  );
}
