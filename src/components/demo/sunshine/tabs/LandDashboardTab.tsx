"use client";

import type { SHLandDeal } from "@/types/sunshine-homes";
import { getLandKPIs, fmt$, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHCompactTable from "../SHCompactTable";
import SHPill from "../SHPill";

interface Props {
  deals: SHLandDeal[];
  onCommunityClick: (community: string) => void;
}

export default function LandDashboardTab({ deals, onCommunityClick }: Props) {
  const kpis = getLandKPIs(deals);

  /* group by city */
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
        <p className="sh-tab-desc">Acquisition pipeline, lot pricing, and deal flow.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Active Deals" value={fmtN(kpis.activeDeals)} />
        <SHKpiCard label="Closed Deals" value={fmtN(kpis.closedDeals)} accent="#22d3ee" />
        <SHKpiCard label="Pipeline Lots" value={fmtN(kpis.totalLotsInPipeline)} />
        <SHKpiCard label="Avg Cost/Lot" value={fmt$(kpis.avgCostPerLot)} accent="#3b82f6" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Geography" title="Lots by City">
          <SHRankedBars items={byCity} />
        </SHPanel>
        <SHPanel kicker="Deals" title="Land Acquisition Pipeline">
          <SHCompactTable
            columns={[
              { key: "name", label: "Deal", width: "1fr" },
              { key: "city", label: "City", width: "100px" },
              { key: "lots", label: "Lots", width: "60px", align: "right" },
              { key: "acquisitionCost", label: "Cost", width: "90px", align: "right", render: r => fmt$(Number(r.acquisitionCost)) },
              { key: "status", label: "Status", width: "100px", render: r => {
                const s = String(r.status);
                const tone = s === "closed" ? "good" : s === "under-contract" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.replace("-", " ")} />;
              }},
            ]}
            rows={deals as unknown as Record<string, unknown>[]}
            onRowClick={r => onCommunityClick(String(r.community))}
          />
        </SHPanel>
      </div>
    </>
  );
}
