"use client";

interface SHDataContextStripProps {
  scopeLabel: string;
  rows: number;
  filterCount: number;
  asOf?: string;
}

export default function SHDataContextStrip({ scopeLabel, rows, filterCount, asOf = "Mar 25, 2026" }: SHDataContextStripProps) {
  return (
    <div
      style={{
        marginBottom: 10,
        padding: "6px 10px",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        borderRadius: 6,
        border: "1px solid var(--sh-border)",
        background: "var(--sh-bg-surface)",
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--sh-text-muted)", textTransform: "uppercase" }}>Data Context</span>
      <span style={{ fontSize: 11, color: "var(--sh-text-secondary)" }}><strong style={{ color: "var(--sh-text-primary)" }}>{scopeLabel}</strong></span>
      <span style={{ fontSize: 11, color: "var(--sh-text-secondary)" }}>Rows: <strong style={{ color: "var(--sh-text-primary)" }}>{rows.toLocaleString()}</strong></span>
      <span style={{ fontSize: 11, color: "var(--sh-text-secondary)" }}>Filters: <strong style={{ color: "var(--sh-text-primary)" }}>{filterCount}</strong></span>
      <span style={{ fontSize: 11, color: "var(--sh-text-secondary)" }}>As of: <strong style={{ color: "var(--sh-text-primary)" }}>{asOf}</strong></span>
    </div>
  );
}
