"use client";

import type { SHSale } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { fmt$, fmtPct, jobs } from "@/lib/sunshine-homes-data";
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

const LENDERS = ["First National Bank", "SunTrust Builders", "Capital One CRE", "Regions Construction", "TD Bank"];

interface Props {
  sales: SHSale[];
  onDrill: (detail: DrillDetail) => void;
}

export default function SalesPipelineTab({ sales, onDrill }: Props) {
  const sortedSales = [...sales].sort((a, b) => b.contractDate.localeCompare(a.contractDate));

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Sales</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Full sales roster with contract details, financing, and closing status. Click any row for details.</p>
      </div>

      <div className="sh-panels-row single">
        <SHPanel kicker="Roster" title="Full Sales Roster">
          <SHSpreadsheetTable
            columns={[
              { key: "jobCode", label: "Job", width: "80px", frozen: true, mono: true },
              { key: "community", label: "Community", width: "140px", frozen: true },
              { key: "city", label: "City", width: "100px" },
              { key: "county", label: "County", width: "90px", render: r => {
                const cityCounty: Record<string, string> = { Orlando: "Orange", Tampa: "Hillsborough", Jacksonville: "Duval", Lakeland: "Polk" };
                return cityCounty[String(r.city)] ?? "\u2014";
              }},
              { key: "entity", label: "Entity", width: "150px" },
              { key: "plan", label: "Plan", width: "110px" },
              { key: "buyer", label: "Buyer", width: "130px" },
              { key: "agent", label: "Agent", width: "120px" },
              { key: "salePrice", label: "Price", width: "85px", align: "right", render: r => fmt$(Number(r.salePrice)) },
              { key: "contractDate", label: "Contract", width: "90px" },
              { key: "closingDate", label: "Closing", width: "90px", render: r => String(r.closingDate ?? "\u2014") },
              { key: "status", label: "Status", width: "90px", render: r => {
                const s = String(r.status);
                const tone = s === "closed" ? "good" : s === "pending" ? "watch" : s === "active" ? "good" : "alert";
                return <SHPill tone={tone} label={s} />;
              }},
              { key: "lot", label: "Lot", width: "60px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.lot ?? "\u2014";
              }},
              { key: "stage", label: "Stage", width: "90px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.stage ?? "\u2014";
              }},
              { key: "completionPct", label: "Completion", width: "110px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return <CompletionBar pct={job?.completionPct ?? 0} />;
              }},
              { key: "estCompletion", label: "Est Complete", width: "90px", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return job?.estCompletion ?? "\u2014";
              }},
              { key: "originalBudget", label: "Budget", width: "80px", align: "right", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return fmt$(job?.originalBudget ?? 0);
              }},
              { key: "wipBalance", label: "WIP", width: "80px", align: "right", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                return fmt$(job?.wipBalance ?? 0);
              }},
              { key: "marginPct", label: "Margin %", width: "70px", align: "right", render: r => {
                const job = jobs.find(j => j.jobCode === String(r.jobCode));
                if (!job) return "\u2014";
                const m = job.marginPct;
                return <SHPill tone={m >= 24 ? "good" : m >= 20 ? "watch" : "alert"} label={fmtPct(m)} />;
              }},
              { key: "contractToClose", label: "Days to Close", width: "85px", align: "right", render: r => {
                if (!r.closingDate) return "\u2014";
                const diff = Math.round((new Date(String(r.closingDate)).getTime() - new Date(String(r.contractDate)).getTime()) / 86400000);
                return `${diff}d`;
              }},
              { key: "deposit", label: "Deposit", width: "75px", align: "right", render: r => fmt$(Number(r.salePrice) * 0.05) },
              { key: "financingType", label: "Financing", width: "95px", render: r => {
                const types = ["Conventional", "FHA", "VA", "Cash"];
                return types[Number(r.id) % types.length];
              }},
              { key: "lenderName", label: "Lender", width: "130px", render: r => LENDERS[Number(r.id) % LENDERS.length] },
              { key: "titleCompany", label: "Title Co.", width: "120px", render: r => {
                const cos = ["First American", "Fidelity Title", "Old Republic", "Stewart Title", "Chicago Title"];
                return cos[Number(r.id) % cos.length];
              }},
              { key: "closingAttorney", label: "Closing Atty", width: "110px", render: r => {
                const attys = ["Smith & Associates", "Johnson Law", "Davis Legal", "Wilson Group", "Brown Partners"];
                return attys[Number(r.id) % attys.length];
              }},
              { key: "commissionPct", label: "Comm %", width: "65px", align: "right", render: r => {
                const pct = 3 + (Number(r.id) % 4);
                return `${pct}%`;
              }},
              { key: "commissionAmt", label: "Commission", width: "85px", align: "right", render: r => {
                const pct = (3 + (Number(r.id) % 4)) / 100;
                return fmt$(Number(r.salePrice) * pct);
              }},
              { key: "netProceeds", label: "Net Proceeds", width: "90px", align: "right", render: r => {
                const commPct = (3 + (Number(r.id) % 4)) / 100;
                const closingCosts = Number(r.salePrice) * 0.02;
                return fmt$(Number(r.salePrice) - Number(r.salePrice) * commPct - closingCosts);
              }},
            ]}
            rows={sortedSales as unknown as Record<string, unknown>[]}
            maxRows={40}
            onRowClick={r => onDrill({ type: "sale", value: String(r.jobCode), label: `${String(r.jobCode)} \u2014 ${String(r.buyer)}` })}
          />
        </SHPanel>
      </div>
    </>
  );
}
