"use client";

import { useState } from "react";

interface DataPoint {
  label: string;
  value: number;
  value2?: number;
}

interface SHAreaChartProps {
  data: DataPoint[];
  color?: string;
  color2?: string;
  label1?: string;
  label2?: string;
  formatY?: (v: number) => string;
  height?: number;
  onPointClick?: (label: string) => void;
}

export default function SHAreaChart({
  data, color = "#14b8a6", color2 = "#3b82f6",
  label1 = "Actual", label2 = "Planned",
  formatY, height = 160, onPointClick,
}: SHAreaChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const allValues = data.flatMap(d => [d.value, d.value2 ?? 0]);
  const maxV = Math.max(...allValues);
  const minV = Math.min(...allValues.filter(v => v > 0));
  const range = maxV - minV || 1;

  const padX = 40, padT = 10, padB = 24;
  const w = 500, h = height;
  const chartW = w - padX;
  const chartH = h - padT - padB;

  const toX = (i: number) => padX + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => padT + chartH - ((v - minV) / range) * chartH;

  const makePath = (key: "value" | "value2") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d[key] ?? 0)}`).join(" ");

  const makeArea = (key: "value" | "value2") =>
    `${makePath(key)} L${toX(data.length - 1)},${h - padB} L${padX},${h - padB} Z`;

  const hasSecondLine = data.some(d => d.value2 !== undefined);
  const yTicks = 5;
  const step = range / (yTicks - 1);

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
          <linearGradient id="area-grad-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          {hasSecondLine && (
            <linearGradient id="area-grad-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color2} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color2} stopOpacity="0.02" />
            </linearGradient>
          )}
        </defs>

        {/* Grid lines */}
        {Array.from({ length: yTicks }).map((_, i) => {
          const val = minV + step * i;
          const y = toY(val);
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={padX - 4} y={y + 3} textAnchor="end" fill="var(--sh-text-muted)" fontSize="8" fontWeight="500">
                {formatY ? formatY(val) : Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Second line (behind) */}
        {hasSecondLine && (
          <>
            <path d={makeArea("value2")} fill="url(#area-grad-2)" />
            <path d={makePath("value2")} fill="none" stroke={color2} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
          </>
        )}

        {/* Primary area + line */}
        <path d={makeArea("value")} fill="url(#area-grad-1)" />
        <path d={makePath("value")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={toX(i)} cy={toY(d.value)}
            r={hovered === i ? 4 : 2}
            fill={color}
            stroke="var(--sh-bg-shell)"
            strokeWidth="1.5"
            style={{ transition: "r 0.15s", cursor: onPointClick ? "pointer" : "default" }}
            onMouseEnter={() => setHovered(i)}
            onClick={onPointClick ? () => onPointClick(d.label) : undefined}
          />
        ))}

        {/* Hover line */}
        {hovered !== null && (
          <line
            x1={toX(hovered)} y1={padT} x2={toX(hovered)} y2={h - padB}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2"
          />
        )}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={toX(i)} y={h - 6}
            textAnchor="middle" fill="var(--sh-text-muted)" fontSize="8" fontWeight="500"
          >
            {d.label}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered !== null && (
        <div style={{
          position: "absolute",
          left: `${(hovered / (data.length - 1)) * 100}%`,
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
          <div style={{ fontWeight: 700 }}>{data[hovered].label}</div>
          <div style={{ color }}>{label1}: {formatY ? formatY(data[hovered].value) : data[hovered].value}</div>
          {data[hovered].value2 !== undefined && (
            <div style={{ color: color2 }}>{label2}: {formatY ? formatY(data[hovered].value2!) : data[hovered].value2}</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--sh-text-secondary)" }}>
          <div style={{ width: 12, height: 3, borderRadius: 2, background: color }} />
          {label1}
        </div>
        {hasSecondLine && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--sh-text-secondary)" }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: color2, opacity: 0.6 }} />
            {label2}
          </div>
        )}
      </div>
    </div>
  );
}
