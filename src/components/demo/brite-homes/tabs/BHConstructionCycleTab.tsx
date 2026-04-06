"use client";

import type { SHJob } from "@/types/sunshine-homes";
import { getCycleTimeKPIs, getCommunityBreakdown, fmtN } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHRankedBars from "../../sunshine/SHRankedBars";
import SHHistogram from "../../sunshine/SHHistogram";

interface Props {
  jobs: SHJob[];
}

export default function BHConstructionCycleTab({ jobs }: Props) {
  const kpis = getCycleTimeKPIs(jobs);
  const byCommunity = getCommunityBreakdown(jobs).map(c => ({
    label: c.label,
    value: jobs.filter(j => j.community === c.label).reduce((s, j) => s + j.totalCycleDays, 0) / Math.max(c.value, 1),
  }));

  const histogramBuckets = [
    { bucket: "<60d", count: jobs.filter(j => j.totalCycleDays < 60).length, color: "#14b8a6" },
    { bucket: "60-90d", count: jobs.filter(j => j.totalCycleDays >= 60 && j.totalCycleDays < 90).length, color: "#22d3ee" },
    { bucket: "90-180d", count: jobs.filter(j => j.totalCycleDays >= 90 && j.totalCycleDays < 180).length, color: "#3b82f6" },
    { bucket: "180-270d", count: jobs.filter(j => j.totalCycleDays >= 180 && j.totalCycleDays < 270).length, color: "#f59e0b" },
    { bucket: ">270d", count: jobs.filter(j => j.totalCycleDays >= 270).length, color: "#ef4444" },
  ];

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Construction</div>
        <h2 className="sh-tab-title">Cycle Time</h2>
        <p className="sh-tab-desc">Job cycle duration analysis, completion distribution, and performance by community.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Avg Cycle Time" value={`${Math.round(kpis.avgCycleTime)}d`} sub="Days to completion" accent="#14b8a6" />
        <SHKpiCard label="Fastest" value={`${kpis.fastest}d`} sub="Shortest cycle" accent="#22d3ee" />
        <SHKpiCard label="Slowest" value={`${kpis.slowest}d`} sub="Longest cycle" accent="#f59e0b" />
        <SHKpiCard label="In Permit" value={fmtN(kpis.inPermit)} sub="Waiting on approval" accent="#ef4444" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Cycles" title="Avg Days by Community">
          <SHRankedBars items={byCommunity.map(c => ({ ...c, value: Math.round(c.value) }))} formatValue={v => `${v}d`} showRank />
        </SHPanel>
        <SHPanel kicker="Distribution" title="Completion Time Buckets">
          <SHHistogram buckets={histogramBuckets} />
        </SHPanel>
      </div>

    </>
  );
}
