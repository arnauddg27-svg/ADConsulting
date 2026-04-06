"use client";

import type { SHSale, SHTab } from "@/types/sunshine-homes";
import { getSalesKPIs, getSalesByCommunity, getSalesByPlan, buildCrossTab, fmt$, fmtN, getQuarter, getMonthLabel, getDayLabel } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHDonutChart from "../SHDonutChart";
import SHCrossTab from "../SHCrossTab";
import SHAreaChart from "../SHAreaChart";
import SHHistogram from "../SHHistogram";

const PLAN_COLORS = ["#14b8a6", "#22d3ee", "#3b82f6"];

const SALES_VALUE_TREND = [
  { label: "Q1 '24", value: 4.2 },
  { label: "Q2 '24", value: 5.8 },
  { label: "Q3 '24", value: 7.1 },
  { label: "Q4 '24", value: 9.3 },
  { label: "Q1 '25", value: 11.0 },
  { label: "Q2 '25", value: 13.4 },
  { label: "Q3 '25", value: 15.9 },
  { label: "Q4 '25", value: 18.7 },
];

interface Props {
  sales: SHSale[];
  onCommunityClick: (community: string) => void;
  onCityClick: (city: string) => void;
  onStatusClick: (status: string) => void;
  onTabChange: (tab: SHTab) => void;
  drillYear: number | null;
  drillQuarter: number | null;
  drillMonth: number | null;
  onYearClick: (year: number) => void;
  onQuarterClick: (quarter: number) => void;
  onMonthClick: (month: number) => void;
}

export default function SalesDashboardTab({ sales, onCommunityClick, onCityClick, onStatusClick, onTabChange, drillYear, drillQuarter, drillMonth, onYearClick, onQuarterClick, onMonthClick }: Props) {
  const kpis = getSalesKPIs(sales);
  const byCommunity = getSalesByCommunity(sales);
  const byPlan = getSalesByPlan(sales).map((p, i) => ({ ...p, color: PLAN_COLORS[i % PLAN_COLORS.length] }));

  /* CrossTab: city x status */
  const crossTab = buildCrossTab(sales, "city", "status");

  /* CrossTab: City x Time — drill-aware (Year → Quarter → Month → Day) */
  const cityTimeCross = (() => {
    const closedSales = sales.filter(s => s.closingDate);
    if (drillMonth) {
      const withDay = closedSales.map(s => ({ ...s, day: getDayLabel(s.closingDate!) }));
      return buildCrossTab(withDay, "city", "day" as keyof typeof withDay[0]);
    }
    if (drillQuarter) {
      const withMonth = closedSales.map(s => ({ ...s, month: getMonthLabel(s.closingDate!) }));
      return buildCrossTab(withMonth, "city", "month" as keyof typeof withMonth[0]);
    }
    if (drillYear) {
      const withQuarter = closedSales.map(s => ({ ...s, quarter: `Q${getQuarter(s.closingDate!)}` }));
      return buildCrossTab(withQuarter, "city", "quarter" as keyof typeof withQuarter[0]);
    }
    return buildCrossTab(sales, "city", "year");
  })();

  /* Ranked bars: avg sale price by city */
  const avgPriceByCity = (() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const s of sales) {
      const e = map.get(s.city) ?? { total: 0, count: 0 };
      e.total += s.salePrice;
      e.count++;
      map.set(s.city, e);
    }
    return Array.from(map.entries())
      .map(([label, d]) => ({ label, value: Math.round(d.total / d.count) }))
      .sort((a, b) => b.value - a.value);
  })();

  /* Histogram: sale price distribution — 5 buckets */
  const prices = sales.map(s => s.salePrice);
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);
  const priceStep = (priceMax - priceMin) / 5;
  const HIST_COLORS = ["#14b8a6", "#22d3ee", "#3b82f6", "#6366f1", "#a855f7"];
  const priceHistogram = Array.from({ length: 5 }, (_, i) => {
    const lo = priceMin + i * priceStep;
    const hi = lo + priceStep;
    return {
      bucket: `${fmt$(Math.round(lo / 1000) * 1000)}–${fmt$(Math.round(hi / 1000) * 1000)}`,
      count: sales.filter(s => s.salePrice >= lo && (i === 4 ? s.salePrice <= hi : s.salePrice < hi)).length,
      color: HIST_COLORS[i],
    };
  });

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Sales</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Sales pipeline, community breakdown, and plan performance. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Sales" value={fmtN(kpis.totalSales)} sub="Active contracts" sparkline={[12, 13, 14, 13, 15, 16, 15, 17, 18]} delta="+2 this month" deltaDir="up" onClick={() => onTabChange("sales-pipeline")} />
        <SHKpiCard label="Total Value" value={fmt$(kpis.totalValue)} accent="#22d3ee" sparkline={[5.2, 5.8, 6.3, 6.9, 7.4, 8.0, 8.5, 9.1, 9.6]} delta="+15% YoY" deltaDir="up" onClick={() => onTabChange("sales-pipeline")} />
        <SHKpiCard label="Avg Sale Price" value={fmt$(kpis.avgPrice)} sparkline={[460, 470, 475, 480, 490, 495, 498, 502, 505]} delta="+3% vs prior" deltaDir="up" onClick={() => onTabChange("sales-pipeline")} />
        <SHKpiCard label="Pending Close" value={fmtN(kpis.pendingClosings)} accent="#efb562" sparkline={[3, 4, 5, 4, 6, 5, 7, 6, 8]} delta={`${kpis.pendingClosings} awaiting`} deltaDir="neutral" onClick={() => onTabChange("sales-pipeline")} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="By Community" title="Sales Volume">
          <SHRankedBars
            items={byCommunity}
            onBarClick={onCommunityClick}
            showRank
          />
        </SHPanel>
        <SHPanel kicker="By Plan" title="Sales by Floor Plan">
          <SHDonutChart
            segments={byPlan}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="City × Status" title="Sales CrossTab">
          <SHCrossTab
            {...crossTab}
            onCellClick={(row) => onCityClick(row)}
            onRowLabelClick={(row) => onCityClick(row)}
            onColHeaderClick={(col) => onStatusClick(col)}
          />
        </SHPanel>
        <SHPanel kicker="Revenue Trend" title="Cumulative Sales Value">
          <SHAreaChart
            data={SALES_VALUE_TREND}
            color="#14b8a6"
            label1="Cumulative ($M)"
            formatY={v => `$${v.toFixed(1)}M`}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="City × Time" title={
          drillMonth ? `Sales: City by Day (${new Date(2000, drillMonth - 1).toLocaleString("en-US", { month: "short" })} ${drillYear})` :
          drillQuarter ? `Sales: City by Month (Q${drillQuarter} ${drillYear})` :
          drillYear ? `Sales: City by Quarter (${drillYear})` :
          "Sales by Year"
        }>
          <SHCrossTab
            {...cityTimeCross}
            onCellClick={(row) => onCityClick(row)}
            onRowLabelClick={(row) => onCityClick(row)}
            onColHeaderClick={
              drillMonth ? undefined :
              drillQuarter ? (col) => onMonthClick(new Date(Date.parse(col + " 1, 2000")).getMonth() + 1) :
              drillYear ? (col) => onQuarterClick(Number(col.replace("Q", ""))) :
              (col) => onYearClick(Number(col))
            }
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="By City" title="Avg Sale Price">
          <SHRankedBars
            items={avgPriceByCity}
            formatValue={v => fmt$(v)}
            onBarClick={onCityClick}
            showRank
          />
        </SHPanel>
        <SHPanel kicker="Price Distribution" title="Sale Price Histogram">
          <SHHistogram buckets={priceHistogram} />
        </SHPanel>
      </div>

    </>
  );
}
