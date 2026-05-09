"use client";

interface SHDataContextStripProps {
  scopeLabel: string;
  rows: number;
  filterCount: number;
  asOf?: string;
  dateBasis?: string;
}

export default function SHDataContextStrip({ scopeLabel, rows, filterCount, asOf = "Mar 25, 2026", dateBasis }: SHDataContextStripProps) {
  return (
    <div className="sh-data-context">
      <span className="sh-data-context-label">Data Context</span>
      <span className="sh-data-context-scope"><strong>{scopeLabel}</strong></span>
      <span>Rows: <strong>{rows.toLocaleString()}</strong></span>
      <span>Filters: <strong>{filterCount}</strong></span>
      {dateBasis && <span className="sh-data-context-secondary">Date basis: <strong>{dateBasis}</strong></span>}
      <span className="sh-data-context-secondary">As of: <strong>{asOf}</strong></span>
    </div>
  );
}
