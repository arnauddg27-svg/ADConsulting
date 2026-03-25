"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  CalendarClock,
  Users,
  Sparkles,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import KPICard from "./KPICard";
import ProjectProgressChart from "./ProjectProgressChart";
import BudgetVarianceChart from "./BudgetVarianceChart";
import CostBreakdownChart from "./CostBreakdownChart";
import MilestoneTimeline from "./MilestoneTimeline";
import ScheduleHeatmap from "./ScheduleHeatmap";
import { projects, jobProfitability } from "@/lib/mock-data";
import type { DashboardFilters, JobProfitability } from "@/types";

const tabs = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { id: "projects", label: "Projects", icon: <FolderOpen size={18} /> },
  { id: "budget", label: "Budget", icon: <DollarSign size={18} /> },
  { id: "schedule", label: "Schedule", icon: <CalendarClock size={18} /> },
  { id: "vendors", label: "Vendors", icon: <Users size={18} /> },
];

const projectStatusBadge = {
  "on-track": "border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
  "at-risk": "border-accent-400/20 bg-accent-500/15 text-accent-300",
  behind: "border-red-500/20 bg-red-500/15 text-red-400",
};

const profitStatusBadge: Record<string, string> = {
  healthy: "border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
  watch: "border-accent-400/20 bg-accent-500/15 text-accent-300",
  eroding: "border-red-500/20 bg-red-500/15 text-red-400",
};

const scheduleNotes = [
  { text: "Cypress Creek rough-in pacing improved after resequencing trades.", type: "success" as const },
  { text: "Clermont Heights still needs drywall sequencing cleanup.", type: "warning" as const },
  { text: "Lake Nona Pines remains the top schedule-risk community.", type: "danger" as const },
];

/* ─── Vendor mock data ─── */
const vendors = [
  { id: 1, name: "Elite Framing Co.", trade: "Framing", score: 92, onTime: 95, defects: 2, avgCost: 18500, trend: "up" as const, community: "Lakewood Reserve" },
  { id: 2, name: "Central FL Plumbing", trade: "Plumbing", score: 87, onTime: 88, defects: 5, avgCost: 12800, trend: "up" as const, community: "Cypress Creek" },
  { id: 3, name: "Sunshine Electrical", trade: "Electrical", score: 78, onTime: 82, defects: 8, avgCost: 14200, trend: "down" as const, community: "Pine Hills" },
  { id: 4, name: "Pro Drywall Inc.", trade: "Drywall", score: 84, onTime: 90, defects: 4, avgCost: 9600, trend: "neutral" as const, community: "Winter Garden Estates" },
  { id: 5, name: "A1 Concrete & Foundation", trade: "Foundation", score: 91, onTime: 93, defects: 1, avgCost: 22400, trend: "up" as const, community: "Clermont Heights" },
  { id: 6, name: "Bay Area Roofing", trade: "Roofing", score: 73, onTime: 76, defects: 11, avgCost: 16800, trend: "down" as const, community: "Apopka Crossing" },
  { id: 7, name: "Precision HVAC", trade: "HVAC", score: 89, onTime: 91, defects: 3, avgCost: 11500, trend: "up" as const, community: "Windermere Trails" },
  { id: 8, name: "Flooring Solutions LLC", trade: "Flooring", score: 81, onTime: 85, defects: 6, avgCost: 8200, trend: "neutral" as const, community: "Lake Nona Pines" },
];

const EMPTY_FILTERS: DashboardFilters = {
  project: null,
  community: null,
  phase: null,
  status: null,
  costCategory: null,
  profitStatus: null,
};

const FILTER_LABELS: Record<keyof DashboardFilters, string> = {
  project: "Project",
  community: "Community",
  phase: "Phase",
  status: "Status",
  costCategory: "Cost",
  profitStatus: "Profit",
};

export default function DashboardShell() {
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);

  const toggleFilter = (key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const clearFilter = (key: keyof DashboardFilters) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  const clearAllFilters = () => setFilters(EMPTY_FILTERS);

  const hasAnyFilter = Object.values(filters).some((v) => v !== null);

  const getCommunity = (name: string) => name.split(" - ")[0];

  const projectMatches = (p: { name: string; phase?: string; status: string }) => {
    if (filters.project && p.name !== filters.project) return false;
    if (filters.community && getCommunity(p.name) !== filters.community) return false;
    if (filters.phase && p.phase !== filters.phase) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  };

  const filteredProjects = projects.filter(projectMatches);

  const jobMatches = (job: JobProfitability) => {
    if (filters.project && job.project !== filters.project) return false;
    if (filters.community && getCommunity(job.project) !== filters.community) return false;
    if (filters.profitStatus && job.status !== filters.profitStatus) return false;
    const proj = projects.find((p) => p.name === job.project);
    if (proj && filters.phase && proj.phase !== filters.phase) return false;
    if (proj && filters.status && proj.status !== filters.status) return false;
    return true;
  };

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  /* --- Dynamic KPI values --- */
  const totalBudget = filteredProjects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = filteredProjects.reduce((s, p) => s + p.spent, 0);
  const onTrackCount = filteredProjects.filter((p) => p.status === "on-track").length;
  const onTimeRate =
    filteredProjects.length > 0
      ? Math.round((onTrackCount / filteredProjects.length) * 100)
      : 0;
  const avgDaysRemaining = filteredProjects.length > 0
    ? Math.round(filteredProjects.reduce((s, p) => s + p.daysRemaining, 0) / filteredProjects.length)
    : 0;

  /* --- Budget derived --- */
  const filteredProfitability = jobProfitability.filter(jobMatches);
  const avgMargin = filteredProfitability.length > 0
    ? Math.round(filteredProfitability.reduce((s, j) => s + j.estimatedMargin, 0) / filteredProfitability.length * 10) / 10
    : 0;

  /* --- Vendor derived --- */
  const avgVendorScore = useMemo(() =>
    Math.round(vendors.reduce((s, v) => s + v.score, 0) / vendors.length),
  []);
  const vendorsAtRisk = vendors.filter((v) => v.score < 80).length;

  /* --- Community summary for projects tab --- */
  const communitySummary = useMemo(() => {
    const map = new Map<string, { count: number; onTrack: number; avgPct: number }>();
    projects.forEach((p) => {
      const comm = getCommunity(p.name);
      const entry = map.get(comm) || { count: 0, onTrack: 0, avgPct: 0 };
      entry.count++;
      entry.avgPct += p.percentComplete;
      if (p.status === "on-track") entry.onTrack++;
      map.set(comm, entry);
    });
    return Array.from(map.entries()).map(([name, d]) => ({
      name,
      count: d.count,
      onTrack: d.onTrack,
      avgPct: Math.round(d.avgPct / d.count),
    }));
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0f1a] shadow-[0_50px_120px_-60px_rgba(0,0,0,1)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0d1321] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-gradient-to-br from-accent-500/20 to-emerald-500/10 text-base font-bold tracking-wider text-accent-300">
            AD
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-50">
              Operating Overview
            </div>
            <div className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
              Builder Operations Console
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em]">
          <span className="badge-dash">Updated 7:30 AM</span>
          <span className="badge-dash text-accent-300">
            <Sparkles size={12} />
            Sample data
          </span>
        </div>
      </div>

      <div className="md:flex">
        <div className="hidden w-52 border-r border-white/[0.06] bg-[#0c1120] p-4 md:block">
          <nav className="space-y-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.12em] transition-all",
                  activeTab === tab.id
                    ? "bg-accent-500 text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-b border-white/[0.06] bg-[#0c1120] md:hidden">
          <div className="flex overflow-x-auto px-3 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={clsx(
                  "mr-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all",
                  activeTab === tab.id
                    ? "bg-accent-500 text-white"
                    : "bg-white/[0.03] text-slate-400"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.06),transparent_22%),#0a0f1a] p-4 md:p-6">
          {/* ── Filter Pill Bar ── */}
          {hasAnyFilter && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Filtering by
              </span>
              {(Object.keys(filters) as Array<keyof DashboardFilters>).map((key) =>
                filters[key] ? (
                  <button
                    key={key}
                    onClick={() => clearFilter(key)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/30 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-300 transition-all hover:bg-accent-500/20"
                  >
                    <span className="text-[0.6rem] uppercase tracking-wider text-slate-500">
                      {FILTER_LABELS[key]}
                    </span>
                    {filters[key]!.replace("-", " ")}
                    <span className="ml-0.5 text-slate-500 hover:text-white">✕</span>
                  </button>
                ) : null
              )}
              <button
                onClick={clearAllFilters}
                className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-white/20 hover:text-slate-200"
              >
                Clear all
              </button>
            </div>
          )}

          {/* ════ OVERVIEW ════ */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <KPICard
                  label="Active Projects"
                  value={String(filteredProjects.length)}
                  change="+3 vs last month"
                  trend="up"
                  clickable
                  onClick={() => switchTab("projects")}
                />
                <KPICard
                  label="On-Time Rate"
                  value={`${onTimeRate}%`}
                  change="+5% vs Q3"
                  trend="up"
                  clickable
                  onClick={() => {
                    toggleFilter("status", "on-track");
                    switchTab("projects");
                  }}
                />
                <KPICard
                  label="Budget Utilization"
                  value={`$${(totalSpent / 1000000).toFixed(1)}M`}
                  subtitle={`of $${(totalBudget / 1000000).toFixed(1)}M budget`}
                  progress={
                    totalBudget > 0
                      ? Math.round((totalSpent / totalBudget) * 100)
                      : 0
                  }
                  clickable
                  onClick={() => switchTab("budget")}
                />
                <KPICard
                  label="Avg Margin"
                  value={`${avgMargin}%`}
                  change={avgMargin >= 18 ? "healthy" : "watch range"}
                  trend={avgMargin >= 18 ? "up" : "neutral"}
                  clickable
                  onClick={() => switchTab("budget")}
                />
                <KPICard
                  label="Vendor Health"
                  value={`${avgVendorScore}`}
                  change={vendorsAtRisk > 0 ? `${vendorsAtRisk} at risk` : "all healthy"}
                  trend={vendorsAtRisk > 0 ? "down" : "up"}
                  clickable
                  onClick={() => switchTab("vendors")}
                />
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <ProjectProgressChart
                  filters={filters}
                  onFilterToggle={toggleFilter}
                />
                <BudgetVarianceChart filters={filters} />
              </div>

              {/* Community summary cards */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
                <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Community Snapshot
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {communitySummary.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => toggleFilter("community", c.name)}
                      className={clsx(
                        "rounded-xl border p-4 text-left transition-all",
                        filters.community === c.name
                          ? "border-accent-400/40 bg-accent-500/10"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="text-sm font-semibold text-slate-100">{c.name}</div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                        <span>{c.count} job{c.count !== 1 ? "s" : ""}</span>
                        <span>{c.avgPct}% avg</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.06]">
                        <div className="h-1.5 rounded-full bg-accent-400" style={{ width: `${c.avgPct}%` }} />
                      </div>
                      <div className="mt-2 text-[0.62rem] text-slate-500">
                        {c.onTrack} of {c.count} on-track
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ PROJECTS ════ */}
          {activeTab === "projects" && (
            <div className="space-y-5">
              <ProjectProgressChart
                filters={filters}
                onFilterToggle={toggleFilter}
              />
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
                <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Project Status Snapshot
                </h3>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        <th className="pb-3">Project</th>
                        <th className="pb-3">Community</th>
                        <th className="pb-3">Phase</th>
                        <th className="pb-3">Progress</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Days Left</th>
                        <th className="pb-3 text-right">Budget</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr
                          key={project.id}
                          className={clsx(
                            "border-b border-white/[0.04] last:border-b-0 transition-opacity duration-300",
                            hasAnyFilter && !projectMatches(project) && "opacity-20"
                          )}
                        >
                          <td className="py-4">
                            <button
                              onClick={() => toggleFilter("project", project.name)}
                              className="cursor-pointer text-left font-medium text-slate-100 transition-colors hover:text-accent-300"
                            >
                              {project.name}
                            </button>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => toggleFilter("community", getCommunity(project.name))}
                              className="cursor-pointer text-left text-slate-400 transition-colors hover:text-accent-300"
                            >
                              {getCommunity(project.name)}
                            </button>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => toggleFilter("phase", project.phase)}
                              className="cursor-pointer text-left text-slate-300 transition-colors hover:text-accent-300"
                            >
                              {project.phase}
                            </button>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-24 rounded-full bg-white/[0.06]">
                                <div
                                  className={clsx(
                                    "h-1.5 rounded-full",
                                    project.status === "on-track" && "bg-emerald-500",
                                    project.status === "at-risk" && "bg-accent-400",
                                    project.status === "behind" && "bg-red-500"
                                  )}
                                  style={{ width: `${project.percentComplete}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400">
                                {project.percentComplete}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => toggleFilter("status", project.status)}
                              className={clsx(
                                "inline-flex cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-all hover:ring-1 hover:ring-white/20",
                                projectStatusBadge[project.status]
                              )}
                            >
                              {project.status.replace("-", " ")}
                            </button>
                          </td>
                          <td className={clsx(
                            "py-4 text-right font-medium",
                            project.daysRemaining <= 30 ? "text-emerald-400" : project.daysRemaining >= 100 ? "text-slate-500" : "text-slate-300"
                          )}>
                            {project.daysRemaining}d
                          </td>
                          <td className="py-4 text-right text-xs text-slate-400">
                            ${(project.spent / 1000).toFixed(0)}k / ${(project.budget / 1000).toFixed(0)}k
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* At-risk alerts */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
                <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <AlertTriangle size={14} />
                  Attention Required
                </div>
                <div className="mt-4 space-y-2">
                  {projects.filter((p) => p.status !== "on-track").map((p) => (
                    <button
                      key={p.id}
                      onClick={() => toggleFilter("project", p.name)}
                      className="flex w-full items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                    >
                      <div className={clsx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        p.status === "at-risk" ? "bg-accent-500/15 text-accent-300" : "bg-red-500/15 text-red-400"
                      )}>
                        {p.status === "at-risk" ? <Clock size={16} /> : <AlertTriangle size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-100">{p.name}</div>
                        <div className="text-xs text-slate-400">
                          {p.phase} · {p.percentComplete}% complete · {p.daysRemaining} days remaining
                        </div>
                      </div>
                      <span className={clsx(
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                        projectStatusBadge[p.status]
                      )}>
                        {p.status.replace("-", " ")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ BUDGET ════ */}
          {activeTab === "budget" && (
            <div className="space-y-5">
              {/* Budget KPIs */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KPICard
                  label="Total Budget"
                  value={`$${(totalBudget / 1000000).toFixed(1)}M`}
                  subtitle={`${filteredProjects.length} projects`}
                />
                <KPICard
                  label="Spent to Date"
                  value={`$${(totalSpent / 1000000).toFixed(1)}M`}
                  progress={totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}
                  subtitle={`${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% utilized`}
                />
                <KPICard
                  label="Avg Margin"
                  value={`${avgMargin}%`}
                  change={avgMargin >= 18 ? "healthy range" : avgMargin >= 14 ? "watch range" : "below target"}
                  trend={avgMargin >= 18 ? "up" : avgMargin >= 14 ? "neutral" : "down"}
                />
                <KPICard
                  label="Remaining"
                  value={`$${((totalBudget - totalSpent) / 1000000).toFixed(1)}M`}
                  subtitle="across all projects"
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <CostBreakdownChart
                  filters={filters}
                  onFilterToggle={toggleFilter}
                />
                <BudgetVarianceChart filters={filters} />
              </div>

              {/* Job Profitability Estimate */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
                <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Projected Job Profitability
                </h3>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[760px] text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <th className="pb-3 pr-2">Project</th>
                        <th className="pb-3 px-2">Community</th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">Contract</th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">Est. Cost</th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">Spent</th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">Proj. Final</th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">Margin</th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">Variance</th>
                        <th className="pb-3 pl-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobProfitability.map((job) => {
                        const variance = job.estimatedCost - job.projectedFinalCost;
                        return (
                          <tr
                            key={job.id}
                            className={clsx(
                              "border-b border-white/[0.04] last:border-b-0 transition-opacity duration-300",
                              hasAnyFilter && !jobMatches(job) && "opacity-20"
                            )}
                          >
                            <td className="py-3 pr-2">
                              <button
                                onClick={() => toggleFilter("project", job.project)}
                                className="cursor-pointer text-left font-medium text-slate-100 transition-colors hover:text-accent-300"
                              >
                                {job.project}
                              </button>
                            </td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => toggleFilter("community", getCommunity(job.project))}
                                className="cursor-pointer text-left text-slate-400 transition-colors hover:text-accent-300"
                              >
                                {getCommunity(job.project)}
                              </button>
                            </td>
                            <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300">
                              ${job.contractValue.toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-right whitespace-nowrap text-slate-400">
                              ${job.estimatedCost.toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300">
                              ${job.actualCostToDate.toLocaleString()}
                            </td>
                            <td className="py-3 px-2 text-right whitespace-nowrap font-medium text-slate-200">
                              ${job.projectedFinalCost.toLocaleString()}
                            </td>
                            <td className={clsx(
                              "py-3 px-2 text-right whitespace-nowrap font-semibold",
                              job.status === "healthy" && "text-emerald-400",
                              job.status === "watch" && "text-accent-300",
                              job.status === "eroding" && "text-red-400"
                            )}>
                              {job.estimatedMargin}%
                            </td>
                            <td className={clsx(
                              "py-3 px-2 text-right whitespace-nowrap font-medium",
                              variance >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                              {variance >= 0 ? "+" : ""}${(variance / 1000).toFixed(0)}k
                            </td>
                            <td className="py-3 pl-2">
                              <button
                                onClick={() => toggleFilter("profitStatus", job.status)}
                                className={clsx(
                                  "inline-flex cursor-pointer rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] transition-all hover:ring-1 hover:ring-white/20",
                                  profitStatusBadge[job.status]
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
                <div className="mt-4 flex items-center gap-4 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy (&ge;18%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent-400" /> Watch (14-18%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> Eroding (&lt;14%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ════ SCHEDULE ════ */}
          {activeTab === "schedule" && (
            <div className="space-y-5">
              {/* Schedule KPIs */}
              <div className="grid gap-4 sm:grid-cols-3">
                <KPICard
                  label="Avg Days Remaining"
                  value={`${avgDaysRemaining}d`}
                  subtitle="across active projects"
                />
                <KPICard
                  label="On-Time Rate"
                  value={`${onTimeRate}%`}
                  change={`${onTrackCount} on-track`}
                  trend="up"
                />
                <KPICard
                  label="Projects Closing Soon"
                  value={String(filteredProjects.filter((p) => p.daysRemaining <= 30).length)}
                  subtitle="within 30 days"
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <MilestoneTimeline
                  filters={filters}
                  onFilterToggle={toggleFilter}
                />
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
                  <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <BellRing size={14} />
                    Schedule notes
                  </div>
                  <div className="mt-5 space-y-3">
                    {scheduleNotes.map((note) => (
                      <div
                        key={note.text}
                        className={clsx(
                          "flex items-start gap-3 rounded-xl border p-4 text-sm leading-6",
                          note.type === "success" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" :
                          note.type === "warning" ? "border-accent-400/20 bg-accent-500/5 text-accent-200" :
                          "border-red-500/20 bg-red-500/5 text-red-300"
                        )}
                      >
                        <span className="mt-0.5 shrink-0">
                          {note.type === "success" ? <CheckCircle2 size={14} /> :
                           note.type === "warning" ? <AlertTriangle size={14} /> :
                           <AlertTriangle size={14} />}
                        </span>
                        {note.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <ScheduleHeatmap
                filters={filters}
                onFilterToggle={toggleFilter}
              />
            </div>
          )}

          {/* ════ VENDORS ════ */}
          {activeTab === "vendors" && (
            <div className="space-y-5">
              {/* Vendor KPIs */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KPICard
                  label="Active Vendors"
                  value={String(vendors.length)}
                  subtitle="across all trades"
                />
                <KPICard
                  label="Avg Score"
                  value={String(avgVendorScore)}
                  change="+3 vs last quarter"
                  trend="up"
                />
                <KPICard
                  label="At-Risk Vendors"
                  value={String(vendorsAtRisk)}
                  change={vendorsAtRisk > 0 ? "need review" : "none flagged"}
                  trend={vendorsAtRisk > 0 ? "down" : "up"}
                />
                <KPICard
                  label="Avg On-Time"
                  value={`${Math.round(vendors.reduce((s, v) => s + v.onTime, 0) / vendors.length)}%`}
                  subtitle="schedule compliance"
                />
              </div>

              {/* Vendor scorecard table */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
                <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Vendor Scorecard
                </h3>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <th className="pb-3 pr-2">Vendor</th>
                        <th className="pb-3 px-2">Trade</th>
                        <th className="pb-3 px-2">Community</th>
                        <th className="pb-3 px-2 text-right">Score</th>
                        <th className="pb-3 px-2 text-right">On-Time</th>
                        <th className="pb-3 px-2 text-right">Defects</th>
                        <th className="pb-3 px-2 text-right">Avg Cost</th>
                        <th className="pb-3 pl-2">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((v) => {
                        const dimmed = filters.community && v.community !== filters.community;
                        return (
                          <tr
                            key={v.id}
                            className={clsx(
                              "border-b border-white/[0.04] last:border-b-0 transition-opacity duration-300",
                              dimmed && "opacity-20"
                            )}
                          >
                            <td className="py-3 pr-2 font-medium text-slate-100">
                              {v.name}
                            </td>
                            <td className="py-3 px-2 text-slate-300">{v.trade}</td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => toggleFilter("community", v.community)}
                                className="text-left text-slate-400 transition-colors hover:text-accent-300"
                              >
                                {v.community}
                              </button>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className={clsx(
                                "inline-flex items-center gap-1.5 font-semibold",
                                v.score >= 85 ? "text-emerald-400" : v.score >= 75 ? "text-accent-300" : "text-red-400"
                              )}>
                                <span className={clsx(
                                  "h-2 w-2 rounded-full",
                                  v.score >= 85 ? "bg-emerald-500" : v.score >= 75 ? "bg-accent-400" : "bg-red-500"
                                )} />
                                {v.score}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-slate-300">{v.onTime}%</td>
                            <td className={clsx(
                              "py-3 px-2 text-right font-medium",
                              v.defects >= 8 ? "text-red-400" : v.defects >= 5 ? "text-accent-300" : "text-slate-400"
                            )}>
                              {v.defects}
                            </td>
                            <td className="py-3 px-2 text-right text-slate-300">
                              ${v.avgCost.toLocaleString()}
                            </td>
                            <td className="py-3 pl-2">
                              <span className={clsx(
                                "inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em]",
                                v.trend === "up" ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-400" :
                                v.trend === "down" ? "border-red-500/20 bg-red-500/15 text-red-400" :
                                "border-white/[0.08] bg-white/[0.04] text-slate-400"
                              )}>
                                {v.trend === "up" ? "↑" : v.trend === "down" ? "↓" : "—"} {v.trend}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Score &ge;85
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent-400" /> 75-84
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> &lt;75 (at risk)
                  </span>
                </div>
              </div>

              {/* Trade performance summary */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
                <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Trade Performance Summary
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {vendors.filter((v) => v.score >= 85).map((v) => (
                    <div key={v.id} className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-300">{v.trade}</span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-slate-200">{v.name}</div>
                      <div className="mt-1 text-xs text-slate-400">Score: {v.score} · {v.onTime}% on-time</div>
                    </div>
                  ))}
                  {vendors.filter((v) => v.score < 75).map((v) => (
                    <div key={v.id} className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-400" />
                        <span className="text-xs font-semibold text-red-300">{v.trade}</span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-slate-200">{v.name}</div>
                      <div className="mt-1 text-xs text-slate-400">Score: {v.score} · {v.defects} defects</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
