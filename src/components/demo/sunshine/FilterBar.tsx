"use client";

import { CITIES, ENTITIES } from "@/lib/sunshine-homes-data";
import type { SHDashboardFilters, SHTimePeriod } from "@/types/sunshine-homes";

interface FilterBarProps {
  filters: SHDashboardFilters;
  onChange: (filters: SHDashboardFilters) => void;
}

const TIME_PERIODS: { value: SHTimePeriod; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = (key: keyof SHDashboardFilters, value: string | null) =>
    onChange({ ...filters, [key]: value });

  const hasAny = filters.city || filters.entity || filters.community || filters.stage || filters.status || filters.drillYear || filters.drillQuarter || filters.timePeriod !== "all";

  return (
    <div className="sh-filter-bar">
      {/* Time period toggle */}
      <div className="sh-time-toggle">
        {TIME_PERIODS.map(tp => (
          <button
            key={tp.value}
            className={`sh-time-btn ${filters.timePeriod === tp.value ? "active" : ""}`}
            onClick={() => onChange({ ...filters, timePeriod: tp.value })}
          >
            {tp.label}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: "var(--sh-border)", flexShrink: 0 }} />

      <select
        className={`sh-filter-select ${filters.city ? "active" : ""}`}
        value={filters.city ?? ""}
        onChange={e => set("city", e.target.value || null)}
      >
        <option value="">All Cities</option>
        {CITIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className={`sh-filter-select ${filters.entity ? "active" : ""}`}
        value={filters.entity ?? ""}
        onChange={e => set("entity", e.target.value || null)}
      >
        <option value="">All Entities</option>
        {ENTITIES.map(e => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>

      {filters.community && (
        <span className="sh-filter-chip">
          {filters.community}
          <button onClick={() => set("community", null)}>✕</button>
        </span>
      )}

      {filters.stage && (
        <span className="sh-filter-chip" style={{ borderColor: "#3b82f633", background: "#3b82f610" }}>
          {filters.stage}
          <button onClick={() => set("stage", null)}>✕</button>
        </span>
      )}

      {filters.status && (
        <span className="sh-filter-chip" style={{ borderColor: "#f9731633", background: "#f9731610" }}>
          {filters.status}
          <button onClick={() => onChange({ ...filters, status: null })}>✕</button>
        </span>
      )}

      {filters.drillYear && (
        <span className="sh-filter-chip" style={{ borderColor: "#8b5cf633", background: "#8b5cf610" }}>
          Year: {filters.drillYear}
          <button onClick={() => onChange({ ...filters, drillYear: null, drillQuarter: null })}>✕</button>
        </span>
      )}

      {filters.drillQuarter && (
        <span className="sh-filter-chip" style={{ borderColor: "#8b5cf633", background: "#8b5cf610" }}>
          Q{filters.drillQuarter}
          <button onClick={() => onChange({ ...filters, drillQuarter: null })}>✕</button>
        </span>
      )}

      {hasAny && (
        <button
          className="sh-filter-clear"
          onClick={() => onChange({ city: null, jobType: null, entity: null, community: null, stage: null, status: null, drillYear: null, drillQuarter: null, timePeriod: "all" })}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
