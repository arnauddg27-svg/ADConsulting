"use client";

import type { SHAuditJob } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { fmt$, fmtPct } from "@/lib/sunshine-homes-data";
import SHPanel from "../SHPanel";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

interface Props {
  audits: SHAuditJob[];
  onDrill: (detail: DrillDetail) => void;
}

export default function AuditsPipelineTab({ audits, onDrill }: Props) {
  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Audits</div>
        <h2 className="sh-tab-title">Per-Job P&L Audits</h2>
        <p className="sh-tab-desc">Detailed cost breakdown for every audited job. Click any row for full pro forma detail.</p>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="PL-02" title="Per-Job Pro Forma P&L">
          <SHSpreadsheetTable
            columns={[
              { key: "jobCode", label: "Job", width: "80px", frozen: true, mono: true },
              { key: "community", label: "Community", width: "120px", frozen: true },
              { key: "plan", label: "Plan", width: "100px" },
              { key: "city", label: "City", width: "90px" },
              { key: "county", label: "County", width: "90px", render: r => {
                const cityCounty: Record<string, string> = { Orlando: "Orange", Tampa: "Hillsborough", Jacksonville: "Duval", Lakeland: "Polk" };
                return cityCounty[String(r.city)] ?? "\u2014";
              }},
              { key: "entity", label: "Entity", width: "150px" },
              { key: "jobType", label: "Job Type", width: "90px" },
              { key: "salesStatus", label: "Sales Status", width: "95px", render: r => {
                const s = String(r.salesStatus);
                const tone = s === "closed" ? "good" : s === "pending" ? "watch" : s === "active" ? "good" : "alert";
                return <SHPill tone={tone} label={s} />;
              }},
              { key: "builderFeePct", label: "Builder %", width: "75px", align: "right", render: r => fmtPct(Number(r.builderFeePct)) },
              { key: "salePrice", label: "Sale Price", width: "85px", align: "right", render: r => fmt$(Number(r.salePrice)) },
              { key: "lotLand", label: "Lot/Land", width: "70px", align: "right", render: r => fmt$(Number(r.lotLand)) },
              { key: "permitting", label: "Permit", width: "70px", align: "right", render: r => fmt$(Number(r.permitting)) },
              { key: "siteWork", label: "Site Work", width: "75px", align: "right", render: r => fmt$(Number(r.siteWork)) },
              { key: "vertical", label: "Vertical", width: "75px", align: "right", render: r => fmt$(Number(r.vertical)) },
              { key: "options", label: "Options", width: "80px", align: "right", render: r => fmt$(Number(r.options)) },
              { key: "dirtPad", label: "Dirt/Pad", width: "80px", align: "right", render: r => fmt$(Number(r.dirtPad)) },
              { key: "dumpsters", label: "Dumpster", width: "80px", align: "right", render: r => fmt$(Number(r.dumpsters)) },
              { key: "financing", label: "Finance", width: "80px", align: "right", render: r => fmt$(Number(r.financing)) },
              { key: "insurance", label: "Insure", width: "80px", align: "right", render: r => fmt$(Number(r.insurance)) },
              { key: "closingCost", label: "Closing", width: "80px", align: "right", render: r => fmt$(Number(r.closingCost)) },
              { key: "septic", label: "Septic", width: "80px", align: "right", render: r => fmt$(Number(r.septic)) },
              { key: "well", label: "Well", width: "75px", align: "right", render: r => fmt$(Number(r.well)) },
              { key: "totalCost", label: "Total Cost", width: "85px", align: "right", render: r => <span style={{ fontWeight: 700 }}>{fmt$(Number(r.totalCost))}</span> },
              { key: "builderFee", label: "Builder Fee", width: "80px", align: "right", render: r => fmt$(Number(r.builderFee)) },
              { key: "contingency", label: "Conting.", width: "70px", align: "right", render: r => fmt$(Number(r.contingency)) },
              { key: "netProfit", label: "Net Profit", width: "85px", align: "right", render: r => {
                const v = Number(r.netProfit);
                return <span style={{ color: v >= 0 ? "var(--sh-accent)" : "var(--sh-danger)", fontWeight: 700 }}>{fmt$(v)}</span>;
              }},
              { key: "netMargin", label: "Margin", width: "80px", align: "right", render: r => {
                const m = Number(r.netMargin);
                const tone = m >= 15 ? "good" : m >= 5 ? "watch" : "alert";
                return <SHPill tone={tone} label={fmtPct(m)} />;
              }},
            ]}
            rows={audits as unknown as Record<string, unknown>[]}
            maxRows={50}
            onRowClick={r => onDrill({ type: "job", value: String(r.jobCode), label: `${r.jobCode} — ${r.address}` })}
          />
        </SHPanel>
      </div>
    </>
  );
}
