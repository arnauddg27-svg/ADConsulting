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

/* ─── Same pipeline data as ConstructionPipeline ─── */
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
  community: string | null;
  stage: string | null;
  super: string | null;
  status: string | null;
  costCategory: string | null;
  profitStatus: string | null;
}

const EMPTY_FILTERS: RetoolFilters = {
  community: null, stage: null, super: null,
  status: null, costCategory: null, profitStatus: null,
};

const FILTER_LABELS: Record<keyof RetoolFilters, string> = {
  community: "Community", stage: "Stage", super: "Super",
  status: "Status", costCategory: "Cost", profitStatus: "Profit",
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
    return true;
  }), [search, filters]);

  const jobMatches = (j: PipelineJob) => {
    if (search && !j.id.toLowerCase().includes(search.toLowerCase()) && !j.community.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.community && j.community !== filters.community) return false;
    if (filters.stage && j.stage !== filters.stage) return false;
    if (filters.super && j.super !== filters.super) return false;
    return true;
  };

  /* ─── Derived KPI data ─── */
  const avgCompletion = filtered.length > 0
    ? Math.round(filtered.reduce((s, j) => s + j.pct, 0) / filtered.length)
    : 0;
  const stalledCount = filtered.filter((j) => j.idle >= 14).length;
  const closingCount = filtered.filter((j) => j.stage === "Closing" || j.stage === "Punch / CO").length;

  /* ─── Community progress chart data ─── */
  const communityChartData = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    pipelineJobs.forEach((j) => {
      const entry = map.get(j.community) || { count: 0, total: 0 };
      entry.count++;
      entry.total += j.pct;
      map.set(j.community, entry);
    });
    return Array.from(map.entries()).map(([name, d]) => ({
      community: name.length > 14 ? name.slice(0, 14) + "…" : name,
      fullName: name,
      avg: Math.round(d.total / d.count),
      jobs: d.count,
    }));
  }, []);

  /* ─── Project matches for budget tab ─── */
  const projectMatchesFn = (p: { name: string; status: string }) => {
    if (filters.community) {
      const comm = p.name.split(" - ")[0];
      if (comm !== filters.community) return false;
    }
    if (filters.status && p.status !== filters.status) return false;
    return true;
  };

  const filteredProjects = projects.filter(projectMatchesFn);

  const totalBudget = filteredProjects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = filteredProjects.reduce((s, p) => s + p.spent, 0);

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ─── Schedule months ─── */
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const heatColor = (v: number) => {
    if (v === 0) return "#f8fafc";
    if (v <= 1) return "#dbeafe";
    if (v <= 2) return "#93c5fd";
    if (v <= 3) return "#60a5fa";
    if (v <= 4) return "#3b82f6";
    return "#1d4ed8";
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white text-[#334155] shadow-sm" style={{ colorScheme: "light" }}>
      {/* Retool-style header bar */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#2563eb] text-xs font-bold text-white">
            R
          </div>
          <div>
            <div className="text-sm font-semibold text-[#1e293b]">
              Construction Operations
            </div>
            <div className="text-[0.65rem] text-[#94a3b8]">
              {filtered.length} of {pipelineJobs.length} jobs · Illustrative data
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#dbeafe] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[#2563eb]">
            Retool App
          </span>
          <button className="rounded border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] transition-colors hover:bg-[#f1f5f9]">
            Export CSV
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-[#e2e8f0] bg-[#f8fafc] px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
              activeTab === tab.id
                ? "border-[#2563eb] text-[#2563eb]"
                : "border-transparent text-[#64748b] hover:text-[#334155]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5">
        <input
          type="text"
          placeholder="Search jobs or communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#334155] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/30"
        />
        <select
          value={filters.community || ""}
          onChange={(e) => setFilters((f) => ({ ...f, community: e.target.value || null }))}
          className="rounded border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#334155] outline-none transition-colors focus:border-[#2563eb]"
        >
          <option value="">All Communities</option>
          {communities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filters.stage || ""}
          onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value || null }))}
          className="rounded border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#334155] outline-none transition-colors focus:border-[#2563eb]"
        >
          <option value="">All Stages</option>
          {stages.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filters.super || ""}
          onChange={(e) => setFilters((f) => ({ ...f, super: e.target.value || null }))}
          className="rounded border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#334155] outline-none transition-colors focus:border-[#2563eb]"
        >
          <option value="">All Supers</option>
          {supers.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasAnyFilter && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#2563eb] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter pills */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e8f0] bg-white px-4 py-2">
          <span className="text-[0.65rem] font-medium text-[#94a3b8]">Active:</span>
          {search && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#dbeafe] px-2.5 py-1 text-[0.65rem] font-medium text-[#1e40af]">
              Search: &ldquo;{search}&rdquo;
              <button onClick={() => setSearch("")} className="ml-0.5 text-[#64748b] hover:text-[#1e293b]">×</button>
            </span>
          )}
          {(Object.keys(filters) as Array<keyof RetoolFilters>).map((key) =>
            filters[key] ? (
              <span key={key} className="inline-flex items-center gap-1 rounded-full bg-[#dbeafe] px-2.5 py-1 text-[0.65rem] font-medium text-[#1e40af]">
                {FILTER_LABELS[key]}: {filters[key]}
                <button onClick={() => clearFilter(key)} className="ml-0.5 text-[#64748b] hover:text-[#1e293b]">×</button>
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Tab content */}
      <div className="p-4">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#94a3b8]">Active Jobs</div>
                <div className="mt-1 text-2xl font-bold text-[#1e293b]">{filtered.length}</div>
                <div className="mt-1 text-[0.65rem] text-[#64748b]">of {pipelineJobs.length} total</div>
              </div>
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#94a3b8]">Avg Completion</div>
                <div className="mt-1 text-2xl font-bold text-[#2563eb]">{avgCompletion}%</div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-[#e2e8f0]">
                  <div className="h-1.5 rounded-full bg-[#2563eb]" style={{ width: `${avgCompletion}%` }} />
                </div>
              </div>
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#94a3b8]">Stalled Jobs</div>
                <div className={clsx("mt-1 text-2xl font-bold", stalledCount > 0 ? "text-[#dc2626]" : "text-[#16a34a]")}>{stalledCount}</div>
                <div className="mt-1 text-[0.65rem] text-[#64748b]">14+ days idle</div>
              </div>
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#94a3b8]">Near Closing</div>
                <div className="mt-1 text-2xl font-bold text-[#16a34a]">{closingCount}</div>
                <div className="mt-1 text-[0.65rem] text-[#64748b]">Punch / CO + Closing</div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid gap-4 xl:grid-cols-2">
              {/* Community progress */}
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="mb-3 text-xs font-semibold text-[#1e293b]">Avg Completion by Community</div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={communityChartData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                      <YAxis
                        dataKey="community"
                        type="category"
                        width={110}
                        tick={(props: Record<string, unknown>) => {
                          const x = Number(props.x);
                          const y = Number(props.y);
                          const value = String((props.payload as Record<string, unknown>)?.value ?? "");
                          const full = communityChartData.find((d) => d.community === value)?.fullName;
                          return (
                            <text
                              x={x}
                              y={y}
                              dy={4}
                              textAnchor="end"
                              fill={filters.community === full ? "#2563eb" : "#334155"}
                              fontSize={10}
                              fontWeight={filters.community === full ? 700 : 500}
                              className="cursor-pointer"
                              onClick={() => { if (full) toggleFilter("community", full); }}
                            >
                              {value}
                            </text>
                          );
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, color: "#334155" }}
                        formatter={(value) => [`${value}%`, "Avg Completion"]}
                      />
                      <Bar
                        dataKey="avg"
                        fill="#2563eb"
                        radius={[0, 4, 4, 0]}
                        barSize={16}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Budget utilization */}
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="mb-3 text-xs font-semibold text-[#1e293b]">Budget vs Actual (Monthly)</div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={budgetData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, color: "#334155" }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                      />
                      <Area type="monotone" dataKey="planned" stroke="#94a3b8" fill="#f1f5f9" strokeWidth={2} name="Planned" />
                      <Area type="monotone" dataKey="actual" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} name="Actual" />
                      <Legend iconType="square" wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Stage distribution summary */}
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="mb-3 text-xs font-semibold text-[#1e293b]">Jobs by Stage</div>
              <div className="flex flex-wrap gap-2">
                {stages.map((s) => {
                  const count = filtered.filter((j) => j.stage === s).length;
                  const isActive = filters.stage === s;
                  return (
                    <button
                      key={s}
                      onClick={() => toggleFilter("stage", s)}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all",
                        isActive
                          ? "border-[#2563eb] bg-[#eff6ff] font-semibold text-[#2563eb]"
                          : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#cbd5e1]"
                      )}
                    >
                      {s}
                      <span className={clsx(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-bold",
                        isActive ? "bg-[#2563eb] text-white" : "bg-[#f1f5f9] text-[#64748b]",
                        count === 0 && "opacity-40"
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

        {/* ── PIPELINE TAB ── */}
        {activeTab === "pipeline" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="w-8 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-[#cbd5e1] accent-[#2563eb]"
                        checked={selectedRows.size === filtered.length && filtered.length > 0}
                        onChange={() => {
                          if (selectedRows.size === filtered.length) setSelectedRows(new Set());
                          else setSelectedRows(new Set(filtered.map((j) => j.id)));
                        }}
                      />
                    </th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[#475569]">Job</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[#475569]">Community</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[#475569]">Plan</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[#475569]">Super</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-[#475569]">Stage</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#475569]">Completion</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#475569]">Est. Close</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-[#475569]">Days Idle</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelineJobs.map((job) => {
                    const matches = jobMatches(job);
                    return (
                      <tr
                        key={job.id}
                        className={clsx(
                          "border-b border-[#f1f5f9] transition-all duration-200",
                          selectedRows.has(job.id) ? "bg-[#eff6ff]" : "hover:bg-[#f8fafc]",
                          hasAnyFilter && !matches && "opacity-20"
                        )}
                      >
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-[#cbd5e1] accent-[#2563eb]"
                            checked={selectedRows.has(job.id)}
                            onChange={() => toggleRow(job.id)}
                          />
                        </td>
                        <td className="px-3 py-2.5 font-medium text-[#2563eb]">
                          {job.id}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => toggleFilter("community", job.community)}
                            className="text-left text-[#334155] transition-colors hover:text-[#2563eb]"
                          >
                            {job.community}
                            <span className="ml-1 text-[#94a3b8]">· {job.lot}</span>
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-[#64748b]">{job.plan}</td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => toggleFilter("super", job.super)}
                            className="text-left text-[#64748b] transition-colors hover:text-[#2563eb]"
                          >
                            {job.super}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => toggleFilter("stage", job.stage)}
                            className={clsx(
                              "inline-block rounded-full px-2 py-0.5 text-[0.62rem] font-medium transition-all hover:ring-1 hover:ring-[#2563eb]/30",
                              job.stage === "Finishes" || job.stage === "Punch / CO" || job.stage === "Closing"
                                ? "bg-[#dcfce7] text-[#166534]"
                                : job.stage === "Foundation" || job.stage === "Site Work"
                                  ? "bg-[#f1f5f9] text-[#475569]"
                                  : "bg-[#dbeafe] text-[#1e40af]"
                            )}
                          >
                            {job.stage}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-[#e2e8f0]">
                              <div
                                className="h-1.5 rounded-full bg-[#2563eb]"
                                style={{ width: `${job.pct}%` }}
                              />
                            </div>
                            <span className="text-[#64748b]">{job.pct}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right text-[#334155]">{job.estClose}</td>
                        <td className={clsx(
                          "px-3 py-2.5 text-right font-medium",
                          job.idle >= 14 ? "text-[#dc2626]" : job.idle >= 7 ? "text-[#d97706]" : "text-[#64748b]"
                        )}>
                          {job.idle}d
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend + footer */}
            <div className="flex flex-wrap items-center gap-4 border-t border-[#e2e8f0] pt-3 text-xs text-[#64748b]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#64748b]" /> Idle &lt; 7d</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#d97706]" /> 7–13 days</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#dc2626]" /> 14+ days (stalled)</span>
              <span className="ml-auto">
                {selectedRows.size > 0
                  ? `${selectedRows.size} row${selectedRows.size !== 1 ? "s" : ""} selected`
                  : `Showing ${filtered.length} of ${pipelineJobs.length} jobs`}
              </span>
            </div>
          </div>
        )}

        {/* ── BUDGET TAB ── */}
        {activeTab === "budget" && (
          <div className="space-y-4">
            {/* Budget KPIs */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#94a3b8]">Total Budget</div>
                <div className="mt-1 text-2xl font-bold text-[#1e293b]">${(totalBudget / 1000000).toFixed(1)}M</div>
              </div>
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#94a3b8]">Total Spent</div>
                <div className="mt-1 text-2xl font-bold text-[#2563eb]">${(totalSpent / 1000000).toFixed(1)}M</div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-[#e2e8f0]">
                  <div className="h-1.5 rounded-full bg-[#2563eb]" style={{ width: `${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%` }} />
                </div>
              </div>
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-[#94a3b8]">Remaining</div>
                <div className="mt-1 text-2xl font-bold text-[#16a34a]">${((totalBudget - totalSpent) / 1000000).toFixed(1)}M</div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid gap-4 xl:grid-cols-2">
              {/* Cost breakdown pie */}
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="mb-3 text-xs font-semibold text-[#1e293b]">Cost Breakdown</div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        dataKey="value"
                        nameKey="category"
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {costBreakdown.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i]}
                            opacity={filters.costCategory && filters.costCategory !== costBreakdown[i].category ? 0.2 : 1}
                            className="cursor-pointer"
                            onClick={() => toggleFilter("costCategory", costBreakdown[i].category)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, color: "#334155" }}
                        formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`, undefined]}
                      />
                      <Legend
                        iconType="square"
                        wrapperStyle={{ fontSize: 11, color: "#64748b" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Budget vs actual area */}
              <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                <div className="mb-3 text-xs font-semibold text-[#1e293b]">Budget vs Actual Trend</div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={budgetData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, color: "#334155" }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                      />
                      <Area type="monotone" dataKey="planned" stroke="#94a3b8" fill="#f1f5f9" strokeWidth={2} name="Planned" />
                      <Area type="monotone" dataKey="actual" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} name="Actual" />
                      <Legend iconType="square" wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Profitability table */}
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="mb-3 text-xs font-semibold text-[#1e293b]">Projected Job Profitability</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-xs">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-left">
                      <th className="px-3 py-2.5 font-semibold text-[#475569]">Project</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[#475569]">Contract</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[#475569]">Est. Cost</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[#475569]">Actual</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[#475569]">Proj. Final</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[#475569]">Margin</th>
                      <th className="px-3 py-2.5 font-semibold text-[#475569]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobProfitability.map((job) => {
                      const matches = projectMatchesFn({ name: job.project, status: job.status }) &&
                        (!filters.profitStatus || job.status === filters.profitStatus);
                      return (
                        <tr
                          key={job.id}
                          className={clsx(
                            "border-b border-[#f1f5f9] transition-all duration-200 hover:bg-[#f8fafc]",
                            hasAnyFilter && !matches && "opacity-20"
                          )}
                        >
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => toggleFilter("community", job.project.split(" - ")[0])}
                              className="text-left font-medium text-[#2563eb] transition-colors hover:underline"
                            >
                              {job.project}
                            </button>
                          </td>
                          <td className="px-3 py-2.5 text-right text-[#334155]">${job.contractValue.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-[#334155]">${job.estimatedCost.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-[#334155]">${job.actualCostToDate.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-[#334155]">${job.projectedFinalCost.toLocaleString()}</td>
                          <td className={clsx(
                            "px-3 py-2.5 text-right font-semibold",
                            job.status === "healthy" ? "text-[#16a34a]" : job.status === "watch" ? "text-[#d97706]" : "text-[#dc2626]"
                          )}>
                            {job.estimatedMargin}%
                          </td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => toggleFilter("profitStatus", job.status)}
                              className={clsx(
                                "rounded-full px-2 py-0.5 text-[0.62rem] font-semibold uppercase transition-all hover:ring-1",
                                job.status === "healthy" ? "bg-[#dcfce7] text-[#166534] hover:ring-[#16a34a]/30" :
                                job.status === "watch" ? "bg-[#fef3c7] text-[#92400e] hover:ring-[#d97706]/30" :
                                "bg-[#fee2e2] text-[#991b1b] hover:ring-[#dc2626]/30"
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
              </div>
              <div className="mt-3 flex items-center gap-4 border-t border-[#e2e8f0] pt-3 text-xs text-[#64748b]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#16a34a]" /> Healthy (&ge;18%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#d97706]" /> Watch (14-18%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#dc2626]" /> Eroding (&lt;14%)</span>
              </div>
            </div>
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            {/* Milestone timeline */}
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="mb-3 text-xs font-semibold text-[#1e293b]">Milestone Timeline</div>
              <div className="flex flex-wrap gap-2">
                {milestones.map((m) => (
                  <div
                    key={m.name}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                      m.status === "complete"
                        ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
                        : m.status === "in-progress"
                          ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af]"
                          : "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8]"
                    )}
                  >
                    <span className={clsx(
                      "h-2 w-2 rounded-full",
                      m.status === "complete" ? "bg-[#16a34a]" :
                      m.status === "in-progress" ? "bg-[#2563eb]" : "bg-[#cbd5e1]"
                    )} />
                    <span className="font-medium">{m.name}</span>
                    <span className="text-[0.6rem]">{m.date}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[0.6rem] text-[#94a3b8]">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /> Complete</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" /> In Progress</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#cbd5e1]" /> Upcoming</span>
              </div>
            </div>

            {/* Activity heatmap */}
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="mb-3 text-xs font-semibold text-[#1e293b]">Community Activity Heatmap</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-xs">
                  <thead>
                    <tr>
                      <th className="pb-2 text-left text-[0.62rem] font-semibold text-[#475569]">Community</th>
                      {months.map((m) => (
                        <th key={m} className="pb-2 text-center text-[0.6rem] font-medium text-[#94a3b8]">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleHeatmapData.map((row) => {
                      const dimmed = filters.community && !row.project.startsWith(filters.community?.split(" ")[0] || "");
                      return (
                        <tr key={row.project} className={clsx("transition-opacity duration-200", dimmed && "opacity-20")}>
                          <td className="py-1 pr-3">
                            <button
                              onClick={() => {
                                const match = communities.find((c) => c.startsWith(row.project.split(" ")[0]));
                                if (match) toggleFilter("community", match);
                              }}
                              className="whitespace-nowrap text-[#334155] transition-colors hover:text-[#2563eb]"
                            >
                              {row.project}
                            </button>
                          </td>
                          {row.weeks.map((v, i) => (
                            <td key={i} className="p-0.5 text-center">
                              <div
                                className="mx-auto h-5 w-7 rounded"
                                style={{ backgroundColor: heatColor(v) }}
                                title={`${v} active jobs`}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[0.6rem] text-[#94a3b8]">
                <span>Less</span>
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <div key={v} className="h-3 w-5 rounded" style={{ backgroundColor: heatColor(v) }} />
                ))}
                <span>More active</span>
              </div>
            </div>

            {/* Schedule notes */}
            <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="mb-3 text-xs font-semibold text-[#1e293b]">Schedule Notes</div>
              <div className="space-y-2">
                {[
                  "Cypress Creek rough-in pacing improved after resequencing trades.",
                  "Clermont Heights still needs drywall sequencing cleanup.",
                  "Lake Nona Pines remains the top schedule-risk community.",
                ].map((note) => (
                  <div key={note} className="rounded border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs leading-5 text-[#334155]">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-xs text-[#64748b]">
        <span>
          {selectedRows.size > 0
            ? `${selectedRows.size} row${selectedRows.size !== 1 ? "s" : ""} selected`
            : `Showing ${filtered.length} of ${pipelineJobs.length} jobs`}
        </span>
        <span className="text-[0.6rem] text-[#94a3b8]">Updated 7:30 AM · Illustrative data</span>
      </div>
    </div>
  );
}
