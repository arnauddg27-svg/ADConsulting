"use client";

interface RankedItem {
  label: string;
  value: number;
  target?: number;
  status?: "good" | "watch" | "alert";
}

interface SHRankedBarsProps {
  items: RankedItem[];
  formatValue?: (v: number) => string;
  onBarClick?: (label: string) => void;
  showRank?: boolean;
}

const STATUS_GRADIENTS = {
  good:  "linear-gradient(90deg, #0f766e, #14b8a6, #22d3ee)",
  watch: "linear-gradient(90deg, #92400e, #d97706, #efb562)",
  alert: "linear-gradient(90deg, #991b1b, #dc2626, #f87171)",
};

const DEFAULT_GRADIENTS = [
  "linear-gradient(90deg, #0f766e, #14b8a6, #22d3ee)",
  "linear-gradient(90deg, #115e59, #0d9488, #38bdf8)",
  "linear-gradient(90deg, #0f766e, #2dd4bf, #60a5fa)",
  "linear-gradient(90deg, #134e4a, #14b8a6, #67e8f9)",
  "linear-gradient(90deg, #0f766e, #22d3ee, #3b82f6)",
  "linear-gradient(90deg, #0b6b63, #2dd4bf, #7dd3fc)",
];

const DEFAULT_GLOWS = [
  "rgba(20, 184, 166, 0.35)",
  "rgba(56, 189, 248, 0.35)",
  "rgba(96, 165, 250, 0.35)",
  "rgba(45, 212, 191, 0.35)",
  "rgba(103, 232, 249, 0.35)",
  "rgba(34, 211, 238, 0.35)",
];

export default function SHRankedBars({ items, formatValue, onBarClick, showRank }: SHRankedBarsProps) {
  if (items.length === 0) {
    return (
      <div style={{ padding: "20px 12px", fontSize: 11, color: "var(--sh-text-muted)", textAlign: "center" }}>
        No data for current filters
      </div>
    );
  }

  const max = Math.max(...items.map(i => i.target ?? i.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => {
        const pct = (item.value / max) * 100;
        const paletteIdx = i % DEFAULT_GRADIENTS.length;
        const gradient = item.status ? STATUS_GRADIENTS[item.status] : DEFAULT_GRADIENTS[paletteIdx];
        const glow = item.status
          ? (item.status === "alert" ? "rgba(244,106,106,0.3)" : item.status === "watch" ? "rgba(239,181,98,0.3)" : "rgba(20, 184, 166, 0.3)")
          : DEFAULT_GLOWS[paletteIdx];
        return (
          <div
            key={item.label}
            style={{
              display: "flex", alignItems: "center", gap: 8, cursor: onBarClick ? "pointer" : "default",
            }}
            onClick={onBarClick ? () => onBarClick(item.label) : undefined}
          >
            {showRank && (
              <span style={{ width: 16, fontSize: 10, fontWeight: 700, color: "var(--sh-text-muted)", textAlign: "right", flexShrink: 0 }}>
                {i + 1}
              </span>
            )}
            <span style={{
              width: 130, flexShrink: 0, fontSize: 11, fontWeight: 500, color: "var(--sh-text-secondary)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              transition: "color 0.12s",
            }} title={item.label}>
              {item.label}
            </span>
            <div style={{
              flex: 1, height: 18, background: "var(--sh-bg-hover)", borderRadius: 3,
              overflow: "hidden", position: "relative",
            }}>
              {item.target && (
                <div style={{
                  position: "absolute", top: 0, left: 0, height: "100%",
                  width: `${(item.target / max) * 100}%`,
                  background: "rgba(255,255,255,0.04)", borderRadius: 3,
                }} />
              )}
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: 3,
                background: gradient,
                boxShadow: `0 0 12px ${glow}`,
                transition: "width 0.4s ease",
              }} />
            </div>
            <span style={{
              width: 50, flexShrink: 0, fontSize: 11, fontWeight: 600,
              color: "var(--sh-text-primary)", textAlign: "right",
            }}>
              {formatValue ? formatValue(item.value) : item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
