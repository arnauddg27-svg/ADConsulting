"use client";

import { useEffect } from "react";
import type { SHJob, SHSale, SHLoan, SHLandDeal, SHPermit, SHPropertyUnit, SHAuditJob } from "@/types/sunshine-homes";
import { jobs, sales, loans, landDeals, permits, propertyUnits, auditJobs, fmt$, fmtPct } from "@/lib/sunshine-homes-data";
import SHPill from "./SHPill";

export interface DrillDetail {
  type: "job" | "community" | "city" | "stage" | "plan" | "lender" | "super" | "sale" | "loan" | "permit" | "unit" | "property" | "cost-category" | "cost-trend-month" | "margin-bucket" | "permit-status" | "occupancy" | "land-status" | "land-metric" | "land-city-year" | "permit-city-year" | "permit-city-status" | "loan-metric" | "loan-rate" | "sale-status" | "sale-metric" | "sale-city-status" | "sale-entity-year" | "pm-metric" | "pm-occupancy" | "cycle-time-cohort" | "cycle-metric" | "cycle-bucket" | "audit-cost" | "construction-city-time" | "sales-city-time" | "loans-city-time" | "pm-city-time" | "audits-community-time" | "sales-community" | "loans-community" | "permits-community" | "pm-community" | "construction-completion-bucket" | "permit-cycle-bucket";
  value: string;
  label: string;
  community?: string; // optional community pre-filter for cost drill-downs
  scopedJobCodes?: string[]; // optional context scope to preserve filtered views
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

/* Permit drilldown — enriched with the Centralized Data 2.0 / Permitting
   sheet fields. Surfaces parcel + permit number, clerk, surveyor, env
   flag, per-step cycle times, and the full date flow. */
const permitCols: Col[] = [
  { key: "jobCode", label: "Job", width: "80px" },
  { key: "community", label: "Community", width: "120px" },
  { key: "city", label: "City", width: "80px" },
  { key: "permitNumber", label: "Permit #", width: "115px", render: r => String(r.permitNumber ?? "\u2014") },
  { key: "parcelId", label: "Parcel ID", width: "105px", render: r => String(r.parcelId ?? "\u2014") },
  { key: "permitType", label: "Type", width: "80px" },
  { key: "envIssues", label: "Env", width: "85px", render: r => {
    const v = String(r.envIssues ?? "None");
    return v === "None" ? <span style={{ color: "var(--sh-text-muted)" }}>None</span> : <SHPill tone="watch" label={v} />;
  }},
  { key: "clerk", label: "Clerk", width: "100px", render: r => String(r.clerk ?? "\u2014") },
  { key: "surveyor", label: "Surveyor", width: "130px", render: r => String(r.surveyor ?? "\u2014") },
  { key: "submittedDate", label: "Submitted", width: "85px" },
  { key: "approvedDate", label: "Approved", width: "85px", render: r => r.approvedDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.approvedDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "issuedDate", label: "Issued", width: "85px", render: r => r.issuedDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.issuedDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "expirationDate", label: "Expires", width: "85px", render: r => r.expirationDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.expirationDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "permitCT", label: "Permit CT", width: "75px", align: "right", render: r => `${Number(r.permitCT ?? r.daysInReview)}d` },
  { key: "totalCycleTime", label: "Total CT", width: "70px", align: "right", render: r => r.totalCycleTime ? `${Number(r.totalCycleTime)}d` : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "permitFeeAmount", label: "Fee", width: "70px", align: "right", render: r => r.permitFeeAmount ? fmt$(Number(r.permitFeeAmount)) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "daysInReview", label: "In Review", width: "75px", align: "right", render: permitDaysPill },
  { key: "status", label: "Status", width: "85px", render: permitStatusPill },
];

const loanExpPill = (r: Record<string, unknown>) => {
  const d = Number(r.daysUntilExpiration);
  return <SHPill tone={d <= 30 ? "alert" : d <= 60 ? "watch" : "good"} label={`${d}d`} />;
};

/* Loan drilldown — enriched with the Centralized Data 2.0 / Loan Tracker
   sheet fields. Surfaces loan number, appraisal, monthly payment, draw
   activity (totalDrawn, drawableWIP, lastDrawDate), extensions, equity,
   and loan status. */
const loanCols: Col[] = [
  { key: "jobCode", label: "Job", width: "80px" },
  { key: "community", label: "Community", width: "120px" },
  { key: "lender", label: "Lender", width: "130px" },
  { key: "loanNumber", label: "Loan #", width: "140px", render: r => String(r.loanNumber ?? "\u2014") },
  { key: "loanAmount", label: "Amount", width: "85px", align: "right", render: r => fmt$(Number(r.loanAmount)) },
  { key: "appraisalAmount", label: "Appraisal", width: "90px", align: "right", render: r => r.appraisalAmount ? fmt$(Number(r.appraisalAmount)) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "interestRate", label: "Rate", width: "55px", align: "right", render: r => `${Number(r.interestRate)}%` },
  { key: "monthlyInterestPayment", label: "Monthly", width: "75px", align: "right", render: r => r.monthlyInterestPayment ? fmt$(Number(r.monthlyInterestPayment)) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "totalDrawn", label: "Drawn", width: "80px", align: "right", render: r => fmt$(Number(r.totalDrawn)) },
  { key: "drawPct", label: "Draw %", width: "65px", align: "right", render: r => fmtPct(Number(r.drawPct)) },
  { key: "drawableWIP", label: "Drawable", width: "85px", align: "right", render: r => r.drawableWIP !== undefined ? fmt$(Number(r.drawableWIP)) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "wipBalance", label: "WIP", width: "80px", align: "right", render: r => r.wipBalance !== undefined ? fmt$(Number(r.wipBalance)) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "equity", label: "Equity", width: "75px", align: "right", render: r => r.equity !== undefined ? fmt$(Number(r.equity)) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "loanRequestDate", label: "Req'd", width: "85px", render: r => r.loanRequestDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.loanRequestDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "loanClosingDate", label: "Closed", width: "85px", render: r => r.loanClosingDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.loanClosingDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "lastDrawDate", label: "Last Draw", width: "90px", render: r => r.lastDrawDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.lastDrawDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "expirationDate", label: "Expires", width: "85px" },
  { key: "extensionCount", label: "Ext", width: "60px", align: "right", render: r => {
    const n = Number(r.extensionCount ?? 0);
    return n > 0 ? <SHPill tone="watch" label={`${n}x`} /> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span>;
  }},
  { key: "loanStatus", label: "Status", width: "85px", render: r => {
    const s = String(r.loanStatus ?? "Active");
    const tone = s === "Paid Off" ? "good" : s === "Expiring" || s === "Pending" ? "watch" : (s === "Expired" || s === "Default") ? "alert" : "good";
    return <SHPill tone={tone} label={s} />;
  }},
  { key: "daysUntilExpiration", label: "Exp Days", width: "75px", align: "right", render: loanExpPill },
];

const saleStatusPill = (r: Record<string, unknown>) => {
  const s = String(r.status);
  return <SHPill tone={s === "closed" ? "good" : s === "active" || s === "pending" ? "watch" : "alert"} label={s} />;
};

/* Sales drilldown — enriched with the Centralized Data 2.0 / Sales sheet
   contract fields (pricing breakdown, deposits, closing schedule, financing,
   realtor + title counterparties, contingency). All optional fields fall
   back to em-dash when missing. */
const saleCols: Col[] = [
  { key: "jobCode", label: "Job", width: "80px" },
  { key: "community", label: "Community", width: "120px" },
  { key: "plan", label: "Plan", width: "100px" },
  { key: "buyer", label: "Buyer", width: "120px" },
  { key: "agent", label: "Sales Agent", width: "110px" },
  { key: "saleSource", label: "Source", width: "85px", render: r => String(r.saleSource ?? "\u2014") },
  { key: "totalPrice", label: "Total Price", width: "95px", align: "right", render: r => fmt$(Number(r.totalPrice ?? r.salePrice)) },
  { key: "lotPremium", label: "Lot Prem", width: "75px", align: "right", render: r => {
    const v = Number(r.lotPremium ?? 0);
    return v > 0 ? fmt$(v) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span>;
  }},
  { key: "changeOrders", label: "C/O", width: "65px", align: "right", render: r => {
    const v = Number(r.changeOrders ?? 0);
    return v > 0 ? fmt$(v) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span>;
  }},
  { key: "totalDeposits", label: "Deposits", width: "80px", align: "right", render: r => {
    const v = Number(r.totalDeposits ?? 0);
    return v > 0 ? fmt$(v) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span>;
  }},
  { key: "closingCost", label: "Close Cost", width: "85px", align: "right", render: r => {
    const v = Number(r.closingCost ?? 0);
    return v > 0 ? fmt$(v) : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span>;
  }},
  { key: "netMarginEst", label: "Margin Est", width: "85px", align: "right", render: r => {
    const v = Number(r.netMarginEst ?? 0);
    if (!v) return <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span>;
    return <span style={{ color: v >= 18 ? "var(--sh-accent)" : v >= 12 ? "inherit" : "var(--sh-warning)", fontWeight: 600 }}>{fmtPct(v)}</span>;
  }},
  { key: "loanType", label: "Loan", width: "90px", render: r => String(r.loanType ?? "\u2014") },
  { key: "mortgageCompany", label: "Mortgage", width: "140px", render: r => String(r.mortgageCompany ?? "\u2014") },
  { key: "realtor", label: "Realtor", width: "110px", render: r => String(r.realtor ?? "\u2014") },
  { key: "realtorCompany", label: "Realtor Co", width: "130px", render: r => String(r.realtorCompany ?? "\u2014") },
  { key: "titleCompany", label: "Title", width: "130px", render: r => String(r.titleCompany ?? "\u2014") },
  { key: "writtenDate", label: "Written", width: "85px", render: r => r.writtenDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.writtenDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "contractDate", label: "Sold", width: "85px", render: r => <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.contractDate)}</span> },
  { key: "scheduledCloseDate", label: "Sched Close", width: "95px", render: r => r.scheduledCloseDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.scheduledCloseDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "closingDate", label: "Closed", width: "85px", render: r => r.closingDate ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{String(r.closingDate)}</span> : <span style={{ color: "var(--sh-text-muted)" }}>\u2014</span> },
  { key: "contingentSale", label: "Conting", width: "75px", render: r => r.contingentSale
    ? <SHPill tone="watch" label="Yes" />
    : <span style={{ color: "var(--sh-text-muted)" }}>No</span> },
  { key: "status", label: "Status", width: "85px", render: saleStatusPill },
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

function parseQuarterLabel(value: string): { year: number; quarter: number } | null {
  const m = value.match(/Q([1-4])\s*'?(\d{2,4})/i);
  if (!m) return null;
  const quarter = Number(m[1]);
  const yy = Number(m[2]);
  const year = yy < 100 ? 2000 + yy : yy;
  return { year, quarter };
}

function inQuarter(dateStr: string, year: number, quarter: number): boolean {
  const d = new Date(dateStr);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return d.getFullYear() === year && q === quarter;
}

function parseMoneyToken(token: string): number {
  const clean = token.trim().replace(/\$/g, "").replace(/,/g, "");
  const m = clean.match(/^(-?\d+(?:\.\d+)?)([kKmM])?$/);
  if (!m) return Number(clean) || 0;
  const base = Number(m[1]);
  const mult = m[2]?.toLowerCase() === "m" ? 1_000_000 : m[2]?.toLowerCase() === "k" ? 1_000 : 1;
  return base * mult;
}

function parseMoneyRange(value: string): { min: number; max: number } | null {
  const compact = value.replace(/\s/g, "");
  if (compact.includes("–") || compact.includes("-")) {
    const parts = compact.split(/[–-]/).filter(Boolean);
    if (parts.length >= 2) {
      const min = parseMoneyToken(parts[0]);
      const max = parseMoneyToken(parts[1]);
      return { min: Math.min(min, max), max: Math.max(min, max) };
    }
  }
  const lt = compact.match(/^<\$?([\d.,]+[kKmM]?)/);
  if (lt) return { min: Number.NEGATIVE_INFINITY, max: parseMoneyToken(lt[1]) };
  const gt = compact.match(/^\$?([\d.,]+[kKmM]?)\+$/);
  if (gt) return { min: parseMoneyToken(gt[1]), max: Number.POSITIVE_INFINITY };
  return null;
}

function parseDaysRange(value: string): { min: number; max: number } | null {
  const compact = value.replace(/\s/g, "");
  const range = compact.match(/^(\d+)[–-](\d+)d$/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const plus = compact.match(/^(\d+)d\+$/i);
  if (plus) return { min: Number(plus[1]), max: Number.POSITIVE_INFINITY };
  return null;
}

function parsePctRange(value: string): { min: number; max: number } | null {
  const compact = value.replace(/\s/g, "");
  const range = compact.match(/^(\d+(?:\.\d+)?)\%?[–-](\d+(?:\.\d+)?)\%?$/);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const plus = compact.match(/^(\d+(?:\.\d+)?)\%\+$/);
  if (plus) return { min: Number(plus[1]), max: Number.POSITIVE_INFINITY };
  return null;
}

function matchTimeToken(dateStr: string, token: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const t = token.trim();
  if (/^\d{4}$/.test(t)) return d.getFullYear() === Number(t);
  const q = t.match(/^Q([1-4])(?:\s*'?(\d{2,4}))?$/i);
  if (q) {
    const quarter = Number(q[1]);
    const year = q[2] ? (Number(q[2]) < 100 ? 2000 + Number(q[2]) : Number(q[2])) : d.getFullYear();
    const dq = Math.floor(d.getMonth() / 3) + 1;
    return d.getFullYear() === year && dq === quarter;
  }
  if (/^\d{1,2}$/.test(t)) return d.getDate() === Number(t);
  const shortMonth = d.toLocaleString("en-US", { month: "short" });
  return shortMonth.toLowerCase() === t.toLowerCase();
}

/* ── Table renderer ──────────────────────────────────────────────── */

/** Minimum width to render an uppercase 9px header label with 0.08em tracking
 *  + 16px horizontal padding (8 each side) + small defensive margin for
 *  wider characters (M/W) and fonts that render slightly heavier than the
 *  mean. Keeps column from ever truncating its own label. */
function estimateHeaderWidth(label: string): number {
  return Math.ceil(label.length * 7.2) + 20;
}

function renderTable(columns: Col[], rows: Record<string, unknown>[]) {
  /* Auto-grow each column so the header label is never truncated.
     Consumer-specified width wins when data is wider than the label. */
  const effectiveColumns = columns.map(c => {
    if (c.width.endsWith("fr")) return c; // proportional cols don't need adjustment
    const specifiedPx = parseInt(c.width) || 80;
    const headerPx = estimateHeaderWidth(c.label);
    const effective = Math.max(specifiedPx, headerPx);
    return { ...c, width: `${effective}px` };
  });
  const grid = effectiveColumns.map(c => c.width).join(" ");
  /* Compute min-width so the grid can scroll horizontally when content overflows */
  const minW = effectiveColumns.reduce((s, c) => {
    if (c.width.endsWith("fr")) return s + Math.round(parseFloat(c.width) * 180);
    return s + (parseInt(c.width) || 80);
  }, 0);
  columns = effectiveColumns;

  const rawText = (row: Record<string, unknown>, key: string) => {
    const value = row[key];
    if (value === null || value === undefined || value === "") return "\u2014";
    return String(value);
  };

  return (
    <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
      <div style={{ minWidth: minW }}>
        <div style={{ display: "grid", gridTemplateColumns: grid, padding: "6px 0", borderBottom: "2px solid rgba(20,184,166,0.2)", position: "sticky", top: 0, background: "var(--sh-bg-surface-raised)", zIndex: 2 }}>
          {columns.map(c => (
            <span key={c.key} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--sh-text-muted)", padding: "0 8px", textAlign: c.align, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.label}>{c.label}</span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: grid, padding: "5px 0", borderBottom: "1px solid var(--sh-border-dim)", fontSize: 11, color: "var(--sh-text-primary)" }}>
            {columns.map(c => (
              <span key={c.key} style={{ padding: "0 8px", textAlign: c.align, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={rawText(r, c.key)}>
                {c.render ? c.render(r) : rawText(r, c.key)}
              </span>
            ))}
          </div>
        ))}
        {rows.length === 0 && <div style={{ padding: 16, fontSize: 11, color: "var(--sh-text-muted)", fontStyle: "italic" }}>No data</div>}
      </div>
    </div>
  );
}

/* ── Pro Forma compact card renderer ─────────────────────────────── */

function renderProForma(audit: SHAuditJob) {
  const Row = ({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) => (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "4px 0",
      borderBottom: "1px solid var(--sh-border-dim)",
      fontSize: 11,
      fontWeight: emphasis ? 700 : 400,
      color: emphasis ? "var(--sh-text-primary)" : "var(--sh-text-secondary)",
    }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );

  const Section = ({
    title, children, accent,
  }: { title: string; children: React.ReactNode; accent?: string }) => (
    <div style={{
      border: "1px solid var(--sh-border)",
      borderRadius: 8,
      padding: "10px 12px",
      background: "var(--sh-bg-surface)",
    }}>
      <div style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: accent ?? "var(--sh-accent)",
        marginBottom: 6,
        paddingBottom: 6,
        borderBottom: `1px solid ${accent ?? "rgba(20,184,166,0.25)"}`,
      }}>
        {title}
      </div>
      {children}
    </div>
  );

  const netMarginTone =
    audit.netMargin >= 15 ? "var(--sh-accent)" :
    audit.netMargin >= 5 ? "var(--sh-warning)" :
    "var(--sh-danger)";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        marginBottom: 10,
        alignItems: "start",
      }}>
        {/* Revenue */}
        <Section title="Revenue">
          <Row label="Sale Price" value={fmt$(audit.salePrice)} />
          <Row label="Proceeds" value={fmt$(audit.proceeds)} />
          <Row label="Seller Credit" value={fmt$(audit.sellerCredit)} />
        </Section>

        {/* Direct Costs */}
        <Section title="Direct Costs">
          <Row label="Lot / Land" value={fmt$(audit.lotLand)} />
          <Row label="Permitting" value={fmt$(audit.permitting)} />
          <Row label="Site Work" value={fmt$(audit.siteWork)} />
          <Row label="Vertical" value={fmt$(audit.vertical)} />
          <Row label="Options" value={fmt$(audit.options)} />
          <Row label="Dirt / Pad" value={fmt$(audit.dirtPad)} />
          <Row label="Dumpsters" value={fmt$(audit.dumpsters)} />
          <Row label="Total Direct" value={fmt$(audit.totalDirectCost)} emphasis />
        </Section>

        {/* Indirect Costs */}
        <Section title="Indirect Costs">
          <Row label="Financing" value={fmt$(audit.financing)} />
          <Row label="Insurance" value={fmt$(audit.insurance)} />
          <Row label="Closing Cost" value={fmt$(audit.closingCost)} />
          <Row label="Total Indirect" value={fmt$(audit.totalIndirectCost)} emphasis />
        </Section>
      </div>

      {/* Bottom line summary — full width. Builder Fee is given a wider
       *  column because its value is longer ($29K (5%)) than the others. */}
      <div style={{
        border: `1px solid ${netMarginTone}66`,
        borderRadius: 8,
        padding: "12px 14px",
        background: `linear-gradient(135deg, ${netMarginTone}14, transparent)`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1.4fr 1fr 1fr 1fr",
        gap: 12,
      }}>
        {[
          { label: "Revenue", value: fmt$(audit.salePrice), tone: "var(--sh-text-secondary)" },
          { label: "Total Cost", value: fmt$(audit.totalCost), tone: "var(--sh-text-secondary)" },
          { label: "Builder Fee", value: `${fmt$(audit.builderFee)} (${audit.builderFeePct}%)`, tone: "var(--sh-text-secondary)" },
          { label: "Contingency", value: fmt$(audit.contingency), tone: "var(--sh-text-secondary)" },
          { label: "Net Profit", value: fmt$(audit.netProfit), tone: netMarginTone },
          { label: "Net Margin", value: fmtPct(audit.netMargin), tone: netMarginTone },
        ].map(kpi => (
          <div key={kpi.label} style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--sh-text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {kpi.label}
            </div>
            <div style={{
              marginTop: 4,
              fontSize: 13,
              fontWeight: 700,
              color: kpi.tone,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }} title={kpi.value}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Construction milestone timeline renderer ────────────────────── */

function renderMilestoneTimeline(
  job: SHJob,
  jobSales: SHSale[],
  jobLoans: SHLoan[],
) {
  /* Ordered milestones. Each has a date (or null if not yet reached) and
   * the stage it corresponds to. */
  const milestones: { label: string; date: string | null | undefined; stage: string }[] = [
    { label: "Permit Issued",    date: job.permitDate,     stage: "Permit" },
    { label: "Foundation Poured", date: job.foundationDate, stage: "Foundation" },
    { label: "Framing Complete", date: job.framingDate,    stage: "Framing" },
    { label: "MEP Rough-In",     date: job.mepDate,        stage: "MEP / Drywall" },
    { label: "Drywall Complete", date: job.drywallDate,    stage: "MEP / Drywall" },
    { label: "Finishes Done",    date: job.finishesDate,   stage: "Finishes" },
    { label: "Certificate of Occupancy", date: job.coDate, stage: "Closing" },
    { label: "Closing",          date: job.closingDate,    stage: "Closing" },
  ];

  const budgetVariance = job.projectedFinalCost - job.originalBudget;
  const variancePct = job.originalBudget > 0 ? (budgetVariance / job.originalBudget) * 100 : 0;
  const varianceTone =
    variancePct <= 2 ? "var(--sh-accent)" :
    variancePct <= 8 ? "var(--sh-warning)" :
    "var(--sh-danger)";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
      {/* Top KPI row — compact */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
        marginBottom: 12,
      }}>
        {[
          { label: "Stage", value: job.stage, tone: "var(--sh-text-primary)" },
          { label: "Completion", value: fmtPct(job.completionPct), tone: "var(--sh-accent)" },
          { label: "Days in Phase", value: `${job.daysInCurrentPhase}d`, tone: job.daysInCurrentPhase > 30 ? "var(--sh-danger)" : job.daysInCurrentPhase > 20 ? "var(--sh-warning)" : "var(--sh-text-primary)" },
          { label: "Total Cycle", value: `${job.totalCycleDays}d`, tone: "var(--sh-text-primary)" },
          { label: "Contract", value: fmt$(job.contractValue), tone: "var(--sh-text-primary)" },
        ].map(k => (
          <div key={k.label} style={{
            border: "1px solid var(--sh-border)",
            borderRadius: 6,
            padding: "8px 10px",
            background: "var(--sh-bg-surface)",
            minWidth: 0,
          }}>
            <div style={{
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--sh-text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>{k.label}</div>
            <div style={{
              marginTop: 3,
              fontSize: 13,
              fontWeight: 700,
              color: k.tone,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }} title={k.value}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Milestone timeline */}
      <div style={{
        border: "1px solid var(--sh-border)",
        borderRadius: 8,
        padding: "12px 14px",
        background: "var(--sh-bg-surface)",
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--sh-accent)",
          marginBottom: 10,
          paddingBottom: 6,
          borderBottom: "1px solid rgba(20,184,166,0.25)",
        }}>
          Construction Milestones
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {milestones.map((m, i) => {
            const complete = !!m.date;
            return (
              <div key={m.label} style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr 100px",
                gap: 10,
                alignItems: "center",
                padding: "7px 0",
                borderBottom: i < milestones.length - 1 ? "1px solid var(--sh-border-dim)" : "none",
              }}>
                {/* Status dot */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                }}>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: complete ? "var(--sh-accent)" : "transparent",
                    border: `1.5px solid ${complete ? "var(--sh-accent)" : "var(--sh-border)"}`,
                    boxShadow: complete ? "0 0 8px rgba(20,184,166,0.5)" : "none",
                  }} />
                </div>
                {/* Label + stage */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: complete ? "var(--sh-text-primary)" : "var(--sh-text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {m.label}
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: "var(--sh-text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}>
                    {m.stage}
                  </div>
                </div>
                {/* Date */}
                <div style={{
                  fontSize: 11,
                  textAlign: "right",
                  color: complete ? "var(--sh-text-primary)" : "var(--sh-text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {complete ? m.date : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial snapshot */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          border: "1px solid var(--sh-border)",
          borderRadius: 8,
          padding: "10px 12px",
          background: "var(--sh-bg-surface)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sh-accent)", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(20,184,166,0.25)" }}>
            Budget & Cost
          </div>
          {[
            { label: "Original Budget", value: fmt$(job.originalBudget) },
            { label: "Actual to Date", value: fmt$(job.actualCostToDate) },
            { label: "WIP Balance", value: fmt$(job.wipBalance) },
            { label: "Projected Final", value: fmt$(job.projectedFinalCost) },
            { label: "Variance", value: `${fmt$(budgetVariance)} (${variancePct >= 0 ? "+" : ""}${variancePct.toFixed(1)}%)`, tone: varianceTone },
            { label: "Lot Cost", value: fmt$(job.lotCost) },
          ].map(row => (
            <div key={row.label} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "1px solid var(--sh-border-dim)",
              fontSize: 11,
              color: "var(--sh-text-secondary)",
            }}>
              <span>{row.label}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", color: row.tone ?? "var(--sh-text-primary)", fontWeight: row.tone ? 700 : 400 }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          border: "1px solid var(--sh-border)",
          borderRadius: 8,
          padding: "10px 12px",
          background: "var(--sh-bg-surface)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sh-accent)", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(20,184,166,0.25)" }}>
            Job Profile
          </div>
          {[
            { label: "Plan", value: job.plan },
            { label: "Lot", value: job.lot },
            { label: "Community", value: job.community },
            { label: "City", value: job.city },
            { label: "Entity", value: job.entity },
            { label: "Superintendent", value: job.superintendent },
            { label: "Start Date", value: job.startDate },
            { label: "Est. Completion", value: job.estCompletion },
          ].map(row => (
            <div key={row.label} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "1px solid var(--sh-border-dim)",
              fontSize: 11,
              color: "var(--sh-text-secondary)",
            }}>
              <span>{row.label}</span>
              <span style={{ color: "var(--sh-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60%" }} title={String(row.value)}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Related sales / loans */}
      {(jobSales.length > 0 || jobLoans.length > 0) && (
        <div style={{
          border: "1px solid var(--sh-border)",
          borderRadius: 8,
          padding: "10px 12px",
          background: "var(--sh-bg-surface)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sh-accent)", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(20,184,166,0.25)" }}>
            Related Records
          </div>
          {jobSales.map(s => (
            <div key={`s-${s.id}`} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "1px solid var(--sh-border-dim)",
              fontSize: 11,
              color: "var(--sh-text-secondary)",
            }}>
              <span>Sale · {s.buyer}</span>
              <span style={{ color: "var(--sh-text-primary)" }}>{fmt$(s.salePrice)} ({s.status})</span>
            </div>
          ))}
          {jobLoans.map(l => (
            <div key={`l-${l.id}`} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "1px solid var(--sh-border-dim)",
              fontSize: 11,
              color: "var(--sh-text-secondary)",
            }}>
              <span>Loan · {l.lender}</span>
              <span style={{ color: "var(--sh-text-primary)" }}>{fmt$(l.loanAmount)} ({fmtPct(l.drawPct)} drawn)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Cost breakdown renderer ─────────────────────────────────────── */

function renderCostBreakdown(
  filteredJobs: SHJob[],
  mode: "budget" | "actual" | "variance" | "margin",
) {
  /* Category aggregates */
  const categories = [
    {
      key: "permitting",
      label: "Permitting",
      budget: filteredJobs.reduce((s, j) => s + j.permittingBudget, 0),
      actual: filteredJobs.reduce((s, j) => s + j.permittingActual, 0),
    },
    {
      key: "sidewalk",
      label: "Site Work",
      budget: filteredJobs.reduce((s, j) => s + j.sidewalkBudget, 0),
      actual: filteredJobs.reduce((s, j) => s + j.sidewalkActual, 0),
    },
    {
      key: "vertical",
      label: "Vertical Construction",
      budget: filteredJobs.reduce((s, j) => s + j.verticalBudget, 0),
      actual: filteredJobs.reduce((s, j) => s + j.verticalActual, 0),
    },
  ].map(c => ({
    ...c,
    variance: c.actual - c.budget,
    variancePct: c.budget > 0 ? ((c.actual - c.budget) / c.budget) * 100 : 0,
    progressPct: c.budget > 0 ? Math.min(120, (c.actual / c.budget) * 100) : 0,
  }));

  const grandBudget = categories.reduce((s, c) => s + c.budget, 0);
  const grandActual = categories.reduce((s, c) => s + c.actual, 0);
  const grandVariance = grandActual - grandBudget;
  const grandVariancePct = grandBudget > 0 ? (grandVariance / grandBudget) * 100 : 0;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
      {/* Headline strip — totals */}
      <div style={{
        border: `1px solid ${grandVariance > 0 ? "rgba(244,106,106,0.35)" : "rgba(20,184,166,0.35)"}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 12,
        background: `linear-gradient(135deg, ${grandVariance > 0 ? "rgba(244,106,106,0.08)" : "rgba(20,184,166,0.08)"}, transparent)`,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}>
        {[
          { label: "Total Budget", value: fmt$(grandBudget), tone: "var(--sh-text-primary)" },
          { label: "Total Actual", value: fmt$(grandActual), tone: "var(--sh-text-primary)" },
          { label: "Variance $", value: `${grandVariance >= 0 ? "+" : ""}${fmt$(grandVariance)}`, tone: grandVariance > 0 ? "var(--sh-danger)" : "var(--sh-accent)" },
          { label: "Variance %", value: `${grandVariancePct >= 0 ? "+" : ""}${grandVariancePct.toFixed(1)}%`, tone: grandVariance > 0 ? "var(--sh-danger)" : "var(--sh-accent)" },
        ].map(k => (
          <div key={k.label} style={{ minWidth: 0 }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--sh-text-muted)" }}>{k.label}</div>
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: k.tone, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={k.value}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Per-category budget vs actual bars */}
      <div style={{
        border: "1px solid var(--sh-border)",
        borderRadius: 8,
        padding: "12px 14px",
        background: "var(--sh-bg-surface)",
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sh-accent)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(20,184,166,0.25)" }}>
          Budget vs Actual by Category
        </div>
        {categories.map(c => {
          const over = c.variance > 0;
          return (
            <div key={c.key} style={{ padding: "8px 0", borderBottom: "1px solid var(--sh-border-dim)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sh-text-primary)" }}>{c.label}</div>
                <div style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", color: over ? "var(--sh-danger)" : "var(--sh-accent)", fontWeight: 700 }}>
                  {over ? "+" : ""}{c.variancePct.toFixed(1)}%
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--sh-text-muted)", marginBottom: 4 }}>
                <span>Budget: <strong style={{ color: "var(--sh-text-primary)", fontVariantNumeric: "tabular-nums" }}>{fmt$(c.budget)}</strong></span>
                <span>Actual: <strong style={{ color: "var(--sh-text-primary)", fontVariantNumeric: "tabular-nums" }}>{fmt$(c.actual)}</strong></span>
                <span>Variance: <strong style={{ color: over ? "var(--sh-danger)" : "var(--sh-accent)", fontVariantNumeric: "tabular-nums" }}>{over ? "+" : ""}{fmt$(c.variance)}</strong></span>
              </div>
              {/* Twin bars: actual over budget */}
              <div style={{ position: "relative", height: 12, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                {/* Budget bar (full width baseline) */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: "100%",
                  background: "rgba(59,130,246,0.25)",
                }} />
                {/* Actual bar on top */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${Math.min(100, c.progressPct)}%`,
                  background: `linear-gradient(90deg, ${over ? "#f46a6a" : "var(--sh-accent)"}, ${over ? "#ef4444" : "#22d3ee"})`,
                  boxShadow: `0 0 10px ${over ? "rgba(244,106,106,0.4)" : "rgba(20,184,166,0.4)"}`,
                }} />
                {/* Overrun marker if actual > budget */}
                {c.progressPct > 100 && (
                  <div style={{
                    position: "absolute", right: 0, top: 0, bottom: 0,
                    width: 2,
                    background: "var(--sh-danger)",
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-house cost breakdown table */}
      <div style={{
        border: "1px solid var(--sh-border)",
        borderRadius: 8,
        padding: "12px 14px",
        background: "var(--sh-bg-surface)",
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sh-accent)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(20,184,166,0.25)", display: "flex", justifyContent: "space-between" }}>
          <span>Cost per Category per House</span>
          <span style={{ color: "var(--sh-text-muted)", fontWeight: 400, letterSpacing: "0.08em" }}>{filteredJobs.length} jobs</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: 11,
            fontVariantNumeric: "tabular-nums",
          }}>
            <thead>
              <tr style={{ color: "var(--sh-text-muted)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left" }}>
                <th style={{ padding: "6px 8px 6px 0", fontWeight: 600 }}>Job</th>
                <th style={{ padding: "6px 8px", fontWeight: 600 }}>Community</th>
                <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>Permit B/A</th>
                <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>Site Work B/A</th>
                <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>Vertical B/A</th>
                <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>Total Actual</th>
                <th style={{ padding: "6px 0 6px 8px", fontWeight: 600, textAlign: "right" }}>Variance</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.slice(0, 60).map((j, i) => {
                const totalB = j.permittingBudget + j.sidewalkBudget + j.verticalBudget;
                const totalA = j.permittingActual + j.sidewalkActual + j.verticalActual;
                const v = totalA - totalB;
                const renderBA = (b: number, a: number) => (
                  <span>
                    <span style={{ color: "var(--sh-text-muted)" }}>{fmt$(b)}</span>
                    <span style={{ color: "var(--sh-text-muted)" }}> / </span>
                    <span style={{ color: a > b ? "var(--sh-danger)" : "var(--sh-accent)" }}>{fmt$(a)}</span>
                  </span>
                );
                return (
                  <tr key={j.jobCode} style={{
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}>
                    <td style={{ padding: "5px 8px 5px 0", color: "var(--sh-text-primary)", fontWeight: 600 }}>{j.jobCode}</td>
                    <td style={{ padding: "5px 8px", color: "var(--sh-text-secondary)" }}>{j.community}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{renderBA(j.permittingBudget, j.permittingActual)}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{renderBA(j.sidewalkBudget, j.sidewalkActual)}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{renderBA(j.verticalBudget, j.verticalActual)}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right", color: "var(--sh-text-primary)", fontWeight: 600 }}>{fmt$(totalA)}</td>
                    <td style={{ padding: "5px 0 5px 8px", textAlign: "right", color: v > 0 ? "var(--sh-danger)" : "var(--sh-accent)", fontWeight: 600 }}>
                      {v >= 0 ? "+" : ""}{fmt$(v)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredJobs.length > 60 && (
            <div style={{ padding: "10px 0 0", fontSize: 10, color: "var(--sh-text-muted)", fontStyle: "italic" }}>
              Showing first 60 of {filteredJobs.length} jobs. Apply a filter to narrow.
            </div>
          )}
        </div>
        {/* Use mode to highlight which column is emphasized */}
        {mode && (
          <div style={{ fontSize: 9, color: "var(--sh-text-muted)", marginTop: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Focused on: {mode}
          </div>
        )}
      </div>
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

  // Custom-render modes — each replaces the default table with a tailored view.
  let proFormaAudit: SHAuditJob | null = null;
  let milestoneJob: { job: SHJob; jobSales: SHSale[]; jobLoans: SHLoan[] } | null = null;
  let costBreakdown: { jobs: SHJob[]; mode: "budget" | "actual" | "variance" | "margin" } | null = null;

  let title = detail.label;
  let subtitle = "";
  let columns: Col[] = [];
  let rows: Record<string, unknown>[] = [];

  switch (detail.type) {

    /* ═══════════════ CONSTRUCTION ═══════════════ */

    case "job": {
      /* Aggregate KPI values → show full job list */
      if (
        detail.value === "all" ||
        detail.value === "active" ||
        detail.value === "completion" ||
        detail.value === "on-schedule" ||
        detail.value === "within-budget" ||
        detail.value === "healthy-progress"
      ) {
        const filtered = detail.value === "active"
          ? jobs.filter(j => j.stage !== "Closing" && j.stage !== "Complete")
          : detail.value === "on-schedule"
            ? jobs.filter(j => j.stage === "Closing" || j.daysInCurrentPhase <= 35)
            : detail.value === "within-budget"
              ? jobs.filter(j => j.projectedFinalCost <= j.originalBudget * 1.08)
              : detail.value === "healthy-progress"
                ? jobs.filter(j => j.stage === "Permit" || j.completionPct >= 55)
                : jobs;
        title = detail.label;
        subtitle = `${filtered.length} jobs`;
        columns = [
          { key: "jobCode", label: "Job", width: "80px" },
          { key: "community", label: "Community", width: "130px" },
          { key: "stage", label: "Stage", width: "90px" },
          { key: "plan", label: "Plan", width: "90px" },
          { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
          { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
        ];
        rows = filtered as unknown as Record<string, unknown>[];
        break;
      }
      const job = jobs.find(j => j.jobCode === detail.value);
      if (!job) {
        title = detail.label;
        subtitle = "Record not found";
        columns = [{ key: "field", label: "Field", width: "1.2fr" }, { key: "value", label: "Value", width: "1fr" }];
        rows = [{ field: "Not Found", value: "Record may have been filtered out" }];
        break;
      }
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
        /* Pro Forma P&L — rendered as a compact 3-column card grid instead
         * of a tall sparse rows table. Row count is reported as the logical
         * number of P&L line items visible in the pro forma. */
        proFormaAudit = audit;
        rows = new Array(14).fill({}); // count-only, not rendered
      } else {
        /* Construction job detail — milestone timeline + budget/profile + related
         * records. Custom renderer instead of sparse two-column table. */
        milestoneJob = { job, jobSales, jobLoans };
        rows = new Array(8 + jobSales.length + jobLoans.length).fill({});
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
        { key: "daysInCurrentPhase", label: "Since Last Milestone", width: "140px", align: "right", render: r => {
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
        { key: "lot", label: "Lot", width: "60px" },
        { key: "plan", label: "Plan", width: "100px" },
        { key: "superintendent", label: "Super", width: "100px" },
        { key: "completionPct", label: "Comp", width: "55px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
        { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
        { key: "lastMilestoneCompleted", label: "Last Milestone", width: "165px", render: r => {
          const v = r.lastMilestoneCompleted as string | null | undefined;
          return v ? <span style={{ color: "var(--sh-text-primary)" }}>{v}</span> : <span style={{ color: "var(--sh-text-muted)" }}>—</span>;
        }},
        { key: "dateLastMilestoneCompleted", label: "MS Date", width: "85px", render: r => {
          const v = r.dateLastMilestoneCompleted as string | null | undefined;
          return v ? <span style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span> : <span style={{ color: "var(--sh-text-muted)" }}>—</span>;
        }},
        { key: "daysSinceLastMilestone", label: "Since Last MS", width: "100px", align: "right", render: r => {
          const d = Number(r.daysSinceLastMilestone ?? r.daysInCurrentPhase);
          return <span style={{ color: d > 30 ? "var(--sh-danger)" : d > 20 ? "var(--sh-warning)" : "inherit", fontWeight: d > 20 ? 700 : 400 }}>{d}d</span>;
        }},
        { key: "offTrack", label: "Track", width: "90px", render: r => {
          const t = (r.offTrack as "on"|"ahead"|"behind"|undefined) ?? "on";
          const days = Number(r.daysOnOffTrack ?? 0);
          const tone = t === "behind" ? "watch" : t === "ahead" ? "good" : "good";
          const label = t === "on" ? "On track" : t === "ahead" ? `+${days}d ahead` : `${days}d behind`;
          return <SHPill tone={tone} label={label} />;
        }},
        { key: "nextStageDate", label: "Next MS", width: "85px", render: r => {
          const v = r.nextStageDate as string | null | undefined;
          return v ? <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--sh-text-muted)" }}>{v}</span> : <span style={{ color: "var(--sh-text-muted)" }}>—</span>;
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
        { key: "daysInCurrentPhase", label: "Since Last Milestone", width: "140px", align: "right" },
        { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
      ];
      rows = superJobs as unknown as Record<string, unknown>[];
      break;
    }

    case "cycle-metric": {
      const completed = jobs.filter(j => j.coDate);
      const inConstruction = jobs.filter(j => j.stage !== "Closing" && j.completionPct < 95);
      let result = completed;
      title = detail.label;
      subtitle = `${completed.length} completed jobs`;

      if (detail.value === "in-construction") {
        result = inConstruction;
        subtitle = `${inConstruction.length} active jobs`;
      } else if (detail.value === "completions") {
        result = completed;
        subtitle = `${completed.length} CO jobs`;
      }

      columns = [
        { key: "jobCode", label: "Job", width: "70px" },
        { key: "community", label: "Community", width: "110px" },
        { key: "stage", label: "Stage", width: "85px", render: r => {
          const s = String(r.stage);
          return <SHPill tone={s === "Closing" ? "good" : s === "Permit" ? "watch" : "good"} label={s} />;
        }},
        { key: "startDate", label: "Start", width: "75px" },
        { key: "coDate", label: "CO", width: "75px", render: r => String(r.coDate ?? "\u2014") },
        { key: "totalCycleDays", label: "Cycle", width: "60px", align: "right", render: r => `${Math.round(Number(r.totalCycleDays))}d` },
        { key: "completionPct", label: "Comp", width: "55px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
      ];
      rows = result as unknown as Record<string, unknown>[];
      break;
    }

    case "cycle-bucket": {
      const completed = jobs.filter(j => j.coDate);
      const inBucket = completed.filter(j => {
        const d = Number(j.totalCycleDays);
        if (detail.value === "< 200d") return d < 200;
        if (detail.value === "200–250d") return d >= 200 && d <= 250;
        if (detail.value === "250–300d") return d >= 250 && d <= 300;
        if (detail.value === "300–350d") return d >= 300 && d <= 350;
        if (detail.value === "> 350d") return d > 350;
        return true;
      });
      title = detail.label;
      subtitle = `${inBucket.length} completed jobs`;
      columns = [
        { key: "jobCode", label: "Job", width: "70px" },
        { key: "community", label: "Community", width: "110px" },
        { key: "city", label: "City", width: "80px" },
        { key: "startDate", label: "Start", width: "75px" },
        { key: "coDate", label: "CO", width: "75px", render: r => String(r.coDate ?? "\u2014") },
        { key: "totalCycleDays", label: "Cycle Days", width: "70px", align: "right", render: r => `${Math.round(Number(r.totalCycleDays))}d` },
        { key: "marginPct", label: "Margin", width: "60px", align: "right", render: r => fmtPct(Number(r.marginPct)) },
      ];
      rows = inBucket as unknown as Record<string, unknown>[];
      break;
    }

    case "construction-completion-bucket": {
      const range = parsePctRange(detail.value);
      const matched = range
        ? jobs.filter(j => {
            const lowOk = j.completionPct >= range.min;
            const highOk = range.max >= 100 ? j.completionPct <= range.max : j.completionPct < range.max;
            return lowOk && highOk;
          })
        : jobs;
      title = detail.label;
      subtitle = `${matched.length} jobs`;
      columns = [
        { key: "jobCode", label: "Job", width: "75px" },
        { key: "community", label: "Community", width: "120px" },
        { key: "city", label: "City", width: "80px" },
        { key: "stage", label: "Stage", width: "95px" },
        { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
        { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
      ];
      rows = matched as unknown as Record<string, unknown>[];
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
      // If a cohort is too thin, expand to same-year completed jobs for a more useful sample.
      const cohortYear = Number(String(detail.value).split(" ")[0]);
      const sameYearJobs = jobs.filter(j => j.coDate && new Date(j.startDate).getFullYear() === cohortYear);
      let result = cohortJobs;
      let subtitleMode: "cohort" | "year" | "all" = "cohort";
      if (result.length > 0 && result.length < 5 && sameYearJobs.length >= 5) {
        result = sameYearJobs;
        subtitleMode = "year";
      } else if (result.length === 0) {
        result = jobs.filter(j => j.coDate);
        subtitleMode = "all";
      }
      /* Helper: days between two date strings (null-safe) */
      const daysBetween = (a: string | null, b: string | null) => {
        if (!a || !b) return null;
        const ms = new Date(b).getTime() - new Date(a).getTime();
        return Math.round(ms / 86400000);
      };
      title = `${detail.label}`;
      subtitle =
        subtitleMode === "cohort"
          ? `${result.length} completed jobs`
          : subtitleMode === "year"
            ? `${result.length} completed jobs (expanded to ${cohortYear} year sample)`
            : `${result.length} completed jobs (all — cohort empty)`;
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
      /* Drill-down for Cost Metrics KPI clicks — renders category totals +
       * per-house pivot table (Permitting / Site Work / Vertical B/A) via
       * custom renderCostBreakdown. */
      const filtered = detail.community
        ? jobs.filter(j => j.community === detail.community)
        : jobs;
      // Interpret the KPI clicked: budget / actual / variance / margin — or a
      // donut segment (Labor, Materials, Subcontractors, etc.) — fall back to
      // "budget" mode which shows everything side by side.
      const modeValue = detail.value.toLowerCase();
      const mode: "budget" | "actual" | "variance" | "margin" =
        modeValue === "actual" ? "actual" :
        modeValue === "variance" ? "variance" :
        modeValue === "margin" ? "margin" :
        "budget";
      title = detail.label;
      subtitle = `${filtered.length} jobs · 3 cost categories`;
      costBreakdown = { jobs: filtered, mode };
      rows = new Array(3 + filtered.length).fill({}); // count-only, custom-rendered
      break;
    }

    case "cost-trend-month": {
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let monthIdx = -1;
      const explicitMatch = detail.value.match(/^month-(\d{1,2})$/i);
      if (explicitMatch) {
        monthIdx = Number(explicitMatch[1]) - 1;
      } else {
        monthIdx = monthOrder.findIndex(m => m.toLowerCase() === detail.value.toLowerCase());
      }
      const scopedSet = detail.scopedJobCodes ? new Set(detail.scopedJobCodes) : null;
      const scopedJobs = scopedSet ? jobs.filter(j => scopedSet.has(j.jobCode)) : jobs;
      const monthlyJobs = monthIdx >= 0
        ? scopedJobs.filter(j => new Date(j.startDate).getMonth() === monthIdx)
        : [];
      const result = [...monthlyJobs].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

      title = detail.label;
      const monthLabel = monthIdx >= 0 ? monthOrder[monthIdx] : detail.value;
      subtitle = `${result.length} jobs started in ${monthLabel}`;
      columns = [
        { key: "jobCode", label: "Job", width: "70px" },
        { key: "community", label: "Community", width: "110px" },
        { key: "startDate", label: "Start", width: "75px" },
        { key: "contractValue", label: "Revenue", width: "80px", align: "right", render: r => fmt$(Number(r.contractValue)) },
        { key: "originalBudget", label: "Budget", width: "75px", align: "right", render: r => fmt$(Number(r.originalBudget)) },
        { key: "actualCostToDate", label: "Actual", width: "75px", align: "right", render: r => fmt$(Number(r.actualCostToDate)) },
        { key: "variance", label: "Variance", width: "75px", align: "right", render: r => {
          const v = Number(r.actualCostToDate) - Number(r.originalBudget);
          return <span style={{ color: v > 0 ? "var(--sh-danger)" : "var(--sh-accent)", fontWeight: 600 }}>{fmt$(v)}</span>;
        }},
        { key: "marginPct", label: "Margin", width: "60px", align: "right", render: r => fmtPct(Number(r.marginPct)) },
      ];
      rows = result as unknown as Record<string, unknown>[];
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
      let result = [...landDeals];
      if (detail.value === "active-deals") {
        result = result.filter(d => d.status === "under-contract");
      } else if (detail.value === "total-lots") {
        result = result.sort((a, b) => b.lots - a.lots);
      } else if (detail.value === "invested") {
        result = result.sort((a, b) => b.acquisitionCost - a.acquisitionCost);
      } else if (detail.value === "avg-cost") {
        result = result.sort((a, b) => b.costPerLot - a.costPerLot);
      } else {
        const moneyRange = parseMoneyRange(detail.value);
        const quarter = parseQuarterLabel(detail.value);
        if (moneyRange) {
          result = result.filter(d => d.costPerLot >= moneyRange.min && d.costPerLot < moneyRange.max);
        } else if (quarter) {
          result = result.filter(d => inQuarter(d.contractDate, quarter.year, quarter.quarter));
        } else {
          result = result.sort((a, b) => b.acquisitionCost - a.acquisitionCost);
        }
      }
      subtitle = `${result.length} land deals`;
      columns = landCols;
      rows = result as unknown as Record<string, unknown>[];
      break;
    }

    case "land-city-year": {
      const [city, token] = parsePipe(detail.value);
      const matched = landDeals.filter(d => d.city === city && (!token || matchTimeToken(d.contractDate, token)));
      const result = matched.length > 0 ? matched : landDeals;
      title = detail.label;
      subtitle = `${result.length} land deals`;
      columns = landCols;
      rows = result as unknown as Record<string, unknown>[];
      break;
    }

    case "construction-city-time": {
      const [city, token] = parsePipe(detail.value);
      const matched = jobs.filter(j => j.city === city && (!token || matchTimeToken(j.startDate, token)));
      title = detail.label;
      subtitle = `${matched.length} construction jobs`;
      columns = [
        { key: "jobCode", label: "Job", width: "75px" },
        { key: "community", label: "Community", width: "110px" },
        { key: "startDate", label: "Start", width: "80px" },
        { key: "stage", label: "Stage", width: "95px" },
        { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
        { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
      ];
      rows = matched as unknown as Record<string, unknown>[];
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
      /* "in-progress" means in-review + pending; "all"/"total"/"avg-days" means everything */
      const statusPermits = (v === "all" || v === "total" || v === "avg-days") ? permits
        : v === "in-progress" ? permits.filter(p => p.status === "in-review" || p.status === "pending")
        : permits.filter(p => p.status === v || p.status.replace(/-/g, " ") === detail.value.toLowerCase());
      title = `${detail.value} Permits`;
      subtitle = `${statusPermits.length} permits`;
      columns = permitCols;
      rows = statusPermits as unknown as Record<string, unknown>[];
      break;
    }

    case "permit-cycle-bucket": {
      const range = parseDaysRange(detail.value);
      const matched = range
        ? permits.filter(p => p.daysInReview >= range.min && p.daysInReview <= range.max)
        : permits;
      title = detail.label;
      subtitle = `${matched.length} permits`;
      columns = permitCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "permit-city-year": {
      const [city, token] = parsePipe(detail.value);
      const matched = permits.filter(p => {
        const cityMatch = p.city === city;
        const timeMatch = token ? matchTimeToken(p.submittedDate, token) : true;
        return cityMatch && timeMatch;
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

    case "permits-community": {
      const matched = permits.filter(p => p.community === detail.value);
      title = detail.label;
      subtitle = `${matched.length} permits`;
      columns = permitCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "permit": {
      const p = permits.find(p => p.jobCode === detail.value || String(p.id) === detail.value);
      if (!p) {
        title = detail.label;
        subtitle = "Record not found";
        columns = [{ key: "field", label: "Field", width: "1.2fr" }, { key: "value", label: "Value", width: "1fr" }];
        rows = [{ field: "Not Found", value: "Permit may have been filtered out" }];
        break;
      }
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
      if (!l) {
        title = detail.label;
        subtitle = "Record not found";
        columns = [{ key: "field", label: "Field", width: "1.2fr" }, { key: "value", label: "Value", width: "1fr" }];
        rows = [{ field: "Not Found", value: "Loan may have been filtered out" }];
        break;
      }
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
      let result = [...loans];
      if (detail.value === "exposure") {
        result = result.sort((a, b) => b.loanAmount - a.loanAmount);
      } else if (detail.value === "drawn") {
        result = result.sort((a, b) => b.totalDrawn - a.totalDrawn);
      } else if (detail.value === "lenders") {
        result = result.sort((a, b) => a.lender.localeCompare(b.lender));
      } else if (detail.value === "expiring") {
        result = result.filter(l => l.daysUntilExpiration <= 60).sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
      } else {
        const dayRange = parseDaysRange(detail.value);
        const quarter = parseQuarterLabel(detail.value);
        if (dayRange) {
          result = result.filter(l => l.daysUntilExpiration >= dayRange.min && l.daysUntilExpiration <= dayRange.max);
        } else if (quarter) {
          result = result.filter(l => inQuarter(l.startDate, quarter.year, quarter.quarter));
        } else {
          result = result.sort((a, b) => b.loanAmount - a.loanAmount);
        }
      }
      subtitle = `${result.length} loans`;
      columns = loanCols;
      rows = result as unknown as Record<string, unknown>[];
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

    case "loans-city-time": {
      const [city, token] = parsePipe(detail.value);
      const matched = loans.filter(l => l.city === city && (!token || matchTimeToken(l.startDate, token)));
      title = detail.label;
      subtitle = `${matched.length} loans`;
      columns = loanCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "loans-community": {
      const matched = loans.filter(l => l.community === detail.value);
      title = detail.label;
      subtitle = `${matched.length} loans`;
      columns = loanCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    /* ═══════════════ SALES ═══════════════ */

    case "sale": {
      const s = sales.find(s => s.jobCode === detail.value || String(s.id) === detail.value);
      if (!s) {
        title = detail.label;
        subtitle = "Record not found";
        columns = [{ key: "field", label: "Field", width: "1.2fr" }, { key: "value", label: "Value", width: "1fr" }];
        rows = [{ field: "Not Found", value: "Sale may have been filtered out" }];
        break;
      }
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

    case "sales-community": {
      const matched = sales.filter(s => s.community === detail.value);
      title = detail.label;
      subtitle = `${matched.length} sales`;
      columns = saleCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "sale-metric": {
      title = detail.label;
      let result = [...sales];
      if (detail.value === "total-sales") {
        result = result.sort((a, b) => b.salePrice - a.salePrice);
      } else if (detail.value === "total-value" || detail.value === "avg-price") {
        result = result.sort((a, b) => b.salePrice - a.salePrice);
      } else if (detail.value === "pending-close") {
        result = result.filter(s => s.status === "pending" || s.status === "active");
      } else {
        const moneyRange = parseMoneyRange(detail.value);
        const quarter = parseQuarterLabel(detail.value);
        if (moneyRange) {
          result = result.filter(s => s.salePrice >= moneyRange.min && s.salePrice < moneyRange.max);
        } else if (quarter) {
          result = result.filter(s => inQuarter(s.contractDate, quarter.year, quarter.quarter));
        } else {
          result = result.sort((a, b) => b.salePrice - a.salePrice);
        }
      }
      subtitle = `${result.length} sales`;
      columns = saleCols;
      rows = result as unknown as Record<string, unknown>[];
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

    case "sales-city-time": {
      const [city, token] = parsePipe(detail.value);
      const matched = sales.filter(s => s.city === city && (!token || matchTimeToken(s.contractDate, token)));
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
      if (!u) {
        title = detail.label;
        subtitle = "Record not found";
        columns = [{ key: "field", label: "Field", width: "1.2fr" }, { key: "value", label: "Value", width: "1fr" }];
        rows = [{ field: "Not Found", value: "Unit may have been filtered out" }];
        break;
      }
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
      let result = [...propertyUnits];
      if (detail.value === "total-units") {
        result = result.sort((a, b) => b.monthlyRent - a.monthlyRent);
      } else if (detail.value === "occupancy") {
        result = result.filter(u => u.occupancy === "leased");
      } else if (detail.value === "revenue") {
        result = result.sort((a, b) => b.monthlyRent - a.monthlyRent);
      } else if (detail.value === "delinquent") {
        result = result.filter(u => u.delinquentAmount > 0).sort((a, b) => b.delinquentAmount - a.delinquentAmount);
      } else if (/^class\s+[abc]$/i.test(detail.value)) {
        const cls = detail.value.trim().toUpperCase().slice(-1);
        const classIndex = cls === "A" ? 1 : cls === "B" ? 2 : 0;
        result = result.filter(u => Number(u.id) % 3 === classIndex);
      } else {
        const moneyRange = parseMoneyRange(detail.value);
        const quarter = parseQuarterLabel(detail.value);
        if (moneyRange) {
          result = result.filter(u => u.monthlyRent >= moneyRange.min && u.monthlyRent < moneyRange.max);
        } else if (quarter) {
          result = result.filter(u => inQuarter(u.leaseStart, quarter.year, quarter.quarter));
        } else {
          result = result.sort((a, b) => b.monthlyRent - a.monthlyRent);
        }
      }
      subtitle = `${result.length} units`;
      columns = pmCols;
      rows = result as unknown as Record<string, unknown>[];
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

    case "pm-city-time": {
      const [city, token] = parsePipe(detail.value);
      const matched = propertyUnits.filter(u => u.city === city && (!token || matchTimeToken(u.leaseStart, token)));
      title = detail.label;
      subtitle = `${matched.length} units`;
      columns = pmCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "pm-community": {
      const matched = propertyUnits.filter(u => u.community === detail.value);
      title = detail.label;
      subtitle = `${matched.length} units`;
      columns = pmCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    /* ═══════════════ AUDITS ═══════════════ */

    case "audit-cost": {
      title = detail.label;
      let result = [...auditJobs];
      if (detail.value === "audited-jobs") {
        result = result.sort((a, b) => b.salePrice - a.salePrice);
      } else if (detail.value === "total-revenue") {
        result = result.sort((a, b) => b.salePrice - a.salePrice);
      } else if (detail.value === "total-profit") {
        result = result.sort((a, b) => b.netProfit - a.netProfit);
      } else if (detail.value === "Vertical") {
        result = result.sort((a, b) => b.vertical - a.vertical);
      } else if (detail.value === "Lot / Land") {
        result = result.sort((a, b) => b.lotLand - a.lotLand);
      } else if (detail.value === "Site Work") {
        result = result.sort((a, b) => b.siteWork - a.siteWork);
      } else if (detail.value === "Permitting & Fees") {
        result = result.sort((a, b) => (b.permitting + b.financing) - (a.permitting + a.financing));
      } else if (detail.value === "Utilities & Infrastructure") {
        result = result.sort((a, b) => (b.dirtPad + b.dumpsters + b.well + b.septic + b.waterFiltration) - (a.dirtPad + a.dumpsters + a.well + a.septic + a.waterFiltration));
      } else if (detail.value === "Other") {
        result = result.sort((a, b) => (b.insurance + b.closingCost + b.options + b.gopherTortoise + b.treeSurvey) - (a.insurance + a.closingCost + a.options + a.gopherTortoise + a.treeSurvey));
      } else {
        const pctRange = parsePctRange(detail.value);
        const quarter = parseQuarterLabel(detail.value);
        if (pctRange) {
          result = result.filter(a => a.builderFeePct >= pctRange.min && a.builderFeePct <= pctRange.max);
        } else if (quarter) {
          result = result.filter(a => inQuarter(a.startDate, quarter.year, quarter.quarter));
        }
      }
      subtitle = `${result.length} jobs`;
      columns = auditCols;
      rows = result as unknown as Record<string, unknown>[];
      break;
    }

    case "margin-bucket": {
      const matched = auditJobs.filter(a => {
        const m = a.netMargin;
        if (detail.value === "< 0%") return m < 0;
        if (detail.value === "0\u201310%") return m >= 0 && m < 10;
        if (detail.value === "10\u201315%") return m >= 10 && m < 15;
        if (detail.value === "15\u201320%") return m >= 15 && m < 20;
        if (detail.value === "20%+") return m >= 20;
        if (detail.value === "avg-margin") return true;
        return true;
      });
      title = detail.label;
      subtitle = `${matched.length} jobs`;
      columns = auditCols;
      rows = matched as unknown as Record<string, unknown>[];
      break;
    }

    case "audits-community-time": {
      const [community, token] = parsePipe(detail.value);
      const matched = auditJobs.filter(a => a.community === community && (!token || matchTimeToken(a.startDate, token)));
      title = detail.label;
      subtitle = `${matched.length} audit jobs`;
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
          width: "clamp(860px, 82vw, 1400px)",
          maxWidth: "calc(100% - 4px)",
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

        {/* Body — Pro Forma OR Milestone Timeline OR Cost Breakdown OR standard table */}
        <div style={{ flex: 1, overflow: "hidden", padding: "0 4px", display: "flex", flexDirection: "column" }}>
          {proFormaAudit
            ? renderProForma(proFormaAudit)
            : milestoneJob
              ? renderMilestoneTimeline(milestoneJob.job, milestoneJob.jobSales, milestoneJob.jobLoans)
              : costBreakdown
                ? renderCostBreakdown(costBreakdown.jobs, costBreakdown.mode)
                : renderTable(columns, rows)}
        </div>
      </div>
    </>
  );
}
