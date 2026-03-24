"use client";

import type { SHLandDeal } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getLandKPIs, fmt$, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHCompactTable from "../SHCompactTable";
import SHPill from "../SHPill";

interface Props {
  deals: SHLandDeal[];
  onCommunityClick: (community: string) => void;
  onDrill: (detail: DrillDetail) => void;
}

export default function LandDashboardTab({ deals, onCommunityClick, onDrill }: Props) {
  const kpis = getLandKPIs(deals);

  const byCity = (() => {
    const map = new Map<string, number>();
    for (const d of deals.filter(d => d.status !== "cancelled")) {
      map.set(d.city, (map.get(d.city) || 0) + d.lots);
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Land</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Acquisition pipeline, lot pricing, and deal flow. Click rows for community details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Active Deals" value={fmtN(kpis.activeDeals)} />
        <SHKpiCard label="Closed Deals" value={fmtN(kpis.closedDeals)} accent="#22d3ee" />
        <SHKpiCard label="Pipeline Lots" value={fmtN(kpis.totalLotsInPipeline)} sparkline={[80, 95, 110, 120, 135, 150, 160, 170]} delta="+35 lots YoY" deltaDir="up" />
        <SHKpiCard label="Avg Cost/Lot" value={fmt$(kpis.avgCostPerLot)} accent="#3b82f6" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Geography" title="Lots by City">
          <SHRankedBars items={byCity} showRank />
        </SHPanel>
        <SHPanel kicker="Deals" title="Land Acquisition Pipeline">
          <SHCompactTable
            columns={[
              { key: "name", label: "Deal", width: "1fr" },
              { key: "city", label: "City", width: "90px" },
              { key: "acres", label: "Acres", width: "55px", align: "right" },
              { key: "lots", label: "Lots", width: "50px", align: "right" },
              { key: "costPerLot", label: "$/Lot", width: "70px", align: "right", render: r => fmt$(Number(r.costPerLot)) },
              { key: "acquisitionCost", label: "Total", width: "80px", align: "right", render: r => fmt$(Number(r.acquisitionCost)) },
              { key: "status", label: "Status", width: "95px", render: r => {
                const s = String(r.status);
                const tone = s === "closed" ? "good" : s === "under-contract" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.replace("-", " ")} />;
              }},
            ]}
            rows={deals as unknown as Record<string, unknown>[]}
            onRowClick={r => onDrill({ type: "community", value: String(r.community), label: String(r.name) })}
          />
        </SHPanel>
      </div>
    </>
  );
}
