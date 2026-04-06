"use client";

import type { SHDashboardFilters } from "@/types/sunshine-homes";

interface SHBreadcrumbProps {
  filters: SHDashboardFilters;
  onClear: (key: keyof SHDashboardFilters) => void;
  onClearAll: () => void;
}

interface Crumb {
  key: keyof SHDashboardFilters;
  label: string;
  value: string;
  color: string;
}

export default function SHBreadcrumb({ filters, onClear, onClearAll }: SHBreadcrumbProps) {
  const crumbs: Crumb[] = [];

  if (filters.city) crumbs.push({ key: "city", label: "City", value: filters.city, color: "#ef8c3b" });
  if (filters.entity) crumbs.push({ key: "entity", label: "Entity", value: filters.entity, color: "#8b5cf6" });
  if (filters.community) crumbs.push({ key: "community", label: "Community", value: filters.community, color: "#14b8a6" });
  if (filters.stage) crumbs.push({ key: "stage", label: "Stage", value: filters.stage, color: "#3b82f6" });
  if (filters.timePeriod !== "all") crumbs.push({ key: "timePeriod", label: "Period", value: filters.timePeriod === "month" ? "This Month" : filters.timePeriod === "quarter" ? "This Quarter" : "This Year", color: "#6b7280" });

  if (crumbs.length === 0) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 16px",
      fontSize: 11,
      color: "var(--sh-text-muted)",
      borderBottom: "1px solid var(--sh-border)",
      background: "rgba(255,255,255,0.01)",
      flexWrap: "wrap",
    }}>
      <button
        onClick={onClearAll}
        style={{
          background: "none",
          border: "none",
          color: "var(--sh-text-secondary)",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 4px",
          borderRadius: 3,
        }}
      >
        All Data
      </button>

      {crumbs.map((crumb, i) => (
        <span key={crumb.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: "var(--sh-text-muted)", opacity: 0.4 }}>›</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 4,
              background: `${crumb.color}15`,
              border: `1px solid ${crumb.color}30`,
              color: crumb.color,
              fontWeight: 600,
              fontSize: 10,
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: "var(--sh-text-muted)", fontWeight: 400, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {crumb.label}:
            </span>
            {crumb.value}
            <button
              onClick={(e) => { e.stopPropagation(); onClear(crumb.key); }}
              style={{
                background: "none",
                border: "none",
                color: crumb.color,
                cursor: "pointer",
                fontSize: 10,
                padding: "0 1px",
                opacity: 0.7,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </span>
        </span>
      ))}
    </div>
  );
}
