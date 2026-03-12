"use client";

import { useState } from "react";
import { clsx } from "clsx";
import {
  Shovel,
  Hammer,
  Zap,
  Paintbrush,
  ClipboardCheck,
  KeyRound,
  ChevronRight,
} from "lucide-react";

/* ─── Pipeline stage definitions ─── */
const stages = [
  { id: "site-work", label: "Site Work", pct: "10%", icon: <Shovel size={16} />, color: "#475569" },
  { id: "foundation", label: "Foundation", pct: "20%", icon: <Shovel size={16} />, color: "#64748b" },
  { id: "framing", label: "Framing", pct: "35%", icon: <Hammer size={16} />, color: "#818cf8" },
  { id: "rough-in", label: "Rough-In", pct: "50%", icon: <Zap size={16} />, color: "#38bdf8" },
  { id: "insulation-drywall", label: "Insul / Drywall", pct: "60%", icon: <Paintbrush size={16} />, color: "#a78bfa" },
  { id: "finishes", label: "Finishes", pct: "80%", icon: <Paintbrush size={16} />, color: "#34d399" },
  { id: "punch-co", label: "Punch / CO", pct: "95%", icon: <ClipboardCheck size={16} />, color: "#10b981" },
  { id: "closing", label: "Closing", pct: "100%", icon: <KeyRound size={16} />, color: "#059669" },
] as const;

type StageId = (typeof stages)[number]["id"];

interface PipelineJob {
  id: string;
  lot: string;
  community: string;
  plan: string;
  super: string;
  stage: StageId;
  completionPct: number;
  estCompletion: string;
  daysSinceMilestone: number;
}

const pipelineJobs: PipelineJob[] = [
  { id: "LR-042", lot: "Lot 42", community: "Lakewood Reserve", plan: "Brite 1983", super: "J. Smythe", stage: "framing", completionPct: 45, estCompletion: "Jun 2026", daysSinceMilestone: 8 },
  { id: "LR-043", lot: "Lot 43", community: "Lakewood Reserve", plan: "Brite 1787", super: "J. Smythe", stage: "rough-in", completionPct: 52, estCompletion: "May 2026", daysSinceMilestone: 3 },
  { id: "LR-044", lot: "Lot 44", community: "Lakewood Reserve", plan: "Brite 1983", super: "J. Smythe", stage: "site-work", completionPct: 8, estCompletion: "Sep 2026", daysSinceMilestone: 12 },
  { id: "CC-008", lot: "Unit 8", community: "Cypress Creek", plan: "Brite 2306", super: "R. Arroyo", stage: "insulation-drywall", completionPct: 62, estCompletion: "Apr 2026", daysSinceMilestone: 5 },
  { id: "CC-009", lot: "Unit 9", community: "Cypress Creek", plan: "Brite 1787", super: "R. Arroyo", stage: "framing", completionPct: 38, estCompletion: "Jun 2026", daysSinceMilestone: 22 },
  { id: "CC-010", lot: "Unit 10", community: "Cypress Creek", plan: "Brite 1983", super: "R. Arroyo", stage: "foundation", completionPct: 18, estCompletion: "Jul 2026", daysSinceMilestone: 6 },
  { id: "PH-017", lot: "Lot 17", community: "Pine Hills", plan: "Brite 1983", super: "M. Flood", stage: "foundation", completionPct: 15, estCompletion: "Aug 2026", daysSinceMilestone: 14 },
  { id: "PH-018", lot: "Lot 18", community: "Pine Hills", plan: "Brite 1787", super: "M. Flood", stage: "site-work", completionPct: 5, estCompletion: "Oct 2026", daysSinceMilestone: 2 },
  { id: "WG-005", lot: "5A", community: "Winter Garden Estates", plan: "Brite 2306", super: "J. Smythe", stage: "finishes", completionPct: 85, estCompletion: "Mar 2026", daysSinceMilestone: 4 },
  { id: "WG-006", lot: "5B", community: "Winter Garden Estates", plan: "Brite 1983", super: "J. Smythe", stage: "punch-co", completionPct: 96, estCompletion: "Mar 2026", daysSinceMilestone: 1 },
  { id: "CH-003", lot: "Lot 3", community: "Clermont Heights", plan: "Brite 1787", super: "R. Arroyo", stage: "insulation-drywall", completionPct: 58, estCompletion: "May 2026", daysSinceMilestone: 18 },
  { id: "CH-004", lot: "Lot 4", community: "Clermont Heights", plan: "Brite 1983", super: "R. Arroyo", stage: "rough-in", completionPct: 48, estCompletion: "Jun 2026", daysSinceMilestone: 7 },
  { id: "AC-012", lot: "Unit 12", community: "Apopka Crossing", plan: "Brite 1983", super: "M. Flood", stage: "site-work", completionPct: 5, estCompletion: "Nov 2026", daysSinceMilestone: 3 },
  { id: "AC-013", lot: "Unit 13", community: "Apopka Crossing", plan: "Brite 2306", super: "M. Flood", stage: "foundation", completionPct: 20, estCompletion: "Sep 2026", daysSinceMilestone: 9 },
  { id: "WT-009", lot: "Lot 9", community: "Windermere Trails", plan: "Brite 2306", super: "J. Smythe", stage: "finishes", completionPct: 78, estCompletion: "Apr 2026", daysSinceMilestone: 6 },
  { id: "WT-010", lot: "Lot 10", community: "Windermere Trails", plan: "Brite 1787", super: "J. Smythe", stage: "rough-in", completionPct: 50, estCompletion: "Jun 2026", daysSinceMilestone: 4 },
  { id: "LN-003", lot: "Unit 3", community: "Lake Nona Pines", plan: "Brite 1983", super: "M. Flood", stage: "framing", completionPct: 38, estCompletion: "Jul 2026", daysSinceMilestone: 26 },
  { id: "LN-004", lot: "Unit 4", community: "Lake Nona Pines", plan: "Brite 1787", super: "M. Flood", stage: "closing", completionPct: 100, estCompletion: "Mar 2026", daysSinceMilestone: 0 },
];


export default function ConstructionPipeline() {
  const [activeStage, setActiveStage] = useState<StageId | null>(null);

  const jobsByStage = (stageId: StageId) =>
    pipelineJobs.filter((j) => j.stage === stageId);

  const displayJobs = activeStage
    ? pipelineJobs.filter((j) => j.stage === activeStage)
    : pipelineJobs;


  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0f1a] shadow-[0_50px_120px_-60px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0d1321] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-400/30 bg-accent-500/15 text-sm font-semibold text-accent-300">
            AD
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-50">
              Construction Pipeline
            </div>
            <div className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
              {pipelineJobs.length} active jobs · Illustrative data
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em]">
          <span className="badge-dash">{pipelineJobs.length} jobs</span>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Pipeline stages — horizontal flow */}
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[700px] items-stretch gap-1">
            {stages.map((stage, i) => {
              const jobs = jobsByStage(stage.id);
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(isActive ? null : stage.id)}
                  className={clsx(
                    "group relative flex flex-1 flex-col items-center gap-2 rounded-xl px-2 py-4 transition-all",
                    isActive
                      ? "bg-accent-500/15 ring-1 ring-accent-400/40"
                      : "bg-white/[0.02] hover:bg-white/[0.05]",
                    activeStage && !isActive && "opacity-40"
                  )}
                >
                  <div
                    className={clsx(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      isActive ? "bg-accent-500 text-white" : "bg-white/[0.06] text-slate-400 group-hover:text-slate-200"
                    )}
                  >
                    {stage.icon}
                  </div>
                  <div className="text-center">
                    <div className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-slate-300">
                      {stage.label}
                    </div>
                    <div className="text-[0.58rem] text-slate-500">{stage.pct}</div>
                  </div>
                  <div
                    className={clsx(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      jobs.length === 0
                        ? "bg-white/[0.04] text-slate-600"
                        : isActive
                          ? "bg-accent-500 text-white"
                          : "bg-white/[0.08] text-slate-200"
                    )}
                  >
                    {jobs.length}
                  </div>
                  {/* Connector arrow */}
                  {i < stages.length - 1 && (
                    <ChevronRight
                      size={12}
                      className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 text-slate-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter pill */}
        {activeStage && (
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-300">
              Stage: &ldquo;{stages.find((s) => s.id === activeStage)?.label}&rdquo;
              <button
                onClick={() => setActiveStage(null)}
                className="ml-1 rounded-full p-0.5 transition-colors hover:bg-white/10"
                aria-label="Clear stage filter"
              >
                ✕
              </button>
            </span>
            <span className="text-xs text-slate-500">
              {displayJobs.length} job{displayJobs.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Jobs table */}
        <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {activeStage
              ? `Jobs at ${stages.find((s) => s.id === activeStage)?.label}`
              : "All Active Jobs"}
          </h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="pb-3 pr-2">Job</th>
                  <th className="pb-3 px-2">Community</th>
                  <th className="pb-3 px-2">Plan</th>
                  <th className="pb-3 px-2">Super</th>
                  <th className="pb-3 px-2">Stage</th>
                  <th className="pb-3 px-2 text-right whitespace-nowrap">Completion</th>
                  <th className="pb-3 px-2 text-right whitespace-nowrap">Est. Close</th>
                  <th className="pb-3 px-2 text-right whitespace-nowrap">Days Idle</th>
                </tr>
              </thead>
              <tbody>
                {displayJobs.map((job) => {
                  const stage = stages.find((s) => s.id === job.stage);
                  return (
                    <tr key={job.id} className="border-b border-white/[0.04] last:border-b-0">
                      <td className="py-3 pr-2 font-medium text-slate-100">{job.id}</td>
                      <td className="py-3 px-2 text-slate-300">
                        {job.community}
                        <span className="ml-1 text-slate-500">· {job.lot}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-400">{job.plan}</td>
                      <td className="py-3 px-2 text-slate-400">{job.super}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => setActiveStage(activeStage === job.stage ? null : job.stage)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-slate-300 transition-all hover:ring-1 hover:ring-white/20"
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stage?.color }} />
                          {stage?.label}
                        </button>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-white/[0.06]">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${job.completionPct}%`,
                                backgroundColor: stage?.color,
                              }}
                            />
                          </div>
                          <span className="text-slate-400">{job.completionPct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-300 whitespace-nowrap">{job.estCompletion}</td>
                      <td className={clsx(
                        "py-3 px-2 text-right font-medium whitespace-nowrap",
                        job.daysSinceMilestone >= 14 ? "text-red-400" : job.daysSinceMilestone >= 7 ? "text-amber-400" : "text-slate-400"
                      )}>
                        {job.daysSinceMilestone}d
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" /> Days idle &lt; 7</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> 7–13 days</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> 14+ days (stalled)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
