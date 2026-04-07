"use client";

import { useRef, useState } from "react";

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

/** Parse a CSS width like "80px", "1.2fr", "100px" into a pixel estimate. */
function widthToPx(w: string): number {
  if (w.endsWith("fr")) return Math.round(parseFloat(w) * 120);
  return parseInt(w, 10) || 100;
}

export default function SHSpreadsheetTable({ columns, rows, maxRows = 20, onRowClick }: SHSpreadsheetTableProps) {
  const normalizedColumns = columns.map((c, idx) => ({
    ...c,
    // Default Excel-like freeze panes: keep first two columns visible.
    frozen: c.frozen ?? idx < 2,
  }));

  const frozenColumns = normalizedColumns.filter((c) => c.frozen);
  const scrollColumns = normalizedColumns.filter((c) => !c.frozen);
  const frozenWidth = frozenColumns.reduce((sum, c) => sum + widthToPx(c.width), 0);
  const scrollMinWidth = scrollColumns.reduce((sum, c) => sum + widthToPx(c.width), 0);

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncSourceRef = useRef<"left" | "right" | null>(null);

  const filteredRows = rows.filter((row) =>
    normalizedColumns.every((c) => {
      const query = (columnFilters[c.key] ?? "").trim().toLowerCase();
      if (!query) return true;
      const value = row[c.key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(query);
    }),
  );
  const visibleRows = filteredRows.slice(0, maxRows);

  const syncVertical = (source: "left" | "right") => {
    const sourceEl = source === "left" ? leftRef.current : rightRef.current;
    const targetEl = source === "left" ? rightRef.current : leftRef.current;
    if (!sourceEl || !targetEl) return;
    if (syncSourceRef.current && syncSourceRef.current !== source) return;
    syncSourceRef.current = source;
    targetEl.scrollTop = sourceEl.scrollTop;
    requestAnimationFrame(() => {
      if (syncSourceRef.current === source) syncSourceRef.current = null;
    });
  };

  const rowBg = (i: number) => {
    if (hoveredRow === i) return "rgba(20,184,166,0.04)";
    return i % 2 === 0 ? "var(--sh-bg-surface)" : "var(--sh-bg-surface-raised)";
  };

  if (rows.length === 0) {
    return (
      <div className="sh-ss-table">
        <div style={{ padding: "24px 16px", fontSize: 11, color: "var(--sh-text-muted)", textAlign: "center" }}>
          No matching records for current filters
        </div>
      </div>
    );
  }

  const headerContent = (c: SSColumn) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span>{c.label}</span>
      <input
        value={columnFilters[c.key] ?? ""}
        onChange={(e) => setColumnFilters((prev) => ({ ...prev, [c.key]: e.target.value }))}
        placeholder="Filter..."
        aria-label={`Filter ${c.label}`}
        style={{
          width: "100%",
          height: 20,
          borderRadius: 4,
          border: "1px solid var(--sh-border)",
          background: "var(--sh-bg-surface)",
          color: "var(--sh-text-secondary)",
          fontSize: 10,
          fontWeight: 500,
          padding: "0 6px",
          textTransform: "none",
          letterSpacing: "normal",
          outline: "none",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        border: "1px solid var(--sh-border)",
        borderRadius: 6,
        overflow: "hidden",
        background: "var(--sh-bg-surface)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: scrollColumns.length > 0 ? `${frozenWidth}px minmax(0, 1fr)` : "1fr",
        }}
      >
        <div style={{ borderRight: scrollColumns.length > 0 ? "2px solid var(--sh-border)" : undefined }}>
          <div ref={leftRef} onScroll={() => syncVertical("left")} style={{ overflowY: "auto", overflowX: "hidden", maxHeight: 400 }}>
            <table
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "fixed",
                fontSize: 11,
                color: "var(--sh-text-primary)",
                width: frozenWidth,
                minWidth: frozenWidth,
              }}
            >
              <thead>
                <tr>
                  {frozenColumns.map((c, ci) => {
                    const isLastFrozen = ci === frozenColumns.length - 1;
                    return (
                      <th
                        key={c.key}
                        style={{
                          padding: "5px 8px",
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "var(--sh-text-muted)",
                          textAlign: c.align ?? "left",
                          whiteSpace: "nowrap",
                          minWidth: widthToPx(c.width),
                          width: widthToPx(c.width),
                          maxWidth: widthToPx(c.width),
                          position: "sticky",
                          top: 0,
                          zIndex: 40,
                          background: "var(--sh-bg-surface-raised)",
                          borderBottom: "2px solid rgba(20, 184, 166, 0.2)",
                          borderRight: isLastFrozen ? "2px solid var(--sh-border)" : undefined,
                          boxShadow: isLastFrozen ? "2px 0 4px rgba(0,0,0,0.3)" : undefined,
                        }}
                      >
                          {headerContent(c)}
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
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ cursor: onRowClick ? "pointer" : "default", background: rowBg(i) }}
                  >
                    {frozenColumns.map((c, ci) => {
                      const isLastFrozen = ci === frozenColumns.length - 1;
                      return (
                        <td
                          key={c.key}
                          style={{
                            padding: "5px 10px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: c.align,
                            fontFamily: c.mono ? '"SF Mono", "Fira Code", monospace' : undefined,
                            fontSize: c.mono ? 10 : undefined,
                            minWidth: widthToPx(c.width),
                            width: widthToPx(c.width),
                            maxWidth: widthToPx(c.width),
                            borderBottom: "1px solid var(--sh-border-dim)",
                            borderRight: isLastFrozen ? "2px solid var(--sh-border)" : undefined,
                            boxShadow: isLastFrozen ? "2px 0 4px rgba(0,0,0,0.3)" : undefined,
                            background: rowBg(i),
                          }}
                        >
                          {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {scrollColumns.length > 0 ? (
          <div ref={rightRef} onScroll={() => syncVertical("right")} style={{ overflow: "auto", maxHeight: 400 }}>
            <table
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "fixed",
                fontSize: 11,
                color: "var(--sh-text-primary)",
                minWidth: scrollMinWidth,
              }}
            >
              <thead>
                <tr>
                  {scrollColumns.map((c) => (
                    <th
                      key={c.key}
                      style={{
                        padding: "5px 8px",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--sh-text-muted)",
                        textAlign: c.align ?? "left",
                        whiteSpace: "nowrap",
                        minWidth: widthToPx(c.width),
                        width: widthToPx(c.width),
                        maxWidth: widthToPx(c.width),
                        position: "sticky",
                        top: 0,
                        zIndex: 30,
                        background: "var(--sh-bg-surface-raised)",
                        borderBottom: "2px solid rgba(20, 184, 166, 0.2)",
                      }}
                    >
                      {headerContent(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr
                    key={i}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ cursor: onRowClick ? "pointer" : "default", background: rowBg(i) }}
                  >
                    {scrollColumns.map((c) => (
                      <td
                        key={c.key}
                        style={{
                          padding: "5px 10px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: c.align,
                          fontFamily: c.mono ? '"SF Mono", "Fira Code", monospace' : undefined,
                          fontSize: c.mono ? 10 : undefined,
                          minWidth: widthToPx(c.width),
                          width: widthToPx(c.width),
                          maxWidth: widthToPx(c.width),
                          borderBottom: "1px solid var(--sh-border-dim)",
                          background: rowBg(i),
                        }}
                      >
                        {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
