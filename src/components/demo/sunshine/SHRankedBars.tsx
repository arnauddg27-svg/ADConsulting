"use client";

interface RankedItem {
  label: string;
  value: number;
  /** Optional secondary value shown as lighter overlay */
  target?: number;
  /** Optional status coloring */
  status?: "good" | "watch" | "alert";
}

interface SHRankedBarsProps {
  items: RankedItem[];
  formatValue?: (v: number) => string;
  onBarClick?: (label: string) => void;
  /** Show rank numbers */
  showRank?: boolean;
}

const STATUS_GRADIENTS = {
  good:  "linear-gradient(90deg, #0f766e, #14b8a6, #22d3ee)",
  watch: "linear-gradient(90deg, #92400e, #d97706, #efb562)",
  alert: "linear-gradient(90deg, #991b1b, #dc2626, #f87171)",
};

const DEFAULT_GRADIENT = "linear-gradient(90deg, #0f766e, #14b8a6, #22d3ee)";

export default function SHRankedBars({ items, formatValue, onBarClick, showRank }: SHRankedBarsProps) {
  const max = Math.max(...items.map(i => i.target ?? i.value), 1);

  return (
    <div className="sh-ranked-bars">
      {items.map((item, i) => {
        const pct = (item.value / max) * 100;
        const gradient = item.status ? STATUS_GRADIENTS[item.status] : DEFAULT_GRADIENT;
        return (
          <div
            key={item.label}
            className="sh-ranked-bar"
            onClick={onBarClick ? () => onBarClick(item.label) : undefined}
          >
            {showRank && (
              <span style={{ width: 16, fontSize: 10, fontWeight: 700, color: "var(--sh-text-muted)", textAlign: "right", marginRight: 4 }}>
                {i + 1}
              </span>
            )}
            <span className="sh-ranked-bar-label" title={item.label}>{item.label}</span>
            <div className="sh-ranked-bar-track">
              {/* Target ghost bar */}
              {item.target && (
                <div style={{
                  position: "absolute", top: 0, left: 0, height: "100%",
                  width: `${(item.target / max) * 100}%`,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 3,
                }} />
              )}
              <div
                className="sh-ranked-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: gradient,
                  boxShadow: `0 0 10px ${item.status === "alert" ? "rgba(244,106,106,0.3)" : item.status === "watch" ? "rgba(239,181,98,0.3)" : "rgba(20, 184, 166, 0.3)"}`,
                }}
              />
            </div>
            <span className="sh-ranked-bar-value">
              {formatValue ? formatValue(item.value) : item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
