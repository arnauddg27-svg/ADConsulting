"use client";

export interface SSColumn {
  key: string;
  label: string;
  width: string;
  frozen?: boolean;
  mono?: boolean;
  align?: "left" | "right";
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface SHSpreadsheetTableProps {
  columns: SSColumn[];
  rows: Record<string, unknown>[];
  maxRows?: number;
  onRowClick?: (row: Record<string, unknown>) => void;
}

/** Parse a CSS width like "80px", "1.2fr", "100px" into a pixel estimate for minWidth */
function widthToPx(w: string): number {
  if (w.endsWith("fr")) return Math.round(parseFloat(w) * 120);
  return parseInt(w) || 100;
}

/** Build cumulative left offsets for frozen columns */
function frozenOffsets(columns: SSColumn[]): number[] {
  const offsets: number[] = [];
  let cumulative = 0;
  for (const c of columns) {
    offsets.push(cumulative);
    if (c.frozen) cumulative += widthToPx(c.width);
  }
  return offsets;
}

export default function SHSpreadsheetTable({ columns, rows, maxRows = 20, onRowClick }: SHSpreadsheetTableProps) {
  const normalizedColumns = columns.map((c, idx) => ({
    ...c,
    // Default to Excel-like freeze panes: keep first two columns visible.
    frozen: c.frozen ?? idx < 2,
  }));
  const visibleRows = rows.slice(0, maxRows);
  const offsets = frozenOffsets(normalizedColumns);

  if (rows.length === 0) {
    return (
      <div className="sh-ss-table">
        <div style={{ padding: "24px 16px", fontSize: 11, color: "var(--sh-text-muted)", textAlign: "center" }}>
          No matching records for current filters
        </div>
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid var(--sh-border)",
      borderRadius: 6,
      overflow: "auto",
      maxHeight: 400,
    }}>
      <table style={{
        borderCollapse: "separate",
        borderSpacing: 0,
        fontSize: 11,
        color: "var(--sh-text-primary)",
        minWidth: normalizedColumns.reduce((s, c) => s + widthToPx(c.width), 0),
      }}>
        <thead>
          <tr>
            {normalizedColumns.map((c, ci) => {
              const isLastFrozen = c.frozen && (ci === normalizedColumns.length - 1 || !normalizedColumns[ci + 1]?.frozen);
              return (
                <th key={c.key} style={{
                  padding: "6px 10px",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--sh-text-muted)",
                  textAlign: c.align ?? "left",
                  whiteSpace: "nowrap",
                  minWidth: widthToPx(c.width),
                  width: c.frozen ? c.width : undefined,
                  position: "sticky",
                  top: 0,
                  left: c.frozen ? offsets[ci] : undefined,
                  zIndex: c.frozen ? 40 : 30,
                  background: "var(--sh-bg-surface-raised)",
                  borderBottom: "2px solid rgba(20, 184, 166, 0.2)",
                  borderRight: isLastFrozen ? "2px solid var(--sh-border)" : undefined,
                  boxShadow: isLastFrozen ? "2px 0 4px rgba(0,0,0,0.3)" : undefined,
                }}>
                  {c.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                cursor: onRowClick ? "pointer" : "default",
                borderBottom: "1px solid var(--sh-border-dim)",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(20,184,166,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"; }}
            >
              {normalizedColumns.map((c, ci) => {
                const isLastFrozen = c.frozen && (ci === normalizedColumns.length - 1 || !normalizedColumns[ci + 1]?.frozen);
                const rowBg = i % 2 === 0 ? "var(--sh-bg-surface)" : "var(--sh-bg-surface-raised)";
                return (
                  <td key={c.key} style={{
                    padding: "5px 10px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: c.align,
                    fontFamily: c.mono ? '"SF Mono", "Fira Code", monospace' : undefined,
                    fontSize: c.mono ? 10 : undefined,
                    position: c.frozen ? "sticky" : undefined,
                    left: c.frozen ? offsets[ci] : undefined,
                    zIndex: c.frozen ? 20 : undefined,
                    background: rowBg,
                    borderRight: isLastFrozen ? "2px solid var(--sh-border)" : undefined,
                    boxShadow: isLastFrozen ? "2px 0 4px rgba(0,0,0,0.3)" : undefined,
                  }}>
                    {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
