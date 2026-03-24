"use client";

import type { SHPropertyUnit } from "@/types/sunshine-homes";
import { getPropertyKPIs, fmt$, fmtN } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHDonutChart from "../../sunshine/SHDonutChart";
import SHRankedBars from "../../sunshine/SHRankedBars";
import SHCompactTable from "../../sunshine/SHCompactTable";

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

  const unitRows = units
    .map(u => {
      const [beds, baths] = u.bedsBaths.split("/").map(v => v.trim());
      return {
        address: u.address,
        community: u.community,
        city: u.city,
        bedrooms: beds,
        bathrooms: baths,
        sqft: u.sqft,
        monthlyRent: u.monthlyRent,
        occupancy: u.occupancy,
        leaseEnd: u.leaseEnd,
      };
    })
    .sort((a, b) => {
      const aLeased = a.occupancy === "leased" ? 0 : 1;
      const bLeased = b.occupancy === "leased" ? 0 : 1;
      return aLeased - bLeased;
    });

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

      <div className="sh-panels-row single">
        <SHPanel kicker="Portfolio" title="Rental Units">
          <SHCompactTable
            columns={[
              { key: "address", label: "Address", width: "150px" },
              { key: "community", label: "Community", width: "120px" },
              { key: "city", label: "City", width: "100px" },
              { key: "bedrooms", label: "Beds", width: "60px", align: "right" },
              { key: "bathrooms", label: "Baths", width: "60px", align: "right" },
              { key: "sqft", label: "SqFt", width: "80px", align: "right" },
              { key: "monthlyRent", label: "Rent/Mo", width: "100px", align: "right", render: r => fmt$(Number(r.monthlyRent)) },
              { key: "occupancy", label: "Status", width: "90px", render: r => {
                const status = String(r.occupancy);
                return status === "leased" ? <span style={{ color: "var(--sh-accent)", fontWeight: 600 }}>Leased</span> : <span style={{ color: "var(--sh-danger)" }}>{status}</span>;
              }},
            ]}
            rows={unitRows as unknown as Record<string, unknown>[]}
          />
        </SHPanel>
      </div>
    </>
  );
}
