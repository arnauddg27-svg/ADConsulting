"use client";

import type { SHPropertyUnit } from "@/types/sunshine-homes";
import { getPMKPIs, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHCompactTable from "../SHCompactTable";
import SHPill from "../SHPill";

const OCC_COLORS: Record<string, string> = {
  leased: "#14b8a6",
  vacant: "#3b82f6",
  "make-ready": "#efb562",
  eviction: "#f46a6a",
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

  const delinquent = units.filter(u => u.delinquentAmount > 0)
    .sort((a, b) => b.daysPastDue - a.daysPastDue);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Property Management</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Portfolio overview, occupancy, and delinquency tracking.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Units" value={fmtN(kpis.totalUnits)} />
        <SHKpiCard label="Occupancy Rate" value={fmtPct(kpis.occupancyRate)} accent="#14b8a6" />
        <SHKpiCard label="Monthly Revenue" value={fmt$(kpis.monthlyRent)} accent="#22d3ee" />
        <SHKpiCard
          label="Delinquent"
          value={fmtN(kpis.delinquentUnits)}
          accent={kpis.delinquentUnits > 0 ? "#f46a6a" : "#24c18d"}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Occupancy" title="Units by Status">
          <SHDonutChart segments={byOccupancy} onSegmentClick={label => onDrill({ type: "occupancy", value: label.toLowerCase(), label })} />
        </SHPanel>
        <SHPanel kicker="Delinquency" title="Past-Due Tenants">
          {delinquent.length > 0 ? (
            <SHCompactTable
              columns={[
                { key: "address", label: "Address", width: "1fr" },
                { key: "community", label: "Community", width: "130px" },
                { key: "delinquentAmount", label: "Amount", width: "80px", align: "right", render: r => fmt$(Number(r.delinquentAmount)) },
                { key: "daysPastDue", label: "Days", width: "70px", align: "right", render: r => {
                  const d = Number(r.daysPastDue);
                  const tone = d >= 60 ? "alert" : d >= 30 ? "watch" : "good";
                  return <SHPill tone={tone} label={`${d}d`} />;
                }},
              ]}
              rows={delinquent as unknown as Record<string, unknown>[]}
              onRowClick={r => onDrill({ type: "unit", value: String(r.address), label: String(r.address) })}
            />
          ) : (
            <div style={{ fontSize: 11, color: "var(--sh-text-muted)", padding: 12 }}>No delinquent tenants</div>
          )}
        </SHPanel>
      </div>
    </>
  );
}
