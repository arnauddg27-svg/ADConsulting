"use client";

import { useState } from "react";
import { SECTIONS, jobs, fmt$, fmtN } from "@/lib/sunshine-homes-data";
import type { SHTab, SHSection } from "@/types/sunshine-homes";

interface RailNavProps {
  activeTab: SHTab;
  onTabChange: (tab: SHTab) => void;
}

export default function RailNav({ activeTab, onTabChange }: RailNavProps) {
  /* find which section the active tab belongs to */
  const activeSection = SECTIONS.find(s => s.tabs.some(t => t.id === activeTab))?.id;

  const [expanded, setExpanded] = useState<Record<SHSection, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of SECTIONS) init[s.id] = s.id === activeSection;
    return init as Record<SHSection, boolean>;
  });

  const toggle = (id: SHSection) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  /* summary stats */
  const totalJobs = jobs.length;
  const totalWip = jobs.reduce((s, j) => s + j.wipBalance, 0);
  const avgCompletion = jobs.reduce((s, j) => s + j.completionPct, 0) / jobs.length;

  return (
    <nav className="sh-rail">
      <div className="sh-rail-sections">
        {SECTIONS.map(section => (
          <div key={section.id} className="sh-rail-section">
            <button
              className="sh-rail-section-header"
              onClick={() => toggle(section.id)}
            >
              <span>{section.label}</span>
              <span className={`sh-rail-chevron ${expanded[section.id] ? "open" : ""}`}>
                ▾
              </span>
            </button>

            {expanded[section.id] && (
              <div className="sh-rail-tabs">
                {section.tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`sh-rail-tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sh-rail-stats">
        <div className="sh-rail-stat">
          <span className="sh-rail-stat-label">Total Jobs</span>
          <span className="sh-rail-stat-value">{fmtN(totalJobs)}</span>
        </div>
        <div className="sh-rail-stat">
          <span className="sh-rail-stat-label">Total WIP</span>
          <span className="sh-rail-stat-value">{fmt$(totalWip)}</span>
        </div>
        <div className="sh-rail-stat">
          <span className="sh-rail-stat-label">Avg Completion</span>
          <span className="sh-rail-stat-value">{avgCompletion.toFixed(0)}%</span>
        </div>
      </div>
    </nav>
  );
}
