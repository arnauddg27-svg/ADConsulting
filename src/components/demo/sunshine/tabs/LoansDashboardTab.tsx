"use client";

import type { SHLoan } from "@/types/sunshine-homes";
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
}

export default function LoansDashboardTab({ loans }: Props) {
  const kpis = getLoanKPIs(loans);
  const lenders = getLenderDistribution(loans).map((l, i) => ({
    ...l, color: LENDER_COLORS[i % LENDER_COLORS.length],
  }));

  const expiring = [...loans]
    .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration)
    .slice(0, 10);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Loans</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Construction loan exposure, draw status, and expiration alerts.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Exposure" value={fmt$(kpis.totalBalance)} />
        <SHKpiCard label="Total Drawn" value={fmt$(kpis.totalDrawn)} accent="#22d3ee" />
        <SHKpiCard label="Avg Draw %" value={fmtPct(kpis.avgDrawPct)} />
        <SHKpiCard
          label="Expiring < 60d"
          value={fmtN(kpis.expiringSoon)}
          accent={kpis.expiringSoon > 0 ? "#f46a6a" : "#24c18d"}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Lenders" title="Loan Distribution">
          <SHDonutChart segments={lenders} />
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
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Alerts" title="Loans by Expiration Date">
          <SHCompactTable
            columns={[
              { key: "jobCode", label: "Job", width: "90px" },
              { key: "community", label: "Community", width: "1fr" },
              { key: "lender", label: "Lender", width: "150px" },
              { key: "loanAmount", label: "Amount", width: "90px", align: "right", render: r => fmt$(Number(r.loanAmount)) },
              { key: "drawPct", label: "Draw %", width: "70px", align: "right", render: r => fmtPct(Number(r.drawPct)) },
              { key: "daysUntilExpiration", label: "Exp", width: "70px", align: "right", render: r => {
                const d = Number(r.daysUntilExpiration);
                const tone = d <= 30 ? "alert" : d <= 60 ? "watch" : "good";
                return <SHPill tone={tone} label={`${d}d`} />;
              }},
            ]}
            rows={expiring as unknown as Record<string, unknown>[]}
          />
        </SHPanel>
      </div>
    </>
  );
}
