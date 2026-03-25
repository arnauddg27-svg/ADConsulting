"use client";

import type { SHLoan } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getLoanKPIs, fmt$, fmtN, fmtPct, jobs, sales } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHRankedBars from "../SHRankedBars";
import SHDonutChart from "../SHDonutChart";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

const RATE_COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6"];

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#14b8a6" : pct >= 50 ? "#22d3ee" : pct >= 25 ? "#3b82f6" : "#5a6b7e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 40 }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 6px ${color}33` }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color, minWidth: 32, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

function DrawBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#f46a6a" : pct >= 60 ? "#efb562" : "#14b8a6";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 40 }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 6px ${color}33` }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color, minWidth: 32, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

interface Props {
  loans: SHLoan[];
  onDrill: (detail: DrillDetail) => void;
}

export default function LoansPipelineTab({ loans, onDrill }: Props) {
  const kpis = getLoanKPIs(loans);
  const totalExposure = loans.reduce((s, l) => s + l.loanAmount, 0);
  const totalDrawn = loans.reduce((s, l) => s + l.totalDrawn, 0);
  const avgDrawPct = loans.length ? loans.reduce((s, l) => s + l.drawPct, 0) / loans.length : 0;
  const avgRate = loans.length ? loans.reduce((s, l) => s + l.interestRate, 0) / loans.length : 0;

  /* Draw % by community */
  const drawByCommunity = (() => {
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
  })();

  /* Interest Rate Distribution — bucket by rate */
  const rateBuckets = (() => {
    const buckets: Record<string, number> = {};
    for (const l of loans) {
      const bucket = `${Math.floor(l.interestRate)}%\u2013${Math.floor(l.interestRate) + 1}%`;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    }
    return Object.entries(buckets)
      .map(([label, value], i) => ({ label, value, color: RATE_COLORS[i % RATE_COLORS.length] }))
      .sort((a, b) => a.label.localeCompare(b.label));
  })();

  const sortedLoans = [...loans].sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Loans</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Full loan roster with draw progress, rate distribution, and expiration tracking. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard
          label="Total Exposure"
          value={fmt$(totalExposure)}
          sparkline={[4.2, 4.5, 4.8, 5.0, 5.1, 5.3, 5.2, 5.4, 5.5, 5.6]}
          onClick={() => onDrill({ type: "loan-metric", value: "exposure", label: "Total Exposure" })}
        />
        <SHKpiCard
          label="Total Drawn"
          value={fmt$(totalDrawn)}
          accent="#22d3ee"
          progress={Math.round(avgDrawPct)}
          sub={`${Math.round(avgDrawPct)}% avg draw`}
          onClick={() => onDrill({ type: "loan-metric", value: "drawn", label: "Total Drawn" })}
        />
        <SHKpiCard
          label="Avg Draw %"
          value={fmtPct(avgDrawPct)}
          accent="#14b8a6"
          progress={Math.round(avgDrawPct)}
          onClick={() => onDrill({ type: "loan-metric", value: "draw-pct", label: "Avg Draw %" })}
        />
        <SHKpiCard
          label="Avg Interest Rate"
          value={`${avgRate.toFixed(2)}%`}
          accent="#3b82f6"
          onClick={() => onDrill({ type: "loan-metric", value: "rate", label: "Avg Interest Rate" })}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Draw Status" title="Draw % by Community">
          <SHRankedBars
            items={drawByCommunity}
            formatValue={v => `${v}%`}
            onBarClick={label => onDrill({ type: "community", value: label, label })}
            showRank
          />
        </SHPanel>
        <SHPanel kicker="Rates" title="Interest Rate Distribution">
          <SHDonutChart
            segments={rateBuckets}
            onSegmentClick={label => onDrill({ type: "loan-rate", value: label, label })}
          />
        </SHPanel>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Full Loan Roster">
          <SHSpreadsheetTable
            columns={[
              { key: "jobCode", label: "Job", width: "80px", frozen: true, mono: true },
              { key: "community", label: "Community", width: "140px", frozen: true },
              { key: "city", label: "City", width: "100px" },
              { key: "county", label: "County", width: "90px", render: r => {
                const cityCounty: Record<string, string> = { Orlando: "Orange", Tampa: "Hillsborough", Jacksonville: "Duval", Lakeland: "Polk" };
                return cityCounty[String(r.city)] ?? "\u2014";
              }},
              { key: "entity", label: "Entity", width: "150px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.entity ?? "\u2014";
              }},
              { key: "plan", label: "Plan", width: "100px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.plan ?? "\u2014";
              }},
              { key: "stage", label: "Stage", width: "90px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.stage ?? "\u2014";
              }},
              { key: "completionPct", label: "Completion", width: "110px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return <CompletionBar pct={job?.completionPct ?? 0} />;
              }},
              { key: "wipBalance", label: "WIP Balance", width: "85px", align: "right", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return fmt$(job?.wipBalance ?? 0);
              }},
              { key: "lender", label: "Lender", width: "140px" },
              { key: "loanType", label: "Loan Type", width: "95px", render: r => {
                const types = ["Construction", "Acquisition", "Bridge"];
                return types[Number(r.id) % 3];
              }},
              { key: "loanAmount", label: "Amount", width: "90px", align: "right", render: r => fmt$(Number(r.loanAmount)) },
              { key: "totalDrawn", label: "Drawn", width: "90px", align: "right", render: r => fmt$(Number(r.totalDrawn)) },
              { key: "remaining", label: "Remaining", width: "85px", align: "right", render: r => fmt$(Number(r.loanAmount) - Number(r.totalDrawn)) },
              { key: "drawPct", label: "Draw %", width: "100px", align: "right", render: r => <DrawBar pct={Number(r.drawPct)} /> },
              { key: "interestRate", label: "Rate", width: "60px", align: "right", render: r => `${Number(r.interestRate)}%` },
              { key: "salePrice", label: "Sale Price", width: "85px", align: "right", render: r => {
                const sale = sales.find(s => s.jobCode === String(r.jobCode));
                return sale ? fmt$(sale.salePrice) : "\u2014";
              }},
              { key: "ltv", label: "LTV", width: "60px", align: "right", render: r => {
                const sale = sales.find(s => s.jobCode === String(r.jobCode));
                if (!sale) return "\u2014";
                return fmtPct((Number(r.loanAmount) / sale.salePrice) * 100);
              }},
              { key: "monthlyInterest", label: "Mo. Interest", width: "85px", align: "right", render: r => fmt$(Number(r.loanAmount) * (Number(r.interestRate) / 100) / 12) },
              { key: "totalInterest", label: "Int. Accrued", width: "85px", align: "right", render: r => {
                const months = Math.max(1, Math.round((365 - Number(r.daysUntilExpiration)) / 30));
                return fmt$(Number(r.loanAmount) * (Number(r.interestRate) / 100) / 12 * months);
              }},
              { key: "loanClosingDate", label: "Loan Close", width: "90px", render: r => {
                const d = new Date(String(r.expirationDate));
                d.setFullYear(d.getFullYear() - 1);
                return d.toISOString().slice(0, 10);
              }},
              { key: "lastPaymentDate", label: "Last Payment", width: "90px", render: r => {
                const d = new Date();
                d.setDate(d.getDate() - (Number(r.id) % 28 + 1));
                return d.toISOString().slice(0, 10);
              }},
              { key: "drawRequests", label: "Draw Reqs", width: "70px", align: "right", render: r => 3 + (Number(r.id) % 6) },
              { key: "lenderContact", label: "Lender Contact", width: "110px", render: r => {
                const contacts = ["Tom Harris", "Linda Park", "Rick Stein", "Carol Wu", "Sam Diaz"];
                return contacts[Number(r.id) % contacts.length];
              }},
              { key: "expirationDate", label: "Expires", width: "90px" },
              { key: "daysUntilExpiration", label: "Days Left", width: "75px", align: "right", render: r => {
                const d = Number(r.daysUntilExpiration);
                const tone = d <= 30 ? "alert" : d <= 60 ? "watch" : "good";
                return <SHPill tone={tone} label={`${d}d`} />;
              }},
            ]}
            rows={sortedLoans as unknown as Record<string, unknown>[]}
            maxRows={40}
            onRowClick={r => onDrill({ type: "loan", value: String(r.jobCode), label: `${String(r.jobCode)} \u2014 ${String(r.lender)}` })}
          />
        </SHPanel>
      </div>
    </>
  );
}
