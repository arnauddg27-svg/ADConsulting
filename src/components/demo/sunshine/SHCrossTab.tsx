"use client";

import { useState } from "react";

interface SHCrossTabProps {
  title?: string;
  rows: string[];
  cols: string[];
  data: Record<string, Record<string, number>>;
  rowTotals: Record<string, number>;
  colTotals: Record<string, number>;
  grandTotal: number;
  onCellClick?: (row: string, col: string, value: number) => void;
  onRowLabelClick?: (row: string) => void;
  onColHeaderClick?: (col: string) => void;
}

export default function SHCrossTab({
  title,
  rows,
  cols,
  data,
  rowTotals,
  colTotals,
  grandTotal,
  onCellClick,
  onRowLabelClick,
  onColHeaderClick,
}: SHCrossTabProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [hoveredColHeader, setHoveredColHeader] = useState<string | null>(null);

  // Compute max value for intensity coloring
  const allValues: number[] = [];
  rows.forEach(r => cols.forEach(c => {
    const v = data[r]?.[c];
    if (v !== undefined && v > 0) allValues.push(v);
  }));
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 1;

  const colCount = cols.length + 2; // row-label + data cols + row-total

  const cellIntensity = (value: number | undefined): string => {
    if (!value || value <= 0) return "transparent";
    const ratio = Math.min(value / maxVal, 1);
    // Teal intensity: from very dim to medium
    const alpha = 0.05 + ratio * 0.25;
    return `rgba(20, 184, 166, ${alpha})`;
  };

  if (rows.length === 0 || cols.length === 0) {
    return (
      <div className="sh-crosstab">
        {title && <div className="sh-crosstab-title">{title}</div>}
        <div
          style={{
            padding: "14px 12px",
            fontSize: 11,
            color: "var(--sh-text-muted)",
            fontStyle: "italic",
            borderTop: "1px solid var(--sh-border)",
            background: "var(--sh-bg-surface)",
          }}
        >
          No records for current filters.
        </div>
      </div>
    );
  }

  return (
    <div className="sh-crosstab">
      {title && <div className="sh-crosstab-title">{title}</div>}

      <div
        className="sh-crosstab-grid"
        style={{ gridTemplateColumns: `140px repeat(${cols.length}, 1fr) 80px` }}
      >
        {/* Header row */}
        <div className="sh-crosstab-header sh-crosstab-corner" />
        {cols.map(col => (
          <div
            key={col}
            className="sh-crosstab-header"
            onClick={onColHeaderClick ? () => onColHeaderClick(col) : undefined}
            onMouseEnter={onColHeaderClick ? () => setHoveredColHeader(col) : undefined}
            onMouseLeave={onColHeaderClick ? () => setHoveredColHeader(null) : undefined}
            role={onColHeaderClick ? "button" : undefined}
            style={{
              cursor: onColHeaderClick ? "pointer" : "default",
              textDecoration: onColHeaderClick && hoveredColHeader === col ? "underline" : "none",
              transition: "all 0.12s",
            }}
          >
            {col}
          </div>
        ))}
        <div className="sh-crosstab-header sh-crosstab-total-header">Total</div>

        {/* Data rows */}
        {rows.map((row, ri) => (
          <>
            {/* Row label (frozen column) */}
            <div
              key={`rl-${row}`}
              className="sh-crosstab-row-label"
              onClick={onRowLabelClick ? () => onRowLabelClick(row) : undefined}
              role={onRowLabelClick ? "button" : undefined}
              style={{ cursor: onRowLabelClick ? "pointer" : "default" }}
            >
              {row}
            </div>

            {/* Data cells */}
            {cols.map((col, ci) => {
              const value = data[row]?.[col];
              const hasValue = value !== undefined && value > 0;
              const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
              return (
                <div
                  key={`${row}-${col}`}
                  className={`sh-crosstab-cell ${hasValue && onCellClick ? "interactive" : ""}`}
                  style={{
                    background: isHovered
                      ? "rgba(20, 184, 166, 0.15)"
                      : cellIntensity(value),
                    boxShadow: isHovered ? "inset 0 0 0 1px var(--sh-accent)" : "none",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={hasValue && onCellClick ? () => onCellClick(row, col, value) : undefined}
                >
                  {hasValue ? value : ""}
                </div>
              );
            })}

            {/* Row total */}
            <div key={`rt-${row}`} className="sh-crosstab-cell sh-crosstab-row-total">
              {rowTotals[row] ?? ""}
            </div>
          </>
        ))}

        {/* Totals row */}
        <div className="sh-crosstab-row-label sh-crosstab-total-label">Total</div>
        {cols.map(col => (
          <div key={`ct-${col}`} className="sh-crosstab-cell sh-crosstab-col-total">
            {colTotals[col] ?? ""}
          </div>
        ))}
        <div className="sh-crosstab-cell sh-crosstab-grand-total">{grandTotal}</div>
      </div>
    </div>
  );
}
