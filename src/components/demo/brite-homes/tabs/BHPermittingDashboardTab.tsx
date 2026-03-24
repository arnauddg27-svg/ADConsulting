"use client";

import type { SHPermit } from "@/types/sunshine-homes";
import { getPermitKPIs, fmtN } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHDonutChart from "../../sunshine/SHDonutChart";
import SHRankedBars from "../../sunshine/SHRankedBars";
import SHCompactTable from "../../sunshine/SHCompactTable";
import SHPill from "../../sunshine/SHPill";

interface Props {
  permits: SHPermit[];
  onCommunityClick: (community: string) => void;
}

export default function BHPermittingDashboardTab({ permits, onCommunityClick }: Props) {
  const kpis = getPermitKPIs(permits);

  const statusBreakdown = [
    { label: "Approved", value: permits.filter(p => p.status === "approved").length, color: "#14b8a6" },
    { label: "In Review", value: permits.filter(p => p.status === "in-review").length, color: "#f59e0b" },
  ];

  const byCity = Array.from(new Set(permits.map(p => p.city)))
    .map(city => ({
      label: city,
      value: permits.filter(p => p.city === city).length,
    }))
    .sort((a, b) => b.value - a.value);

  const permitRows = permits
    .map(p => ({
      permitType: p.permitType,
      jobCode: p.jobCode,
      community: p.community,
      city: p.city,
      submittedDate: p.submittedDate,
      approvedDate: p.approvedDate,
      status: p.status,
      daysElapsed: p.daysInReview,
    }))
    .sort((a, b) => b.daysElapsed - a.daysElapsed);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Permitting</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Permit status, approval tracking, and processing delays.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="In Permitting" value={fmtN(kpis.inPermitting)} sub="Pending review" accent="#f59e0b" />
        <SHKpiCard label="Avg Days" value={`${kpis.avgDays}d`} sub="To approval" accent="#22d3ee" />
        <SHKpiCard label="Stuck >90d" value={fmtN(kpis.stuckOver90)} sub="Over 90 days" accent="#ef4444" />
        <SHKpiCard label="Approved This Month" value={fmtN(kpis.approvedThisMonth)} sub="Recent approvals" accent="#14b8a6" sparkline={[2, 3, 2, 4, 3, 5, 4, 6, 5, 8]} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Status" title="Permit Status">
          <SHDonutChart segments={statusBreakdown} />
        </SHPanel>
        <SHPanel kicker="Geography" title="Permits by City">
          <SHRankedBars items={byCity} onBarClick={city => onCommunityClick(city)} showRank />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Permit Tracking">
          <SHCompactTable
            columns={[
              { key: "permitType", label: "Permit Type", width: "110px" },
              { key: "jobCode", label: "Job", width: "90px" },
              { key: "community", label: "Community", width: "120px" },
              { key: "city", label: "City", width: "100px" },
              { key: "submittedDate", label: "Submitted", width: "100px" },
              { key: "status", label: "Status", width: "100px", render: r => {
                const status = String(r.status);
                return status === "approved" ? <SHPill tone="good" label="Approved" /> : <SHPill tone="watch" label="In Review" />;
              }},
              { key: "daysElapsed", label: "Days", width: "70px", align: "right", render: r => {
                const days = Number(r.daysElapsed);
                const tone = days > 90 ? "alert" : days > 60 ? "watch" : "good";
                return <span style={{ color: tone === "alert" ? "var(--sh-danger)" : tone === "watch" ? "var(--sh-warning)" : "var(--sh-accent)" }}>{days}d</span>;
              }},
            ]}
            rows={permitRows as unknown as Record<string, unknown>[]}
          />
        </SHPanel>
      </div>
    </>
  );
}
