"use client";

import { useState } from "react";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface SHDonutChartProps {
  segments: Segment[];
  size?: number;
  thickness?: number;
  onSegmentClick?: (label: string) => void;
}

export default function SHDonutChart({ segments, size = 140, thickness = 20, onSegmentClick }: SHDonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;
  const gapAngle = 0.02; // small gap between segments

  let offset = 0;
  const arcs = segments.map((seg, i) => {
    const pct = seg.value / total;
    const dash = Math.max(0, pct * circumference - gapAngle * circumference);
    const gap = circumference - dash;
    const arc = { ...seg, dash, gap, offset, pct, index: i };
    offset += pct * circumference;
    return arc;
  });

  const hoveredSeg = hovered !== null ? segments[hovered] : null;

  return (
    <div className="sh-donut-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 0 12px rgba(20, 184, 166, 0.15))" }}>
        <defs>
          {segments.map((seg, i) => (
            <linearGradient key={i} id={`donut-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={seg.color} stopOpacity="1" />
              <stop offset="100%" stopColor={seg.color} stopOpacity="0.65" />
            </linearGradient>
          ))}
          <filter id="donut-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={center} cy={center} r={r}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={thickness}
        />

        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={center} cy={center} r={r}
            fill="none"
            stroke={`url(#donut-grad-${i})`}
            strokeWidth={hovered === i ? thickness + 4 : thickness}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            filter={hovered === i ? "url(#donut-glow)" : undefined}
            style={{
              cursor: onSegmentClick ? "pointer" : "default",
              transition: "stroke-width 0.2s, opacity 0.2s",
              opacity: hovered !== null && hovered !== i ? 0.4 : 1,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={onSegmentClick ? () => onSegmentClick(arc.label) : undefined}
          />
        ))}

        {/* Center text */}
        <text x={center} y={center - 6} className="sh-donut-center" style={{ fontSize: hoveredSeg ? 14 : 18 }}>
          {hoveredSeg ? hoveredSeg.value : total}
        </text>
        <text x={center} y={center + 10} textAnchor="middle" style={{ fontSize: 9, fill: "var(--sh-text-muted)", fontWeight: 500 }}>
          {hoveredSeg ? hoveredSeg.label : "total"}
        </text>
      </svg>

      <div className="sh-donut-legend">
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            className="sh-donut-legend-item"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={onSegmentClick ? () => onSegmentClick(seg.label) : undefined}
            style={{ opacity: hovered !== null && hovered !== i ? 0.5 : 1, transition: "opacity 0.15s" }}
          >
            <span
              className="sh-donut-legend-swatch"
              style={{
                background: `linear-gradient(135deg, ${seg.color}, ${seg.color}99)`,
                boxShadow: hovered === i ? `0 0 8px ${seg.color}66` : "none",
              }}
            />
            <span>{seg.label}</span>
            <span className="sh-donut-legend-value">
              {seg.value}
              <span style={{ fontSize: 9, color: "var(--sh-text-muted)", marginLeft: 3 }}>
                {Math.round((seg.value / total) * 100)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
