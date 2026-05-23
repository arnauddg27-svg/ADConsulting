"use client";

import { SECTIONS } from "@/lib/sunshine-homes-data";
import type { SHTab } from "@/types/sunshine-homes";

interface MobileNavProps {
  activeTab: SHTab;
  onTabChange: (tab: SHTab) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  filterCount: number;
}

/**
 * Mobile dashboard navigation. On desktop the left RailNav handles section/tab
 * switching, but it's hidden below 1024px, leaving no way to change dashboards.
 * This renders the section + view switcher the mobile CSS was built for:
 *  - 769–1024px (tablet): scrollable chip rows
 *  - ≤768px (phone): compact <select> dropdowns + a filter toggle
 * CSS in sunshine-tokens.css decides which layout shows per breakpoint; this
 * component renders both so dashboard selection works on every screen.
 */
export default function MobileNav({
  activeTab,
  onTabChange,
  filtersOpen,
  onToggleFilters,
  filterCount,
}: MobileNavProps) {
  const activeSection =
    SECTIONS.find((s) => s.tabs.some((t) => t.id === activeTab)) ?? SECTIONS[0];

  // Switching section jumps to that section's first tab (its dashboard view).
  const pickSection = (id: string) => {
    const section = SECTIONS.find((s) => s.id === id);
    if (section && section.id !== activeSection.id) {
      onTabChange(section.tabs[0].id);
    }
  };

  const filterLabel = filtersOpen
    ? "Hide filters"
    : filterCount > 0
      ? `Filters · ${filterCount}`
      : "Filters";

  return (
    <div className="sh-mobile-nav">
      {/* Tablet: scrollable chip rows */}
      <div className="sh-mobile-section-row" role="group" aria-label="Dashboard section">
        {SECTIONS.map((s) => {
          const active = s.id === activeSection.id;
          return (
            <button
              key={s.id}
              type="button"
              aria-current={active ? "true" : undefined}
              className={`sh-mobile-section ${active ? "active" : ""}`}
              onClick={() => pickSection(s.id)}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="sh-mobile-tab-row" role="group" aria-label="View">
        {activeSection.tabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              aria-current={active ? "true" : undefined}
              className={`sh-mobile-tab ${active ? "active" : ""}`}
              onClick={() => onTabChange(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Phone: compact selects */}
      <select
        className="sh-mobile-section-select"
        aria-label="Dashboard section"
        value={activeSection.id}
        onChange={(e) => pickSection(e.target.value)}
      >
        {SECTIONS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        className="sh-mobile-tab-select"
        aria-label="View"
        value={activeTab}
        onChange={(e) => onTabChange(e.target.value as SHTab)}
      >
        {activeSection.tabs.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        className={`sh-mobile-filter-toggle ${filtersOpen || filterCount > 0 ? "active" : ""}`}
        aria-expanded={filtersOpen}
        aria-controls="sh-filter-bar"
        onClick={onToggleFilters}
      >
        {filterLabel}
      </button>
    </div>
  );
}
