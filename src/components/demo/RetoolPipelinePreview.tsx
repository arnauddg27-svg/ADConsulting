"use client";

import { useState } from "react";
import { clsx } from "clsx";

/* ─── Same pipeline data as ConstructionPipeline ─── */
const stages = [
  "Site Work", "Foundation", "Framing", "Rough-In",
  "Insul / Drywall", "Finishes", "Punch / CO", "Closing",
] as const;

interface Job {
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

const jobs: Job[] = [
  { id: "LR-042", lot: "Lot 42", community: "Lakewood Reserve", plan: "Avalon 1983", super: "T. Reeves", stage: "Framing", pct: 45, estClose: "Jun 2026", idle: 8 },
  { id: "LR-043", lot: "Lot 43", community: "Lakewood Reserve", plan: "Harmon 1787", super: "T. Reeves", stage: "Rough-In", pct: 52, estClose: "May 2026", idle: 3 },
  { id: "CC-008", lot: "Unit 8", community: "Cypress Creek", plan: "Seville 2306", super: "D. Castillo", stage: "Insul / Drywall", pct: 62, estClose: "Apr 2026", idle: 5 },
  { id: "CC-009", lot: "Unit 9", community: "Cypress Creek", plan: "Harmon 1787", super: "D. Castillo", stage: "Framing", pct: 38, estClose: "Jun 2026", idle: 22 },
  { id: "PH-017", lot: "Lot 17", community: "Pine Hills", plan: "Avalon 1983", super: "K. Nguyen", stage: "Foundation", pct: 15, estClose: "Aug 2026", idle: 14 },
  { id: "WG-005", lot: "5A", community: "Winter Garden Estates", plan: "Seville 2306", super: "T. Reeves", stage: "Finishes", pct: 85, estClose: "Mar 2026", idle: 4 },
  { id: "WG-006", lot: "5B", community: "Winter Garden Estates", plan: "Avalon 1983", super: "T. Reeves", stage: "Punch / CO", pct: 96, estClose: "Mar 2026", idle: 1 },
  { id: "CH-003", lot: "Lot 3", community: "Clermont Heights", plan: "Harmon 1787", super: "D. Castillo", stage: "Insul / Drywall", pct: 58, estClose: "May 2026", idle: 18 },
];

export default function RetoolPipelinePreview() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filtered = jobs.filter((j) => {
    if (search && !j.id.toLowerCase().includes(search.toLowerCase()) && !j.community.toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter && j.stage !== stageFilter) return false;
    return true;
  });

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
              Construction Pipeline
            </div>
            <div className="text-[0.65rem] text-[#94a3b8]">
              {filtered.length} of {jobs.length} jobs
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
          <button className="rounded bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1d4ed8]">
            + Add Job
          </button>
        </div>
      </div>

      {/* Toolbar / filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5">
        <input
          type="text"
          placeholder="Search jobs or communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#334155] placeholder-[#94a3b8] outline-none transition-colors focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/30"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#334155] outline-none transition-colors focus:border-[#2563eb]"
        >
          <option value="">All Stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {(search || stageFilter) && (
          <button
            onClick={() => { setSearch(""); setStageFilter(""); }}
            className="text-xs text-[#2563eb] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
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
            {filtered.map((job) => (
              <tr
                key={job.id}
                className={clsx(
                  "border-b border-[#f1f5f9] transition-colors",
                  selectedRows.has(job.id)
                    ? "bg-[#eff6ff]"
                    : "hover:bg-[#f8fafc]"
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
                <td className="px-3 py-2.5 text-[#334155]">
                  {job.community}
                  <span className="ml-1 text-[#94a3b8]">· {job.lot}</span>
                </td>
                <td className="px-3 py-2.5 text-[#64748b]">{job.plan}</td>
                <td className="px-3 py-2.5 text-[#64748b]">{job.super}</td>
                <td className="px-3 py-2.5">
                  <span className={clsx(
                    "inline-block rounded-full px-2 py-0.5 text-[0.62rem] font-medium",
                    job.stage === "Finishes" || job.stage === "Punch / CO" || job.stage === "Closing"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : job.stage === "Foundation" || job.stage === "Site Work"
                        ? "bg-[#f1f5f9] text-[#475569]"
                        : "bg-[#dbeafe] text-[#1e40af]"
                  )}>
                    {job.stage}
                  </span>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-xs text-[#64748b]">
        <span>
          {selectedRows.size > 0
            ? `${selectedRows.size} row${selectedRows.size !== 1 ? "s" : ""} selected`
            : `Showing ${filtered.length} of ${jobs.length} jobs`}
        </span>
        <div className="flex items-center gap-1">
          <button className="rounded border border-[#e2e8f0] bg-white px-2.5 py-1 text-[#94a3b8]">
            ← Prev
          </button>
          <span className="px-2 font-medium text-[#334155]">Page 1 of 1</span>
          <button className="rounded border border-[#e2e8f0] bg-white px-2.5 py-1 text-[#94a3b8]">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
