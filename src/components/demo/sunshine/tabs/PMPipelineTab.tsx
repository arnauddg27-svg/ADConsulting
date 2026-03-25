"use client";

import type { SHPropertyUnit } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getPMKPIs, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHDonutChart from "../SHDonutChart";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

const OCC_COLORS: Record<string, string> = {
  leased: "#14b8a6",
  vacant: "#3b82f6",
  "make-ready": "#efb562",
  eviction: "#f46a6a",
};

interface Props {
  units: SHPropertyUnit[];
  onDrill: (detail: DrillDetail) => void;
}

export default function PMPipelineTab({ units, onDrill }: Props) {
  const kpis = getPMKPIs(units);
  const totalDelinquent = units.reduce((s, u) => s + u.delinquentAmount, 0);

  /* Revenue by City */
  const revenueByCity = (() => {
    const map = new Map<string, number>();
    for (const u of units) {
      map.set(u.city, (map.get(u.city) || 0) + u.monthlyRent);
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  })();

  /* Occupancy by Status */
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
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Full property roster with revenue, occupancy, and delinquency details. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard
          label="Total Units"
          value={fmtN(kpis.totalUnits)}
          sparkline={[22, 24, 26, 28, 30, 32, 34, 36, 38, 40]}
          onClick={() => onDrill({ type: "pm-metric", value: "units", label: "Total Units" })}
        />
        <SHKpiCard
          label="Occupancy Rate"
          value={fmtPct(kpis.occupancyRate)}
          accent="#14b8a6"
          progress={Math.round(kpis.occupancyRate)}
          onClick={() => onDrill({ type: "pm-metric", value: "occupancy", label: "Occupancy Rate" })}
        />
        <SHKpiCard
          label="Monthly Revenue"
          value={fmt$(kpis.monthlyRent)}
          accent="#22d3ee"
          sparkline={[32, 34, 35, 37, 38, 39, 40, 41, 42, 44]}
          delta="+6% vs Q3"
          deltaDir="up"
          onClick={() => onDrill({ type: "pm-metric", value: "revenue", label: "Monthly Revenue" })}
        />
        <SHKpiCard
          label="Delinquent $"
          value={fmt$(totalDelinquent)}
          accent={totalDelinquent > 0 ? "#f46a6a" : "#24c18d"}
          sub={`${kpis.delinquentUnits} units past due`}
          onClick={() => onDrill({ type: "pm-metric", value: "delinquent", label: "Delinquent Amount" })}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Revenue" title="Revenue by City">
          <SHRankedBars
            items={revenueByCity}
            formatValue={v => fmt$(v)}
            onBarClick={label => onDrill({ type: "city", value: label, label })}
            showRank
          />
        </SHPanel>
        <SHPanel kicker="Occupancy" title="Occupancy by Status">
          <SHDonutChart
            segments={byOccupancy}
            onSegmentClick={label => onDrill({ type: "pm-occupancy", value: label.toLowerCase(), label })}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Full Property Roster">
          <SHSpreadsheetTable
            columns={[
              { key: "address", label: "Address", width: "160px", frozen: true },
              { key: "community", label: "Community", width: "130px", frozen: true },
              { key: "city", label: "City", width: "90px" },
              { key: "entity", label: "Entity", width: "150px" },
              { key: "bedsBaths", label: "Beds/Baths", width: "80px" },
              { key: "sqft", label: "SqFt", width: "60px", align: "right", render: r => fmtN(Number(r.sqft)) },
              { key: "occupancy", label: "Status", width: "90px", render: r => {
                const s = String(r.occupancy);
                const tone = s === "leased" ? "good" : s === "vacant" ? "watch" : s === "make-ready" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")} />;
              }},
              { key: "tenant", label: "Tenant", width: "120px", render: r => String(r.tenant ?? "\u2014") },
              { key: "monthlyRent", label: "Rent", width: "75px", align: "right", render: r => fmt$(Number(r.monthlyRent)) },
              { key: "marketRent", label: "Market", width: "75px", align: "right", render: r => fmt$(Number(r.marketRent)) },
              { key: "deposit", label: "Deposit", width: "70px", align: "right", render: r => fmt$(Number(r.deposit)) },
              { key: "managementPct", label: "Mgmt %", width: "65px", align: "right", render: r => fmtPct(Number(r.managementPct)) },
              { key: "leaseEnd", label: "Lease End", width: "90px", render: r => String(r.leaseEnd ?? "\u2014") },
              { key: "delinquentAmount", label: "Delinquent", width: "85px", align: "right", render: r => {
                const v = Number(r.delinquentAmount);
                if (v <= 0) return <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span>;
                return <span style={{ color: "var(--sh-danger)", fontWeight: 700 }}>{fmt$(v)}</span>;
              }},
              { key: "daysPastDue", label: "Days Late", width: "75px", align: "right", render: r => {
                const d = Number(r.daysPastDue);
                if (d <= 0) return <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span>;
                const tone = d >= 60 ? "alert" : d >= 30 ? "watch" : "good";
                return <SHPill tone={tone} label={`${d}d`} />;
              }},
            ]}
            rows={units as unknown as Record<string, unknown>[]}
            maxRows={40}
            onRowClick={r => onDrill({ type: "property", value: String(r.address), label: `${String(r.address)} \u2014 ${String(r.community)}` })}
          />
        </SHPanel>
      </div>
    </>
  );
}
