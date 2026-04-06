"use client";

import type { SHLandDeal, SHTab } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getLandKPIs, buildCrossTab, fmt$, fmtN, getQuarter, getMonthLabel, getDayLabel } from "@/lib/sunshine-homes-data";
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
    const cancelled = deals.filter(d => d.status === "cancelled").length;
    return [
      { label: "Closed", value: closed, color: "#14b8a6" },
      { label: "Under Contract", value: active, color: "#efb562" },
      ...(cancelled > 0 ? [{ label: "Cancelled", value: cancelled, color: "#f46a6a" }] : []),
    ];
  })();

  /* Total investment */
  const totalInvestment = nonCancelled.reduce((s, d) => s + d.acquisitionCost, 0);
  const totalLots = nonCancelled.reduce((s, d) => s + d.lots, 0);

  /* CrossTab: City x Time — drill-aware (Year → Quarter → Month → Day) */
  const cityTimeCross = (() => {
    if (drillMonth) {
      const withDay = deals.map(d => ({ ...d, day: getDayLabel(d.contractDate) }));
      return buildCrossTab(withDay, "city", "day" as keyof typeof withDay[0]);
    }
    if (drillQuarter) {
      const withMonth = deals.map(d => ({ ...d, month: getMonthLabel(d.contractDate) }));
      return buildCrossTab(withMonth, "city", "month" as keyof typeof withMonth[0]);
    }
    if (drillYear) {
      const withQuarter = deals.map(d => ({ ...d, quarter: `Q${getQuarter(d.contractDate)}` }));
      return buildCrossTab(withQuarter, "city", "quarter" as keyof typeof withQuarter[0]);
    }
    return buildCrossTab(deals, "city", "year");
  })();

  /* Ranked Bars: Under Contract lots by city */
  const underContractByCity = (() => {
    const activeDeals = deals.filter(d => d.status === "under-contract");
    const map = new Map<string, number>();
    for (const d of activeDeals) map.set(d.city, (map.get(d.city) || 0) + d.lots);
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  })();

  /* Area Chart: Cumulative investment trend over 8 quarters */
  const investmentTrend = [
    { label: "Q1 '23", value: 4.2 },
    { label: "Q2 '23", value: 7.8 },
    { label: "Q3 '23", value: 11.5 },
    { label: "Q4 '23", value: 16.1 },
    { label: "Q1 '24", value: 20.4 },
    { label: "Q2 '24", value: 25.9 },
    { label: "Q3 '24", value: 31.3 },
    { label: "Q4 '24", value: 37.6 },
  ];

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
        <SHKpiCard label="Active Deals" value={fmtN(kpis.activeDeals)} sub={`${kpis.closedDeals} closed`} delta={`+${kpis.activeDeals} in pipeline`} deltaDir="up" onClick={() => onDrill({ type: "land-metric", value: "active-deals", label: `Active Deals — ${fmtN(kpis.activeDeals)}` })} />
        <SHKpiCard label="Total Lots" value={fmtN(totalLots)} sparkline={[80, 95, 110, 120, 135, 150, 160, 170]} delta="+35 lots YoY" deltaDir="up" onClick={() => onDrill({ type: "land-metric", value: "total-lots", label: `Total Lots — ${fmtN(totalLots)}` })} />
        <SHKpiCard label="Total Invested" value={fmt$(totalInvestment)} accent="#22d3ee" sparkline={[2.1, 2.5, 2.8, 3.2, 3.5, 3.9, 4.2, 4.6, 5.0, 5.3]} delta="+18% YoY" deltaDir="up" onClick={() => onDrill({ type: "land-metric", value: "invested", label: `Total Invested — ${fmt$(totalInvestment)}` })} />
        <SHKpiCard label="Avg Cost/Lot" value={fmt$(kpis.avgCostPerLot)} accent="#3b82f6" sparkline={[38, 40, 42, 43, 44, 45, 46, 47]} delta="+4% vs prior" deltaDir="up" onClick={() => onDrill({ type: "land-metric", value: "avg-cost", label: `Avg Cost/Lot — ${fmt$(kpis.avgCostPerLot)}` })} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Status" title="Deal Status Distribution">
          <SHDonutChart segments={byStatus} onSegmentClick={label => {
            const map: Record<string, string> = { "Closed": "closed", "Under Contract": "under-contract", "Cancelled": "cancelled" };
            onStatusClick(map[label] ?? label.toLowerCase());
            onDrill({ type: "land-status", value: label, label });
          }} />
        </SHPanel>
        <SHPanel kicker="Geography" title="Lots by City">
          <SHRankedBars items={byCity} onBarClick={label => { onCityClick(label); onDrill({ type: "city", value: label, label }); }} showRank />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="City × Time" title={
          drillMonth ? `Closed Deals: City by Day (${new Date(2000, drillMonth - 1).toLocaleString("en-US", { month: "short" })} ${drillYear})` :
          drillQuarter ? `Closed Deals: City by Month (Q${drillQuarter} ${drillYear})` :
          drillYear ? `Closed Deals: City by Quarter (${drillYear})` :
          "Closed Deals: City by Year"
        }>
          <SHCrossTab
            {...cityTimeCross}
            onCellClick={(row, col) => { onCityClick(row); onDrill({ type: "land-city-year", value: row, label: `${row} — ${col}` }); }}
            onRowLabelClick={(row) => { onCityClick(row); onDrill({ type: "city", value: row, label: row }); }}
            onColHeaderClick={
              drillMonth ? undefined :
              drillQuarter ? (col) => onMonthClick(new Date(Date.parse(col + " 1, 2000")).getMonth() + 1) :
              drillYear ? (col) => onQuarterClick(Number(col.replace("Q", ""))) :
              (col) => onYearClick(Number(col))
            }
          />
        </SHPanel>
        <SHPanel kicker="Pipeline" title="Under Contract — Lots by City">
          <SHRankedBars
            items={underContractByCity}
            onBarClick={label => { onCityClick(label); onDrill({ type: "city", value: label, label }); }}
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
          />
        </SHPanel>
        <SHPanel kicker="Distribution" title="Cost per Lot Distribution">
          <SHHistogram buckets={costPerLotBuckets} onBucketClick={bucket => onDrill({ type: "land-metric", value: bucket, label: `Cost/Lot ${bucket}` })} />
        </SHPanel>
      </div>

    </>
  );
}
