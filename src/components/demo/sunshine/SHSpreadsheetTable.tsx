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

export default function SHSpreadsheetTable({ columns, rows, maxRows = 20, onRowClick }: SHSpreadsheetTableProps) {
  const frozenCols = columns.filter(c => c.frozen);
  const scrollCols = columns.filter(c => !c.frozen);
  const visibleRows = rows.slice(0, maxRows);

  if (rows.length === 0) {
    return (
      <div className="sh-ss-table">
        <div style={{ padding: "24px 16px", fontSize: 11, color: "var(--sh-text-muted)", textAlign: "center" }}>
          No matching records for current filters
        </div>
      </div>
    );
  }

  const gridFrozen = frozenCols.map(c => c.width).join(" ");
  const gridScroll = scrollCols.map(c => c.width).join(" ");

  const renderCell = (col: SSColumn, row: Record<string, unknown>) => {
    const className = [
      col.mono ? "mono" : "",
      col.align === "right" ? "text-right" : "",
    ].filter(Boolean).join(" ");
    return (
      <span key={col.key} className={className}>
        {col.render ? col.render(row) : String(row[col.key] ?? "—")}
      </span>
    );
  };

  return (
    <div className="sh-ss-table">
      {/* Frozen columns */}
      {frozenCols.length > 0 && (
        <div className="sh-ss-frozen">
          <div className="sh-ss-header" style={{ gridTemplateColumns: gridFrozen }}>
            {frozenCols.map(c => <span key={c.key}>{c.label}</span>)}
          </div>
          {visibleRows.map((row, i) => (
            <div
              key={i}
              className={`sh-ss-row ${onRowClick ? "interactive" : ""}`}
              style={{ gridTemplateColumns: gridFrozen, cursor: onRowClick ? "pointer" : "default" }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {frozenCols.map(c => renderCell(c, row))}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable columns */}
      <div className="sh-ss-scroll">
        <div className="sh-ss-header" style={{ gridTemplateColumns: gridScroll }}>
          {scrollCols.map(c => <span key={c.key} style={{ textAlign: c.align }}>{c.label}</span>)}
        </div>
        {visibleRows.map((row, i) => (
          <div
            key={i}
            className={`sh-ss-row ${onRowClick ? "interactive" : ""}`}
            style={{ gridTemplateColumns: gridScroll, cursor: onRowClick ? "pointer" : "default" }}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {scrollCols.map(c => renderCell(c, row))}
          </div>
        ))}
      </div>
    </div>
  );
}
