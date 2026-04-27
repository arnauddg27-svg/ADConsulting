"use client";

import type { SHPropertyUnit } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHPanel from "../SHPanel";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";
import SHExceptionSummary from "../SHExceptionSummary";

interface Props {
  units: SHPropertyUnit[];
  onDrill: (detail: DrillDetail) => void;
}

export default function PMPipelineTab({ units, onDrill }: Props) {
  const delinquent = units.filter(u => u.delinquentAmount > 0).length;
  const vacantOrTurn = units.filter(u => u.occupancy === "vacant" || u.occupancy === "make-ready").length;
  const seriousLate = units.filter(u => u.daysPastDue >= 30).length;

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Property Management</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Full property roster with occupancy, financials, and maintenance details. Click any row for details.</p>
      </div>

      <SHExceptionSummary
        items={[
          { label: "Delinquent Units", value: String(delinquent), tone: delinquent >= 10 ? "alert" : delinquent >= 5 ? "watch" : "good" },
          { label: "Vacant / Turn Units", value: String(vacantOrTurn), tone: vacantOrTurn >= 12 ? "watch" : "good" },
          { label: "30+ Days Late", value: String(seriousLate), tone: seriousLate >= 6 ? "alert" : seriousLate >= 3 ? "watch" : "good" },
        ]}
      />

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Full Property Roster">
          <SHSpreadsheetTable
            columns={[
              { key: "address", label: "Address", width: "160px", frozen: true },
              { key: "community", label: "Community", width: "130px", frozen: true },
              { key: "city", label: "City", width: "90px" },
              { key: "county", label: "County", width: "90px", render: r => {
                const cityCounty: Record<string, string> = { Orlando: "Orange", Tampa: "Hillsborough", Jacksonville: "Duval", Lakeland: "Polk" };
                return cityCounty[String(r.city)] ?? "\u2014";
              }},
              { key: "entity", label: "Entity", width: "160px" },
              { key: "bedsBaths", label: "Beds/Baths", width: "80px" },
              { key: "sqft", label: "SqFt", width: "70px", align: "right", render: r => fmtN(Number(r.sqft)) },
              { key: "occupancy", label: "Status", width: "120px", render: r => {
                const s = String(r.occupancy);
                const tone = s === "leased" ? "good" : s === "vacant" ? "watch" : s === "make-ready" ? "watch" : s === "notice-to-vacate" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")} />;
              }},
              { key: "tenant", label: "Tenant", width: "120px", render: r => String(r.tenant ?? "\u2014") },
              { key: "monthlyRent", label: "Rent", width: "75px", align: "right", render: r => fmt$(Number(r.monthlyRent)) },
              { key: "marketRent", label: "Market", width: "75px", align: "right", render: r => fmt$(Number(r.marketRent)) },
              { key: "deposit", label: "Deposit", width: "80px", align: "right", render: r => fmt$(Number(r.deposit)) },
              { key: "managementPct", label: "Mgmt %", width: "75px", align: "right", render: r => fmtPct(Number(r.managementPct)) },
              { key: "leaseEnd", label: "Lease End", width: "90px", render: r => String(r.leaseEnd ?? "\u2014") },
              { key: "yearBuilt", label: "Year Built", width: "75px", align: "right" },
              { key: "lotSqft", label: "Lot SqFt", width: "75px", align: "right", render: r => fmtN(Number(r.lotSqft)) },
              { key: "hoaMonthly", label: "HOA/Mo", width: "80px", align: "right", render: r => fmt$(Number(r.hoaMonthly)) },
              { key: "propertyTaxAnnual", label: "Tax/Yr", width: "75px", align: "right", render: r => fmt$(Number(r.propertyTaxAnnual)) },
              { key: "insuranceAnnual", label: "Insure/Yr", width: "75px", align: "right", render: r => fmt$(Number(r.insuranceAnnual)) },
              { key: "lastInspectionDate", label: "Last Inspect", width: "90px" },
              { key: "nextInspectionDate", label: "Next Inspect", width: "90px" },
              { key: "maintenanceYtd", label: "Maint YTD", width: "80px", align: "right", render: r => fmt$(Number(r.maintenanceYtd)) },
              { key: "vacancyDays", label: "Vacancy Days", width: "85px", align: "right", render: r => {
                const d = Number(r.vacancyDays ?? 0);
                if (d <= 0) return <span style={{ color: "var(--sh-text-muted)" }}>0</span>;
                return <span style={{ color: d > 60 ? "var(--sh-danger)" : "var(--sh-warning)", fontWeight: 700 }}>{d}</span>;
              }},
              { key: "turnoverCount", label: "Turnovers", width: "75px", align: "right" },
              { key: "noiMonthly", label: "NOI/Mo", width: "75px", align: "right", render: r => fmt$(Number(r.noiMonthly)) },
              { key: "capRatePct", label: "Cap Rate", width: "80px", align: "right", render: r => fmtPct(Number(r.capRatePct)) },
              { key: "estimatedValue", label: "Est. Value", width: "85px", align: "right", render: r => fmt$(Number(r.estimatedValue)) },
              { key: "owner", label: "Owner", width: "120px" },
              { key: "propertyClass", label: "Class", width: "65px", render: r => {
                const c = String(r.propertyClass);
                return <SHPill tone={c === "A" ? "good" : c === "B" ? "watch" : "alert"} label={c} />;
              }},
              { key: "delinquentAmount", label: "Delinquent", width: "85px", align: "right", render: r => {
                const v = Number(r.delinquentAmount);
                if (v <= 0) return <span style={{ color: "var(--sh-text-muted)" }}>{"\u2014"}</span>;
                return <span style={{ color: "var(--sh-danger)", fontWeight: 700 }}>{fmt$(v)}</span>;
              }},
              { key: "daysPastDue", label: "Days Late", width: "75px", align: "right", render: r => {
                const d = Number(r.daysPastDue);
                if (d <= 0) return <span style={{ color: "var(--sh-text-muted)" }}>{"\u2014"}</span>;
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
