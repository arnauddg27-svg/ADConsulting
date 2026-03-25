"use client";

import type { SHPermit } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getPermitKPIs, buildCrossTab, fmtN, jobs } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHCrossTab from "../SHCrossTab";
import SHCompactTable from "../SHCompactTable";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#14b8a6" : pct >= 50 ? "#22d3ee" : pct >= 25 ? "#3b82f6" : "#5a6b7e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 40 }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 6px ${color}33` }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color, minWidth: 32, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

interface Props {
  permits: SHPermit[];
  onDrill: (detail: DrillDetail) => void;
}

export default function PermittingPipelineTab({ permits, onDrill }: Props) {
  const kpis = getPermitKPIs(permits);

  /* Cross-tab: City x Year of permit starts */
  const cityYearCross = buildCrossTab(permits, "city", "year");

  /* Cross-tab: City x Status */
  const cityStatusCross = buildCrossTab(permits, "city", "status");

  /* Permitting Cycle Time by City — derive from permits' daysInReview */
  const cycleTimeByCity = (() => {
    const map = new Map<string, { sitePlans: number[]; housePlans: number[]; septic: number[]; bldgDep: number[]; jioApproved: number[] }>();
    for (const p of permits) {
      if (!map.has(p.city)) map.set(p.city, { sitePlans: [], housePlans: [], septic: [], bldgDep: [], jioApproved: [] });
      const entry = map.get(p.city)!;
      // Distribute daysInReview across sub-stages using realistic ratios
      const base = p.daysInReview;
      entry.sitePlans.push(Math.round(base * 0.25));
      entry.housePlans.push(Math.round(base * 0.20));
      entry.septic.push(Math.round(base * 0.15));
      entry.bldgDep.push(Math.round(base * 0.25));
      entry.jioApproved.push(Math.round(base * 0.15));
    }
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
    return Array.from(map.entries())
      .map(([city, d]) => ({
        city,
        avgSitePlans: avg(d.sitePlans),
        avgHousePlans: avg(d.housePlans),
        avgSeptic: avg(d.septic),
        avgBldgDep: avg(d.bldgDep),
        avgJioApproved: avg(d.jioApproved),
      }))
      .sort((a, b) => a.city.localeCompare(b.city));
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Permitting</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Permit status cross-tabs, cycle time analysis, and full permit roster. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard
          label="In Progress"
          value={fmtN(kpis.inReview + kpis.pending)}
          sub={`${kpis.inReview} in review, ${kpis.pending} pending`}
          accent="#efb562"
          onClick={() => onDrill({ type: "permit-status", value: "in-progress", label: "In Progress Permits" })}
        />
        <SHKpiCard
          label="Approved"
          value={fmtN(kpis.approved)}
          accent="#14b8a6"
          onClick={() => onDrill({ type: "permit-status", value: "approved", label: "Approved Permits" })}
        />
        <SHKpiCard
          label="Issued"
          value={fmtN(kpis.issued)}
          accent="#22d3ee"
          onClick={() => onDrill({ type: "permit-status", value: "issued", label: "Issued Permits" })}
        />
        <SHKpiCard
          label="Total Permits"
          value={fmtN(kpis.total)}
          sub={`Avg ${Math.round(kpis.avgDaysToApproval)}d to approval`}
          sparkline={[18, 22, 25, 28, 30, 33, 35, 38, 40, 42]}
          delta={`${Math.round(kpis.avgDaysToApproval)}d avg`}
          deltaDir="neutral"
          onClick={() => onDrill({ type: "permit-status", value: "all", label: "All Permits" })}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Timeline" title="City x Year (Permit Count)">
          <SHCrossTab
            {...cityYearCross}
            onCellClick={(row, col, value) =>
              onDrill({ type: "permit-city-year", value: `${row}|${col}`, label: `${row} ${col} (${value} permits)` })
            }
          />
        </SHPanel>
        <SHPanel kicker="Status" title="City x Permit Status">
          <SHCrossTab
            {...cityStatusCross}
            onCellClick={(row, col, value) =>
              onDrill({ type: "permit-city-status", value: `${row}|${col}`, label: `${row} \u2014 ${col} (${value})` })
            }
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Cycle Time" title="Permitting Cycle Time by City (Avg Days)">
          <SHCompactTable
            columns={[
              { key: "city", label: "City", width: "1fr" },
              { key: "avgSitePlans", label: "Site Plans CT", width: "90px", align: "right", render: r => {
                const d = Number(r.avgSitePlans);
                return <span style={{ color: d > 10 ? "var(--sh-warning)" : "var(--sh-text-secondary)" }}>{d}d</span>;
              }},
              { key: "avgHousePlans", label: "House Plans CT", width: "100px", align: "right", render: r => {
                const d = Number(r.avgHousePlans);
                return <span style={{ color: d > 8 ? "var(--sh-warning)" : "var(--sh-text-secondary)" }}>{d}d</span>;
              }},
              { key: "avgSeptic", label: "Septic CT", width: "80px", align: "right", render: r => {
                const d = Number(r.avgSeptic);
                return <span style={{ color: d > 6 ? "var(--sh-warning)" : "var(--sh-text-secondary)" }}>{d}d</span>;
              }},
              { key: "avgBldgDep", label: "Bldg Dep CT", width: "90px", align: "right", render: r => {
                const d = Number(r.avgBldgDep);
                return <span style={{ color: d > 10 ? "var(--sh-warning)" : "var(--sh-text-secondary)" }}>{d}d</span>;
              }},
              { key: "avgJioApproved", label: "JIO to Approved", width: "110px", align: "right", render: r => {
                const d = Number(r.avgJioApproved);
                return <span style={{ color: d > 6 ? "var(--sh-warning)" : "var(--sh-text-secondary)" }}>{d}d</span>;
              }},
            ]}
            rows={cycleTimeByCity as unknown as Record<string, unknown>[]}
            onRowClick={r => onDrill({ type: "city", value: String(r.city), label: `${String(r.city)} Cycle Times` })}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Full Permit Roster">
          <SHSpreadsheetTable
            columns={[
              { key: "jobCode", label: "Job", width: "80px", frozen: true, mono: true },
              { key: "community", label: "Community", width: "140px", frozen: true },
              { key: "city", label: "City", width: "100px" },
              { key: "county", label: "County", width: "90px", render: r => {
                const cityCounty: Record<string, string> = { Orlando: "Orange", Tampa: "Hillsborough", Jacksonville: "Duval", Lakeland: "Polk" };
                return cityCounty[String(r.city)] ?? "\u2014";
              }},
              { key: "entity", label: "Entity", width: "150px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.entity ?? "\u2014";
              }},
              { key: "permitType", label: "Type", width: "100px" },
              { key: "permitSubType", label: "Sub-Type", width: "110px" },
              { key: "submittedDate", label: "Submitted", width: "90px" },
              { key: "approvedDate", label: "Approved", width: "90px", render: r => String(r.approvedDate ?? "\u2014") },
              { key: "issuedDate", label: "Issued", width: "90px", render: r => String(r.issuedDate ?? "\u2014") },
              { key: "year", label: "Year", width: "60px", align: "right" },
              { key: "status", label: "Status", width: "95px", render: r => {
                const s = String(r.status);
                const tone = s === "issued" ? "good" : s === "approved" ? "good" : s === "in-review" ? "watch" : s === "pending" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.replace("-", " ")} />;
              }},
              { key: "plan", label: "Plan", width: "100px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.plan ?? "\u2014";
              }},
              { key: "superintendent", label: "Super", width: "100px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.superintendent ?? "\u2014";
              }},
              { key: "stage", label: "Stage", width: "90px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.stage ?? "\u2014";
              }},
              { key: "completionPct", label: "Completion", width: "110px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return <CompletionBar pct={job?.completionPct ?? 0} />;
              }},
              { key: "daysInReview", label: "Total Days", width: "70px", align: "right", render: r => {
                const d = Number(r.daysInReview);
                return <span style={{ color: d > 30 ? "var(--sh-danger)" : d > 20 ? "var(--sh-warning)" : "var(--sh-text-secondary)", fontWeight: d > 20 ? 700 : 400 }}>{d}d</span>;
              }},
              { key: "sitePlanCT", label: "Site Plan CT", width: "85px", align: "right", render: r => `${Math.round(Number(r.daysInReview) * 0.25)}d` },
              { key: "housePlanCT", label: "House Plan CT", width: "90px", align: "right", render: r => `${Math.round(Number(r.daysInReview) * 0.20)}d` },
              { key: "septicCT", label: "Septic CT", width: "75px", align: "right", render: r => `${Math.round(Number(r.daysInReview) * 0.15)}d` },
              { key: "bldgDeptCT", label: "Bldg Dept CT", width: "85px", align: "right", render: r => `${Math.round(Number(r.daysInReview) * 0.25)}d` },
              { key: "jioApprovedCT", label: "JIO to Appr CT", width: "95px", align: "right", render: r => `${Math.round(Number(r.daysInReview) * 0.15)}d` },
              { key: "gopherTortoise", label: "Gopher Tortoise", width: "100px", render: r => {
                const v = Number(r.id) % 4 === 0;
                return <SHPill tone={v ? "watch" : "good"} label={v ? "Y" : "N"} />;
              }},
              { key: "treeSurvey", label: "Tree Survey", width: "85px", render: r => {
                const v = Number(r.id) % 3 === 0;
                return <SHPill tone={v ? "watch" : "good"} label={v ? "Y" : "N"} />;
              }},
              { key: "floodZone", label: "Flood Zone", width: "80px", render: r => {
                const zones = ["X", "X", "AE", "X", "VE"];
                const z = zones[Number(r.id) % zones.length];
                return <SHPill tone={z === "X" ? "good" : z === "AE" ? "watch" : "alert"} label={z} />;
              }},
              { key: "productType", label: "Product", width: "90px", render: () => "Single Family" },
            ]}
            rows={permits as unknown as Record<string, unknown>[]}
            maxRows={40}
            onRowClick={r => onDrill({ type: "permit", value: String(r.jobCode), label: `${String(r.jobCode)} \u2014 ${String(r.permitType)}` })}
          />
        </SHPanel>
      </div>
    </>
  );
}
