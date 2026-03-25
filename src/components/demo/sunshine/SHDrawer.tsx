"use client";

import { useEffect } from "react";
import type { SHJob, SHSale, SHLoan, SHLandDeal, SHPermit, SHPropertyUnit, SHAuditJob } from "@/types/sunshine-homes";
import { jobs, sales, loans, landDeals, permits, propertyUnits, auditJobs, fmt$, fmtPct } from "@/lib/sunshine-homes-data";
import SHPill from "./SHPill";

export interface DrillDetail {
  type: "job" | "community" | "city" | "stage" | "plan" | "lender" | "super" | "sale" | "loan" | "permit" | "unit" | "property" | "cost-category" | "margin-bucket" | "permit-status" | "occupancy" | "land-status" | "land-metric" | "land-city-year" | "permit-city-year" | "permit-city-status" | "loan-metric" | "loan-rate" | "sale-status" | "sale-metric" | "sale-city-status" | "sale-entity-year" | "pm-metric" | "pm-occupancy";
  value: string;
  label: string;
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
              {c.render ? c.render(r) : String(r[c.key] ?? "—")}
            </span>
          ))}
        </div>
      ))}
      {rows.length === 0 && <div style={{ padding: 16, fontSize: 11, color: "var(--sh-text-muted)", fontStyle: "italic" }}>No data</div>}
    </div>
  );
}

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
    case "job": {
      const job = jobs.find(j => j.jobCode === detail.value);
      if (!job) break;
      title = `${job.jobCode} — ${job.community}`;
      subtitle = `${job.lot} · ${job.plan} · ${job.superintendent}`;
      // Show job detail as key-value pairs + related sales/loans
      const jobSales = sales.filter(s => s.jobCode === detail.value);
      const jobLoans = loans.filter(l => l.jobCode === detail.value);
      columns = [
        { key: "field", label: "Field", width: "1.2fr" },
        { key: "value", label: "Value", width: "1fr", align: "right" },
      ];
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
      break;
    }

    case "community": {
      const communityJobs = jobs.filter(j => j.community === detail.value);
      title = `${detail.value} — All Jobs`;
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
      title = `${detail.value} — All Jobs`;
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
      title = `${detail.value} — Jobs`;
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
      title = `${detail.value} — Workload`;
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

    case "lender": {
      const lenderLoans = loans.filter(l => l.lender === detail.value);
      title = `${detail.value} — Loans`;
      subtitle = `${lenderLoans.length} active loans`;
      columns = [
        { key: "jobCode", label: "Job", width: "80px" },
        { key: "community", label: "Community", width: "130px" },
        { key: "loanAmount", label: "Amount", width: "80px", align: "right", render: r => fmt$(Number(r.loanAmount)) },
        { key: "drawPct", label: "Draw %", width: "60px", align: "right", render: r => fmtPct(Number(r.drawPct)) },
        { key: "interestRate", label: "Rate", width: "50px", align: "right", render: r => `${Number(r.interestRate)}%` },
        { key: "daysUntilExpiration", label: "Exp", width: "50px", align: "right", render: r => {
          const d = Number(r.daysUntilExpiration);
          return <SHPill tone={d <= 30 ? "alert" : d <= 60 ? "watch" : "good"} label={`${d}d`} />;
        }},
      ];
      rows = lenderLoans as unknown as Record<string, unknown>[];
      break;
    }

    case "permit-status": {
      const statusPermits = permits.filter(p => {
        const statusLabel = p.status.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase());
        return statusLabel === detail.value || p.status === detail.value.toLowerCase().replace(" ", "-");
      });
      title = `${detail.value} Permits`;
      subtitle = `${statusPermits.length} permits`;
      columns = [
        { key: "jobCode", label: "Job", width: "80px" },
        { key: "community", label: "Community", width: "130px" },
        { key: "city", label: "City", width: "90px" },
        { key: "permitType", label: "Type", width: "80px" },
        { key: "submittedDate", label: "Submitted", width: "90px" },
        { key: "daysInReview", label: "Days", width: "50px", align: "right", render: r => {
          const d = Number(r.daysInReview);
          return <SHPill tone={d > 30 ? "alert" : d > 15 ? "watch" : "good"} label={`${d}d`} />;
        }},
      ];
      rows = statusPermits as unknown as Record<string, unknown>[];
      break;
    }

    case "occupancy": {
      const occUnits = propertyUnits.filter(u => u.occupancy === detail.value.toLowerCase().replace(" ", "-"));
      title = `${detail.label} Units`;
      subtitle = `${occUnits.length} units`;
      columns = [
        { key: "address", label: "Address", width: "1fr" },
        { key: "community", label: "Community", width: "120px" },
        { key: "tenant", label: "Tenant", width: "100px", render: r => String(r.tenant ?? "—") },
        { key: "monthlyRent", label: "Rent", width: "70px", align: "right", render: r => fmt$(Number(r.monthlyRent)) },
      ];
      rows = occUnits as unknown as Record<string, unknown>[];
      break;
    }

    case "cost-category":
    case "margin-bucket": {
      const auditRows = auditJobs.filter(a => {
        if (detail.type === "margin-bucket") {
          const m = a.netMargin;
          if (detail.value === "< 0%") return m < 0;
          if (detail.value === "0–10%") return m >= 0 && m < 10;
          if (detail.value === "10–20%") return m >= 10 && m < 20;
          if (detail.value === "20–30%") return m >= 20 && m < 30;
          if (detail.value === "30%+") return m >= 30;
        }
        return true;
      });
      title = detail.label;
      subtitle = `${auditRows.length} jobs`;
      columns = [
        { key: "jobCode", label: "Job", width: "80px" },
        { key: "community", label: "Community", width: "120px" },
        { key: "salePrice", label: "Sale", width: "75px", align: "right", render: r => fmt$(Number(r.salePrice)) },
        { key: "totalCost", label: "Cost", width: "75px", align: "right", render: r => fmt$(Number(r.totalCost)) },
        { key: "netMargin", label: "Margin", width: "60px", align: "right", render: r => {
          const m = Number(r.netMargin);
          return <SHPill tone={m >= 15 ? "good" : m >= 5 ? "watch" : "alert"} label={fmtPct(m)} />;
        }},
      ];
      rows = auditRows as unknown as Record<string, unknown>[];
      break;
    }

    default:
      title = detail.label;
      subtitle = "Drill-down data";
      /* Try to show related jobs for unhandled types */
      const relatedJobs = jobs.filter(j =>
        j.community === detail.value || j.city === detail.value || j.stage === detail.value || j.plan === detail.value
      );
      if (relatedJobs.length > 0) {
        subtitle = `${relatedJobs.length} related jobs`;
        columns = [
          { key: "jobCode", label: "Job", width: "80px" },
          { key: "community", label: "Community", width: "130px" },
          { key: "stage", label: "Stage", width: "100px" },
          { key: "completionPct", label: "Comp", width: "60px", align: "right", render: r => fmtPct(Number(r.completionPct)) },
          { key: "wipBalance", label: "WIP", width: "70px", align: "right", render: r => fmt$(Number(r.wipBalance)) },
        ];
        rows = relatedJobs as unknown as Record<string, unknown>[];
      } else {
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
        <div style={{ flex: 1, overflow: "hidden", padding: "0 4px" }}>
          {renderTable(columns, rows)}
        </div>
      </div>
    </>
  );
}
