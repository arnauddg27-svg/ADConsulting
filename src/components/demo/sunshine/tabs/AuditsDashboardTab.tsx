"use client";

import type { SHAuditJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getAuditKPIs, getAuditCostBreakdown, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHCompactTable from "../SHCompactTable";
import SHPill from "../SHPill";

interface Props {
  audits: SHAuditJob[];
  onDrill: (detail: DrillDetail) => void;
}

export default function AuditsDashboardTab({ audits, onDrill }: Props) {
  const kpis = getAuditKPIs(audits);
  const costBreakdown = getAuditCostBreakdown(audits);

  /* Margin distribution */
  const marginBuckets = [
    { label: "< 0%", value: audits.filter(a => a.netMargin < 0).length, color: "#f46a6a" },
    { label: "0–10%", value: audits.filter(a => a.netMargin >= 0 && a.netMargin < 10).length, color: "#efb562" },
    { label: "10–20%", value: audits.filter(a => a.netMargin >= 10 && a.netMargin < 20).length, color: "#22d3ee" },
    { label: "20–30%", value: audits.filter(a => a.netMargin >= 20 && a.netMargin < 30).length, color: "#14b8a6" },
    { label: "30%+", value: audits.filter(a => a.netMargin >= 30).length, color: "#0f766e" },
  ].filter(b => b.value > 0);

  /* Top at-risk jobs (worst margin first) */
  const atRiskJobs = [...audits].sort((a, b) => a.netMargin - b.netMargin).slice(0, 15);

  /* By community avg margin */
  const byCommunity = (() => {
    const map = new Map<string, { count: number; totalMargin: number }>();
    for (const a of audits) {
      const e = map.get(a.community) || { count: 0, totalMargin: 0 };
      e.count++;
      e.totalMargin += a.netMargin;
      map.set(a.community, e);
    }
    return Array.from(map.entries())
      .map(([label, d]) => ({
        label,
        value: Math.round(d.totalMargin / d.count * 10) / 10,
        status: (d.totalMargin / d.count) >= 15 ? "good" as const : (d.totalMargin / d.count) >= 5 ? "watch" as const : "alert" as const,
      }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Audits</div>
        <h2 className="sh-tab-title">P&L Dashboard</h2>
        <p className="sh-tab-desc">Per-job profitability analysis, cost breakdown, and margin distribution. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Audited Jobs" value={fmtN(kpis.count)} sub="With cost data" />
        <SHKpiCard label="Total Revenue" value={fmt$(kpis.totalRevenue)} accent="#22d3ee" />
        <SHKpiCard label="Total Profit" value={fmt$(kpis.totalProfit)} accent={kpis.totalProfit > 0 ? "#14b8a6" : "#f46a6a"} />
        <SHKpiCard label="Avg Net Margin" value={fmtPct(kpis.avgMargin)} accent={kpis.avgMargin >= 15 ? "#14b8a6" : kpis.avgMargin >= 5 ? "#efb562" : "#f46a6a"} delta={kpis.atRisk > 0 ? `${kpis.atRisk} at-risk` : "All profitable"} deltaDir={kpis.atRisk > 0 ? "down" : "up"} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="PL-02" title="Cost Distribution">
          <SHDonutChart segments={costBreakdown} onSegmentClick={label => onDrill({ type: "cost-category", value: label, label })} />
        </SHPanel>
        <SHPanel kicker="PL-03" title="Net Margin Distribution">
          <SHDonutChart segments={marginBuckets} onSegmentClick={label => onDrill({ type: "margin-bucket", value: label, label })} />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="By Community" title="Average Net Margin">
          <SHRankedBars
            items={byCommunity}
            formatValue={v => `${v}%`}
            onBarClick={label => onDrill({ type: "community", value: label, label })}
            showRank
          />
        </SHPanel>
        <SHPanel kicker="PL-03" title="Jobs Sorted by Margin (Worst First)">
          <SHCompactTable
            columns={[
              { key: "jobCode", label: "Job", width: "80px" },
              { key: "community", label: "Community", width: "1fr" },
              { key: "salePrice", label: "Sale", width: "75px", align: "right", render: r => fmt$(Number(r.salePrice)) },
              { key: "totalCost", label: "Cost", width: "75px", align: "right", render: r => fmt$(Number(r.totalCost)) },
              { key: "netProfit", label: "Profit", width: "75px", align: "right", render: r => {
                const v = Number(r.netProfit);
                return <span style={{ color: v >= 0 ? "var(--sh-accent)" : "var(--sh-danger)", fontWeight: 600 }}>{fmt$(v)}</span>;
              }},
              { key: "netMargin", label: "Margin", width: "70px", align: "right", render: r => {
                const m = Number(r.netMargin);
                const tone = m >= 15 ? "good" : m >= 5 ? "watch" : "alert";
                return <SHPill tone={tone} label={fmtPct(m)} />;
              }},
            ]}
            rows={atRiskJobs as unknown as Record<string, unknown>[]}
            onRowClick={r => onDrill({ type: "job", value: String(r.jobCode), label: String(r.jobCode) })}
          />
        </SHPanel>
      </div>
    </>
  );
}
