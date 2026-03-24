"use client";

import type { SHSale } from "@/types/sunshine-homes";
import { getSalesKPIs, getSalesByCommunity, getSalesByPlan, fmt$, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHDonutChart from "../SHDonutChart";
import SHCompactTable from "../SHCompactTable";
import SHPill from "../SHPill";

const PLAN_COLORS = ["#14b8a6", "#22d3ee", "#3b82f6"];

interface Props {
  sales: SHSale[];
  onCommunityClick: (community: string) => void;
}

export default function SalesDashboardTab({ sales, onCommunityClick }: Props) {
  const kpis = getSalesKPIs(sales);
  const byCommunity = getSalesByCommunity(sales);
  const byPlan = getSalesByPlan(sales).map((p, i) => ({ ...p, color: PLAN_COLORS[i % PLAN_COLORS.length] }));

  const recentSales = sales
    .filter(s => s.status !== "cancelled")
    .sort((a, b) => b.contractDate.localeCompare(a.contractDate))
    .slice(0, 10);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Sales</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Sales pipeline, community breakdown, and plan performance.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Sales" value={fmtN(kpis.totalSales)} sub="Active contracts" />
        <SHKpiCard label="Total Value" value={fmt$(kpis.totalValue)} accent="#22d3ee" />
        <SHKpiCard label="Avg Sale Price" value={fmt$(kpis.avgPrice)} />
        <SHKpiCard label="Pending Closings" value={fmtN(kpis.pendingClosings)} accent="#efb562" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="By Community" title="Sales Volume">
          <SHRankedBars
            items={byCommunity}
            onBarClick={onCommunityClick}
          />
        </SHPanel>
        <SHPanel kicker="By Plan" title="Sales by Floor Plan">
          <SHDonutChart segments={byPlan} />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Recent" title="Latest Contracts">
          <SHCompactTable
            columns={[
              { key: "jobCode", label: "Job", width: "90px" },
              { key: "community", label: "Community", width: "1fr" },
              { key: "plan", label: "Plan", width: "120px" },
              { key: "salePrice", label: "Price", width: "90px", align: "right", render: r => fmt$(Number(r.salePrice)) },
              { key: "contractDate", label: "Contract", width: "100px" },
              { key: "status", label: "Status", width: "90px", render: r => {
                const status = String(r.status);
                const tone = status === "pending" ? "watch" : status === "active" ? "good" : "alert";
                return <SHPill tone={tone} label={status} />;
              }},
            ]}
            rows={recentSales as unknown as Record<string, unknown>[]}
          />
        </SHPanel>
      </div>
    </>
  );
}
