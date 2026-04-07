"use client";

import type { SHPermit } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { jobs } from "@/lib/sunshine-homes-data";
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
        ]}
      />

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
              { key: "entity", label: "Entity", width: "160px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.entity ?? "\u2014";
              }},
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
              { key: "plan", label: "Plan", width: "100px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.plan ?? "\u2014";
              }},
              { key: "superintendent", label: "Super", width: "130px", render: r => {
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
              { key: "daysInReview", label: "Total Days", width: "80px", align: "right", render: r => {
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
