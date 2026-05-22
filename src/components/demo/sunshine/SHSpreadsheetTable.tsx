"use client";

import { useMemo, useState } from "react";

export interface SSColumn {
  key: string;
  label: string;
  width: string;
  frozen?: boolean;
  mono?: boolean;
  /** Retained for API compatibility. Pipeline rosters render every column
   *  center-aligned (header label, filter, and cells), so this is not applied. */
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
  if (w.endsWith("fr")) return Math.round(parseFloat(w) * 160);
  return parseInt(w, 10) || 100;
}

/** Minimum width required to render an uppercase 10px header label with
 *  0.06em letter-spacing plus padding. Ensures column never truncates its
 *  own header. ~7.2px per uppercase char + 24px padding (8+16). */
function estimateHeaderWidth(label: string): number {
  return Math.ceil(label.length * 7.2) + 24;
}

export default function SHSpreadsheetTable({ columns, rows, maxRows = 20, onRowClick }: SHSpreadsheetTableProps) {
  const HEADER_ROW_HEIGHT = 50;
  const DATA_ROW_HEIGHT = 30;

  const normalizedColumns = columns.map((c, idx) => {
    const specifiedPx = widthToPx(c.width);
    const headerMinPx = estimateHeaderWidth(c.label);
    // Effective width = max(specified, header-fit). Keeps consumer widths for
    // columns whose data is wider than the label, and auto-grows narrow columns
    // whose label would truncate otherwise.
    const effectivePx = Math.max(specifiedPx, headerMinPx);
    return {
      ...c,
      width: `${effectivePx}px`,
      // Default Excel-like freeze panes: keep first two columns visible.
      frozen: c.frozen ?? idx < 2,
    };
  });

  // Manual column resizing — drag the right edge of any header to resize.
  // A width override persists for the session; double-click a handle to reset
  // that column to its computed default. All width-derived values below
  // (colgroup, frozen-column offsets, totals) read through getWidth so frozen
  // panes stay perfectly aligned while resizing.
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [resizingKey, setResizingKey] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const MIN_COL_WIDTH = 56;
  const getWidth = (c: { key: string; width: string }) => colWidths[c.key] ?? widthToPx(c.width);
  const resetColumn = (key: string) =>
    setColWidths((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  const startResize = (e: React.PointerEvent, key: string, startWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingKey(key);
    const startX = e.clientX;
    const onMove = (ev: PointerEvent) => {
      const next = Math.max(MIN_COL_WIDTH, Math.round(startWidth + (ev.clientX - startX)));
      setColWidths((prev) => ({ ...prev, [key]: next }));
    };
    const onUp = () => {
      setResizingKey(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const frozenColumns = normalizedColumns.filter((c) => c.frozen);
  const scrollColumns = normalizedColumns.filter((c) => !c.frozen);
  const frozenWidth = frozenColumns.reduce((sum, c) => sum + getWidth(c), 0);
  const scrollMinWidth = scrollColumns.reduce((sum, c) => sum + getWidth(c), 0);

  // Render every column in ONE table (frozen first), so rows can never drift
  // out of vertical alignment. Frozen columns use position: sticky + a
  // cumulative left offset; a trailing spacer column absorbs any extra width.
  const orderedColumns = [...frozenColumns, ...scrollColumns];
  const frozenCount = frozenColumns.length;
  const totalWidth = frozenWidth + scrollMinWidth;
  const frozenLeft = frozenColumns.reduce<number[]>((acc, _c, idx) => {
    acc.push(idx === 0 ? 0 : acc[idx - 1] + getWidth(frozenColumns[idx - 1]));
    return acc;
  }, []);

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const columnOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    const sortValues = (values: string[]) => {
      const numeric = values.every((v) => /^-?\d+(\.\d+)?$/.test(v));
      if (numeric) return values.sort((a, b) => Number(a) - Number(b));
      return values.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));
    };

    for (const c of normalizedColumns) {
      const vals = new Set<string>();
      for (const row of rows) {
        const value = row[c.key];
        if (value === null || value === undefined || value === "") continue;
        vals.add(String(value));
      }
      options[c.key] = sortValues(Array.from(vals));
    }
    return options;
  }, [normalizedColumns, rows]);

  const filteredRows = rows.filter((row) =>
    normalizedColumns.every((c) => {
      const query = (columnFilters[c.key] ?? "").trim().toLowerCase();
      if (!query) return true;
      const value = row[c.key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase() === query;
    }),
  );
  const visibleRows = filteredRows.slice(0, maxRows);

  const rowBg = (i: number) => {
    // The hover highlight MUST be opaque: frozen (sticky) cells paint over the
    // horizontally-scrolling columns, so a translucent hover background lets the
    // scrolling cells' content bleed through the frozen Deal Name / City columns.
    // color-mix keeps the same subtle teal tint but stays fully opaque.
    if (hoveredRow === i) return "color-mix(in srgb, rgb(20, 184, 166) 8%, var(--sh-bg-surface))";
    return i % 2 === 0 ? "var(--sh-bg-surface)" : "var(--sh-bg-surface-raised)";
  };

  const rawText = (row: Record<string, unknown>, key: string) => {
    const value = row[key];
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
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
      <span
        style={{
          display: "block",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={c.label}
      >
        {c.label}
      </span>
      <select
        value={columnFilters[c.key] ?? ""}
        onChange={(e) => setColumnFilters((prev) => ({ ...prev, [c.key]: e.target.value }))}
        aria-label={`Filter ${c.label}`}
        title={`Filter ${c.label}`}
        style={{
          width: "100%",
          height: 20,
          textAlign: "center",
          textAlignLast: "center",
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
          appearance: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235a6b7e'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 6px center",
          paddingRight: 20,
        }}
      >
        <option value="">All</option>
        {columnOptions[c.key].map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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
      <div style={{ overflow: "auto", maxHeight: 400 }}>
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
            width: "100%",
            minWidth: totalWidth,
            fontSize: 11,
            color: "var(--sh-text-primary)",
          }}
        >
          <colgroup>
            {orderedColumns.map((c) => (
              <col key={c.key} style={{ width: getWidth(c) }} />
            ))}
            <col />
          </colgroup>
          <thead>
            <tr>
              {orderedColumns.map((c, idx) => {
                const isFrozen = idx < frozenCount;
                const isLastFrozen = idx === frozenCount - 1;
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
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      position: "sticky",
                      top: 0,
                      left: isFrozen ? frozenLeft[idx] : undefined,
                      zIndex: isFrozen ? 40 : 30,
                      background: "var(--sh-bg-surface-raised)",
                      borderBottom: "2px solid rgba(20, 184, 166, 0.2)",
                      borderRight: isLastFrozen ? "2px solid var(--sh-border)" : undefined,
                      boxShadow: isLastFrozen ? "2px 0 4px rgba(0,0,0,0.3)" : undefined,
                      height: HEADER_ROW_HEIGHT,
                      verticalAlign: "top",
                    }}
                  >
                    {headerContent(c)}
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Resize ${c.label} column`}
                      title="Drag to resize · double-click to reset"
                      onPointerDown={(e) => startResize(e, c.key, getWidth(c))}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        resetColumn(c.key);
                      }}
                      onMouseEnter={() => setHoverKey(c.key)}
                      onMouseLeave={() => setHoverKey(null)}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 9,
                        height: "100%",
                        cursor: "col-resize",
                        touchAction: "none",
                        userSelect: "none",
                        display: "flex",
                        justifyContent: "flex-end",
                        zIndex: 3,
                      }}
                    >
                      <span
                        style={{
                          width: 2,
                          height: "100%",
                          background:
                            resizingKey === c.key || hoverKey === c.key
                              ? "var(--sh-accent)"
                              : "transparent",
                          transition: "background 0.12s",
                        }}
                      />
                    </span>
                  </th>
                );
              })}
              <th
                aria-hidden
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 30,
                  background: "var(--sh-bg-surface-raised)",
                  borderBottom: "2px solid rgba(20, 184, 166, 0.2)",
                  height: HEADER_ROW_HEIGHT,
                }}
              />
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
                {orderedColumns.map((c, idx) => {
                  const isFrozen = idx < frozenCount;
                  const isLastFrozen = idx === frozenCount - 1;
                  return (
                    <td
                      key={c.key}
                      style={{
                        padding: "5px 10px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        fontFamily: c.mono ? '"SF Mono", "Fira Code", monospace' : undefined,
                        fontSize: c.mono ? 10 : undefined,
                        borderBottom: "1px solid var(--sh-border-dim)",
                        position: isFrozen ? "sticky" : undefined,
                        left: isFrozen ? frozenLeft[idx] : undefined,
                        zIndex: isFrozen ? 20 : undefined,
                        borderRight: isLastFrozen ? "2px solid var(--sh-border)" : undefined,
                        boxShadow: isLastFrozen ? "2px 0 4px rgba(0,0,0,0.3)" : undefined,
                        background: rowBg(i),
                        height: DATA_ROW_HEIGHT,
                        verticalAlign: "middle",
                      }}
                    >
                      <span title={rawText(row, c.key)} style={{ display: "block", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "18px" }}>
                        {c.render ? c.render(row) : rawText(row, c.key)}
                      </span>
                    </td>
                  );
                })}
                <td
                  aria-hidden
                  style={{
                    borderBottom: "1px solid var(--sh-border-dim)",
                    background: rowBg(i),
                    height: DATA_ROW_HEIGHT,
                  }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
