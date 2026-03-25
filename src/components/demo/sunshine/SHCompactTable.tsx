"use client";

export interface SHColumn {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "right" | "center";
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface SHCompactTableProps {
  columns: SHColumn[];
  rows: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
}

export default function SHCompactTable({ columns, rows, onRowClick }: SHCompactTableProps) {
  const gridCols = columns.map(c => c.width ?? "1fr").join(" ");

  if (rows.length === 0) {
    return (
      <div className="sh-compact-table">
        <div style={{ padding: "20px 12px", fontSize: 11, color: "var(--sh-text-muted)", textAlign: "center" }}>
          No data for current filters
        </div>
      </div>
    );
  }

  return (
    <div className="sh-compact-table">
      <div className="sh-compact-table-head" style={{ gridTemplateColumns: gridCols }}>
        {columns.map(c => (
          <span key={c.key} style={{ textAlign: c.align }}>{c.label}</span>
        ))}
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`sh-compact-table-row ${onRowClick ? "interactive" : ""}`}
          style={{ gridTemplateColumns: gridCols }}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
        >
          {columns.map(c => (
            <span key={c.key} style={{ textAlign: c.align }}>
              {c.render ? c.render(row) : String(row[c.key] ?? "")}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
