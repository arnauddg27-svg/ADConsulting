"use client";

import { useMemo } from "react";
import type { SHLoan, SHTab } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getLoanKPIs, getLenderDistribution, buildCrossTab, fmt$, fmtN, getQuarter, getMonthLabel, getDayLabel, buildQuarterTrend } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHAreaChart from "../SHAreaChart";
import SHHistogram from "../SHHistogram";
import SHCrossTab from "../SHCrossTab";

const LENDER_COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6"];

interface Props {
  loans: SHLoan[];
  onCommunityClick: (community: string) => void;
  onCityClick: (city: string) => void;
  onStatusClick: (status: string) => void;
  onTabChange: (tab: SHTab) => void;
  onDrill: (detail: DrillDetail) => void;
  drillYear: number | null;
  drillQuarter: number | null;
  drillMonth: number | null;
  onYearClick: (year: number) => void;
  onQuarterClick: (quarter: number) => void;
  onMonthClick: (month: number) => void;
}

export default function LoansDashboardTab({ loans, onCommunityClick, onCityClick, onStatusClick, onTabChange, onDrill, drillYear, drillQuarter, drillMonth, onYearClick, onQuarterClick, onMonthClick }: Props) {
  const kpis = getLoanKPIs(loans);
  const lenders = getLenderDistribution(loans).map((l, i) => ({
    ...l, color: LENDER_COLORS[i % LENDER_COLORS.length],
  }));

  /* Donut: Interest rate distribution */
  const rateDistribution = (() => {
    const buckets = [
      { label: "5–6%", min: 5, max: 6, color: "#0f766e" },
      { label: "6–7%", min: 6, max: 7, color: "#14b8a6" },
      { label: "7–8%", min: 7, max: 8, color: "#22d3ee" },
      { label: "8%+",  min: 8, max: Infinity, color: "#3b82f6" },
    ];
    return buckets.map(b => ({
      label: b.label,
      color: b.color,
      value: loans.filter(l => l.interestRate >= b.min && l.interestRate < b.max).length,
    })).filter(b => b.value > 0);
  })();

  const exposureTrend = useMemo(() => (
    buildQuarterTrend(
      loans,
      l => l.startDate,
      l => l.loanAmount,
      { cumulative: true, maxPoints: 8 },
    ).map(p => ({ label: p.label, value: Math.round((p.value / 1_000_000) * 10) / 10 }))
  ), [loans]);

  /* Ranked Bars: Loan exposure by city */
  const exposureByCity = (() => {
    const map = new Map<string, number>();
    for (const l of loans) map.set(l.city, (map.get(l.city) || 0) + l.loanAmount);
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value: Math.round(value / 1_000_000) }))
      .sort((a, b) => b.value - a.value);
  })();

  /* CrossTab: City x Time — drill-aware (Year → Quarter → Month → Day) */
  const cityTimeCross = (() => {
    if (drillMonth) {
      const withDay = loans.map(l => ({ ...l, day: getDayLabel(l.startDate) }));
      return buildCrossTab(withDay, "city", "day" as keyof typeof withDay[0]);
    }
    if (drillQuarter) {
      const withMonth = loans.map(l => ({ ...l, month: getMonthLabel(l.startDate) }));
      return buildCrossTab(withMonth, "city", "month" as keyof typeof withMonth[0]);
    }
    if (drillYear) {
      const withQuarter = loans.map(l => ({ ...l, quarter: `Q${getQuarter(l.startDate)}` }));
      return buildCrossTab(withQuarter, "city", "quarter" as keyof typeof withQuarter[0]);
    }
    return buildCrossTab(loans, "city", "year");
  })();

  /* Histogram: Days until expiration distribution */
  const expirationBuckets = (() => {
    const thresholds = [30, 60, 90, 180, Infinity];
    const labels = ["0–30d", "31–60d", "61–90d", "91–180d", "180d+"];
    const colors = ["#f46a6a", "#efb562", "#22d3ee", "#14b8a6", "#0f766e"];
    const counts = [0, 0, 0, 0, 0];
    for (const l of loans) {
      const d = l.daysUntilExpiration;
      for (let i = 0; i < thresholds.length; i++) {
        if (d <= thresholds[i]) { counts[i]++; break; }
      }
    }
    return labels.map((bucket, i) => ({ bucket, count: counts[i], color: colors[i] }));
  })();

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Loans</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Construction loan exposure, draw status, and expiration alerts. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Exposure" value={fmt$(kpis.totalBalance)} sparkline={[4.2, 4.5, 4.8, 5.0, 5.1, 5.3, 5.2, 5.4, 5.5]} onClick={() => onDrill({ type: "loan-metric", value: "exposure", label: `Total Exposure — ${fmt$(kpis.totalBalance)}` })} />
        <SHKpiCard label="Total Drawn" value={fmt$(kpis.totalDrawn)} accent="#22d3ee" progress={Math.round(kpis.avgDrawPct)} sub={`${Math.round(kpis.avgDrawPct)}% avg draw`} onClick={() => onDrill({ type: "loan-metric", value: "drawn", label: `Total Drawn — ${fmt$(kpis.totalDrawn)}` })} />
        <SHKpiCard label="Lender Count" value={fmtN(kpis.lenderCount)} accent="#3b82f6" sparkline={[3, 3, 4, 4, 4, 5, 5, 5, 5, 5]} delta="Diversified" deltaDir="up" onClick={() => onDrill({ type: "loan-metric", value: "lenders", label: `${fmtN(kpis.lenderCount)} Lenders` })} />
        <SHKpiCard label="Expiring < 60d" value={fmtN(kpis.expiringSoon)} accent={kpis.expiringSoon > 0 ? "#f46a6a" : "#24c18d"} sparkline={[4, 3, 5, 4, 3, 2, 3, 4, 3, kpis.expiringSoon]} delta={kpis.expiringSoon > 0 ? "Action needed" : "No urgency"} deltaDir={kpis.expiringSoon > 0 ? "down" : "up"} onClick={() => onDrill({ type: "loan-metric", value: "expiring", label: `${fmtN(kpis.expiringSoon)} Expiring < 60d` })} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Lenders" title="Loan Distribution">
          <SHDonutChart
            segments={lenders}
            onSegmentClick={label => onDrill({ type: "lender", value: label, label })}
          />
        </SHPanel>
        <SHPanel kicker="Draw Status" title="Draw % by Community">
          <SHRankedBars
            items={(() => {
              const map = new Map<string, { total: number; drawn: number }>();
              for (const l of loans) {
                const e = map.get(l.community) || { total: 0, drawn: 0 };
                e.total += l.loanAmount;
                e.drawn += l.totalDrawn;
                map.set(l.community, e);
              }
              return Array.from(map.entries())
                .map(([label, d]) => ({ label, value: Math.round((d.drawn / d.total) * 100) }))
                .sort((a, b) => b.value - a.value);
            })()}
            formatValue={v => `${v}%`}
            onBarClick={label => { onCommunityClick(label); onDrill({ type: "loans-community", value: label, label }); }}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Rates" title="Interest Rate Distribution">
          <SHDonutChart
            segments={rateDistribution}
            onSegmentClick={label => onDrill({ type: "loan-rate", value: label, label })}
          />
        </SHPanel>
        <SHPanel kicker="Geography" title="Exposure by City ($M)">
          <SHRankedBars
            items={exposureByCity}
            formatValue={v => `$${v}M`}
            onBarClick={label => { onCityClick(label); onDrill({ type: "loans-city-time", value: `${label}|`, label }); }}
            showRank
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="City × Time" title={
          drillMonth ? `Loans: City by Day (${new Date(2000, drillMonth - 1).toLocaleString("en-US", { month: "short" })} ${drillYear})` :
          drillQuarter ? `Loans: City by Month (Q${drillQuarter} ${drillYear})` :
          drillYear ? `Loans: City by Quarter (${drillYear})` :
          "Loans by Year"
        }>
          <SHCrossTab
            {...cityTimeCross}
            onCellClick={(row, col) => { onCityClick(row); onDrill({ type: "loans-city-time", value: `${row}|${col}`, label: `${row} — ${col}` }); }}
            onRowLabelClick={(row) => { onCityClick(row); onDrill({ type: "loans-city-time", value: `${row}|`, label: row }); }}
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
        <SHPanel kicker="Trend" title="Loan Exposure Trend ($M)">
          <SHAreaChart
            data={exposureTrend}
            color="#22d3ee"
            label1="Exposure ($M)"
            formatY={v => `$${v.toFixed(1)}M`}
            onPointClick={label => onDrill({ type: "loan-metric", value: label, label: `Exposure — ${label}` })}
          />
        </SHPanel>
        <SHPanel kicker="Expiration" title="Days Until Expiration">
          <SHHistogram buckets={expirationBuckets} onBucketClick={bucket => onDrill({ type: "loan-metric", value: bucket, label: `Expiration ${bucket}` })} />
        </SHPanel>
      </div>

    </>
  );
}
