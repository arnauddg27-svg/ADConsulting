"use client";

import type { SHLandDeal } from "@/types/sunshine-homes";
import { getLandKPIs, fmt$, fmtN, fmtPct } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHRankedBars from "../../sunshine/SHRankedBars";
import SHDonutChart from "../../sunshine/SHDonutChart";

interface Props {
  deals: SHLandDeal[];
  onCommunityClick: (community: string) => void;
}

export default function BHLandDashboardTab({ deals, onCommunityClick }: Props) {
  const kpis = getLandKPIs(deals);

  const byCity = Array.from(new Set(deals.map(d => d.city)))
    .map(city => ({
      label: city,
      value: deals.filter(d => d.city === city).length,
    }))
    .sort((a, b) => b.value - a.value);

  const statusBreakdown = [
    { label: "Active", value: kpis.activeDeals, color: "#14b8a6" },
    { label: "Closed", value: kpis.closed, color: "#0d9488" },
  ];

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Land</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Land acquisition, lot inventory, and deal status.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Active Deals" value={fmtN(kpis.activeDeals)} sub="In development" accent="#14b8a6" />
        <SHKpiCard label="Closed" value={fmtN(kpis.closed)} sub="Completed deals" accent="#0d9488" />
        <SHKpiCard label="Total Lots" value={fmtN(kpis.totalLots)} sub="Across all deals" accent="#22d3ee" />
        <SHKpiCard label="Cancel Rate" value={fmtPct(kpis.cancelRate)} sub="Unrealized lots" accent="#f59e0b" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Geography" title="Active Deals by City">
          <SHRankedBars items={byCity} onBarClick={city => onCommunityClick(city)} showRank />
        </SHPanel>
        <SHPanel kicker="Status" title="Deal Status">
          <SHDonutChart segments={statusBreakdown} />
        </SHPanel>
      </div>

    </>
  );
}
