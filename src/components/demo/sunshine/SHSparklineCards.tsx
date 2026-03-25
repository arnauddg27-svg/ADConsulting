"use client";

import { useState } from "react";

interface SparklineCard {
  label: string;
  current: number;
  goal: number;
  data: number[];
  status: "on-track" | "at-risk" | "behind";
  unit?: string;
}

interface SHSparklineCardsProps {
  cards: SparklineCard[];
  onCardClick?: (label: string) => void;
  columns?: number;
}

const statusConfig = {
  "on-track": { label: "On Track", color: "var(--sh-accent)", bg: "var(--sh-accent-dim)", border: "rgba(36, 193, 141, 0.2)", sparkColor: "#24c18d" },
  "at-risk":  { label: "At Risk",  color: "var(--sh-warning)", bg: "var(--sh-warning-dim)", border: "rgba(239, 181, 98, 0.2)", sparkColor: "#efb562" },
  "behind":   { label: "Behind",   color: "var(--sh-danger)",  bg: "var(--sh-danger-dim)",  border: "rgba(244, 106, 106, 0.2)", sparkColor: "#f46a6a" },
};

function MiniSparkline({ data, color, width = 100, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (height - pad * 2) - ((v - min) / range) * (height - pad * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${height - pad} L${points[0].x},${height - pad} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill={color}
        stroke="var(--sh-bg-surface)"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function SHSparklineCards({ cards, onCardClick, columns = 2 }: SHSparklineCardsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (cards.length === 0) return null;

  return (
    <div
      className="sh-sparkline-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {cards.map((card, i) => {
        const cfg = statusConfig[card.status];
        const isHovered = hoveredIdx === i;
        const pct = card.goal > 0 ? Math.round((card.current / card.goal) * 100) : 0;
        const unit = card.unit || "d";

        return (
          <div
            key={card.label}
            className="sh-sparkline-card"
            style={{
              cursor: onCardClick ? "pointer" : "default",
              transform: isHovered ? "translateY(-1px)" : "none",
              boxShadow: isHovered ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
              borderColor: isHovered ? "rgba(36, 193, 141, 0.2)" : undefined,
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={onCardClick ? () => onCardClick(card.label) : undefined}
          >
            {/* Header row */}
            <div className="sh-sparkline-card-header">
              <span className="sh-sparkline-card-label">{card.label}</span>
              <span
                className="sh-sparkline-card-badge"
                style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
              >
                {cfg.label}
              </span>
            </div>

            {/* Values */}
            <div className="sh-sparkline-card-values">
              <span className="sh-sparkline-card-current" style={{ color: cfg.color }}>
                {card.current}{unit}
              </span>
              <span className="sh-sparkline-card-goal">
                / {card.goal}{unit} goal
              </span>
              <span className="sh-sparkline-card-pct" style={{ color: cfg.color }}>
                {pct}%
              </span>
            </div>

            {/* Sparkline */}
            <div className="sh-sparkline-card-chart">
              <MiniSparkline data={card.data} color={cfg.sparkColor} width={140} height={28} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
