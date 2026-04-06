"use client";

import type { SHAuditJob, SHTab } from "@/types/sunshine-homes";
import { getAuditKPIs, getAuditCostBreakdown, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHHistogram from "../SHHistogram";
import SHAreaChart from "../SHAreaChart";

const PROFIT_TREND = [
  { label: "Q1 '24", value: 1.1 },
  { label: "Q2 '24", value: 1.5 },
  { label: "Q3 '24", value: 2.0 },
  { label: "Q4 '24", value: 2.8 },
  { label: "Q1 '25", value: 3.5 },
  { label: "Q2 '25", value: 4.4 },
  { label: "Q3 '25", value: 5.2 },
  { label: "Q4 '25", value: 6.3 },
];

interface Props {
  audits: SHAuditJob[];
  onCommunityClick: (community: string) => void;
  onStatusClick: (status: string) => void;
  onTabChange: (tab: SHTab) => void;
}

export default function AuditsDashboardTab({ audits, onCommunityClick, onStatusClick, onTabChange }: Props) {
  const kpis = getAuditKPIs(audits);
  const costBreakdown = getAuditCostBreakdown(audits);

  /* Margin distribution */
  const marginBuckets = [
    { label: "< 0%", value: audits.filter(a => a.netMargin < 0).length, color: "#ef4444" },
    { label: "0–10%", value: audits.filter(a => a.netMargin >= 0 && a.netMargin < 10).length, color: "#f59e0b" },
    { label: "10–15%", value: audits.filter(a => a.netMargin >= 10 && a.netMargin < 15).length, color: "#22d3ee" },
    { label: "15–20%", value: audits.filter(a => a.netMargin >= 15 && a.netMargin < 20).length, color: "#14b8a6" },
    { label: "20%+", value: audits.filter(a => a.netMargin >= 20).length, color: "#0f766e" },
  ].filter(b => b.value > 0);

  /* Builder fee histogram — 5 buckets */
  const fees = audits.map(a => a.builderFeePct);
  const feeMin = Math.min(...fees);
  const feeMax = Math.max(...fees);
  const feeStep = (feeMax - feeMin) / 5 || 1;
  const FEE_COLORS = ["#14b8a6", "#22d3ee", "#3b82f6", "#6366f1", "#a855f7"];
  const feeHistogram = Array.from({ length: 5 }, (_, i) => {
    const lo = feeMin + i * feeStep;
    const hi = lo + feeStep;
    return {
      bucket: `${lo.toFixed(1)}–${hi.toFixed(1)}%`,
      count: audits.filter(a => a.builderFeePct >= lo && (i === 4 ? a.builderFeePct <= hi : a.builderFeePct < hi)).length,
      color: FEE_COLORS[i],
    };
  });

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
        <SHKpiCard label="Audited Jobs" value={fmtN(kpis.count)} sub="With cost data" sparkline={[15, 18, 20, 22, 24, 26, 28, 30, 32, kpis.count]} delta="+5 this quarter" deltaDir="up" onClick={() => onTabChange("audits-pipeline")} />
        <SHKpiCard label="Total Revenue" value={fmt$(kpis.totalRevenue)} accent="#22d3ee" sparkline={[8.5, 9.2, 10.1, 11.0, 12.2, 13.5, 14.1, 15.0, 15.8, 16.5]} delta="+8% YoY" deltaDir="up" onClick={() => onTabChange("audits-pipeline")} />
        <SHKpiCard label="Total Profit" value={fmt$(kpis.totalProfit)} accent={kpis.totalProfit > 0 ? "#14b8a6" : "#f46a6a"} sparkline={[1.2, 1.4, 1.3, 1.5, 1.6, 1.8, 1.7, 2.0, 2.1, 2.3]} delta={kpis.totalProfit > 0 ? "Profitable" : "Loss"} deltaDir={kpis.totalProfit > 0 ? "up" : "down"} onClick={() => onTabChange("audits-pipeline")} />
        <SHKpiCard label="Avg Net Margin" value={fmtPct(kpis.avgMargin)} accent={kpis.avgMargin >= 15 ? "#14b8a6" : kpis.avgMargin >= 5 ? "#efb562" : "#f46a6a"} progress={Math.min(100, Math.round(kpis.avgMargin * 3))} delta={kpis.atRisk > 0 ? `${kpis.atRisk} at-risk` : "All profitable"} deltaDir={kpis.atRisk > 0 ? "down" : "up"} onClick={() => onTabChange("audits-pipeline")} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="PL-02" title="Cost Distribution">
          <SHDonutChart segments={costBreakdown} />
        </SHPanel>
        <SHPanel kicker="PL-03" title="Net Margin Distribution">
          <SHDonutChart segments={marginBuckets} />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="By Community" title="Average Net Margin">
          <SHRankedBars
            items={byCommunity}
            formatValue={v => `${v}%`}
            onBarClick={onCommunityClick}
            showRank
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Builder Fee" title="Fee % Distribution">
          <SHHistogram buckets={feeHistogram} />
        </SHPanel>
        <SHPanel kicker="Profit Trend" title="Cumulative Profit">
          <SHAreaChart
            data={PROFIT_TREND}
            color="#14b8a6"
            label1="Profit ($M)"
            formatY={v => `$${v.toFixed(1)}M`}
          />
        </SHPanel>
      </div>
    </>
  );
}
