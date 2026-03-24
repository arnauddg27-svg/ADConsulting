"use client";

import { useState } from "react";

interface Phase {
  phase: string;
  days: number;
  color: string;
}

interface SHCycleTimePipelineProps {
  phases: Phase[];
}

export default function SHCycleTimePipeline({ phases }: SHCycleTimePipelineProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = phases.reduce((s, p) => s + p.days, 0);
  if (total === 0) return null;

  return (
    <div>
      {/* Main bar */}
      <div className="sh-cycle-bar" style={{ position: "relative" }}>
        {phases.map((p, i) => {
          const pct = (p.days / total) * 100;
          const isHovered = hovered === i;
          return (
            <div
              key={p.phase}
              className="sh-cycle-segment"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(180deg, ${p.color}, ${p.color}88)`,
                boxShadow: isHovered ? `inset 0 0 20px rgba(255,255,255,0.15), 0 0 12px ${p.color}44` : "none",
                transform: isHovered ? "scaleY(1.15)" : "scaleY(1)",
                transition: "all 0.2s ease",
                position: "relative",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              title={`${p.phase}: ${p.days}d`}
            >
              {pct >= 12 ? `${p.days}d` : ""}
            </div>
          );
        })}
      </div>

      {/* Phase labels below */}
      <div style={{ display: "flex", marginTop: 6 }}>
        {phases.map((p, i) => {
          const pct = (p.days / total) * 100;
          return (
            <div
              key={p.phase}
              style={{
                width: `${pct}%`,
                textAlign: "center",
                fontSize: 9,
                fontWeight: hovered === i ? 700 : 500,
                color: hovered === i ? p.color : "var(--sh-text-muted)",
                transition: "all 0.15s",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                padding: "0 2px",
              }}
            >
              {pct >= 10 ? p.phase : ""}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: "var(--sh-text-muted)", marginTop: 8,
        padding: "6px 0", borderTop: "1px solid var(--sh-border-dim)",
      }}>
        <span>Start</span>
        <span style={{ fontWeight: 700, color: "var(--sh-text-secondary)" }}>
          Total: {total} days
        </span>
        <span>CO</span>
      </div>
    </div>
  );
}
