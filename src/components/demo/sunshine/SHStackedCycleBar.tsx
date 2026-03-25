"use client";

import { useState } from "react";

interface PhaseData {
  phase: string;
  days: number;
  color: string;
}

interface CityRow {
  city: string;
  phases: PhaseData[];
  total: number;
  jobCount: number;
}

interface SHStackedCycleBarProps {
  cities: CityRow[];
  onPhaseClick?: (city: string, phase: string) => void;
}

export default function SHStackedCycleBar({ cities, onPhaseClick }: SHStackedCycleBarProps) {
  const [hovered, setHovered] = useState<{ city: number; phase: number } | null>(null);

  if (cities.length === 0) return null;

  const maxTotal = Math.max(...cities.map(c => c.total));

  // Collect unique phases for legend
  const phaseMap = new Map<string, string>();
  cities.forEach(c => c.phases.forEach(p => { if (!phaseMap.has(p.phase)) phaseMap.set(p.phase, p.color); }));
  const legendItems = Array.from(phaseMap.entries());

  return (
    <div className="sh-stacked-cycle">
      {/* Phase legend */}
      <div className="sh-stacked-legend">
        {legendItems.map(([phase, color]) => (
          <div key={phase} className="sh-stacked-legend-item">
            <span className="sh-stacked-legend-swatch" style={{ background: color }} />
            <span>{phase}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="sh-stacked-rows">
        {cities.map((city, ci) => {
          const barPct = maxTotal > 0 ? (city.total / maxTotal) * 100 : 0;
          return (
            <div key={city.city} className="sh-stacked-row">
              {/* City label */}
              <div className="sh-stacked-city">
                <span className="sh-stacked-city-name">{city.city}</span>
                <span className="sh-stacked-city-jobs">{city.jobCount} jobs</span>
              </div>

              {/* Bar container */}
              <div className="sh-stacked-bar-track">
                <div className="sh-stacked-bar" style={{ width: `${barPct}%` }}>
                  {city.phases.map((p, pi) => {
                    const segPct = city.total > 0 ? (p.days / city.total) * 100 : 0;
                    const isHovered = hovered?.city === ci && hovered?.phase === pi;
                    const anyHovered = hovered !== null && hovered.city === ci;
                    const dimmed = anyHovered && !isHovered;
                    return (
                      <div
                        key={p.phase}
                        className="sh-stacked-segment"
                        style={{
                          width: `${segPct}%`,
                          background: `linear-gradient(180deg, ${p.color}, ${p.color}88)`,
                          boxShadow: isHovered ? `inset 0 0 20px rgba(255,255,255,0.15), 0 0 10px ${p.color}44` : "none",
                          opacity: dimmed ? 0.4 : 1,
                          cursor: onPhaseClick ? "pointer" : "default",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={() => setHovered({ city: ci, phase: pi })}
                        onMouseLeave={() => setHovered(null)}
                        onClick={onPhaseClick ? () => onPhaseClick(city.city, p.phase) : undefined}
                        title={`${p.phase}: ${p.days}d`}
                      >
                        {segPct >= 10 ? `${p.days}` : ""}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="sh-stacked-total">{city.total}d</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
