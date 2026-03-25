"use client";

import type { SHLandDeal } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getLandKPIs, fmt$, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHCompactTable from "../SHCompactTable";
import SHDonutChart from "../SHDonutChart";
import SHPill from "../SHPill";

interface Props {
  deals: SHLandDeal[];
  onCommunityClick: (community: string) => void;
  onDrill: (detail: DrillDetail) => void;
}

export default function LandDashboardTab({ deals, onCommunityClick, onDrill }: Props) {
  const kpis = getLandKPIs(deals);
  const nonCancelled = deals.filter(d => d.status !== "cancelled");

  /* Lots by city */
  const byCity = (() => {
    const map = new Map<string, number>();
    for (const d of nonCancelled) map.set(d.city, (map.get(d.city) || 0) + d.lots);
    return Array.from(map.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  })();

  /* Status distribution */
  const byStatus = (() => {
    const closed = deals.filter(d => d.status === "closed").length;
    const active = deals.filter(d => d.status === "under-contract").length;
    const cancelled = deals.filter(d => d.status === "cancelled").length;
    return [
      { label: "Closed", value: closed, color: "#14b8a6" },
      { label: "Under Contract", value: active, color: "#efb562" },
      ...(cancelled > 0 ? [{ label: "Cancelled", value: cancelled, color: "#f46a6a" }] : []),
    ];
  })();

  /* Total investment */
  const totalInvestment = nonCancelled.reduce((s, d) => s + d.acquisitionCost, 0);
  const totalLots = nonCancelled.reduce((s, d) => s + d.lots, 0);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Land</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Acquisition pipeline, lot pricing, and deal flow. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Active Deals" value={fmtN(kpis.activeDeals)} sub={`${kpis.closedDeals} closed`} delta={`+${kpis.activeDeals} in pipeline`} deltaDir="up" />
        <SHKpiCard label="Total Lots" value={fmtN(totalLots)} sparkline={[80, 95, 110, 120, 135, 150, 160, 170]} delta="+35 lots YoY" deltaDir="up" />
        <SHKpiCard label="Total Invested" value={fmt$(totalInvestment)} accent="#22d3ee" sparkline={[2.1, 2.5, 2.8, 3.2, 3.5, 3.9, 4.2, 4.6, 5.0, 5.3]} delta="+18% YoY" deltaDir="up" />
        <SHKpiCard label="Avg Cost/Lot" value={fmt$(kpis.avgCostPerLot)} accent="#3b82f6" sparkline={[38, 40, 42, 43, 44, 45, 46, 47]} delta="+4% vs prior" deltaDir="up" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Status" title="Deal Status Distribution">
          <SHDonutChart segments={byStatus} onSegmentClick={label => onDrill({ type: "land-status", value: label.toLowerCase().replace(" ", "-"), label })} />
        </SHPanel>
        <SHPanel kicker="Geography" title="Lots by City">
          <SHRankedBars items={byCity} onBarClick={label => onDrill({ type: "city", value: label, label })} showRank />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Deals" title="Land Acquisition Pipeline">
          <SHCompactTable
            columns={[
              { key: "name", label: "Deal Name", width: "1.5fr" },
              { key: "city", label: "City", width: "100px" },
              { key: "county", label: "County", width: "110px" },
              { key: "acres", label: "Acres", width: "60px", align: "right" },
              { key: "lots", label: "Lots", width: "55px", align: "right" },
              { key: "costPerLot", label: "$/Lot", width: "75px", align: "right", render: r => fmt$(Number(r.costPerLot)) },
              { key: "acquisitionCost", label: "Total Cost", width: "90px", align: "right", render: r => fmt$(Number(r.acquisitionCost)) },
              { key: "status", label: "Status", width: "110px", render: r => {
                const s = String(r.status);
                const tone = s === "closed" ? "good" : s === "under-contract" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.replace("-", " ")} />;
              }},
            ]}
            rows={deals as unknown as Record<string, unknown>[]}
            onRowClick={r => onDrill({ type: "land-status", value: String(r.name), label: String(r.name) })}
          />
        </SHPanel>
      </div>
    </>
  );
}
