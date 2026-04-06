"use client";

import { useEffect } from "react";
import type { SHJob, SHSale, SHLoan, SHLandDeal, SHPermit, SHPropertyUnit, SHAuditJob } from "@/types/sunshine-homes";
import { jobs, sales, loans, landDeals, permits, propertyUnits, auditJobs, fmt$, fmtPct } from "@/lib/sunshine-homes-data";
import SHPill from "./SHPill";

export interface DrillDetail {
  type: "job" | "community" | "city" | "stage" | "plan" | "lender" | "super" | "sale" | "loan" | "permit" | "unit" | "property" | "cost-category" | "margin-bucket" | "permit-status" | "occupancy" | "land-status" | "land-metric" | "land-city-year" | "permit-city-year" | "permit-city-status" | "loan-metric" | "loan-rate" | "sale-status" | "sale-metric" | "sale-city-status" | "sale-entity-year" | "pm-metric" | "pm-occupancy" | "cycle-time-cohort";
  value: string;
  label: string;
  community?: string; // optional community pre-filter for cost drill-downs
}

interface SHDrawerProps {
  detail: DrillDetail | null;
  onClose: () => void;
}

interface Col {
  key: string;
  label: string;
  width: string;
  align?: "right";
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

/* ── Reusable column definitions ────────────────────────────────── */

const landStatusPill = (r: Record<string, unknown>) => {
  const s = String(r.status);
  return <SHPill tone={s === "closed" ? "good" : s === "under-contract" ? "watch" : "alert"} label={s.replace(/-/g, " ")} />;
};

const landCols: Col[] = [
  { key: "name", label: "Deal", width: "1.2fr" },
  { key: "city", label: "City", width: "90px" },
  { key: "acres", label: "Acres", width: "55px", align: "right" },
  { key: "lots", label: "Lots", width: "50px", align: "right" },
  { key: "costPerLot", label: "$/Lot", width: "65px", align: "right", render: r => fmt$(Number(r.costPerLot)) },
  { key: "acquisitionCost", label: "Total", width: "75px", align: "right", render: r => fmt$(Number(r.acquisitionCost)) },
  { key: "status", label: "Status", width: "90px", render: landStatusPill },
];

const permitDaysPill = (r: Record<string, unknown>) => {
  const d = Number(r.daysInReview);
  return <SHPill tone={d > 30 ? "alert" : d > 15 ? "watch" : "good"} label={`${d}d`} />;
};

const permitStatusPill = (r: Record<string, unknown>) => {
  const s = String(r.status);
  return <SHPill tone={s === "approved" || s === "issued" ? "good" : s === "in-review" || s === "pending" ? "watch" : "alert"} label={s.replace(/-/g, " ")} />;
};

const permitCols: Col[] = [
  { key: "jobCode", label: "Job", width: "80px" },
  { key: "community", label: "Community", width: "120px" },
  { key: "city", label: "City", width: "80px" },
  { key: "permitType", label: "Type", width: "80px" },
  { key: "submittedDate", label: "Submitted", width: "85px" },
  { key: "daysInReview", label: "Days", width: "50px", align: "right", render: permitDaysPill },
  { key: "status", label: "Status", width: "80px", render: permitStatusPill },
];

const loanExpPill = (r: Record<string, unknown>) => {
  const d = Number(r.daysUntilExpiration);
  return <SHPill tone={d <= 30 ? "alert" : d <= 60 ? "watch" : "good"} label={`${d}d`} />;
};

const loanCols: Col[] = [
  { key: "jobCode", label: "Job", width: "80px" },
  { key: "community", label: "Community", width: "120px" },
  { key: "lender", label: "Lender", width: "120px" },
  { key: "loanAmount", label: "Amount", width: "80px", align: "right", render: r => fmt$(Number(r.loanAmount)) },
  { key: "drawPct", label: "Draw %", width: "60px", align: "right", render: r => fmtPct(Number(r.drawPct)) },
  { key: "interestRate", label: "Rate", width: "50px", align: "right", render: r => `${Number(r.interestRate)}%` },
  { key: "daysUntilExpiration", label: "Exp", width: "50px", align: "right", render: loanExpPill },
];

const saleStatusPill = (r: Record<string, unknown>) => {
  const s = String(r.status);
  return <SHPill tone={s === "closed" ? "good" : s === "active" || s === "pending" ? "watch" : "alert"} label={s} />;
};

const saleCols: Col[] = [
  { key: "jobCode", label: "Job", width: "80px" },
  { key: "community", label: "Community", width: "120px" },
  { key: "buyer", label: "Buyer", width: "100px" },
  { key: "salePrice", label: "Price", width: "80px", align: "right", render: r => fmt$(Number(r.salePrice)) },
  { key: "contractDate", label: "Contract", width: "85px" },
  { key: "status", label: "Status", width: "80px", render: saleStatusPill },
];

const pmOccPill = (r: Record<string, unknown>) => {
  const s = String(r.occupancy);
  return <SHPill tone={s === "leased" ? "good" : s === "vacant" ? "alert" : s === "make-ready" ? "watch" : "alert"} label={s.replace(/-/g, " ")} />;
};

const pmCols: Col[] = [
  { key: "address", label: "Address", width: "1fr" },
  { key: "community", label: "Community", width: "110px" },
  { key: "occupancy", label: "Status", width: "80px", render: pmOccPill },
  { key: "tenant", label: "Tenant", width: "100px", render: r => String(r.tenant ?? "\u2014") },
  { key: "monthlyRent", label: "Rent", width: "70px", align: "right", render: r => fmt$(Number(r.monthlyRent)) },
  { key: "delinquentAmount", label: "Delinq", width: "65px", align: "right", render: r => {
    const v = Number(r.delinquentAmount);
    return v > 0 ? <span style={{ color: "var(--sh-danger)", fontWeight: 700 }}>{fmt$(v)}</span> : "\u2014";
  }},
];

const auditMarginPill = (r: Record<string, unknown>) => {
  const m = Number(r.netMargin);
  return <SHPill tone={m >= 15 ? "good" : m >= 5 ? "watch" : "alert"} label={fmtPct(m)} />;
};

const auditCols: Col[] = [
  { key: "jobCode", label: "Job", width: "80px" },
  { key: "community", label: "Community", width: "120px" },
  { key: "salePrice", label: "Sale", width: "75px", align: "right", render: r => fmt$(Number(r.salePrice)) },
  { key: "totalCost", label: "Cost", width: "75px", align: "right", render: r => fmt$(Number(r.totalCost)) },
  { key: "netMargin", label: "Margin", width: "60px", align: "right", render: auditMarginPill },
];

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Normalize a status string for comparison: lowercase + replace spaces with hyphens */
function normStatus(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

/** Parse "City|Extra" compound values */
function parsePipe(value: string): [string, string] {
  const idx = value.indexOf("|");
  if (idx === -1) return [value, ""];
  return [value.slice(0, idx), value.slice(idx + 1)];
}

/* ── Table renderer ──────────────────────────────────────────────── */

function renderTable(columns: Col[], rows: Record<string, unknown>[]) {
  const grid = columns.map(c => c.width).join(" ");
  return (
    <div style={{ maxHeight: "calc(100% - 60px)", overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: grid, padding: "6px 0", borderBottom: "2px solid rgba(20,184,166,0.2)", position: "sticky", top: 0, background: "var(--sh-bg-surface-raised)", zIndex: 2 }}>
        {columns.map(c => (
          <span key={c.key} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--sh-text-muted)", padding: "0 8px", textAlign: c.align }}>{c.label}</span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: grid, padding: "5px 0", borderBottom: "1px solid var(--sh-border-dim)", fontSize: 11, color: "var(--sh-text-primary)" }}>
          {columns.map(c => (
            <span key={c.key} style={{ padding: "0 8px", textAlign: c.align, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.render ? c.render(r) : String(r[c.key] ?? "\u2014")}
            </span>
          ))}
        </div>
      ))}
      {rows.length === 0 && <div style={{ padding: 16, fontSize: 11, color: "var(--sh-text-muted)", fontStyle: "italic" }}>No data</div>}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */

export default function SHDrawer({ detail, onClose }: SHDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!detail) return null;

  let title = detail.label;
  let subtitle = "";
  let columns: Col[] = [];
  let rows: Record<string, unknown>[] = [];

  switch (detail.type) {

    /* ═══════════════ CONSTRUCTION ═══════════════ */

    case "job": {
      const job = jobs.find(j => j.jobCode === detail.value);
      if (!job) break;
      title = `${job.jobCode} — ${job.community}`;
      subtitle = `${job.lot} · ${job.plan} · ${job.superintendent}`;
      const jobSales = sales.filter(s => s.jobCode === detail.value);
      const jobLoans = loans.filter(l => l.jobCode === detail.value);
      const audit = auditJobs.find(a => a.jobCode === detail.value);
      columns = [
        { key: "field", label: "Field", width: "1.2fr" },
        { key: "value", label: "Value", width: "1fr", align: "right" },
      ];

      if (audit) {
        /* Pro Forma P&L Card — like the export.pdf */
        rows = [
          { field: "══ REVENUE ══", value: "" },
          { field: "Sale Price", value: fmt$(audit.salePrice) },
          { field: "Proceeds", value: fmt$(audit.proceeds) },
          { field: "Seller Credit", value: fmt$(audit.sellerCredit) },
          { field: "", value: "" },
          { field: "══ DIRECT COSTS ══", value: "" },
          { field: "Lot / Land", value: fmt$(audit.lotLand) },
          { field: "Permitting", value: fmt$(audit.permitting) },
          { field: "Site Work", value: fmt$(audit.siteWork) },
          { field: "Vertical", value: fmt$(audit.vertical) },
          { field: "Options", value: fmt$(audit.options) },
          { field: "Dirt / Pad Build", value: fmt$(audit.dirtPad) },
          { field: "Dumpsters / Toilets", value: fmt$(audit.dumpsters) },
          { field: "Total Direct", value: fmt$(audit.totalDirectCost) },
          { field: "", value: "" },
          { field: "══ INDIRECT COSTS ══", value: "" },
          { field: "Financing", value: fmt$(audit.financing) },
          { field: "Insurance / Builder's Risk", value: fmt$(audit.insurance) },
          { field: "Closing Cost", value: fmt$(audit.closingCost) },
          { field: "Total Indirect", value: fmt$(audit.totalIndirectCost) },
          { field: "", value: "" },
          { field: "══ TOTALS ══", value: "" },
          { field: "Total Cost", value: fmt$(audit.totalCost) },
          { field: "Builder Fee", value: `${fmt$(audit.builderFee)} (${audit.builderFeePct}%)` },
          { field: "Contingency", value: fmt$(audit.contingency) },
          { field: "", value: "" },
          { field: "══ BOTTOM LINE ══", value: "" },
          { field: "Net Profit", value: fmt$(audit.netProfit) },
          { field: "Net Margin", value: fmtPct(audit.netMargin) },
        ];
      } else {
        /* Standard job detail + related sales/loans */
        rows = [
          { field: "Stage", value: job.stage },
          { field: "Completion", value: fmtPct(job.completionPct) },
          { field: "Days in Phase", value: `${job.daysInCurrentPhase}d` },
          { field: "Total Cycle Days", value: `${job.totalCycleDays}d` },
          { field: "Contract Value", value: fmt$(job.contractValue) },
          { field: "Original Budget", value: fmt$(job.originalBudget) },
          { field: "Actual Cost", value: fmt$(job.actualCostToDate) },
          { field: "WIP Balance", value: fmt$(job.wipBalance) },
          { field: "Projected Final", value: fmt$(job.projectedFinalCost) },
          { field: "Margin", value: `${fmt$(job.margin)} (${fmtPct(job.marginPct)})` },
          { field: "Lot Cost", value: fmt$(job.lotCost) },
          { field: "Start Date", value: job.startDate },
          { field: "Est. Completion", value: job.estCompletion },
          ...(jobSales.length > 0 ? [{ field: "—— Sales ——", value: "" }] : []),
          ...jobSales.map(s => ({ field: `Sale → ${s.buyer}`, value: `${fmt$(s.salePrice)} (${s.status})` })),
          ...(jobLoans.length > 0 ? [{ field: "—— Loans ——", value: "" }] : []),
          ...jobLoans.map(l => ({ field: `Loan → ${l.lender}`, value: `${fmt$(l.loanAmount)} (${fmtPct(l.drawPct)} drawn)` })),
        ];
      }
      break;
    }

    case "community": {
      const communityJobs = jobs.filter(j => j.community === detail.value);
      title = `${detail.value} \u2014 All Jobs`;
      subtitle = `${communityJobs.length} jobs`;
      columns = [
        { key: "jobCode", label: "Job", width: "80px" },
        { key: "lot", label: "Lot", width: "70px" },
        { key: "plan", label: "Plan", width: "100px" },
        { key: "stage", label: "Stage", width: "100px", render: r => {
          const s = String(r.stage);
          return <SHPill tone={s === "Closing" ? "good" : s === "Permit" ? "watch" : "good"} label={s} />;
        }},
        { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
        { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
        { key: "superintendent", label: "Super", width: "90px" },
        { key: "daysInCurrentPhase", label: "Days", width: "50px", align: "right", render: r => {
          const d = Number(r.daysInCurrentPhase);
          return <span style={{ color: d > 30 ? "var(--sh-danger)" : d > 20 ? "var(--sh-warning)" : "inherit", fontWeight: d > 20 ? 700 : 400 }}>{d}d</span>;
        }},
      ];
      rows = communityJobs as unknown as Record<string, unknown>[];
      break;
    }

    case "stage": {
      const stageJobs = jobs.filter(j => j.stage === detail.value);
      title = `${detail.value} \u2014 All Jobs`;
      subtitle = `${stageJobs.length} jobs in this phase`;
      columns = [
        { key: "jobCode", label: "Job", width: "80px" },
        { key: "community", label: "Community", width: "130px" },
        { key: "lot", label: "Lot", width: "70px" },
        { key: "plan", label: "Plan", width: "100px" },
        { key: "superintendent", label: "Super", width: "100px" },
        { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
        { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
        { key: "daysInCurrentPhase", label: "Days", width: "50px", align: "right", render: r => {
          const d = Number(r.daysInCurrentPhase);
          return <span style={{ color: d > 30 ? "var(--sh-danger)" : d > 20 ? "var(--sh-warning)" : "inherit", fontWeight: d > 20 ? 700 : 400 }}>{d}d</span>;
        }},
      ];
      rows = stageJobs as unknown as Record<string, unknown>[];
      break;
    }

    case "plan": {
      const planJobs = jobs.filter(j => j.plan === detail.value);
      title = `${detail.value} \u2014 Jobs`;
      subtitle = `${planJobs.length} jobs with this plan`;
      columns = [
        { key: "jobCode", label: "Job", width: "80px" },
        { key: "community", label: "Community", width: "130px" },
        { key: "stage", label: "Stage", width: "90px" },
        { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
        { key: "contractValue", label: "Contract", width: "80px", align: "right", render: r => fmt$(Number(r.contractValue)) },
        { key: "marginPct", label: "Margin", width: "60px", align: "right", render: r => fmtPct(Number(r.marginPct)) },
      ];
      rows = planJobs as unknown as Record<string, unknown>[];
      break;
    }

    case "super": {
      const superJobs = jobs.filter(j => j.superintendent === detail.value);
      title = `${detail.value} \u2014 Workload`;
      subtitle = `${superJobs.length} assigned jobs`;
      columns = [
        { key: "jobCode", label: "Job", width: "80px" },
        { key: "community", label: "Community", width: "130px" },
        { key: "stage", label: "Stage", width: "90px" },
        { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
        { key: "daysInCurrentPhase", label: "Days", width: "50px", align: "right" },
        { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
      ];
      rows = superJobs as unknown as Record<string, unknown>[];
      break;
    }

    case "cycle-time-cohort": {
      /* Drill-down for cycle time trendline clicks — filter by quarter cohort */
      const cohortJobs = jobs.filter(j => {
        if (!j.coDate) return false;
        const d = new Date(j.startDate);
        const q = Math.floor(d.getMonth() / 3) + 1;
        const key = `${d.getFullYear()} Q${q}`;
        return key === detail.value;
      });
      /* Fall back to all completed if no cohort match */
      const result = cohortJobs.length > 0 ? cohortJobs : jobs.filter(j => j.coDate);
      /* Helper: days between two date strings (null-safe) */
      const daysBetween = (a: string | null, b: string | null) => {
        if (!a || !b) return null;
        const ms = new Date(b).getTime() - new Date(a).getTime();
        return Math.round(ms / 86400000);
      };
      title = `${detail.label}`;
      subtitle = `${result.length} completed jobs`;
      columns = [
        { key: "jobCode", label: "Job", width: "70px" },
        { key: "community", label: "Community", width: "110px" },
        { key: "startDate", label: "Start", width: "75px" },
        { key: "coDate", label: "End Date", width: "75px", render: r => String(r.coDate ?? "\u2014") },
        { key: "totalCycleDays", label: "Cycle", width: "55px", align: "right", render: r => {
          const d = Number(r.totalCycleDays);
          return <span>{(d / 30.44).toFixed(1)}mo</span>;
        }},
        { key: "foundation", label: "Found.", width: "50px", align: "right", render: r => {
          const d = daysBetween(String(r.foundationDate || ""), String(r.framingDate || ""));
          return <span style={{ color: "var(--sh-text-secondary)" }}>{d != null ? `${d}d` : "\u2014"}</span>;
        }},
        { key: "framing", label: "Frame", width: "50px", align: "right", render: r => {
          const d = daysBetween(String(r.framingDate || ""), String(r.mepDate || ""));
          return <span style={{ color: "var(--sh-text-secondary)" }}>{d != null ? `${d}d` : "\u2014"}</span>;
        }},
        { key: "mep", label: "MEP", width: "45px", align: "right", render: r => {
          const d = daysBetween(String(r.mepDate || ""), String(r.drywallDate || ""));
          return <span style={{ color: "var(--sh-text-secondary)" }}>{d != null ? `${d}d` : "\u2014"}</span>;
        }},
        { key: "finishes", label: "Finish", width: "50px", align: "right", render: r => {
          const d = daysBetween(String(r.finishesDate || ""), String(r.coDate || ""));
          return <span style={{ color: "var(--sh-text-secondary)" }}>{d != null ? `${d}d` : "\u2014"}</span>;
        }},
        { key: "marginPct", label: "Margin", width: "55px", align: "right", render: r => fmtPct(Number(r.marginPct)) },
      ];
      rows = result as unknown as Record<string, unknown>[];
      break;
    }

    case "cost-category": {
      /* Drill-down for cost metric KPI clicks — per-cost-code rows with optional community filter */
      const filtered = detail.community
        ? jobs.filter(j => j.community === detail.community)
        : jobs;
      /* Flatten each job into 3 cost-code rows: Permitting, Sidewalk, Vertical */
      const costCodeRows = filtered.flatMap(j => [
        { jobCode: j.jobCode, community: j.community, costCode: "Permitting", budget: j.permittingBudget, actual: j.permittingActual, variance: j.permittingActual - j.permittingBudget },
        { jobCode: j.jobCode, community: j.community, costCode: "Sidewalk", budget: j.sidewalkBudget, actual: j.sidewalkActual, variance: j.sidewalkActual - j.sidewalkBudget },
        { jobCode: j.jobCode, community: j.community, costCode: "Vertical", budget: j.verticalBudget, actual: j.verticalActual, variance: j.verticalActual - j.verticalBudget },
      ]).sort((a, b) => a.variance - b.variance);
      title = detail.label;
      subtitle = `${filtered.length} jobs · ${costCodeRows.length} line items`;
      columns = [
        { key: "jobCode", label: "Job", width: "70px" },
        { key: "community", label: "Community", width: "110px" },
        { key: "costCode", label: "Cost Code", width: "80px" },
        { key: "budget", label: "Budget", width: "70px", align: "right", render: r => fmt$(Number(r.budget)) },
        { key: "actual", label: "Actual", width: "70px", align: "right", render: r => fmt$(Number(r.actual)) },
        { key: "variance", label: "Variance", width: "75px", align: "right", render: r => {
          const v = Number(r.variance);
          return <span style={{ color: v > 0 ? "var(--sh-danger)" : "var(--sh-accent)", fontWeight: 600 }}>{fmt$(v)}</span>;
        }},
      ];
      rows = costCodeRows as unknown as Record<string, unknown>[];
      break;
    }

    /* ═══════════════ LAND ═══════════════ */

    case "land-status": {
      const matched = landDeals.filter(d =>
        d.status === detail.value || d.name === detail.value ||
        normStatus(d.status) === normStatus(detail.value)
      );
      const result = matched.length > 0 ? matched : landDeals;
      title = detail.label;
      subtitle = `${result.length} land deals`;
      columns = landCols;
      rows = result as unknown as Record<string, unknown>[];
      break;
    }

    case "land-metric": {
      title = detail.label;
      subtitle = `${landDeals.length} land deals`;
      columns = landCols;
      rows = [...landDeals].sort((a, b) => {
        const key = detail.value as keyof SHLandDeal;
        const av = typeof a[key] === "number" ? (a[key] as number) : 0;
        const bv = typeof b[key] === "number" ? (b[key] as number) : 0;
        return bv - av;
      }) as unknown as Record<string, unknown>[];
      break;
    }

    case "land-city-year": {
      const [city] = parsePipe(detail.value);
      const matched = landDeals.filter(d => d.city === city);
      const result = matched.length > 0 ? matched : landDeals;
      title = detail.label;
      subtitle = `${result.length} land deals`;
      columns = landCols;
      rows = result as unknown as Record<string, unknown>[];
      break;
    }

    case "city": {
      const cityDeals = landDeals.filter(d => d.city === detail.value);
      if (cityDeals.length > 0) {
        title = `${detail.value} \u2014 Land Deals`;
        subtitle = `${cityDeals.length} deals, ${cityDeals.reduce((s, d) => s + d.lots, 0)} lots`;
        columns = landCols;
        rows = cityDeals as unknown as Record<string, unknown>[];
      } else {
        const cityJobs = jobs.filter(j => j.city === detail.value);
        title = `${detail.value} \u2014 All Jobs`;
        subtitle = `${cityJobs.length} jobs`;
        columns = [
          { key: "jobCode", label: "Job", width: "80px" },
          { key: "community", label: "Community", width: "130px" },
          { key: "stage", label: "Stage", width: "100px" },
          { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
          { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
        ];
        rows = cityJobs as unknown as Record<string, unknown>[];
      }
      break;
    }

    /* ═══════════════ PERMITS ═══════════════ */

    case "permit-status": {
      const v = detail.value.toLowerCase().replace(/\s+/g, "-");
      /* "in-progress" means in-review + pending; "all" means everything */
      const statusPermits = v === "all" ? permits
        : v === "in-progress" ? permits.filter(p => p.status === "in-review" || p.status === "pending")
        : permits.filter(p => p.status === v || p.status.replace(/-/g, " ") === detail.value.toLowerCase());
      title = `${detail.value} Permits`;
      subtitle = `${statusPermits.length} permits`;
      columns = permitCols;
      rows = statusPermits as unknown as Record<string, unknown>[];
      break;
    }

    case "permit-city-year": {
      const [city, year] = parsePipe(detail.value);
      const matched = permits.filter(p => {
        const cityMatch = p.city === city;
        const yearMatch = year ? String(p.year) === year : true;
        return cityMatch && yearMatch;
      });
      title = detail.label;
      subtitle = `${matched.length} permits`;
      columns = permitCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "permit-city-status": {
      const [city, status] = parsePipe(detail.value);
      const matched = permits.filter(p => {
        const cityMatch = p.city === city;
        const statusMatch = status ? normStatus(p.status) === normStatus(status) : true;
        return cityMatch && statusMatch;
      });
      title = detail.label;
      subtitle = `${matched.length} permits`;
      columns = permitCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "permit": {
      const p = permits.find(p => p.jobCode === detail.value || String(p.id) === detail.value);
      if (p) {
        title = `Permit \u2014 ${p.jobCode}`;
        subtitle = `${p.permitType} \u00b7 ${p.city}`;
        columns = [
          { key: "field", label: "Field", width: "1.2fr" },
          { key: "value", label: "Value", width: "1fr", align: "right" },
        ];
        rows = [
          { field: "Job Code", value: p.jobCode },
          { field: "Community", value: p.community },
          { field: "City", value: p.city },
          { field: "Permit Type", value: p.permitType },
          { field: "Sub-Type", value: p.permitSubType },
          { field: "Submitted", value: p.submittedDate },
          { field: "Approved", value: p.approvedDate ?? "\u2014" },
          { field: "Issued", value: p.issuedDate ?? "\u2014" },
          { field: "Days in Review", value: `${p.daysInReview}d` },
          { field: "Status", value: p.status.replace(/-/g, " ") },
        ];
      }
      break;
    }

    /* ═══════════════ LOANS ═══════════════ */

    case "lender": {
      const lenderLoans = loans.filter(l => l.lender === detail.value);
      title = `${detail.value} \u2014 Loans`;
      subtitle = `${lenderLoans.length} active loans`;
      columns = loanCols;
      rows = lenderLoans as unknown as Record<string, unknown>[];
      break;
    }

    case "loan": {
      const l = loans.find(l => l.jobCode === detail.value || String(l.id) === detail.value);
      if (l) {
        title = `Loan \u2014 ${l.jobCode}`;
        subtitle = `${l.lender} \u00b7 ${l.community}`;
        columns = [
          { key: "field", label: "Field", width: "1.2fr" },
          { key: "value", label: "Value", width: "1fr", align: "right" },
        ];
        rows = [
          { field: "Job Code", value: l.jobCode },
          { field: "Community", value: l.community },
          { field: "City", value: l.city },
          { field: "Lender", value: l.lender },
          { field: "Loan Amount", value: fmt$(l.loanAmount) },
          { field: "Total Drawn", value: fmt$(l.totalDrawn) },
          { field: "Draw %", value: fmtPct(l.drawPct) },
          { field: "Interest Rate", value: `${l.interestRate}%` },
          { field: "Expiration Date", value: l.expirationDate },
          { field: "Days Until Exp", value: `${l.daysUntilExpiration}d` },
        ];
      }
      break;
    }

    case "loan-metric": {
      title = detail.label;
      subtitle = `${loans.length} loans`;
      columns = loanCols;
      rows = [...loans].sort((a, b) => {
        const key = detail.value as keyof SHLoan;
        const av = typeof a[key] === "number" ? (a[key] as number) : 0;
        const bv = typeof b[key] === "number" ? (b[key] as number) : 0;
        return bv - av;
      }) as unknown as Record<string, unknown>[];
      break;
    }

    case "loan-rate": {
      const matched = loans.filter(l => {
        const v = detail.value;
        if (v.includes("<") || v.includes("Under")) return l.interestRate < 5;
        if (v.includes("5") && v.includes("6")) return l.interestRate >= 5 && l.interestRate < 6;
        if (v.includes("6") && v.includes("7")) return l.interestRate >= 6 && l.interestRate < 7;
        if (v.includes("7") && v.includes("8")) return l.interestRate >= 7 && l.interestRate < 8;
        if (v.includes(">") || v.includes("8+") || v.includes("Over")) return l.interestRate >= 8;
        // Try exact match on rate value
        const num = parseFloat(v);
        if (!isNaN(num)) return Math.floor(l.interestRate) === Math.floor(num);
        return true;
      });
      title = detail.label;
      subtitle = `${matched.length} loans`;
      columns = loanCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    /* ═══════════════ SALES ═══════════════ */

    case "sale": {
      const s = sales.find(s => s.jobCode === detail.value || String(s.id) === detail.value);
      if (s) {
        title = `Sale \u2014 ${s.jobCode}`;
        subtitle = `${s.buyer} \u00b7 ${s.community}`;
        columns = [
          { key: "field", label: "Field", width: "1.2fr" },
          { key: "value", label: "Value", width: "1fr", align: "right" },
        ];
        rows = [
          { field: "Job Code", value: s.jobCode },
          { field: "Community", value: s.community },
          { field: "City", value: s.city },
          { field: "Entity", value: s.entity },
          { field: "Plan", value: s.plan },
          { field: "Buyer", value: s.buyer },
          { field: "Agent", value: s.agent },
          { field: "Sale Price", value: fmt$(s.salePrice) },
          { field: "Contract Date", value: s.contractDate },
          { field: "Closing Date", value: s.closingDate ?? "\u2014" },
          { field: "Status", value: s.status },
        ];
      }
      break;
    }

    case "sale-status": {
      const matched = sales.filter(s => normStatus(s.status) === normStatus(detail.value));
      title = `${detail.value} Sales`;
      subtitle = `${matched.length} sales`;
      columns = saleCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "sale-metric": {
      title = detail.label;
      subtitle = `${sales.length} sales`;
      columns = saleCols;
      rows = [...sales].sort((a, b) => {
        const key = detail.value as keyof SHSale;
        const av = typeof a[key] === "number" ? (a[key] as number) : 0;
        const bv = typeof b[key] === "number" ? (b[key] as number) : 0;
        return bv - av;
      }) as unknown as Record<string, unknown>[];
      break;
    }

    case "sale-city-status": {
      const [city, status] = parsePipe(detail.value);
      const matched = sales.filter(s => {
        const cityMatch = s.city === city;
        const statusMatch = status ? normStatus(s.status) === normStatus(status) : true;
        return cityMatch && statusMatch;
      });
      title = detail.label;
      subtitle = `${matched.length} sales`;
      columns = saleCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "sale-entity-year": {
      const [entity, year] = parsePipe(detail.value);
      const matched = sales.filter(s => {
        const entityMatch = s.entity === entity;
        const yearMatch = year ? s.contractDate.startsWith(year) || s.contractDate.includes(year) : true;
        return entityMatch && yearMatch;
      });
      title = detail.label;
      subtitle = `${matched.length} sales`;
      columns = saleCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    /* ═══════════════ PROPERTY MANAGEMENT ═══════════════ */

    case "unit":
    case "property": {
      const u = propertyUnits.find(u => u.address === detail.value || String(u.id) === detail.value);
      if (u) {
        title = `Unit \u2014 ${u.address}`;
        subtitle = `${u.community} \u00b7 ${u.city}`;
        columns = [
          { key: "field", label: "Field", width: "1.2fr" },
          { key: "value", label: "Value", width: "1fr", align: "right" },
        ];
        rows = [
          { field: "Address", value: u.address },
          { field: "Community", value: u.community },
          { field: "City", value: u.city },
          { field: "Entity", value: u.entity },
          { field: "Beds/Baths", value: u.bedsBaths },
          { field: "Sq Ft", value: `${u.sqft.toLocaleString()} sf` },
          { field: "Monthly Rent", value: fmt$(u.monthlyRent) },
          { field: "Market Rent", value: fmt$(u.marketRent) },
          { field: "Deposit", value: fmt$(u.deposit) },
          { field: "Mgmt %", value: fmtPct(u.managementPct) },
          { field: "Occupancy", value: u.occupancy.replace(/-/g, " ") },
          { field: "Tenant", value: u.tenant ?? "\u2014" },
          { field: "Lease End", value: u.leaseEnd ?? "\u2014" },
          { field: "Delinquent", value: u.delinquentAmount > 0 ? fmt$(u.delinquentAmount) : "\u2014" },
          { field: "Days Past Due", value: u.daysPastDue > 0 ? `${u.daysPastDue}d` : "\u2014" },
        ];
      }
      break;
    }

    case "occupancy": {
      const occUnits = propertyUnits.filter(u =>
        u.occupancy === detail.value ||
        normStatus(u.occupancy) === normStatus(detail.value)
      );
      title = `${detail.label} Units`;
      subtitle = `${occUnits.length} units`;
      columns = pmCols;
      rows = occUnits as unknown as Record<string, unknown>[];
      break;
    }

    case "pm-metric": {
      title = detail.label;
      subtitle = `${propertyUnits.length} units`;
      columns = pmCols;
      rows = [...propertyUnits].sort((a, b) => {
        const key = detail.value as keyof SHPropertyUnit;
        const av = typeof a[key] === "number" ? (a[key] as number) : 0;
        const bv = typeof b[key] === "number" ? (b[key] as number) : 0;
        return bv - av;
      }) as unknown as Record<string, unknown>[];
      break;
    }

    case "pm-occupancy": {
      const matched = propertyUnits.filter(u =>
        u.occupancy === detail.value ||
        normStatus(u.occupancy) === normStatus(detail.value)
      );
      title = detail.label;
      subtitle = `${matched.length} units`;
      columns = pmCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    /* ═══════════════ AUDITS ═══════════════ */

    case "cost-category": {
      title = detail.label;
      subtitle = `${auditJobs.length} jobs`;
      columns = auditCols;
      rows = auditJobs as unknown as Record<string, unknown>[];
      break;
    }

    case "margin-bucket": {
      const matched = auditJobs.filter(a => {
        const m = a.netMargin;
        if (detail.value === "< 0%") return m < 0;
        if (detail.value === "0\u201310%") return m >= 0 && m < 10;
        if (detail.value === "10\u201320%") return m >= 10 && m < 20;
        if (detail.value === "20\u201330%") return m >= 20 && m < 30;
        if (detail.value === "30%+") return m >= 30;
        return true;
      });
      title = detail.label;
      subtitle = `${matched.length} jobs`;
      columns = auditCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    /* ═══════════════ FALLBACK ═══════════════ */

    default: {
      // Should never be reached since all types are handled above.
      // Show an empty state instead of misleading data.
      title = detail.label;
      subtitle = "No drill-down handler for this type";
      columns = [];
      rows = [];
    }
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50,
          borderRadius: 12,
        }}
      />

      {/* Drawer panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: "min(520px, 85%)",
          background: "var(--sh-bg-surface-raised)",
          borderLeft: "1px solid var(--sh-border)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
          zIndex: 51,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          borderRadius: "0 12px 12px 0",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px 10px", borderBottom: "1px solid var(--sh-border)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sh-text-primary)" }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: "var(--sh-text-secondary)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
              background: "var(--sh-accent-dim)", color: "var(--sh-accent)",
            }}>
              {rows.length} row{rows.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", color: "var(--sh-text-muted)", fontSize: 16,
                cursor: "pointer", padding: 4, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 4px" }}>
          {renderTable(columns, rows)}
        </div>
      </div>
    </>
  );
}
