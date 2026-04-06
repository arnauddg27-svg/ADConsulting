"use client";

import type { SHSubdivision } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHPanel from "../SHPanel";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

function LotBar({ sold, construction, completed, remaining, total }: { sold: number; construction: number; completed: number; remaining: number; total: number }) {
  const pctSold = (sold / total) * 100;
  const pctConst = (construction / total) * 100;
  const pctDone = (completed / total) * 100;
  return (
    <div style={{ minWidth: 80 }}>
      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ width: `${pctDone}%`, background: "#14b8a6" }} title={`${completed} completed`} />
        <div style={{ width: `${pctConst}%`, background: "#22d3ee" }} title={`${construction} under construction`} />
        <div style={{ width: `${pctSold}%`, background: "#3b82f6" }} title={`${sold} sold`} />
      </div>
    </div>
  );
}

interface Props {
  subdivisions: SHSubdivision[];
  onDrill?: (detail: DrillDetail) => void;
}

export default function SubdivisionPipelineTab({ subdivisions, onDrill }: Props) {
  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Land</div>
        <h2 className="sh-tab-title">Subdivision Pipeline</h2>
        <p className="sh-tab-desc">Development projects with lot inventory, infrastructure status, and absorption metrics. Click any row for details.</p>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Subdivision Roster">
          <SHSpreadsheetTable
            columns={[
              { key: "projectName", label: "Project", width: "160px", frozen: true },
              { key: "community", label: "Community", width: "130px", frozen: true },
              { key: "city", label: "City", width: "90px" },
              { key: "status", label: "Status", width: "100px", render: r => {
                const s = String(r.status);
                const tone = s === "active" ? "good" : s === "sold-out" ? "good" : s === "pre-development" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.replace("-", " ")} />;
              }},
              { key: "totalAcres", label: "Acres", width: "65px", align: "right" },
              { key: "totalLots", label: "Total Lots", width: "70px", align: "right" },
              { key: "lotsCompleted", label: "Completed", width: "75px", align: "right" },
              { key: "lotsUnderConstruction", label: "Building", width: "70px", align: "right" },
              { key: "lotsSold", label: "Sold", width: "55px", align: "right" },
              { key: "lotsRemaining", label: "Available", width: "70px", align: "right" },
              { key: "lotProgress", label: "Lot Progress", width: "110px", render: r => (
                <LotBar
                  sold={Number(r.lotsSold)}
                  construction={Number(r.lotsUnderConstruction)}
                  completed={Number(r.lotsCompleted)}
                  remaining={Number(r.lotsRemaining)}
                  total={Number(r.totalLots)}
                />
              )},
              { key: "totalInvestment", label: "Investment", width: "90px", align: "right", render: r => fmt$(Number(r.totalInvestment)) },
              { key: "profitMarginPct", label: "Proj Margin", width: "80px", align: "right", render: r => {
                const m = Number(r.profitMarginPct);
                return <SHPill tone={m >= 20 ? "good" : m >= 10 ? "watch" : "alert"} label={fmtPct(m)} />;
              }},
              { key: "absorptionRate", label: "Absorption", width: "80px", align: "right", render: r => `${Number(r.absorptionRate)}/mo` },
              { key: "zoningApproved", label: "Zoning", width: "65px", render: r => <SHPill tone={r.zoningApproved ? "good" : "alert"} label={r.zoningApproved ? "✓" : "○"} /> },
              { key: "platRecorded", label: "Plat", width: "55px", render: r => <SHPill tone={r.platRecorded ? "good" : "alert"} label={r.platRecorded ? "✓" : "○"} /> },
              { key: "utilityStubs", label: "Utilities", width: "65px", render: r => <SHPill tone={r.utilityStubs ? "good" : "alert"} label={r.utilityStubs ? "✓" : "○"} /> },
              { key: "roadsComplete", label: "Roads", width: "60px", render: r => <SHPill tone={r.roadsComplete ? "good" : "alert"} label={r.roadsComplete ? "✓" : "○"} /> },
              { key: "retentionPonds", label: "Retention", width: "70px", render: r => <SHPill tone={r.retentionPonds ? "good" : "alert"} label={r.retentionPonds ? "✓" : "○"} /> },
              { key: "monthsRemaining", label: "Mo. Remain", width: "75px", align: "right", render: r => {
                const remaining = Number(r.lotsRemaining);
                const rate = Number(r.absorptionRate);
                if (rate <= 0) return "\u2014";
                return `${Math.round(remaining / rate)}mo`;
              }},
            ]}
            rows={subdivisions as unknown as Record<string, unknown>[]}
            maxRows={40}
            onRowClick={onDrill ? r => onDrill({ type: "community", value: String(r.community), label: String(r.projectName) }) : undefined}
          />
        </SHPanel>
      </div>
    </>
  );
}
