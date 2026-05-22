"use client";

import type { SHPermit } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import SHPanel from "../SHPanel";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";
import SHExceptionSummary from "../SHExceptionSummary";

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
  const longReview = permits.filter(p => (p.status === "in-review" || p.status === "pending") && p.daysInReview > 30).length;
  const rejected = permits.filter(p => p.status === "rejected").length;
  const pending = permits.filter(p => p.status === "pending").length;
  const envFlags = permits.filter(p => p.gopherTortoise || p.treeSurvey || (p.floodZone != null && p.floodZone !== "X")).length;

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Permitting</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Full permit roster with status, cycle times, and environmental flags. Click any row for details.</p>
      </div>

      <SHExceptionSummary
        items={[
          { label: "In Review > 30d", value: String(longReview), tone: longReview >= 12 ? "alert" : longReview >= 6 ? "watch" : "good" },
          { label: "Rejected Permits", value: String(rejected), tone: rejected >= 6 ? "alert" : rejected >= 3 ? "watch" : "good" },
          { label: "Pending Queue", value: String(pending), tone: pending >= 18 ? "watch" : "good" },
          { label: "Env. Flags", value: String(envFlags), tone: envFlags >= 16 ? "alert" : envFlags >= 8 ? "watch" : "good" },
        ]}
      />

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Full Permit Roster">
          <SHSpreadsheetTable
            columns={[
              { key: "jobCode", label: "Job", width: "80px", frozen: true, mono: true },
              { key: "community", label: "Community", width: "140px", frozen: true },
              { key: "city", label: "City", width: "100px" },
              { key: "county", label: "County", width: "90px", render: r => String(r.county ?? "\u2014") },
              { key: "entity", label: "Entity", width: "160px", render: r => String(r.entity ?? "\u2014") },
              { key: "permitType", label: "Type", width: "100px" },
              { key: "permitSubType", label: "Sub-Type", width: "110px" },
              { key: "submittedDate", label: "Submitted", width: "90px" },
              { key: "approvedDate", label: "Approved", width: "90px", render: r => String(r.approvedDate ?? "\u2014") },
              { key: "issuedDate", label: "Issued", width: "90px", render: r => String(r.issuedDate ?? "\u2014") },
              { key: "year", label: "Year", width: "60px", align: "right" },
              { key: "status", label: "Status", width: "110px", render: r => {
                const s = String(r.status);
                const tone = s === "issued" ? "good" : s === "approved" ? "good" : s === "in-review" ? "watch" : s === "pending" ? "watch" : "alert";
                return <SHPill tone={tone} label={s.replace("-", " ")} />;
              }},
              { key: "plan", label: "Plan", width: "100px", render: r => String(r.plan ?? "\u2014") },
              { key: "superintendent", label: "Super", width: "130px", render: r => String(r.superintendent ?? "\u2014") },
              { key: "stage", label: "Stage", width: "90px", render: r => String(r.stage ?? "\u2014") },
              { key: "completionPct", label: "Completion", width: "110px", render: r => <CompletionBar pct={Number(r.completionPct ?? 0)} /> },
              { key: "daysInReview", label: "Total Days", width: "80px", align: "right", render: r => {
                const d = Number(r.daysInReview);
                return <span style={{ color: d > 30 ? "var(--sh-danger)" : d > 20 ? "var(--sh-warning)" : "var(--sh-text-secondary)", fontWeight: d > 20 ? 700 : 400 }}>{d}d</span>;
              }},
              { key: "sitePlanCycleDays", label: "Site Plan CT", width: "85px", align: "right", render: r => `${Number(r.sitePlanCycleDays ?? 0)}d` },
              { key: "housePlanCycleDays", label: "House Plan CT", width: "90px", align: "right", render: r => `${Number(r.housePlanCycleDays ?? 0)}d` },
              { key: "septicCycleDays", label: "Septic CT", width: "75px", align: "right", render: r => `${Number(r.septicCycleDays ?? 0)}d` },
              { key: "buildingDeptCycleDays", label: "Bldg Dept CT", width: "85px", align: "right", render: r => `${Number(r.buildingDeptCycleDays ?? 0)}d` },
              { key: "jioApprovalCycleDays", label: "JIO to Appr CT", width: "95px", align: "right", render: r => `${Number(r.jioApprovalCycleDays ?? 0)}d` },
              { key: "gopherTortoise", label: "Gopher Tortoise", width: "100px", render: r => {
                const v = Boolean(r.gopherTortoise);
                return <SHPill tone={v ? "watch" : "good"} label={v ? "Y" : "N"} />;
              }},
              { key: "treeSurvey", label: "Tree Survey", width: "85px", render: r => {
                const v = Boolean(r.treeSurvey);
                return <SHPill tone={v ? "watch" : "good"} label={v ? "Y" : "N"} />;
              }},
              { key: "floodZone", label: "Flood Zone", width: "80px", render: r => {
                const z = String(r.floodZone ?? "X");
                return <SHPill tone={z === "X" ? "good" : z === "AE" ? "watch" : "alert"} label={z} />;
              }},
              { key: "productType", label: "Product", width: "90px", render: r => String(r.productType ?? "\u2014") },
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
