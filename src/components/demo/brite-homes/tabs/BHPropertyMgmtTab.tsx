"use client";

import type { SHPropertyUnit } from "@/types/sunshine-homes";
import { getPropertyKPIs, fmt$, fmtN } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHDonutChart from "../../sunshine/SHDonutChart";
import SHRankedBars from "../../sunshine/SHRankedBars";

interface Props {
  units: SHPropertyUnit[];
}

export default function BHPropertyMgmtTab({ units }: Props) {
  const kpis = getPropertyKPIs(units);

  const occupancySegments = [
    { label: "Leased", value: units.filter(u => u.occupancy === "leased").length, color: "#14b8a6" },
    { label: "Vacant", value: units.filter(u => u.occupancy === "vacant").length, color: "#ef4444" },
  ];

  const byCity = Array.from(new Set(units.map(u => u.city)))
    .map(city => ({
      label: city,
      value: units.filter(u => u.city === city && u.occupancy === "leased").reduce((s, u) => s + u.monthlyRent, 0),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Property Management</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Unit occupancy, revenue tracking, and rental portfolio.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Units" value={fmtN(kpis.totalUnits)} sub="Managed properties" accent="#14b8a6" />
        <SHKpiCard label="Occupancy %" value={fmtN(Math.round(kpis.occupancy))} sub={`${Math.round(kpis.occupancy)}% occupied`} progress={Math.round(kpis.occupancy)} accent="#22d3ee" />
        <SHKpiCard label="Monthly Revenue" value={fmt$(Math.round(kpis.monthlyRevenue))} sparkline={[24000, 26000, 27000, 28000, 29000, 30000, 31000, 32000, 33000, 35000]} />
        <SHKpiCard label="Vacancies" value={fmtN(kpis.vacancies)} sub="Units available" accent="#f59e0b" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Status" title="Occupancy Rate">
          <SHDonutChart segments={occupancySegments} />
        </SHPanel>
        <SHPanel kicker="Revenue" title="Monthly Revenue by City">
          <SHRankedBars items={byCity} formatValue={v => fmt$(v)} showRank />
        </SHPanel>
      </div>

    </>
  );
}
