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
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const months = [
    { value: 1, label: "Jan" }, { value: 2, label: "Feb" }, { value: 3, label: "Mar" },
    { value: 4, label: "Apr" }, { value: 5, label: "May" }, { value: 6, label: "Jun" },
    { value: 7, label: "Jul" }, { value: 8, label: "Aug" }, { value: 9, label: "Sep" },
    { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Dec" },
  ];

  const setYear = (value: string) => {
    const year = value ? Number(value) : null;
    onChange({ ...filters, drillYear: year, drillQuarter: null, drillMonth: null });
  };
  const setQuarter = (value: string) => {
    const quarter = value ? Number(value) : null;
    onChange({ ...filters, drillQuarter: quarter, drillMonth: null });
  };
  const setMonth = (value: string) => {
    const month = value ? Number(value) : null;
    onChange({ ...filters, drillMonth: month });
  };

  const hasAny = filters.city || filters.entity || filters.community || filters.stage || filters.status || filters.drillYear || filters.drillQuarter || filters.drillMonth || filters.timePeriod !== "all";

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

      <select
        className={`sh-filter-select ${filters.drillYear ? "active" : ""}`}
        value={filters.drillYear ?? ""}
        onChange={e => setYear(e.target.value)}
      >
        <option value="">All Years</option>
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <select
        className={`sh-filter-select ${filters.drillQuarter ? "active" : ""}`}
        value={filters.drillQuarter ?? ""}
        onChange={e => setQuarter(e.target.value)}
      >
        <option value="">All Quarters</option>
        <option value="1">Q1</option>
        <option value="2">Q2</option>
        <option value="3">Q3</option>
        <option value="4">Q4</option>
      </select>

      <select
        className={`sh-filter-select ${filters.drillMonth ? "active" : ""}`}
        value={filters.drillMonth ?? ""}
        onChange={e => setMonth(e.target.value)}
      >
        <option value="">All Months</option>
        {months.map((month) => (
          <option key={month.value} value={month.value}>{month.label}</option>
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
          <button onClick={() => onChange({ ...filters, drillQuarter: null, drillMonth: null })}>✕</button>
        </span>
      )}

      {filters.drillMonth && (
        <span className="sh-filter-chip" style={{ borderColor: "#8b5cf633", background: "#8b5cf610" }}>
          {new Date(2000, filters.drillMonth - 1).toLocaleString("en-US", { month: "short" })}
          <button onClick={() => onChange({ ...filters, drillMonth: null })}>✕</button>
        </span>
      )}

      {hasAny && (
        <button
          className="sh-filter-clear"
          onClick={() => onChange({ city: null, jobType: null, entity: null, community: null, stage: null, status: null, drillYear: null, drillQuarter: null, drillMonth: null, timePeriod: "all" })}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
