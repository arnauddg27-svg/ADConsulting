"use client";

import type { SHPropertyUnit } from "@/types/sunshine-homes";
import { getPMKPIs, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHHistogram from "../SHHistogram";
import SHAreaChart from "../SHAreaChart";

const OCC_COLORS: Record<string, string> = {
  leased: "#14b8a6",
  vacant: "#3b82f6",
  "make-ready": "#efb562",
  eviction: "#f46a6a",
  "notice-to-vacate": "#a855f7",
};

const CLASS_COLORS = ["#14b8a6", "#22d3ee", "#6366f1"];

const REVENUE_TREND = [
  { label: "Q1 '24", value: 28.4 },
  { label: "Q2 '24", value: 31.0 },
  { label: "Q3 '24", value: 33.5 },
  { label: "Q4 '24", value: 36.2 },
  { label: "Q1 '25", value: 38.9 },
  { label: "Q2 '25", value: 41.4 },
  { label: "Q3 '25", value: 44.1 },
  { label: "Q4 '25", value: 47.3 },
];

interface Props {
  units: SHPropertyUnit[];
  onDrill: (detail: import("../SHDrawer").DrillDetail) => void;
}

export default function PropertyMgmtDashboardTab({ units, onDrill }: Props) {
  const kpis = getPMKPIs(units);

  const byOccupancy = (() => {
    const map = new Map<string, number>();
    for (const u of units) map.set(u.occupancy, (map.get(u.occupancy) || 0) + 1);
    return Array.from(map.entries())
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1).replace("-", " "),
        value,
        color: OCC_COLORS[label] ?? "#14b8a6",
      }))
      .sort((a, b) => b.value - a.value);
  })();

  /* Ranked bars: revenue by city */
  const revenueByCity = (() => {
    const map = new Map<string, number>();
    for (const u of units) map.set(u.city, (map.get(u.city) ?? 0) + u.monthlyRent);
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  })();

  /* Ranked bars: delinquent amount by community */
  const delinquentByCommunity = (() => {
    const map = new Map<string, number>();
    for (const u of units) {
      if (u.delinquentAmount > 0) {
        map.set(u.community, (map.get(u.community) ?? 0) + u.delinquentAmount);
      }
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value: Math.round(value), status: "alert" as const }))
      .sort((a, b) => b.value - a.value);
  })();

  /* Histogram: rent distribution — 5 buckets */
  const rents = units.map(u => u.monthlyRent);
  const rentMin = Math.min(...rents);
  const rentMax = Math.max(...rents);
  const rentStep = (rentMax - rentMin) / 5;
  const HIST_COLORS = ["#14b8a6", "#22d3ee", "#3b82f6", "#6366f1", "#a855f7"];
  const rentHistogram = Array.from({ length: 5 }, (_, i) => {
    const lo = rentMin + i * rentStep;
    const hi = lo + rentStep;
    return {
      bucket: `$${Math.round(lo / 100) * 100}–$${Math.round(hi / 100) * 100}`,
      count: units.filter(u => u.monthlyRent >= lo && (i === 4 ? u.monthlyRent <= hi : u.monthlyRent < hi)).length,
      color: HIST_COLORS[i],
    };
  });

  /* Donut: property class A/B/C distribution */
  const classes = ["A", "B", "C"];
  const classCounts = [0, 0, 0];
  for (const u of units) classCounts[Number(u.id) % classes.length]++;
  const byClass = classes.map((cls, i) => ({
    label: `Class ${cls}`,
    value: classCounts[i],
    color: CLASS_COLORS[i],
  }));

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Property Management</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Portfolio overview, occupancy, and delinquency tracking. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Units" value={fmtN(kpis.totalUnits)} sparkline={[28, 30, 32, 34, 35, 36, 38, 39, 40, kpis.totalUnits]} delta="+4 units YoY" deltaDir="up" />
        <SHKpiCard label="Occupancy Rate" value={fmtPct(kpis.occupancyRate)} accent="#14b8a6" progress={Math.round(kpis.occupancyRate)} delta="+2% vs Q3" deltaDir="up" />
        <SHKpiCard label="Monthly Revenue" value={fmt$(kpis.monthlyRent)} accent="#22d3ee" sparkline={[32, 34, 35, 37, 38, 39, 40, 41, 42, 44]} delta="+6% vs prior" deltaDir="up" />
        <SHKpiCard
          label="Delinquent"
          value={fmtN(kpis.delinquentUnits)}
          accent={kpis.delinquentUnits > 0 ? "#f46a6a" : "#24c18d"}
          sparkline={[5, 4, 6, 5, 3, 4, 3, 2, 3, kpis.delinquentUnits]}
          delta={kpis.delinquentUnits > 0 ? "Past due" : "All current"}
          deltaDir={kpis.delinquentUnits > 0 ? "down" : "up"}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Occupancy" title="Units by Status">
          <SHDonutChart segments={byOccupancy} onSegmentClick={label => onDrill({ type: "occupancy", value: label.toLowerCase(), label })} />
        </SHPanel>
        <SHPanel kicker="Property Class" title="Class Distribution">
          <SHDonutChart
            segments={byClass}
            onSegmentClick={label => onDrill({ type: "occupancy", value: label, label })}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="By City" title="Monthly Revenue">
          <SHRankedBars
            items={revenueByCity}
            formatValue={v => fmt$(v)}
            onBarClick={label => onDrill({ type: "city", value: label, label })}
            showRank
          />
        </SHPanel>
        <SHPanel kicker="Delinquency" title="Past Due by Community">
          <SHRankedBars
            items={delinquentByCommunity.length > 0 ? delinquentByCommunity : [{ label: "No delinquencies", value: 0 }]}
            formatValue={v => fmt$(v)}
            onBarClick={label => onDrill({ type: "community", value: label, label })}
            showRank
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Rent Distribution" title="Monthly Rent Histogram">
          <SHHistogram buckets={rentHistogram} />
        </SHPanel>
        <SHPanel kicker="Revenue Trend" title="Cumulative Revenue">
          <SHAreaChart
            data={REVENUE_TREND}
            color="#22d3ee"
            label1="Revenue ($K)"
            formatY={v => `$${v.toFixed(1)}K`}
          />
        </SHPanel>
      </div>
    </>
  );
}
