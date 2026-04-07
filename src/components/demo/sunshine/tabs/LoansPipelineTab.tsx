"use client";

import type { SHLoan } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { fmt$, fmtPct, jobs, sales } from "@/lib/sunshine-homes-data";
import SHPanel from "../SHPanel";
import SHSpreadsheetTable from "../SHSpreadsheetTable";
import SHPill from "../SHPill";

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
  const sortedLoans = [...loans].sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Loans</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Full loan roster with draw progress, rates, and expiration tracking. Click any row for details.</p>
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
              { key: "entity", label: "Entity", width: "160px", render: r => {
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
              { key: "lender", label: "Lender", width: "160px" },
              { key: "loanType", label: "Loan Type", width: "95px", render: r => {
                const types = ["Construction", "Acquisition", "Bridge"];
                return types[Number(r.id) % 3];
              }},
              { key: "loanAmount", label: "Amount", width: "90px", align: "right", render: r => fmt$(Number(r.loanAmount)) },
              { key: "totalDrawn", label: "Drawn", width: "90px", align: "right", render: r => fmt$(Number(r.totalDrawn)) },
              { key: "remaining", label: "Remaining", width: "85px", align: "right", render: r => fmt$(Number(r.loanAmount) - Number(r.totalDrawn)) },
              { key: "drawPct", label: "Draw %", width: "100px", align: "right", render: r => <DrawBar pct={Number(r.drawPct)} /> },
              { key: "interestRate", label: "Rate", width: "70px", align: "right", render: r => `${Number(r.interestRate)}%` },
              { key: "salePrice", label: "Sale Price", width: "85px", align: "right", render: r => {
                const sale = sales.find(s => s.jobCode === String(r.jobCode));
                return sale ? fmt$(sale.salePrice) : "\u2014";
              }},
              { key: "ltv", label: "LTV", width: "70px", align: "right", render: r => {
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
              { key: "lenderContact", label: "Lender Contact", width: "140px", render: r => {
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
