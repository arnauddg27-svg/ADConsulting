"use client";

import type { SHLoan } from "@/types/sunshine-homes";
import { getLoansKPIs, fmt$, fmtN, fmtPct } from "@/lib/brite-homes-data";
import SHKpiCard from "../../sunshine/SHKpiCard";
import SHPanel from "../../sunshine/SHPanel";
import SHDonutChart from "../../sunshine/SHDonutChart";
import SHRankedBars from "../../sunshine/SHRankedBars";

interface Props {
  loans: SHLoan[];
}

export default function BHLoansDashboardTab({ loans }: Props) {
  const kpis = getLoansKPIs(loans);

  const byLender = Array.from(new Set(loans.map(l => l.lender)))
    .map(lender => ({
      label: lender,
      value: loans.filter(l => l.lender === lender).reduce((s, l) => s + l.loanAmount, 0),
      color: ["#14b8a6", "#0d9488", "#22d3ee", "#3b82f6", "#1e40af"][loans.findIndex(l => l.lender === lender) % 5],
    }));

  const byJob = Array.from(new Set(loans.map(l => l.jobCode)))
    .map(jobCode => ({
      label: jobCode,
      value: loans.filter(l => l.jobCode === jobCode).reduce((s, l) => s + l.totalDrawn, 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Loans</div>
        <h2 className="sh-tab-title">Dashboard</h2>
        <p className="sh-tab-desc">Loan exposure, draw tracking, and lender portfolio.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard label="Total Exposure" value={fmt$(kpis.totalExposure)} sub={`${loans.length} active loans`} accent="#14b8a6" />
        <SHKpiCard label="Total Drawn" value={fmt$(kpis.totalDrawn)} progress={Math.round(kpis.drawPercentage)} sub={`${Math.round(kpis.drawPercentage)}% drawn`} />
        <SHKpiCard label="Draw %" value={fmtPct(kpis.drawPercentage)} accent="#22d3ee" />
        <SHKpiCard label="Expiring Soon" value={fmtN(kpis.expiringSoon)} sub="Within 90 days" accent="#f59e0b" />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Lenders" title="Exposure by Lender">
          <SHDonutChart segments={byLender} />
        </SHPanel>
        <SHPanel kicker="Jobs" title="Draw by Job">
          <SHRankedBars items={byJob} formatValue={v => fmt$(v)} showRank />
        </SHPanel>
      </div>

    </>
  );
}
