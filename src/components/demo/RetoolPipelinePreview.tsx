"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import {
  projects, budgetData, costBreakdown, jobProfitability,
  milestones, scheduleHeatmapData,
} from "@/lib/mock-data";

/* ─── Pipeline data ─── */
const stages = [
  "Site Work", "Foundation", "Framing", "Rough-In",
  "Insul / Drywall", "Finishes", "Punch / CO", "Closing",
] as const;

interface PipelineJob {
  id: string;
  lot: string;
  community: string;
  plan: string;
  super: string;
  stage: string;
  pct: number;
  estClose: string;
  idle: number;
}

const pipelineJobs: PipelineJob[] = [
  { id: "LR-042", lot: "Lot 42", community: "Lakewood Reserve", plan: "Avalon 1983", super: "T. Reeves", stage: "Framing", pct: 45, estClose: "Jun 2026", idle: 8 },
  { id: "LR-043", lot: "Lot 43", community: "Lakewood Reserve", plan: "Harmon 1787", super: "T. Reeves", stage: "Rough-In", pct: 52, estClose: "May 2026", idle: 3 },
  { id: "LR-044", lot: "Lot 44", community: "Lakewood Reserve", plan: "Avalon 1983", super: "T. Reeves", stage: "Site Work", pct: 8, estClose: "Sep 2026", idle: 12 },
  { id: "CC-008", lot: "Unit 8", community: "Cypress Creek", plan: "Seville 2306", super: "D. Castillo", stage: "Insul / Drywall", pct: 62, estClose: "Apr 2026", idle: 5 },
  { id: "CC-009", lot: "Unit 9", community: "Cypress Creek", plan: "Harmon 1787", super: "D. Castillo", stage: "Framing", pct: 38, estClose: "Jun 2026", idle: 22 },
  { id: "CC-010", lot: "Unit 10", community: "Cypress Creek", plan: "Avalon 1983", super: "D. Castillo", stage: "Foundation", pct: 18, estClose: "Jul 2026", idle: 6 },
  { id: "PH-017", lot: "Lot 17", community: "Pine Hills", plan: "Avalon 1983", super: "K. Nguyen", stage: "Foundation", pct: 15, estClose: "Aug 2026", idle: 14 },
  { id: "PH-018", lot: "Lot 18", community: "Pine Hills", plan: "Harmon 1787", super: "K. Nguyen", stage: "Site Work", pct: 5, estClose: "Oct 2026", idle: 2 },
  { id: "WG-005", lot: "5A", community: "Winter Garden Estates", plan: "Seville 2306", super: "T. Reeves", stage: "Finishes", pct: 85, estClose: "Mar 2026", idle: 4 },
  { id: "WG-006", lot: "5B", community: "Winter Garden Estates", plan: "Avalon 1983", super: "T. Reeves", stage: "Punch / CO", pct: 96, estClose: "Mar 2026", idle: 1 },
  { id: "CH-003", lot: "Lot 3", community: "Clermont Heights", plan: "Harmon 1787", super: "D. Castillo", stage: "Insul / Drywall", pct: 58, estClose: "May 2026", idle: 18 },
  { id: "CH-004", lot: "Lot 4", community: "Clermont Heights", plan: "Avalon 1983", super: "D. Castillo", stage: "Rough-In", pct: 48, estClose: "Jun 2026", idle: 7 },
  { id: "AC-012", lot: "Unit 12", community: "Apopka Crossing", plan: "Avalon 1983", super: "K. Nguyen", stage: "Site Work", pct: 5, estClose: "Nov 2026", idle: 3 },
  { id: "AC-013", lot: "Unit 13", community: "Apopka Crossing", plan: "Seville 2306", super: "K. Nguyen", stage: "Foundation", pct: 20, estClose: "Sep 2026", idle: 9 },
  { id: "WT-009", lot: "Lot 9", community: "Windermere Trails", plan: "Seville 2306", super: "T. Reeves", stage: "Finishes", pct: 78, estClose: "Apr 2026", idle: 6 },
  { id: "WT-010", lot: "Lot 10", community: "Windermere Trails", plan: "Harmon 1787", super: "T. Reeves", stage: "Rough-In", pct: 50, estClose: "Jun 2026", idle: 4 },
  { id: "LN-003", lot: "Unit 3", community: "Lake Nona Pines", plan: "Avalon 1983", super: "K. Nguyen", stage: "Framing", pct: 38, estClose: "Jul 2026", idle: 26 },
  { id: "LN-004", lot: "Unit 4", community: "Lake Nona Pines", plan: "Harmon 1787", super: "K. Nguyen", stage: "Closing", pct: 100, estClose: "Mar 2026", idle: 0 },
];

/* ─── Filter model ─── */
interface RetoolFilters {
  project: string | null;
  community: string | null;
  stage: string | null;
  super: string | null;
  status: string | null;
  costCategory: string | null;
  profitStatus: string | null;
}

const EMPTY_FILTERS: RetoolFilters = {
  project: null, community: null, stage: null, super: null,
  status: null, costCategory: null, profitStatus: null,
};

const FILTER_LABELS: Record<keyof RetoolFilters, string> = {
  project: "Project", community: "Community", stage: "Stage", super: "Super",
  status: "Status", costCategory: "Cost Category", profitStatus: "Profit",
};

const PIE_COLORS = ["#2563eb", "#64748b", "#8b5cf6", "#475569"];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "pipeline", label: "Pipeline" },
  { id: "budget", label: "Budget" },
  { id: "schedule", label: "Schedule" },
];

const communities = [...new Set(pipelineJobs.map((j) => j.community))];
const supers = [...new Set(pipelineJobs.map((j) => j.super))];

export default function RetoolPipelinePreview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<RetoolFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleFilter = (key: keyof RetoolFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const clearFilter = (key: keyof RetoolFilters) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearch("");
  };

  const hasAnyFilter = Object.values(filters).some((v) => v !== null) || search !== "";

  /* ─── Filtered pipeline jobs ─── */
  const filtered = useMemo(() => pipelineJobs.filter((j) => {
    if (search && !j.id.toLowerCase().includes(search.toLowerCase()) && !j.community.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.community && j.community !== filters.community) return false;
    if (filters.stage && j.stage !== filters.stage) return false;
    if (filters.super && j.super !== filters.super) return false;
    if (filters.project && `${j.community} - ${j.lot}` !== filters.project) return false;
    return true;
  }), [search, filters]);

  const jobMatches = (j: PipelineJob) => {
    if (search && !j.id.toLowerCase().includes(search.toLowerCase()) && !j.community.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.community && j.community !== filters.community) return false;
    if (filters.stage && j.stage !== filters.stage) return false;
    if (filters.super && j.super !== filters.super) return false;
    if (filters.project && `${j.community} - ${j.lot}` !== filters.project) return false;
    return true;
  };

  /* ─── Derived KPI data ─── */
  const avgCompletion = filtered.length > 0
    ? Math.round(filtered.reduce((s, j) => s + j.pct, 0) / filtered.length)
    : 0;
  const stalledCount = filtered.filter((j) => j.idle >= 14).length;
  const closingCount = filtered.filter((j) => j.stage === "Closing" || j.stage === "Punch / CO").length;
  const avgIdle = filtered.length > 0
    ? Math.round(filtered.reduce((s, j) => s + j.idle, 0) / filtered.length * 10) / 10
    : 0;

  /* ─── Community chart data ─── */
  const communityChartData = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    pipelineJobs.forEach((j) => {
      const entry = map.get(j.community) || { count: 0, total: 0 };
      entry.count++;
      entry.total += j.pct;
      map.set(j.community, entry);
    });
    return Array.from(map.entries()).map(([name, d]) => ({
      community: name.length > 16 ? name.slice(0, 16) + "…" : name,
      fullName: name,
      avg: Math.round(d.total / d.count),
      jobs: d.count,
    }));
  }, []);

  /* ─── Budget helpers ─── */
  const getCommunity = (name: string) => name.split(" - ")[0];

  const projectMatchesBudget = (p: { name: string; status: string }) => {
    if (filters.project && p.name !== filters.project) return false;
    if (filters.community && getCommunity(p.name) !== filters.community) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  };

  const jobMatchesBudget = (job: { project: string; status: string }) => {
    if (filters.project && job.project !== filters.project) return false;
    if (filters.community && getCommunity(job.project) !== filters.community) return false;
    if (filters.profitStatus && job.status !== filters.profitStatus) return false;
    const proj = projects.find((p) => p.name === job.project);
    if (proj && filters.status && proj.status !== filters.status) return false;
    return true;
  };

  const filteredProjects = projects.filter(projectMatchesBudget);
  const filteredProfitability = jobProfitability.filter(jobMatchesBudget);

  const totalBudget = filteredProjects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = filteredProjects.reduce((s, p) => s + p.spent, 0);
  const avgMargin = filteredProfitability.length > 0
    ? Math.round(filteredProfitability.reduce((s, j) => s + j.estimatedMargin, 0) / filteredProfitability.length * 10) / 10
    : 0;
  const onTrackCount = filteredProjects.filter((p) => p.status === "on-track").length;

  /* ─── Super workload data ─── */
  const superWorkload = useMemo(() => {
    const map = new Map<string, { total: number; stalled: number; avgPct: number; count: number }>();
    pipelineJobs.forEach((j) => {
      const entry = map.get(j.super) || { total: 0, stalled: 0, avgPct: 0, count: 0 };
      entry.total++;
      entry.count++;
      entry.avgPct += j.pct;
      if (j.idle >= 14) entry.stalled++;
      map.set(j.super, entry);
    });
    return Array.from(map.entries()).map(([name, d]) => ({
      name,
      jobs: d.total,
      stalled: d.stalled,
      avgPct: Math.round(d.avgPct / d.count),
    }));
  }, []);

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ─── Schedule ─── */
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const heatColor = (v: number) => {
    if (v === 0) return "#f8fafc";
    if (v <= 1) return "#dbeafe";
    if (v <= 2) return "#93c5fd";
    if (v <= 3) return "#60a5fa";
    if (v <= 4) return "#3b82f6";
    return "#1d4ed8";
  };

  /* ─── Shared clickable text style ─── */
  const clickableText = "cursor-pointer transition-colors hover:text-[#2563eb] hover:underline decoration-[#2563eb]/30 underline-offset-2";

  return (
    <div className="overflow-hidden rounded-lg border border-[#d1d5db] bg-[#f9fafb] text-[#334155] shadow-md" style={{ colorScheme: "light" }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2563eb] text-xs font-bold text-white shadow-sm">
            R
          </div>
          <div>
            <div className="text-[0.82rem] font-semibold text-[#111827]">Construction Operations</div>
            <div className="text-[0.62rem] text-[#9ca3af]">
              {filtered.length} of {pipelineJobs.length} jobs · Illustrative data
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#2563eb]/10 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-wider text-[#2563eb]">
            Retool App
          </span>
          <button className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.68rem] font-medium text-[#374151] shadow-sm transition-colors hover:bg-[#f3f4f6]">
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center border-b border-[#e5e7eb] bg-white px-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "border-b-2 px-4 py-2.5 text-[0.72rem] font-semibold transition-colors",
              activeTab === tab.id
                ? "border-[#2563eb] text-[#2563eb]"
                : "border-transparent text-[#6b7280] hover:text-[#111827]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-[#e5e7eb] bg-white px-5 py-2.5">
        <input
          type="text"
          placeholder="Search jobs or communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52 rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.72rem] text-[#111827] placeholder-[#9ca3af] shadow-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
        />
        <select
          value={filters.community || ""}
          onChange={(e) => setFilters((f) => ({ ...f, community: e.target.value || null }))}
          className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.72rem] text-[#111827] shadow-sm outline-none transition focus:border-[#2563eb]"
        >
          <option value="">All Communities</option>
          {communities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filters.stage || ""}
          onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value || null }))}
          className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.72rem] text-[#111827] shadow-sm outline-none transition focus:border-[#2563eb]"
        >
          <option value="">All Stages</option>
          {stages.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filters.super || ""}
          onChange={(e) => setFilters((f) => ({ ...f, super: e.target.value || null }))}
          className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.72rem] text-[#111827] shadow-sm outline-none transition focus:border-[#2563eb]"
        >
          <option value="">All Supers</option>
          {supers.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasAnyFilter && (
          <button onClick={clearAllFilters} className="rounded-md bg-[#fee2e2] px-2.5 py-1.5 text-[0.68rem] font-medium text-[#dc2626] transition hover:bg-[#fecaca]">
            Clear all
          </button>
        )}
      </div>

      {/* ── Filter pills ── */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#e5e7eb] bg-[#f0f4ff] px-5 py-2">
          <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-[#6b7280]">Filtering:</span>
          {search && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#2563eb] px-2 py-0.5 text-[0.62rem] font-medium text-white">
              Search: &ldquo;{search}&rdquo;
              <button onClick={() => setSearch("")} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
            </span>
          )}
          {(Object.keys(filters) as Array<keyof RetoolFilters>).map((key) =>
            filters[key] ? (
              <span key={key} className="inline-flex items-center gap-1 rounded-md bg-[#2563eb] px-2 py-0.5 text-[0.62rem] font-medium text-white">
                {FILTER_LABELS[key]}: {filters[key]}
                <button onClick={() => clearFilter(key)} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
              </span>
            ) : null
          )}
        </div>
      )}

      {/* ── Tab content ── */}
      <div className="p-5">

        {/* ════ OVERVIEW ════ */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* KPI row */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Active Jobs", value: String(filtered.length), sub: `of ${pipelineJobs.length} total`, color: "#111827" },
                { label: "Avg Completion", value: `${avgCompletion}%`, sub: "across filtered jobs", color: "#2563eb" },
                { label: "Stalled (14+ days)", value: String(stalledCount), sub: stalledCount > 0 ? "need attention" : "none flagged", color: stalledCount > 0 ? "#dc2626" : "#16a34a" },
                { label: "Near Closing", value: String(closingCount), sub: "Punch/CO + Closing", color: "#16a34a" },
                { label: "Avg Days Idle", value: `${avgIdle}d`, sub: avgIdle >= 7 ? "above target" : "within target", color: avgIdle >= 7 ? "#d97706" : "#16a34a" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                  <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-[#9ca3af]">{kpi.label}</div>
                  <div className="mt-1.5 text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="mt-0.5 text-[0.62rem] text-[#6b7280]">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid gap-4 xl:grid-cols-2">
              {/* Community progress */}
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                <div className="mb-4 text-[0.72rem] font-semibold text-[#111827]">Avg Completion by Community</div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={communityChartData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                      <YAxis
                        dataKey="community"
                        type="category"
                        width={120}
                        tick={(props: Record<string, unknown>) => {
                          const x = Number(props.x);
                          const y = Number(props.y);
                          const value = String((props.payload as Record<string, unknown>)?.value ?? "");
                          const full = communityChartData.find((d) => d.community === value)?.fullName;
                          const isActive = filters.community === full;
                          return (
                            <text
                              x={x} y={y} dy={4} textAnchor="end"
                              fill={isActive ? "#2563eb" : "#374151"}
                              fontSize={10.5}
                              fontWeight={isActive ? 700 : 500}
                              className="cursor-pointer"
                              onClick={() => { if (full) toggleFilter("community", full); }}
                              textDecoration={isActive ? "underline" : "none"}
                            >
                              {value}
                            </text>
                          );
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 11, color: "#111827", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                        formatter={(value) => [`${value}%`, "Avg Completion"]}
                      />
                      <Bar dataKey="avg" radius={[0, 6, 6, 0]} barSize={18}>
                        {communityChartData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={filters.community && filters.community !== d.fullName ? "#e5e7eb" : "#2563eb"}
                            className="cursor-pointer"
                            onClick={() => toggleFilter("community", d.fullName)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Super workload */}
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                <div className="mb-4 text-[0.72rem] font-semibold text-[#111827]">Superintendent Workload</div>
                <div className="space-y-3">
                  {superWorkload.map((s) => {
                    const isActive = filters.super === s.name;
                    return (
                      <button
                        key={s.name}
                        onClick={() => toggleFilter("super", s.name)}
                        className={clsx(
                          "flex w-full items-center gap-4 rounded-lg border p-3.5 text-left transition-all",
                          isActive
                            ? "border-[#2563eb] bg-[#eff6ff] shadow-sm"
                            : "border-[#e5e7eb] bg-white hover:border-[#bfdbfe] hover:bg-[#f8fafc]"
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[0.68rem] font-bold text-[#374151]">
                          {s.name.split(" ")[0]}{s.name.split(" ")[1]?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="text-[0.72rem] font-semibold text-[#111827]">{s.name}</div>
                          <div className="mt-1 flex items-center gap-3 text-[0.62rem] text-[#6b7280]">
                            <span><strong className="text-[#111827]">{s.jobs}</strong> jobs</span>
                            <span><strong className="text-[#111827]">{s.avgPct}%</strong> avg</span>
                            {s.stalled > 0 && (
                              <span className="rounded bg-[#fee2e2] px-1.5 py-0.5 text-[0.58rem] font-semibold text-[#dc2626]">
                                {s.stalled} stalled
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-2 w-20 rounded-full bg-[#f3f4f6]">
                            <div className="h-2 rounded-full bg-[#2563eb]" style={{ width: `${s.avgPct}%` }} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stage distribution */}
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <div className="mb-3 text-[0.72rem] font-semibold text-[#111827]">Jobs by Stage</div>
              <div className="flex flex-wrap gap-2">
                {stages.map((s) => {
                  const count = filtered.filter((j) => j.stage === s).length;
                  const isActive = filters.stage === s;
                  return (
                    <button
                      key={s}
                      onClick={() => toggleFilter("stage", s)}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[0.72rem] transition-all",
                        isActive
                          ? "border-[#2563eb] bg-[#2563eb] font-semibold text-white shadow-sm"
                          : "border-[#d1d5db] bg-white text-[#374151] hover:border-[#93c5fd] hover:bg-[#f0f4ff]",
                        count === 0 && !isActive && "opacity-40"
                      )}
                    >
                      {s}
                      <span className={clsx(
                        "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[0.58rem] font-bold",
                        isActive ? "bg-white/25 text-white" : "bg-[#f3f4f6] text-[#374151]"
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ PIPELINE ════ */}
        {activeTab === "pipeline" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
              <table className="w-full min-w-[760px] text-[0.72rem]">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    <th className="w-8 px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-[#d1d5db] accent-[#2563eb]"
                        checked={selectedRows.size === filtered.length && filtered.length > 0}
                        onChange={() => {
                          if (selectedRows.size === filtered.length) setSelectedRows(new Set());
                          else setSelectedRows(new Set(filtered.map((j) => j.id)));
                        }}
                      />
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[#374151]">Job</th>
                    <th className="px-3 py-3 text-left font-semibold text-[#374151]">Community</th>
                    <th className="px-3 py-3 text-left font-semibold text-[#374151]">Plan</th>
                    <th className="px-3 py-3 text-left font-semibold text-[#374151]">Super</th>
                    <th className="px-3 py-3 text-left font-semibold text-[#374151]">Stage</th>
                    <th className="px-3 py-3 text-right font-semibold text-[#374151]">Completion</th>
                    <th className="px-3 py-3 text-right font-semibold text-[#374151]">Est. Close</th>
                    <th className="px-3 py-3 text-right font-semibold text-[#374151]">Days Idle</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelineJobs.map((job) => {
                    const matches = jobMatches(job);
                    return (
                      <tr
                        key={job.id}
                        className={clsx(
                          "border-b border-[#f3f4f6] transition-all duration-200",
                          selectedRows.has(job.id) ? "bg-[#eff6ff]" : "hover:bg-[#f9fafb]",
                          hasAnyFilter && !matches && "opacity-15"
                        )}
                      >
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" className="rounded border-[#d1d5db] accent-[#2563eb]" checked={selectedRows.has(job.id)} onChange={() => toggleRow(job.id)} />
                        </td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => toggleFilter("project", `${job.community} - ${job.lot}`)} className={clsx("font-semibold text-[#2563eb]", clickableText)}>
                            {job.id}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => toggleFilter("community", job.community)} className={clsx("text-[#111827]", clickableText)}>
                            {job.community}
                          </button>
                          <span className="ml-1 text-[#9ca3af]">· {job.lot}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[#6b7280]">{job.plan}</td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => toggleFilter("super", job.super)} className={clsx("text-[#6b7280]", clickableText)}>
                            {job.super}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => toggleFilter("stage", job.stage)}
                            className={clsx(
                              "inline-block rounded-md px-2 py-0.5 text-[0.62rem] font-semibold transition-all hover:ring-2 hover:ring-[#2563eb]/20",
                              job.stage === "Finishes" || job.stage === "Punch / CO" || job.stage === "Closing"
                                ? "bg-[#dcfce7] text-[#166534]"
                                : job.stage === "Foundation" || job.stage === "Site Work"
                                  ? "bg-[#f3f4f6] text-[#374151]"
                                  : "bg-[#dbeafe] text-[#1e40af]"
                            )}
                          >
                            {job.stage}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-[#f3f4f6]">
                              <div className="h-1.5 rounded-full bg-[#2563eb]" style={{ width: `${job.pct}%` }} />
                            </div>
                            <span className="w-8 text-right text-[#6b7280]">{job.pct}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right text-[#111827]">{job.estClose}</td>
                        <td className={clsx(
                          "px-3 py-2.5 text-right font-semibold",
                          job.idle >= 14 ? "text-[#dc2626]" : job.idle >= 7 ? "text-[#d97706]" : "text-[#6b7280]"
                        )}>
                          {job.idle}d
                          {job.idle >= 14 && <span className="ml-1 text-[0.55rem]">⚠</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-[0.68rem] text-[#6b7280]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#6b7280]" /> &lt;7d</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#d97706]" /> 7–13d</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#dc2626]" /> 14+d stalled</span>
              </div>
              <span>
                {selectedRows.size > 0
                  ? `${selectedRows.size} row${selectedRows.size !== 1 ? "s" : ""} selected`
                  : `${filtered.length} of ${pipelineJobs.length} jobs`}
              </span>
            </div>
          </div>
        )}

        {/* ════ BUDGET ════ */}
        {activeTab === "budget" && (
          <div className="space-y-5">
            {/* Budget KPI row */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-[#9ca3af]">Total Budget</div>
                <div className="mt-1.5 text-2xl font-bold text-[#111827]">${(totalBudget / 1000000).toFixed(2)}M</div>
                <div className="mt-1 text-[0.62rem] text-[#6b7280]">{filteredProjects.length} projects</div>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-[#9ca3af]">Spent to Date</div>
                <div className="mt-1.5 text-2xl font-bold text-[#2563eb]">${(totalSpent / 1000000).toFixed(2)}M</div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-[#f3f4f6]">
                  <div className="h-2 rounded-full bg-[#2563eb]" style={{ width: `${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%` }} />
                </div>
                <div className="mt-1 text-[0.62rem] text-[#6b7280]">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% utilized</div>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-[#9ca3af]">Avg Margin</div>
                <div className={clsx("mt-1.5 text-2xl font-bold", avgMargin >= 18 ? "text-[#16a34a]" : avgMargin >= 14 ? "text-[#d97706]" : "text-[#dc2626]")}>
                  {avgMargin}%
                </div>
                <div className="mt-1 text-[0.62rem] text-[#6b7280]">
                  {avgMargin >= 18 ? "healthy range" : avgMargin >= 14 ? "watch range" : "below target"}
                </div>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-[#9ca3af]">On-Track Rate</div>
                <div className="mt-1.5 text-2xl font-bold text-[#111827]">
                  {filteredProjects.length > 0 ? Math.round((onTrackCount / filteredProjects.length) * 100) : 0}%
                </div>
                <div className="mt-1 text-[0.62rem] text-[#6b7280]">{onTrackCount} of {filteredProjects.length} on-track</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-4 xl:grid-cols-2">
              {/* Cost breakdown pie */}
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                <div className="mb-3 text-[0.72rem] font-semibold text-[#111827]">Cost Breakdown</div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" nameKey="category" strokeWidth={2} stroke="#fff">
                        {costBreakdown.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i]}
                            opacity={filters.costCategory && filters.costCategory !== entry.category ? 0.15 : 1}
                            className="cursor-pointer"
                            onClick={() => toggleFilter("costCategory", entry.category)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 11, color: "#111827", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                        formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`, undefined]}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Budget trend */}
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
                <div className="mb-3 text-[0.72rem] font-semibold text-[#111827]">Budget vs Actual Trend</div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={budgetData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 11, color: "#111827", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                      />
                      <Area type="monotone" dataKey="planned" stroke="#9ca3af" fill="#f3f4f6" strokeWidth={2} name="Planned" />
                      <Area type="monotone" dataKey="actual" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} name="Actual" />
                      <Legend iconType="square" wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Profitability table */}
            <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
              <div className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
                <div className="text-[0.72rem] font-semibold text-[#111827]">Projected Job Profitability</div>
              </div>
              <table className="w-full min-w-[720px] text-[0.72rem]">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    <th className="px-4 py-2.5 text-left font-semibold text-[#374151]">Project</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[#374151]">Community</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Contract</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Est. Cost</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Spent</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Proj. Final</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Margin</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Variance</th>
                    <th className="px-3 py-2.5 font-semibold text-[#374151]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobProfitability.map((job) => {
                    const matches = jobMatchesBudget(job);
                    const variance = job.estimatedCost - job.projectedFinalCost;
                    const proj = projects.find((p) => p.name === job.project);
                    return (
                      <tr
                        key={job.id}
                        className={clsx(
                          "border-b border-[#f3f4f6] transition-all duration-200 hover:bg-[#f9fafb]",
                          hasAnyFilter && !matches && "opacity-15"
                        )}
                      >
                        <td className="px-4 py-3">
                          <button onClick={() => toggleFilter("project", job.project)} className={clsx("text-left font-semibold text-[#2563eb]", clickableText)}>
                            {job.project}
                          </button>
                          {proj && (
                            <div className="mt-0.5 text-[0.6rem] text-[#9ca3af]">{proj.phase} · {proj.percentComplete}% complete</div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <button onClick={() => toggleFilter("community", getCommunity(job.project))} className={clsx("text-[#374151]", clickableText)}>
                            {getCommunity(job.project)}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-right text-[#111827]">${job.contractValue.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-[#6b7280]">${job.estimatedCost.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-[#111827]">${job.actualCostToDate.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-[#111827] font-medium">${job.projectedFinalCost.toLocaleString()}</td>
                        <td className={clsx(
                          "px-3 py-3 text-right font-bold",
                          job.status === "healthy" ? "text-[#16a34a]" : job.status === "watch" ? "text-[#d97706]" : "text-[#dc2626]"
                        )}>
                          {job.estimatedMargin}%
                        </td>
                        <td className={clsx(
                          "px-3 py-3 text-right font-medium",
                          variance >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                        )}>
                          {variance >= 0 ? "+" : ""}${(variance / 1000).toFixed(0)}k
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleFilter("profitStatus", job.status)}
                            className={clsx(
                              "rounded-md px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide transition-all hover:ring-2",
                              job.status === "healthy" ? "bg-[#dcfce7] text-[#166534] hover:ring-[#16a34a]/20" :
                              job.status === "watch" ? "bg-[#fef3c7] text-[#92400e] hover:ring-[#d97706]/20" :
                              "bg-[#fee2e2] text-[#991b1b] hover:ring-[#dc2626]/20"
                            )}
                          >
                            {job.status}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center gap-4 border-t border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[0.65rem] text-[#6b7280]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#16a34a]" /> Healthy (&ge;18%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#d97706]" /> Watch (14-18%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#dc2626]" /> Eroding (&lt;14%)</span>
              </div>
            </div>

            {/* Project status table */}
            <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
              <div className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
                <div className="text-[0.72rem] font-semibold text-[#111827]">Project Budget Status</div>
              </div>
              <table className="w-full min-w-[600px] text-[0.72rem]">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    <th className="px-4 py-2.5 text-left font-semibold text-[#374151]">Project</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[#374151]">Phase</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Budget</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Spent</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#374151]">Remaining</th>
                    <th className="px-3 py-2.5 font-semibold text-[#374151]">Utilization</th>
                    <th className="px-3 py-2.5 font-semibold text-[#374151]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const matches = projectMatchesBudget(p);
                    const pctUsed = Math.round((p.spent / p.budget) * 100);
                    const remaining = p.budget - p.spent;
                    return (
                      <tr
                        key={p.id}
                        className={clsx(
                          "border-b border-[#f3f4f6] transition-all duration-200 hover:bg-[#f9fafb]",
                          hasAnyFilter && !matches && "opacity-15"
                        )}
                      >
                        <td className="px-4 py-3">
                          <button onClick={() => toggleFilter("project", p.name)} className={clsx("text-left font-semibold text-[#2563eb]", clickableText)}>
                            {p.name}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-[#6b7280]">{p.phase}</td>
                        <td className="px-3 py-3 text-right text-[#111827]">${p.budget.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-[#111827]">${p.spent.toLocaleString()}</td>
                        <td className={clsx("px-3 py-3 text-right font-medium", remaining < 50000 ? "text-[#d97706]" : "text-[#16a34a]")}>
                          ${remaining.toLocaleString()}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-[#f3f4f6]">
                              <div
                                className={clsx("h-2 rounded-full", pctUsed > 85 ? "bg-[#dc2626]" : pctUsed > 70 ? "bg-[#d97706]" : "bg-[#2563eb]")}
                                style={{ width: `${Math.min(pctUsed, 100)}%` }}
                              />
                            </div>
                            <span className="text-[0.62rem] text-[#6b7280]">{pctUsed}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleFilter("status", p.status)}
                            className={clsx(
                              "rounded-md px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide transition-all hover:ring-2",
                              p.status === "on-track" ? "bg-[#dcfce7] text-[#166534] hover:ring-[#16a34a]/20" :
                              p.status === "at-risk" ? "bg-[#fef3c7] text-[#92400e] hover:ring-[#d97706]/20" :
                              "bg-[#fee2e2] text-[#991b1b] hover:ring-[#dc2626]/20"
                            )}
                          >
                            {p.status.replace("-", " ")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ SCHEDULE ════ */}
        {activeTab === "schedule" && (
          <div className="space-y-5">
            {/* Milestone timeline */}
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <div className="mb-4 text-[0.72rem] font-semibold text-[#111827]">Milestone Timeline</div>
              <div className="relative flex items-center justify-between overflow-x-auto pb-2">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-[#e5e7eb]" />
                {milestones.map((m) => (
                  <div key={m.name} className="relative z-10 flex flex-col items-center px-2">
                    <div className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[0.55rem] font-bold",
                      m.status === "complete" ? "border-[#16a34a] bg-[#dcfce7] text-[#16a34a]" :
                      m.status === "in-progress" ? "border-[#2563eb] bg-[#dbeafe] text-[#2563eb]" :
                      "border-[#d1d5db] bg-white text-[#9ca3af]"
                    )}>
                      {m.status === "complete" ? "✓" : m.status === "in-progress" ? "●" : "○"}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={clsx(
                        "text-[0.65rem] font-semibold",
                        m.status === "complete" ? "text-[#16a34a]" :
                        m.status === "in-progress" ? "text-[#2563eb]" : "text-[#9ca3af]"
                      )}>
                        {m.name}
                      </div>
                      <div className="text-[0.55rem] text-[#9ca3af]">{m.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap */}
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <div className="mb-4 text-[0.72rem] font-semibold text-[#111827]">Community Activity Heatmap</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-[0.68rem]">
                  <thead>
                    <tr>
                      <th className="pb-2 text-left font-semibold text-[#374151]">Community</th>
                      {months.map((m) => (
                        <th key={m} className="pb-2 text-center text-[0.58rem] font-medium text-[#9ca3af]">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleHeatmapData.map((row) => {
                      const dimmed = filters.community && !row.project.startsWith(filters.community?.split(" ")[0] || "");
                      return (
                        <tr key={row.project} className={clsx("transition-opacity duration-200", dimmed && "opacity-15")}>
                          <td className="py-1.5 pr-3">
                            <button
                              onClick={() => {
                                const match = communities.find((c) => c.startsWith(row.project.split(" ")[0]));
                                if (match) toggleFilter("community", match);
                              }}
                              className={clsx("whitespace-nowrap font-medium text-[#374151]", clickableText)}
                            >
                              {row.project}
                            </button>
                          </td>
                          {row.weeks.map((v, i) => (
                            <td key={i} className="p-0.5 text-center">
                              <div className="mx-auto h-6 w-8 rounded-md" style={{ backgroundColor: heatColor(v) }} title={`${v} active jobs`} />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[0.58rem] text-[#9ca3af]">
                <span>Less</span>
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <div key={v} className="h-3.5 w-6 rounded-md" style={{ backgroundColor: heatColor(v) }} />
                ))}
                <span>More active</span>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <div className="mb-3 text-[0.72rem] font-semibold text-[#111827]">Schedule Notes</div>
              <div className="space-y-2">
                {[
                  { text: "Cypress Creek rough-in pacing improved after resequencing trades.", type: "success" as const },
                  { text: "Clermont Heights still needs drywall sequencing cleanup.", type: "warning" as const },
                  { text: "Lake Nona Pines remains the top schedule-risk community.", type: "danger" as const },
                ].map((note) => (
                  <div
                    key={note.text}
                    className={clsx(
                      "flex items-start gap-3 rounded-lg border p-3.5 text-[0.72rem] leading-5",
                      note.type === "success" ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]" :
                      note.type === "warning" ? "border-[#fde68a] bg-[#fffbeb] text-[#92400e]" :
                      "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                    )}
                  >
                    <span className="shrink-0 text-sm">
                      {note.type === "success" ? "✓" : note.type === "warning" ? "⚠" : "✕"}
                    </span>
                    {note.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-5 py-2.5 text-[0.68rem] text-[#6b7280]">
        <span>{filtered.length} of {pipelineJobs.length} jobs</span>
        <span className="text-[0.58rem] text-[#9ca3af]">Updated 7:30 AM · Illustrative data</span>
      </div>
    </div>
  );
}
