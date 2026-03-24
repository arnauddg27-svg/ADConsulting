"use client";

import type { SHSubdivision } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getSubdivisionKPIs, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHPill from "../SHPill";

const STATUS_COLORS: Record<string, string> = {
  active: "#14b8a6",
  "pre-development": "#22d3ee",
  "sold-out": "#3b82f6",
  planning: "#efb562",
};

function InfraFlag({ label, done }: { label: string; done: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 3,
      background: done ? "rgba(20,184,166,0.1)" : "rgba(255,255,255,0.04)",
      color: done ? "var(--sh-accent)" : "var(--sh-text-muted)",
      border: `1px solid ${done ? "rgba(20,184,166,0.2)" : "rgba(255,255,255,0.06)"}`,
    }}>
      {done ? "✓" : "○"} {label}
    </span>
  );
}

function LotBar({ sold, construction, completed, remaining, total }: { sold: number; construction: number; completed: number; remaining: number; total: number }) {
  const pctSold = (sold / total) * 100;
  const pctConst = (construction / total) * 100;
  const pctDone = (completed / total) * 100;
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ width: `${pctDone}%`, background: "#14b8a6" }} title={`${completed} completed`} />
        <div style={{ width: `${pctConst}%`, background: "#22d3ee" }} title={`${construction} under construction`} />
        <div style={{ width: `${pctSold}%`, background: "#3b82f6" }} title={`${sold} sold`} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 9, color: "var(--sh-text-muted)" }}>
        <span><span style={{ color: "#14b8a6", fontWeight: 700 }}>{completed}</span> done</span>
        <span><span style={{ color: "#22d3ee", fontWeight: 700 }}>{construction}</span> building</span>
        <span><span style={{ color: "#3b82f6", fontWeight: 700 }}>{sold}</span> sold</span>
        <span><span style={{ fontWeight: 700 }}>{remaining}</span> avail</span>
      </div>
    </div>
  );
}

interface Props {
  subdivisions: SHSubdivision[];
  onDrill?: (detail: DrillDetail) => void;
}

export default function SubdivisionPipelineTab({ subdivisions, onDrill }: Props) {
  const kpis = getSubdivisionKPIs(subdivisions);

  const statusMap = {
    active: kpis.activeSubs,
    "pre-development": kpis.preDev,
    "sold-out": kpis.soldOut,
    planning: kpis.planning,
  };
  const byStatus = Object.entries(statusMap)
    .filter(([, v]) => v > 0)
    .map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1).replace("-", " "),
      value,
      color: STATUS_COLORS[label] ?? "#14b8a6",
    }));

  const byCity = (() => {
    const map = new Map<string, number>();
    for (const s of subdivisions) map.set(s.city, (map.get(s.city) || 0) + s.totalLots);
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Land</div>
        <h2 className="sh-tab-title">Subdivision Pipeline</h2>
        <p className="sh-tab-desc">Development projects, lot inventory, infrastructure status, and absorption metrics.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Projects" value={fmtN(subdivisions.length)} sub={`${kpis.activeSubs} active`} />
        <SHKpiCard label="Total Lots" value={fmtN(kpis.totalLots)} progress={Math.round(((kpis.totalLots - kpis.lotsRemaining) / kpis.totalLots) * 100)} sub={`${kpis.lotsRemaining} remaining`} accent="#22d3ee" />
        <SHKpiCard label="Total Investment" value={fmt$(kpis.totalInvestment)} sparkline={[8.2, 9.1, 10.5, 12.0, 14.2, 16.8, 19.5, 22.0]} />
        <SHKpiCard label="Avg Absorption" value={`${kpis.avgAbsorption.toFixed(1)}/mo`} sub="Sales velocity" accent="#3b82f6" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Status" title="Projects by Status">
          <SHDonutChart segments={byStatus} />
        </SHPanel>
        <SHPanel kicker="Geography" title="Lots by City">
          <SHRankedBars items={byCity} showRank />
        </SHPanel>
      </div>

      {/* Subdivision cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 14 }}>
        {subdivisions.map(sub => (
          <div
            key={sub.id}
            className="sh-panel"
            style={{ cursor: onDrill ? "pointer" : "default" }}
            onClick={onDrill ? () => onDrill({ type: "community", value: sub.community, label: sub.projectName }) : undefined}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--sh-text-primary)" }}>{sub.projectName}</div>
                <div style={{ fontSize: 10, color: "var(--sh-text-muted)" }}>{sub.community} · {sub.city} · {sub.totalAcres} acres</div>
              </div>
              <SHPill
                tone={sub.status === "active" ? "good" : sub.status === "sold-out" ? "good" : sub.status === "pre-development" ? "watch" : "alert"}
                label={sub.status.replace("-", " ")}
              />
            </div>

            <LotBar
              sold={sub.lotsSold}
              construction={sub.lotsUnderConstruction}
              completed={sub.lotsCompleted}
              remaining={sub.lotsRemaining}
              total={sub.totalLots}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sh-text-muted)" }}>Investment</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sh-text-primary)" }}>{fmt$(sub.totalInvestment)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sh-text-muted)" }}>Proj. Margin</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: sub.profitMarginPct >= 20 ? "var(--sh-accent)" : "var(--sh-warning)" }}>{fmtPct(sub.profitMarginPct)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--sh-text-muted)" }}>Absorption</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sh-text-primary)" }}>{sub.absorptionRate}/mo</div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
              <InfraFlag label="Zoning" done={sub.zoningApproved} />
              <InfraFlag label="Plat" done={sub.platRecorded} />
              <InfraFlag label="Utilities" done={sub.utilityStubs} />
              <InfraFlag label="Roads" done={sub.roadsComplete} />
              <InfraFlag label="Retention" done={sub.retentionPonds} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
