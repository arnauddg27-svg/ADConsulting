"use client";

import type { SHPropertyUnit } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHPanel from "../SHPanel";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

interface Props {
  units: SHPropertyUnit[];
  onDrill: (detail: DrillDetail) => void;
}

export default function PMPipelineTab({ units, onDrill }: Props) {
  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Property Management</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Full property roster with occupancy, financials, and maintenance details. Click any row for details.</p>
      </div>

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
              { key: "yearBuilt", label: "Year Built", width: "75px", align: "right", render: r => 2020 + (Number(r.id) % 6) },
              { key: "lotSize", label: "Lot SqFt", width: "75px", align: "right", render: r => fmtN(4500 + (Number(r.id) % 8) * 500) },
              { key: "hoa", label: "HOA/Mo", width: "80px", align: "right", render: r => fmt$(150 + (Number(r.id) % 5) * 50) },
              { key: "propertyTax", label: "Tax/Yr", width: "75px", align: "right", render: r => fmt$(3000 + (Number(r.id) % 6) * 1000) },
              { key: "insurance", label: "Insure/Yr", width: "75px", align: "right", render: r => fmt$(1200 + (Number(r.id) % 7) * 300) },
              { key: "lastInspection", label: "Last Inspect", width: "90px", render: r => {
                const d = new Date();
                d.setDate(d.getDate() - 30 - (Number(r.id) % 180));
                return d.toISOString().slice(0, 10);
              }},
              { key: "nextInspection", label: "Next Inspect", width: "90px", render: r => {
                const d = new Date();
                d.setDate(d.getDate() + 30 + (Number(r.id) % 335));
                return d.toISOString().slice(0, 10);
              }},
              { key: "maintenanceYtd", label: "Maint YTD", width: "80px", align: "right", render: r => fmt$(500 + (Number(r.id) % 6) * 500) },
              { key: "vacancyDays", label: "Vacancy Days", width: "85px", align: "right", render: r => {
                const s = String(r.occupancy);
                if (s === "leased") return <span style={{ color: "var(--sh-text-muted)" }}>0</span>;
                const d = 15 + (Number(r.id) % 76);
                return <span style={{ color: d > 60 ? "var(--sh-danger)" : "var(--sh-warning)", fontWeight: 700 }}>{d}</span>;
              }},
              { key: "turnoverCount", label: "Turnovers", width: "75px", align: "right", render: r => Number(r.id) % 4 },
              { key: "noi", label: "NOI/Mo", width: "75px", align: "right", render: r => {
                const rent = Number(r.monthlyRent);
                const expenses = (150 + (Number(r.id) % 5) * 50) + ((3000 + (Number(r.id) % 6) * 1000) / 12) + ((1200 + (Number(r.id) % 7) * 300) / 12) + (rent * Number(r.managementPct) / 100);
                return fmt$(rent - expenses);
              }},
              { key: "capRate", label: "Cap Rate", width: "80px", align: "right", render: r => {
                const rent = Number(r.monthlyRent);
                const expenses = (150 + (Number(r.id) % 5) * 50) + ((3000 + (Number(r.id) % 6) * 1000) / 12) + ((1200 + (Number(r.id) % 7) * 300) / 12) + (rent * Number(r.managementPct) / 100);
                const noi = (rent - expenses) * 12;
                const estValue = 350000 + (Number(r.id) % 6) * 50000;
                return fmtPct((noi / estValue) * 100);
              }},
              { key: "estValue", label: "Est. Value", width: "85px", align: "right", render: r => fmt$(350000 + (Number(r.id) % 6) * 50000) },
              { key: "owner", label: "Owner", width: "110px", render: r => {
                const owners = ["Sunshine Holdings", "Palm Coast Trust", "Emerald Bay LLC", "Coral Springs LP", "Magnolia Inv."];
                return owners[Number(r.id) % owners.length];
              }},
              { key: "propertyClass", label: "Class", width: "65px", render: r => {
                const classes = ["A", "A", "B", "B", "C"];
                const c = classes[Number(r.id) % classes.length];
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
