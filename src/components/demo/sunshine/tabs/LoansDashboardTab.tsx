"use client";

import type { SHLoan } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getLoanKPIs, getLenderDistribution, fmt$, fmtN, fmtPct } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHDonutChart from "../SHDonutChart";
import SHRankedBars from "../SHRankedBars";
import SHCompactTable from "../SHCompactTable";
import SHPill from "../SHPill";

const LENDER_COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6"];

interface Props {
  loans: SHLoan[];
  onDrill: (detail: DrillDetail) => void;
}

export default function LoansDashboardTab({ loans, onDrill }: Props) {
  const kpis = getLoanKPIs(loans);
  const lenders = getLenderDistribution(loans).map((l, i) => ({
    ...l, color: LENDER_COLORS[i % LENDER_COLORS.length],
  }));

  const allLoans = [...loans].sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Loans</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Construction loan exposure, draw status, and expiration alerts. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Exposure" value={fmt$(kpis.totalBalance)} sparkline={[4.2, 4.5, 4.8, 5.0, 5.1, 5.3, 5.2, 5.4, 5.5]} />
        <SHKpiCard label="Total Drawn" value={fmt$(kpis.totalDrawn)} accent="#22d3ee" progress={Math.round(kpis.avgDrawPct)} sub={`${Math.round(kpis.avgDrawPct)}% avg draw`} />
        <SHKpiCard label="Lender Count" value={fmtN(kpis.lenderCount)} accent="#3b82f6" sparkline={[3, 3, 4, 4, 4, 5, 5, 5, 5, 5]} delta="Diversified" deltaDir="up" />
        <SHKpiCard label="Expiring < 60d" value={fmtN(kpis.expiringSoon)} accent={kpis.expiringSoon > 0 ? "#f46a6a" : "#24c18d"} sparkline={[4, 3, 5, 4, 3, 2, 3, 4, 3, kpis.expiringSoon]} delta={kpis.expiringSoon > 0 ? "Action needed" : "No urgency"} deltaDir={kpis.expiringSoon > 0 ? "down" : "up"} />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Lenders" title="Loan Distribution">
          <SHDonutChart
            segments={lenders}
            onSegmentClick={label => onDrill({ type: "lender", value: label, label })}
          />
        </SHPanel>
        <SHPanel kicker="Draw Status" title="Draw % by Community">
          <SHRankedBars
            items={(() => {
              const map = new Map<string, { total: number; drawn: number }>();
              for (const l of loans) {
                const e = map.get(l.community) || { total: 0, drawn: 0 };
                e.total += l.loanAmount;
                e.drawn += l.totalDrawn;
                map.set(l.community, e);
              }
              return Array.from(map.entries())
                .map(([label, d]) => ({ label, value: Math.round((d.drawn / d.total) * 100) }))
                .sort((a, b) => b.value - a.value);
            })()}
            formatValue={v => `${v}%`}
            onBarClick={label => onDrill({ type: "community", value: label, label })}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="All Loans" title="Loan Roster by Expiration">
          <SHCompactTable
            columns={[
              { key: "jobCode", label: "Job", width: "80px" },
              { key: "community", label: "Community", width: "1fr" },
              { key: "lender", label: "Lender", width: "130px" },
              { key: "loanAmount", label: "Amount", width: "80px", align: "right", render: r => fmt$(Number(r.loanAmount)) },
              { key: "totalDrawn", label: "Drawn", width: "80px", align: "right", render: r => fmt$(Number(r.totalDrawn)) },
              { key: "drawPct", label: "Draw %", width: "65px", align: "right", render: r => fmtPct(Number(r.drawPct)) },
              { key: "interestRate", label: "Rate", width: "50px", align: "right", render: r => `${Number(r.interestRate)}%` },
              { key: "expirationDate", label: "Expires", width: "85px" },
              { key: "daysUntilExpiration", label: "Exp", width: "60px", align: "right", render: r => {
                const d = Number(r.daysUntilExpiration);
                const tone = d <= 30 ? "alert" : d <= 60 ? "watch" : "good";
                return <SHPill tone={tone} label={`${d}d`} />;
              }},
            ]}
            rows={allLoans as unknown as Record<string, unknown>[]}
            onRowClick={r => onDrill({ type: "lender", value: String(r.lender), label: String(r.lender) })}
          />
        </SHPanel>
      </div>
    </>
  );
}
