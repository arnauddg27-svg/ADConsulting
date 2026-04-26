"use client";

import type { SHSubdivision } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHPanel from "../SHPanel";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

/* Mutually exclusive lot lifecycle: completed + building + toStart +
   available = total. Visual stack uses the same partition so the bar
   length always equals total inventory. */
function LotBar({ completed, construction, toStart, remaining, total }: { completed: number; construction: number; toStart: number; remaining: number; total: number }) {
  const pctDone = (completed / total) * 100;
  const pctConst = (construction / total) * 100;
  const pctToStart = (toStart / total) * 100;
  const pctRemaining = (remaining / total) * 100;
  return (
    <div style={{ minWidth: 80 }}>
      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ width: `${pctDone}%`, background: "#14b8a6" }} title={`${completed} completed`} />
        <div style={{ width: `${pctConst}%`, background: "#22d3ee" }} title={`${construction} under construction`} />
        <div style={{ width: `${pctToStart}%`, background: "#3b82f6" }} title={`${toStart} sold, awaiting start`} />
        <div style={{ width: `${pctRemaining}%`, background: "rgba(255,255,255,0.08)" }} title={`${remaining} available`} />
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
              { key: "totalLots", label: "Total", width: "60px", align: "right" },
              /* Mutually-exclusive lifecycle: total = completed + building +
                 toStart + remaining. Solved that "Sold" overlapped with both
                 Completed and Building, so the row math never reconciled. */
              { key: "lotsCompleted", label: "Completed", width: "75px", align: "right" },
              { key: "lotsUnderConstruction", label: "Building", width: "70px", align: "right" },
              { key: "lotsToStart", label: "To Start", width: "70px", align: "right", render: r => {
                const toStart = Number(r.lotsSold) - Number(r.lotsUnderConstruction) - Number(r.lotsCompleted);
                return Math.max(0, toStart);
              }},
              { key: "lotsRemaining", label: "Available", width: "70px", align: "right" },
              { key: "lotProgress", label: "Lot Progress", width: "120px", render: r => {
                const total = Number(r.totalLots);
                const completed = Number(r.lotsCompleted);
                const construction = Number(r.lotsUnderConstruction);
                const remaining = Number(r.lotsRemaining);
                const toStart = Math.max(0, Number(r.lotsSold) - construction - completed);
                return (
                  <LotBar
                    completed={completed}
                    construction={construction}
                    toStart={toStart}
                    remaining={remaining}
                    total={total}
                  />
                );
              }},
              { key: "totalInvestment", label: "Investment", width: "90px", align: "right", render: r => fmt$(Number(r.totalInvestment)) },
              { key: "profitMarginPct", label: "Proj Margin", width: "80px", align: "right", render: r => {
                const m = Number(r.profitMarginPct);
                return <SHPill tone={m >= 20 ? "good" : m >= 10 ? "watch" : "alert"} label={fmtPct(m)} />;
              }},
              { key: "absorptionRate", label: "Absorption", width: "80px", align: "right", render: r => `${Number(r.absorptionRate)}/mo` },
              { key: "infrastructure", label: "Infra", width: "75px", render: r => {
                const checks = [r.zoningApproved, r.platRecorded, r.utilityStubs, r.roadsComplete, r.retentionPonds];
                const done = checks.filter(Boolean).length;
                const tone = done === 5 ? "good" : done >= 3 ? "watch" : "alert";
                return <SHPill tone={tone} label={`${done}/5`} />;
              }},
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
