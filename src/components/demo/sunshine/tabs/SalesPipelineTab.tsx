"use client";

import type { SHSale } from "@/types/sunshine-homes";
import type { DrillDetail } from "../SHDrawer";
import { getSalesKPIs, buildCrossTab, fmt$, fmtN, fmtPct, jobs } from "@/lib/sunshine-homes-data";
import SHKpiCard from "../SHKpiCard";
import SHPanel from "../SHPanel";
import SHCrossTab from "../SHCrossTab";
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
  const kpis = getSalesKPIs(sales);

  const closedSales = sales.filter(s => s.status === "closed");
  const closedValue = closedSales.reduce((s, sale) => s + sale.salePrice, 0);
  const underContract = sales.filter(s => s.status === "pending").length;
  const avgPrice = sales.length ? sales.reduce((s, sale) => s + sale.salePrice, 0) / sales.length : 0;

  /* Cross-tab: City x Status (inventory) */
  const inventoryCross = buildCrossTab(sales, "city", "status");

  /* Cross-tab: Entity x Year (derive year from contractDate) */
  const salesWithYear = sales.map(s => ({
    ...s,
    saleYear: String(new Date(s.contractDate).getFullYear()),
  }));
  const entityYearCross = buildCrossTab(salesWithYear, "entity", "saleYear");

  const sortedSales = [...sales].sort((a, b) => b.contractDate.localeCompare(a.contractDate));

  return (
    <>
      <div className="sh-tab-header">
        <div className="sh-tab-kicker">Sales</div>
        <h2 className="sh-tab-title">Pipeline</h2>
        <p className="sh-tab-desc">Inventory cross-tabs, entity performance, and full sales roster. Click any element for details.</p>
      </div>

      <div className="sh-kpi-row">
        <SHKpiCard
          label="Closed"
          value={`${fmtN(closedSales.length)} / ${fmt$(closedValue)}`}
          sub={`${closedSales.length} closed sales`}
          accent="#14b8a6"
          sparkline={[8, 10, 12, 11, 14, 15, 16, 18, 19, 20]}
          delta="+12% vs Q3"
          deltaDir="up"
          onClick={() => onDrill({ type: "sale-status", value: "closed", label: "Closed Sales" })}
        />
        <SHKpiCard
          label="Under Contract"
          value={fmtN(underContract)}
          accent="#efb562"
          onClick={() => onDrill({ type: "sale-status", value: "pending", label: "Under Contract" })}
        />
        <SHKpiCard
          label="Total Sales"
          value={fmtN(kpis.totalSales)}
          sub={fmt$(kpis.totalValue)}
          sparkline={[12, 13, 14, 13, 15, 16, 15, 17, 18, 20]}
          onClick={() => onDrill({ type: "sale-status", value: "all", label: "All Sales" })}
        />
        <SHKpiCard
          label="Avg Price"
          value={fmt$(avgPrice)}
          accent="#3b82f6"
          sparkline={[460, 470, 475, 480, 490, 495, 498, 502, 505, 510]}
          delta="+3% YoY"
          deltaDir="up"
          onClick={() => onDrill({ type: "sale-metric", value: "avg-price", label: "Avg Sale Price" })}
        />
      </div>

      <div className="sh-panels-row">
        <SHPanel kicker="Inventory" title="City x Status (Lot Count)">
          <SHCrossTab
            {...inventoryCross}
            onCellClick={(row, col, value) =>
              onDrill({ type: "sale-city-status", value: `${row}|${col}`, label: `${row} \u2014 ${col} (${value})` })
            }
          />
        </SHPanel>
        <SHPanel kicker="Entities" title="Entity x Year">
          <SHCrossTab
            {...entityYearCross}
            onCellClick={(row, col, value) =>
              onDrill({ type: "sale-entity-year", value: `${row}|${col}`, label: `${row} ${col} (${value})` })
            }
          />
        </SHPanel>
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
