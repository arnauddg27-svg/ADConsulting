"use client";

import { useState } from "react";

interface DataPoint {
  x: string;
  y: number;
}

interface LineConfig {
  label: string;
  color: string;
  data: DataPoint[];
}

interface SHMultiLineChartProps {
  lines: LineConfig[];
  goalLine?: number;
  height?: number;
  formatY?: (v: number) => string;
  onPointClick?: (lineLabel: string, x: string, y: number) => void;
}

export default function SHMultiLineChart({
  lines,
  goalLine,
  height = 180,
  formatY,
  onPointClick,
}: SHMultiLineChartProps) {
  const [hovered, setHovered] = useState<{ line: number; point: number } | null>(null);

  if (lines.length === 0 || lines[0].data.length === 0) return null;

  // Compute bounds across all lines
  const allY = lines.flatMap(l => l.data.map(d => d.y));
  if (goalLine !== undefined) allY.push(goalLine);
  const maxY = Math.max(...allY);
  const minY = Math.min(...allY);
  const rangeY = maxY - minY || 1;
  const xLabels = lines[0].data.map(d => d.x);
  const pointCount = xLabels.length;

  const padL = 44, padR = 16, padT = 16, padB = 28;
  const w = 520, h = height;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const toX = (i: number) => padL + (pointCount > 1 ? (i / (pointCount - 1)) * chartW : chartW / 2);
  const toY = (v: number) => padT + chartH - ((v - minY) / rangeY) * chartH;

  const makePath = (data: DataPoint[]) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.y)}`).join(" ");

  const makeArea = (data: DataPoint[]) =>
    `${makePath(data)} L${toX(data.length - 1)},${padT + chartH} L${padL},${padT + chartH} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yStep = rangeY / (yTicks - 1);
  const fmtY = formatY || ((v: number) => String(Math.round(v)));

  return (
    <div style={{ position: "relative" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHovered(null)}
        style={{ display: "block" }}
      >
        <defs>
          {lines.map((line, li) => (
            <linearGradient key={li} id={`ml-grad-${li}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={line.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
          <filter id="ml-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines + Y labels */}
        {Array.from({ length: yTicks }).map((_, i) => {
          const val = minY + yStep * i;
          const y = toY(val);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fill="var(--sh-text-muted)" fontSize="8" fontWeight="500">
                {fmtY(val)}
              </text>
            </g>
          );
        })}

        {/* Goal line */}
        {goalLine !== undefined && (
          <g>
            <line
              x1={padL} y1={toY(goalLine)} x2={w - padR} y2={toY(goalLine)}
              stroke="var(--sh-warning)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7"
            />
            <text
              x={w - padR + 4} y={toY(goalLine) + 3}
              fill="var(--sh-warning)" fontSize="8" fontWeight="600"
            >
              Goal {fmtY(goalLine)}
            </text>
          </g>
        )}

        {/* Area fills (behind lines) */}
        {lines.map((line, li) => (
          <path key={`area-${li}`} d={makeArea(line.data)} fill={`url(#ml-grad-${li})`} />
        ))}

        {/* Lines */}
        {lines.map((line, li) => (
          <path
            key={`line-${li}`}
            d={makePath(line.data)}
            fill="none"
            stroke={line.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 4px ${line.color}55)` }}
          />
        ))}

        {/* Data points + labels */}
        {lines.map((line, li) =>
          line.data.map((d, pi) => {
            const isHovered = hovered?.line === li && hovered?.point === pi;
            return (
              <g key={`pt-${li}-${pi}`}>
                {/* Data label above point */}
                <text
                  x={toX(pi)} y={toY(d.y) - 8}
                  textAnchor="middle" fill={line.color} fontSize="8" fontWeight="600"
                  opacity={isHovered ? 1 : 0.7}
                >
                  {fmtY(d.y)}
                </text>
                {/* Point dot */}
                <circle
                  cx={toX(pi)} cy={toY(d.y)}
                  r={isHovered ? 5 : 3}
                  fill={line.color}
                  stroke="var(--sh-bg-shell)"
                  strokeWidth="1.5"
                  filter={isHovered ? "url(#ml-glow)" : undefined}
                  style={{ transition: "r 0.15s", cursor: onPointClick ? "pointer" : "default" }}
                  onMouseEnter={() => setHovered({ line: li, point: pi })}
                  onClick={onPointClick ? () => onPointClick(line.label, d.x, d.y) : undefined}
                />
              </g>
            );
          })
        )}

        {/* Hover crosshair */}
        {hovered !== null && (
          <line
            x1={toX(hovered.point)} y1={padT}
            x2={toX(hovered.point)} y2={padT + chartH}
            stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 2"
          />
        )}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={toX(i)} y={h - 6}
            textAnchor="middle" fill="var(--sh-text-muted)" fontSize="8" fontWeight="500"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered !== null && (() => {
        const pt = lines[hovered.line].data[hovered.point];
        return (
          <div style={{
            position: "absolute",
            left: `${((toX(hovered.point)) / w) * 100}%`,
            top: 0,
            transform: "translateX(-50%)",
            background: "var(--sh-bg-surface-raised)",
            border: "1px solid var(--sh-border)",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 10,
            color: "var(--sh-text-primary)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            zIndex: 10,
          }}>
            <div style={{ fontWeight: 700 }}>{pt.x}</div>
            <div style={{ color: lines[hovered.line].color }}>
              {lines[hovered.line].label}: {fmtY(pt.y)}
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
        {lines.map((line, li) => (
          <div key={li} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--sh-text-secondary)" }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: line.color }} />
            {line.label}
          </div>
        ))}
        {goalLine !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--sh-text-secondary)" }}>
            <div style={{ width: 12, height: 0, borderTop: "2px dashed var(--sh-warning)", opacity: 0.7 }} />
            Goal
          </div>
        )}
      </div>
    </div>
  );
}
