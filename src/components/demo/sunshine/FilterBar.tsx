"use client";

import { CITIES, ENTITIES } from "@/lib/sunshine-homes-data";
import type { SHDashboardFilters } from "@/types/sunshine-homes";

interface FilterBarProps {
  filters: SHDashboardFilters;
  onChange: (filters: SHDashboardFilters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = (key: keyof SHDashboardFilters, value: string | null) =>
    onChange({ ...filters, [key]: value });

  const hasAny = Object.values(filters).some(v => v !== null);

  return (
    <div className="sh-filter-bar">
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

      {hasAny && (
        <button
          className="sh-filter-clear"
          onClick={() => onChange({ city: null, jobType: null, entity: null, community: null })}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
