"use client";

import { useMemo } from "react";
import type { SHLandDeal, SHTab } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getLandKPIs, buildCrossTab, fmt$, fmtN, getQuarter, getMonthLabel, getDayLabel, buildQuarterTrend } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHDonutChart from "../SHDonutChart";
import SHCrossTab from "../SHCrossTab";
import SHAreaChart from "../SHAreaChart";
import SHHistogram from "../SHHistogram";

interface Props {
  deals: SHLandDeal[];
  onCommunityClick: (community: string) => void;
  onCityClick: (city: string) => void;
  onTabChange: (tab: SHTab) => void;
  onStatusClick: (status: string) => void;
  onDrill: (detail: DrillDetail) => void;
  drillYear: number | null;
  drillQuarter: number | null;
  drillMonth: number | null;
  onYearClick: (year: number) => void;
  onQuarterClick: (quarter: number) => void;
  onMonthClick: (month: number) => void;
}

export default function LandDashboardTab({ deals, onCommunityClick, onCityClick, onTabChange, onStatusClick, onDrill, drillYear, drillQuarter, drillMonth, onYearClick, onQuarterClick, onMonthClick }: Props) {
  const kpis = getLandKPIs(deals);
  const nonCancelled = deals.filter(d => d.status !== "cancelled");

  /* Lots by city */
  const byCity = (() => {
    const map = new Map<string, number>();
    for (const d of nonCancelled) map.set(d.city, (map.get(d.city) || 0) + d.lots);
    return Array.from(map.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  })();

  /* Status distribution */
  const byStatus = (() => {
    const closed = deals.filter(d => d.status === "closed").length;
    const active = deals.filter(d => d.status === "under-contract").length;
    const pending = deals.filter(d => d.status === "pending").length;
    const cancelled = deals.filter(d => d.status === "cancelled").length;
    return [
      { label: "Closed", value: closed, color: "#14b8a6" },
      { label: "Active", value: active, color: "#22d3ee" },
      { label: "Pending", value: pending, color: "#efb562" },
      ...(cancelled > 0 ? [{ label: "Cancelled", value: cancelled, color: "#f46a6a" }] : []),
    ];
  })();

  /* Total investment */
  const totalInvestment = nonCancelled.reduce((s, d) => s + d.acquisitionCost, 0);
  const totalLots = nonCancelled.reduce((s, d) => s + d.lots, 0);
  const landActivityDeals = nonCancelled;
  const landActivityDealIds = landActivityDeals.map(d => d.id);

  /* CrossTab: City x Time — drill-aware (Year → Quarter → Month → Day) */
  const cityTimeCross = (() => {
    if (drillMonth) {
      const withDay = landActivityDeals.map(d => ({ ...d, day: getDayLabel(d.contractDate) }));
      return buildCrossTab(withDay, "city", "day" as keyof typeof withDay[0]);
    }
    if (drillQuarter) {
      const withMonth = landActivityDeals.map(d => ({ ...d, month: getMonthLabel(d.contractDate) }));
      return buildCrossTab(withMonth, "city", "month" as keyof typeof withMonth[0]);
    }
    if (drillYear) {
      const withQuarter = landActivityDeals.map(d => ({ ...d, quarter: `Q${getQuarter(d.contractDate)}` }));
      return buildCrossTab(withQuarter, "city", "quarter" as keyof typeof withQuarter[0]);
    }
    const withYear = landActivityDeals.map(d => ({ ...d, contractYear: new Date(d.contractDate).getFullYear() }));
    return buildCrossTab(withYear, "city", "contractYear" as keyof typeof withYear[0]);
  })();

  /* Ranked Bars: active/pending acquisition lots by city */
  const activePipelineByCity = (() => {
    const activeDeals = deals.filter(d => d.status === "under-contract" || d.status === "pending");
    const map = new Map<string, number>();
    for (const d of activeDeals) map.set(d.city, (map.get(d.city) || 0) + d.lots);
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  })();

  const investmentTrend = useMemo(() => (
    buildQuarterTrend(
      nonCancelled,
      d => d.contractDate,
      d => d.acquisitionCost,
      { cumulative: true, maxPoints: 8 },
    ).map(p => ({ label: p.label, value: Math.round((p.value / 1_000_000) * 10) / 10 }))
  ), [nonCancelled]);

  /* Histogram: Cost/Lot distribution (5 buckets) */
  const costPerLotBuckets = (() => {
    const thresholds = [30000, 40000, 50000, 60000, Infinity];
    const labels = ["<$30K", "$30–40K", "$40–50K", "$50–60K", "$60K+"];
    const colors = ["#0f766e", "#14b8a6", "#22d3ee", "#3b82f6", "#6366f1"];
    const counts = [0, 0, 0, 0, 0];
    for (const d of nonCancelled) {
      for (let i = 0; i < thresholds.length; i++) {
        if (d.costPerLot < thresholds[i]) { counts[i]++; break; }
      }
    }
    return labels.map((bucket, i) => ({ bucket, count: counts[i], color: colors[i] }));
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Land</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Acquisition pipeline, lot pricing, and deal flow. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Active Deals" value={fmtN(kpis.activeDeals)} sub={`${kpis.pendingDeals} pending · ${kpis.closedDeals} closed`} onClick={() => onDrill({ type: "land-metric", value: "active-deals", label: `Active Deals — ${fmtN(kpis.activeDeals)}` })} />
        <SHKpiCard label="Total Lots" value={fmtN(totalLots)} sparkline={[320, 380, 420, 460, 510, 540, 570, 600]} onClick={() => onDrill({ type: "land-metric", value: "total-lots", label: `Total Lots — ${fmtN(totalLots)}` })} />
        <SHKpiCard label="Total Invested" value={fmt$(totalInvestment)} accent="#22d3ee" sparkline={[2.1, 2.5, 2.8, 3.2, 3.5, 3.9, 4.2, 4.6, 5.0, 5.3]} onClick={() => onDrill({ type: "land-metric", value: "invested", label: `Total Invested — ${fmt$(totalInvestment)}` })} />
        <SHKpiCard label="Avg Cost/Lot" value={fmt$(kpis.avgCostPerLot)} accent="#3b82f6" sparkline={[38, 40, 42, 43, 44, 45, 46, 47]} onClick={() => onDrill({ type: "land-metric", value: "avg-cost", label: `Avg Cost/Lot — ${fmt$(kpis.avgCostPerLot)}` })} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Status" title="Deal Status Distribution">
          <SHDonutChart segments={byStatus} onSegmentClick={label => {
            const map: Record<string, string> = { "Closed": "closed", "Active": "under-contract", "Pending": "pending", "Cancelled": "cancelled" };
            onStatusClick(map[label] ?? label.toLowerCase());
            onDrill({ type: "land-status", value: map[label] ?? label, label });
          }} />
        </SHPanel>
        <SHPanel kicker="Geography" title="Lots by City">
          <SHRankedBars items={byCity} onBarClick={label => { onCityClick(label); onDrill({ type: "city", value: label, label }); }} showRank />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="City × Time" title={
          drillMonth ? `Contract Activity: City by Day (${new Date(2000, drillMonth - 1).toLocaleString("en-US", { month: "short" })} ${drillYear})` :
          drillQuarter ? `Contract Activity: City by Month (Q${drillQuarter} ${drillYear})` :
          drillYear ? `Contract Activity: City by Quarter (${drillYear})` :
          "Contract Activity: City by Year"
        }>
          <SHCrossTab
            {...cityTimeCross}
            onCellClick={(row, col) => { onCityClick(row); onDrill({ type: "land-city-year", value: `${row}|${col}`, label: `${row} — ${col}`, scopedLandDealIds: landActivityDealIds }); }}
            onRowLabelClick={(row) => { onCityClick(row); onDrill({ type: "city", value: row, label: `${row} — Contract Activity`, scopedLandDealIds: landActivityDeals.filter(d => d.city === row).map(d => d.id) }); }}
            onColHeaderClick={
              drillMonth ? undefined :
              drillQuarter ? (col) => {
                onMonthClick(new Date(Date.parse(col + " 1, 2000")).getMonth() + 1);
                onDrill({ type: "land-time", value: col, label: `Land Contracts — ${col}`, scopedLandDealIds: landActivityDealIds });
              } :
              drillYear ? (col) => {
                onQuarterClick(Number(col.replace("Q", "")));
                onDrill({ type: "land-time", value: col, label: `Land Contracts — ${col}`, scopedLandDealIds: landActivityDealIds });
              } :
              (col) => {
                onYearClick(Number(col));
                onDrill({ type: "land-time", value: col, label: `Land Contracts — ${col}`, scopedLandDealIds: landActivityDealIds });
              }
            }
          />
        </SHPanel>
        <SHPanel kicker="Pipeline" title="Active / Pending Lots by City">
          <SHRankedBars
            items={activePipelineByCity}
            onBarClick={label => {
              onCityClick(label);
              onDrill({
                type: "city",
                value: label,
                label,
                scopedLandDealIds: deals.filter(d => d.city === label && (d.status === "under-contract" || d.status === "pending")).map(d => d.id),
              });
            }}
            showRank
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Trend" title="Cumulative Investment ($M)">
          <SHAreaChart
            data={investmentTrend}
            color="#14b8a6"
            label1="Cumulative ($M)"
            formatY={v => `$${v.toFixed(1)}M`}
            onPointClick={label => onDrill({ type: "land-time", value: label, label: `Investment — ${label}`, scopedLandDealIds: landActivityDealIds })}
          />
        </SHPanel>
        <SHPanel kicker="Distribution" title="Cost per Lot Distribution">
          <SHHistogram buckets={costPerLotBuckets} onBucketClick={bucket => onDrill({ type: "land-metric", value: bucket, label: `Cost/Lot ${bucket}`, scopedLandDealIds: landActivityDealIds })} />
        </SHPanel>
      </div>

    </>
  );
}
