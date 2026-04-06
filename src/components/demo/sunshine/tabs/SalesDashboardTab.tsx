"use client";

import type { SHSale } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getSalesKPIs, getSalesByCommunity, getSalesByPlan, fmt$, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHDonutChart from "../SHDonutChart";

const PLAN_COLORS = ["#14b8a6", "#22d3ee", "#3b82f6"];

interface Props {
  sales: SHSale[];
  onCommunityClick: (community: string) => void;
  onDrill: (detail: DrillDetail) => void;
}

export default function SalesDashboardTab({ sales, onCommunityClick, onDrill }: Props) {
  const kpis = getSalesKPIs(sales);
  const byCommunity = getSalesByCommunity(sales);
  const byPlan = getSalesByPlan(sales).map((p, i) => ({ ...p, color: PLAN_COLORS[i % PLAN_COLORS.length] }));

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Sales</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Sales pipeline, community breakdown, and plan performance. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Sales" value={fmtN(kpis.totalSales)} sub="Active contracts" sparkline={[12, 13, 14, 13, 15, 16, 15, 17, 18]} delta="+2 this month" deltaDir="up" />
        <SHKpiCard label="Total Value" value={fmt$(kpis.totalValue)} accent="#22d3ee" sparkline={[5.2, 5.8, 6.3, 6.9, 7.4, 8.0, 8.5, 9.1, 9.6]} delta="+15% YoY" deltaDir="up" />
        <SHKpiCard label="Avg Sale Price" value={fmt$(kpis.avgPrice)} sparkline={[460, 470, 475, 480, 490, 495, 498, 502, 505]} delta="+3% vs prior" deltaDir="up" />
        <SHKpiCard label="Pending Close" value={fmtN(kpis.pendingClosings)} accent="#efb562" sparkline={[3, 4, 5, 4, 6, 5, 7, 6, 8]} delta={`${kpis.pendingClosings} awaiting`} deltaDir="neutral" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="By Community" title="Sales Volume">
          <SHRankedBars
            items={byCommunity}
            onBarClick={label => onDrill({ type: "community", value: label, label })}
            showRank
          />
        </SHPanel>
        <SHPanel kicker="By Plan" title="Sales by Floor Plan">
          <SHDonutChart
            segments={byPlan}
            onSegmentClick={label => onDrill({ type: "plan", value: label, label })}
          />
        </SHPanel>
      </div>

    </>
  );
}
