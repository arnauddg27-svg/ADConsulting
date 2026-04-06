"use client";

import type { SHLandDeal } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { fmt$, fmtPct } from "@/lib/sunshine-homes-data";
import SHPanel from "../SHPanel";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

interface Props {
  deals: SHLandDeal[];
  onDrill: (detail: DrillDetail) => void;
}

export default function LandPipelineTab({ deals, onDrill }: Props) {
  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Land</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Full deal roster with acquisition details, due diligence status, and financials. Click any row for details.</p>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Full Deal Roster">
          <SHSpreadsheetTable
            columns={[
              { key: "name", label: "Deal Name", width: "150px", frozen: true },
              { key: "city", label: "City", width: "100px", frozen: true },
              { key: "county", label: "County", width: "100px" },
              { key: "community", label: "Community", width: "130px" },
              { key: "entity", label: "Entity", width: "150px", render: r => {
                const city = String(r.city);
                const meta: Record<string, string> = { Orlando: "Sunshine Homes LLC", Tampa: "Sunshine Homes LLC", Jacksonville: "Sunshine Homes East LLC", Lakeland: "Sunshine Homes East LLC" };
                return meta[city] ?? city;
              }},
              { key: "contractDate", label: "Contract", width: "90px" },
              { key: "year", label: "Year", width: "60px", align: "right" },
              { key: "closeDate", label: "Close Date", width: "90px", render: r => String(r.closeDate ?? "\u2014") },
              { key: "status", label: "Status", width: "110px", render: r => {
                const s = String(r.status);
                const tone = s === "closed" ? "good" : s === "under-contract" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.replace("-", " ")} />;
              }},
              { key: "acres", label: "Acres", width: "65px", align: "right" },
              { key: "lots", label: "Lots", width: "55px", align: "right" },
              { key: "costPerLot", label: "Cost/Lot", width: "80px", align: "right", render: r => fmt$(Number(r.costPerLot)) },
              { key: "acquisitionCost", label: "Total Cost", width: "90px", align: "right", render: r => fmt$(Number(r.acquisitionCost)) },
              { key: "revenuePotential", label: "Rev Potential", width: "95px", align: "right", render: r => fmt$(Number(r.lots) * 480000) },
              { key: "profitPotential", label: "Profit Pot.", width: "90px", align: "right", render: r => fmt$(Number(r.lots) * 480000 - Number(r.acquisitionCost)) },
              { key: "roi", label: "ROI %", width: "65px", align: "right", render: r => {
                const cost = Number(r.acquisitionCost);
                const rev = Number(r.lots) * 480000;
                return cost > 0 ? fmtPct(((rev - cost) / cost) * 100) : "\u2014";
              }},
              { key: "hasWetlands", label: "Wetlands", width: "75px", render: r => {
                const v = Number(r.id) % 3 === 0;
                return <SHPill tone={v ? "alert" : "good"} label={v ? "Yes" : "No"} />;
              }},
              { key: "hasTrees", label: "Trees", width: "65px", render: r => {
                const v = Number(r.id) % 2 === 0;
                return <SHPill tone={v ? "watch" : "good"} label={v ? "Yes" : "No"} />;
              }},
              { key: "ddStatus", label: "DD Status", width: "90px", render: r => {
                const statuses = ["Complete", "In Progress", "Pending"];
                const s = statuses[Number(r.id) % 3];
                return <SHPill tone={s === "Complete" ? "good" : s === "In Progress" ? "watch" : "alert"} label={s} />;
              }},
              { key: "soilTesting", label: "Soil Test", width: "85px", render: r => {
                const statuses = ["Pass", "In Progress", "Pending"];
                const s = statuses[Number(r.id) % 3];
                return <SHPill tone={s === "Pass" ? "good" : s === "In Progress" ? "watch" : "alert"} label={s} />;
              }},
              { key: "surveyStatus", label: "Survey", width: "80px", render: r => {
                const statuses = ["Complete", "Scheduled", "Pending"];
                const s = statuses[(Number(r.id) + 1) % 3];
                return <SHPill tone={s === "Complete" ? "good" : s === "Scheduled" ? "watch" : "alert"} label={s} />;
              }},
              { key: "zoningStatus", label: "Zoning", width: "80px", render: r => {
                const statuses = ["Approved", "In Review", "Pending"];
                const s = statuses[(Number(r.id) + 2) % 3];
                return <SHPill tone={s === "Approved" ? "good" : s === "In Review" ? "watch" : "alert"} label={s} />;
              }},
              { key: "platStatus", label: "Plat", width: "80px", render: r => {
                const statuses = ["Recorded", "Submitted", "Pending"];
                const s = statuses[Number(r.id) % 3];
                return <SHPill tone={s === "Recorded" ? "good" : s === "Submitted" ? "watch" : "alert"} label={s} />;
              }},
              { key: "seller", label: "Seller", width: "110px", render: r => {
                const sellers = ["J. Morrison", "Lakewood Trust", "FL Land Group", "Carter Family", "Pine Valley LLC"];
                return sellers[Number(r.id) % sellers.length];
              }},
              { key: "source", label: "Source", width: "85px", render: r => {
                const sources = ["Direct", "Assignment", "Broker"];
                return sources[Number(r.id) % 3];
              }},
            ]}
            rows={deals as unknown as Record<string, unknown>[]}
            maxRows={40}
            onRowClick={r => onDrill({ type: "community", value: String(r.community), label: String(r.name) })}
          />
        </SHPanel>
      </div>
    </>
  );
}
