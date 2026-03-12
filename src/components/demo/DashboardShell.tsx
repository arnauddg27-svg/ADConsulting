"use client";

import { useState } from "react";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  CalendarClock,
  Sparkles,
  BellRing,
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
  "Cypress Creek rough-in pacing improved after resequencing trades.",
  "Clermont Heights still needs drywall sequencing cleanup.",
  "Lake Nona Pines remains the top schedule-risk community.",
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
              Illustrative project and cost snapshot
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em]">
          <span className="badge-dash">Updated 7:30 AM</span>
          <span className="badge-dash text-accent-300">
            <Sparkles size={12} />
            Illustrative example
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

          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  label="Open Change Orders"
                  value="12"
                  change="2 need escalation"
                  trend="neutral"
                />
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <ProjectProgressChart
                  filters={filters}
                  onFilterToggle={toggleFilter}
                />
                <BudgetVarianceChart filters={filters} />
              </div>
            </div>
          )}

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
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        <th className="pb-3">Project</th>
                        <th className="pb-3">Phase</th>
                        <th className="pb-3">Progress</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Days Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr
                          key={project.id}
                          className={clsx(
                            "border-b border-white/[0.04] last:border-b-0 transition-opacity duration-300",
                            hasAnyFilter &&
                              !projectMatches(project) &&
                              "opacity-20"
                          )}
                        >
                          <td className="py-4">
                            <button
                              onClick={() =>
                                toggleFilter("project", project.name)
                              }
                              className="cursor-pointer text-left font-medium text-slate-100 transition-colors hover:text-accent-300"
                            >
                              {project.name}
                            </button>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() =>
                                toggleFilter("phase", project.phase)
                              }
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
                                    project.status === "on-track" &&
                                      "bg-emerald-500",
                                    project.status === "at-risk" &&
                                      "bg-accent-400",
                                    project.status === "behind" && "bg-red-500"
                                  )}
                                  style={{
                                    width: `${project.percentComplete}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-400">
                                {project.percentComplete}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() =>
                                toggleFilter("status", project.status)
                              }
                              className={clsx(
                                "inline-flex cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-all hover:ring-1 hover:ring-white/20",
                                projectStatusBadge[project.status]
                              )}
                            >
                              {project.status.replace("-", " ")}
                            </button>
                          </td>
                          <td className="py-4 text-right text-slate-300">
                            {project.daysRemaining}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-5">
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
                  <table className="w-full min-w-[640px] text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        <th className="pb-3 pr-2">Project</th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">
                          Contract
                        </th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">
                          Est. Cost
                        </th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">
                          Actual
                        </th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">
                          Proj. Final
                        </th>
                        <th className="pb-3 px-2 text-right whitespace-nowrap">
                          Margin
                        </th>
                        <th className="pb-3 pl-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobProfitability.map((job) => (
                        <tr
                          key={job.id}
                          className={clsx(
                            "border-b border-white/[0.04] last:border-b-0 transition-opacity duration-300",
                            hasAnyFilter && !jobMatches(job) && "opacity-20"
                          )}
                        >
                          <td className="py-3 pr-2">
                            <button
                              onClick={() =>
                                toggleFilter("project", job.project)
                              }
                              className="cursor-pointer text-left font-medium text-slate-100 transition-colors hover:text-accent-300"
                            >
                              {job.project}
                            </button>
                          </td>
                          <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300">
                            ${job.contractValue.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300">
                            ${job.estimatedCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300">
                            ${job.actualCostToDate.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right whitespace-nowrap text-slate-300">
                            ${job.projectedFinalCost.toLocaleString()}
                          </td>
                          <td
                            className={clsx(
                              "py-3 px-2 text-right whitespace-nowrap font-semibold",
                              job.status === "healthy" && "text-emerald-400",
                              job.status === "watch" && "text-accent-300",
                              job.status === "eroding" && "text-red-400"
                            )}
                          >
                            {job.estimatedMargin}%
                          </td>
                          <td className="py-3 pl-2">
                            <button
                              onClick={() =>
                                toggleFilter("profitStatus", job.status)
                              }
                              className={clsx(
                                "inline-flex cursor-pointer rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] transition-all hover:ring-1 hover:ring-white/20",
                                profitStatusBadge[job.status]
                              )}
                            >
                              {job.status}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                    Healthy (≥18%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent-400" />{" "}
                    Watch (14-18%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />{" "}
                    Eroding (&lt;14%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-5">
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
                        key={note}
                        className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-sm leading-6 text-slate-200"
                      >
                        {note}
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
        </div>
      </div>
    </div>
  );
}
