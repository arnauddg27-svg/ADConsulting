"use client";

interface SHKpiCardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  deltaDir?: "up" | "down" | "neutral";
  accent?: string;
  onClick?: () => void;
  /** 0-100 progress bar under value */
  progress?: number;
  /** Array of 8-12 numbers for mini sparkline */
  sparkline?: number[];
}

/** Mini SVG sparkline */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 60, h = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ marginTop: 4, display: "block" }}>
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace("#", "")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SHKpiCard({ label, value, sub, delta, deltaDir, accent, onClick, progress, sparkline }: SHKpiCardProps) {
  const accentColor = accent ?? "var(--sh-accent)";
  return (
    <div
      className={`sh-kpi-card ${onClick ? "clickable" : ""}`}
      style={{ "--_kpi-accent": accentColor } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => { if (e.key === "Enter") onClick(); } : undefined}
    >
      <div className="sh-kpi-label">{label}</div>
      <div className="sh-kpi-value">{value}</div>
      {sub && <div className="sh-kpi-sub">{sub}</div>}
      {progress !== undefined && (
        <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            width: `${Math.min(100, progress)}%`,
            height: "100%",
            borderRadius: 2,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
            boxShadow: `0 0 8px ${accentColor}44`,
            transition: "width 0.6s ease",
          }} />
        </div>
      )}
      {sparkline && <Sparkline data={sparkline} color={accentColor} />}
      {delta && (
        <div className={`sh-kpi-delta ${deltaDir ?? "neutral"}`}>
          {deltaDir === "up" && "↗ "}
          {deltaDir === "down" && "↘ "}
          {delta}
        </div>
      )}
      {onClick && (
        <div style={{ position: "absolute", top: 10, right: 10, fontSize: 10, color: "var(--sh-text-muted)", opacity: 0.5 }}>→</div>
      )}
    </div>
  );
}
