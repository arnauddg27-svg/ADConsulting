"use client";

import type { SHPropertyUnit } from "@/types/sunshine-homes";
import { getPMKPIs, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";

const OCC_COLORS: Record<string, string> = {
  leased: "#14b8a6",
  vacant: "#3b82f6",
  "make-ready": "#efb562",
  eviction: "#f46a6a",
  "notice-to-vacate": "#a855f7",
};

interface Props {
  units: SHPropertyUnit[];
  onDrill: (detail: import("../SHDrawer").DrillDetail) => void;
}

export default function PropertyMgmtDashboardTab({ units, onDrill }: Props) {
  const kpis = getPMKPIs(units);

  const byOccupancy = (() => {
    const map = new Map<string, number>();
    for (const u of units) map.set(u.occupancy, (map.get(u.occupancy) || 0) + 1);
    return Array.from(map.entries())
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1).replace("-", " "),
        value,
        color: OCC_COLORS[label] ?? "#14b8a6",
      }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Property Management</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Portfolio overview, occupancy, and delinquency tracking. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Units" value={fmtN(kpis.totalUnits)} sparkline={[28, 30, 32, 34, 35, 36, 38, 39, 40, kpis.totalUnits]} delta="+4 units YoY" deltaDir="up" />
        <SHKpiCard label="Occupancy Rate" value={fmtPct(kpis.occupancyRate)} accent="#14b8a6" progress={Math.round(kpis.occupancyRate)} delta="+2% vs Q3" deltaDir="up" />
        <SHKpiCard label="Monthly Revenue" value={fmt$(kpis.monthlyRent)} accent="#22d3ee" sparkline={[32, 34, 35, 37, 38, 39, 40, 41, 42, 44]} delta="+6% vs prior" deltaDir="up" />
        <SHKpiCard
          label="Delinquent"
          value={fmtN(kpis.delinquentUnits)}
          accent={kpis.delinquentUnits > 0 ? "#f46a6a" : "#24c18d"}
          sparkline={[5, 4, 6, 5, 3, 4, 3, 2, 3, kpis.delinquentUnits]}
          delta={kpis.delinquentUnits > 0 ? "Past due" : "All current"}
          deltaDir={kpis.delinquentUnits > 0 ? "down" : "up"}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Occupancy" title="Units by Status">
          <SHDonutChart segments={byOccupancy} onSegmentClick={label => onDrill({ type: "occupancy", value: label.toLowerCase(), label })} />
        </SHPanel>
      </div>
    </>
  );
}
