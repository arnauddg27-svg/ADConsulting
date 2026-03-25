"use client";

import type { SHPermit } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getPermitKPIs, fmtN } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";

const STATUS_COLORS: Record<string, string> = {
  approved: "#14b8a6",
  "in-review": "#22d3ee",
  pending: "#efb562",
  rejected: "#f46a6a",
};

interface Props {
  permits: SHPermit[];
  onCommunityClick: (community: string) => void;
  onDrill: (detail: DrillDetail) => void;
}

export default function PermittingDashboardTab({ permits, onCommunityClick, onDrill }: Props) {
  const kpis = getPermitKPIs(permits);

  const byStatus = [
    { label: "Approved", value: kpis.approved, color: STATUS_COLORS.approved },
    { label: "In Review", value: kpis.inReview, color: STATUS_COLORS["in-review"] },
    { label: "Pending", value: kpis.pending, color: STATUS_COLORS.pending },
  ].filter(s => s.value > 0);

  const byCommunity = (() => {
    const map = new Map<string, number>();
    for (const p of permits) map.set(p.community, (map.get(p.community) || 0) + 1);
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Permitting</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Permit status tracking and cycle times.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Permits" value={fmtN(kpis.total)} />
        <SHKpiCard label="Approved" value={fmtN(kpis.approved)} accent="#14b8a6" />
        <SHKpiCard label="In Review" value={fmtN(kpis.inReview)} accent="#22d3ee" />
        <SHKpiCard label="Avg Days" value={`${Math.round(kpis.avgDaysToApproval)}d`} sub="To approval" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Status" title="Permits by Status">
          <SHDonutChart segments={byStatus} onSegmentClick={label => onDrill({ type: "permit-status", value: label, label })} />
        </SHPanel>
        <SHPanel kicker="Communities" title="Permits by Community">
          <SHRankedBars items={byCommunity} onBarClick={label => onDrill({ type: "community", value: label, label })} showRank />
        </SHPanel>
      </div>
    </>
  );
}
