"use client";

import type { SHPermit, SHTab } from "@/types/sunshine-homes";
import { getPermitKPIs, buildCrossTab, fmtN, getQuarter, getMonthLabel } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHCrossTab from "../SHCrossTab";
import SHHistogram from "../SHHistogram";

const STATUS_COLORS: Record<string, string> = {
  approved: "#14b8a6",
  "in-review": "#22d3ee",
  pending: "#efb562",
  rejected: "#f46a6a",
};

interface Props {
  permits: SHPermit[];
  onCommunityClick: (community: string) => void;
  onCityClick: (city: string) => void;
  onTabChange: (tab: SHTab) => void;
  onStatusClick: (status: string) => void;
  drillYear: number | null;
  drillQuarter: number | null;
  onYearClick: (year: number) => void;
  onQuarterClick: (quarter: number) => void;
}

export default function PermittingDashboardTab({ permits, onCommunityClick, onCityClick, onTabChange, onStatusClick, drillYear, drillQuarter, onYearClick, onQuarterClick }: Props) {
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

  /* Cross-tab: City x Time — drill-aware (Year → Quarter → Month) */
  const cityTimeCross = (() => {
    if (drillQuarter) {
      const withMonth = permits
        .filter(p => p.submittedDate)
        .map(p => ({ ...p, month: getMonthLabel(p.submittedDate) }));
      return buildCrossTab(withMonth, "city", "month" as keyof typeof withMonth[0]);
    }
    if (drillYear) {
      const withQuarter = permits
        .filter(p => p.submittedDate)
        .map(p => ({ ...p, quarter: `Q${getQuarter(p.submittedDate)}` }));
      return buildCrossTab(withQuarter, "city", "quarter" as keyof typeof withQuarter[0]);
    }
    return buildCrossTab(permits, "city", "year");
  })();

  /* Cross-tab: City x Status */
  const cityStatusCross = buildCrossTab(permits, "city", "status");

  /* Histogram: Cycle time distribution (daysInReview, 5 buckets) */
  const cycleTimeBuckets = (() => {
    const thresholds = [15, 30, 45, 60, Infinity];
    const labels = ["0–15d", "16–30d", "31–45d", "46–60d", "60d+"];
    const colors = ["#14b8a6", "#22d3ee", "#efb562", "#f97316", "#f46a6a"];
    const counts = [0, 0, 0, 0, 0];
    for (const p of permits) {
      const d = p.daysInReview;
      for (let i = 0; i < thresholds.length; i++) {
        if (d <= thresholds[i]) { counts[i]++; break; }
      }
    }
    return labels.map((bucket, i) => ({ bucket, count: counts[i], color: colors[i] }));
  })();

  /* Ranked Bars: Avg cycle time by city */
  const avgCycleByCity = (() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const p of permits) {
      const e = map.get(p.city) || { total: 0, count: 0 };
      e.total += p.daysInReview;
      e.count++;
      map.set(p.city, e);
    }
    return Array.from(map.entries())
      .map(([label, d]) => ({ label, value: Math.round(d.total / d.count) }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Permitting</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Permit status tracking, cross-tab analysis, cycle times, and community breakdown. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Permits" value={fmtN(kpis.total)} sparkline={[18, 22, 25, 28, 30, 33, 35, 38, 40, 42]} delta="+8 this quarter" deltaDir="up" onClick={() => onTabChange("permitting-pipeline")} />
        <SHKpiCard label="Approved" value={fmtN(kpis.approved)} accent="#14b8a6" progress={Math.round((kpis.approved / Math.max(kpis.total, 1)) * 100)} delta={`${Math.round((kpis.approved / Math.max(kpis.total, 1)) * 100)}% approved`} deltaDir="up" onClick={() => onTabChange("permitting-pipeline")} />
        <SHKpiCard label="In Review" value={fmtN(kpis.inReview)} accent="#22d3ee" sparkline={[5, 4, 6, 7, 5, 6, 8, 7, 6, 5]} delta={`${kpis.pending} pending`} deltaDir="neutral" onClick={() => onTabChange("permitting-pipeline")} />
        <SHKpiCard label="Avg Days" value={`${Math.round(kpis.avgDaysToApproval)}d`} sub="To approval" sparkline={[32, 30, 28, 27, 26, 25, 24, 23, 22, 21]} delta="-3d vs prior" deltaDir="up" onClick={() => onTabChange("permitting-pipeline")} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Status" title="Permits by Status">
          <SHDonutChart segments={byStatus} onSegmentClick={label => {
            const map: Record<string, string> = { "Approved": "approved", "In Review": "in-review", "Pending": "pending", "Rejected": "rejected" };
            onStatusClick(map[label] ?? label.toLowerCase());
          }} />
        </SHPanel>
        <SHPanel kicker="Communities" title="Permits by Community">
          <SHRankedBars items={byCommunity} onBarClick={onCommunityClick} showRank />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="City × Time" title={
          drillQuarter ? `City by Month (Q${drillQuarter} ${drillYear})` :
          drillYear ? `City by Quarter (${drillYear})` :
          "City x Year (Permit Count)"
        }>
          <SHCrossTab
            {...cityTimeCross}
            onCellClick={(row) => onCityClick(row)}
            onRowLabelClick={(row) => onCityClick(row)}
            onColHeaderClick={
              drillQuarter ? undefined :
              drillYear ? (col) => onQuarterClick(Number(col.replace("Q", ""))) :
              (col) => onYearClick(Number(col))
            }
          />
        </SHPanel>
        <SHPanel kicker="Status" title="City x Permit Status">
          <SHCrossTab
            {...cityStatusCross}
            onCellClick={(row) => onCityClick(row)}
            onRowLabelClick={(row) => onCityClick(row)}
            onColHeaderClick={(col) => onStatusClick(col)}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Distribution" title="Cycle Time Distribution">
          <SHHistogram buckets={cycleTimeBuckets} />
        </SHPanel>
        <SHPanel kicker="Performance" title="Avg Cycle Time by City (days)">
          <SHRankedBars
            items={avgCycleByCity}
            formatValue={v => `${v}d`}
            onBarClick={onCityClick}
            showRank
          />
        </SHPanel>
      </div>

    </>
  );
}
