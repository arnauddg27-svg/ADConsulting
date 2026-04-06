"use client";

import type { SHSale } from "@/types/sunshine-homes";
import { getSalesKPIs, getSalesByPlan, fmt$, fmtN } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHRankedBars from "../../sunshine/SHRankedBars";
import SHDonutChart from "../../sunshine/SHDonutChart";

interface Props {
  sales: SHSale[];
  onCommunityClick: (community: string) => void;
}

export default function BHSalesDashboardTab({ sales, onCommunityClick }: Props) {
  const kpis = getSalesKPIs(sales);
  const byPlan = getSalesByPlan(sales);

  const byCommunity = Array.from(new Set(sales.map(s => s.community)))
    .map(comm => ({
      label: comm,
      value: sales.filter(s => s.community === comm).length,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Sales</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Sales performance, value metrics, and closing pipeline.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Sales" value={fmtN(kpis.totalSales)} sub="Signed contracts" accent="#14b8a6" />
        <SHKpiCard label="Total Value" value={fmt$(kpis.totalValue)} sparkline={[420000, 450000, 480000, 510000, 540000, 560000, 580000, 600000, 620000, 650000]} />
        <SHKpiCard label="Avg Sale Price" value={fmt$(Math.round(kpis.avgPrice))} sub={`$${Math.round(kpis.avgPrice / 1000)}K median`} accent="#22d3ee" />
        <SHKpiCard label="Pending Closings" value={fmtN(kpis.pendingClosings)} sub="Ready to close" accent="#f59e0b" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Communities" title="Contracts by Community">
          <SHRankedBars items={byCommunity} onBarClick={onCommunityClick} showRank />
        </SHPanel>
        <SHPanel kicker="Plans" title="Sales by Plan">
          <SHDonutChart segments={byPlan} />
        </SHPanel>
      </div>

    </>
  );
}
