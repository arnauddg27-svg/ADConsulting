"use client";

import { useState, useMemo, useCallback, Suspense, lazy, useEffect } from "react";
import { createPortal } from "react-dom";
import "./sunshine-tokens.css";
import ShellBar from "./ShellBar";
import RailNav from "./RailNav";
import FilterBar from "./FilterBar";
import SHDrawer from "./SHDrawer";
import SHDataContextStrip from "./SHDataContextStrip";
import type { DrillDetail } from "./SHDrawer";
import {
  jobs, sales, loans, landDeals, permits, propertyUnits, subdivisions, auditJobs,
  matchFilters,
} from "@/lib/sunshine-homes-data";
import type { SHTab, SHDashboardFilters } from "@/types/sunshine-homes";

/* Lazy-load all tabs — only the active tab's code is fetched */
const ConstructionDashboardTab = lazy(() => import("./tabs/ConstructionDashboardTab"));
const ConstructionPipelineTab = lazy(() => import("./tabs/ConstructionPipelineTab"));
const ConstructionCycleTimeTab = lazy(() => import("./tabs/ConstructionCycleTimeTab"));
const ConstructionCostTab = lazy(() => import("./tabs/ConstructionCostTab"));
const SalesDashboardTab = lazy(() => import("./tabs/SalesDashboardTab"));
const LoansDashboardTab = lazy(() => import("./tabs/LoansDashboardTab"));
const LandDashboardTab = lazy(() => import("./tabs/LandDashboardTab"));
const SubdivisionPipelineTab = lazy(() => import("./tabs/SubdivisionPipelineTab"));
const PermittingDashboardTab = lazy(() => import("./tabs/PermittingDashboardTab"));
const PropertyMgmtDashboardTab = lazy(() => import("./tabs/PropertyMgmtDashboardTab"));
const LandPipelineTab = lazy(() => import("./tabs/LandPipelineTab"));
const PermittingPipelineTab = lazy(() => import("./tabs/PermittingPipelineTab"));
const LoansPipelineTab = lazy(() => import("./tabs/LoansPipelineTab"));
const SalesPipelineTab = lazy(() => import("./tabs/SalesPipelineTab"));
const PMPipelineTab = lazy(() => import("./tabs/PMPipelineTab"));
const AuditsDashboardTab = lazy(() => import("./tabs/AuditsDashboardTab"));
const AuditsPipelineTab = lazy(() => import("./tabs/AuditsPipelineTab"));

function TabLoader() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--sh-text-muted)", fontSize: 12 }}>
      Loading...
    </div>
  );
}

const EMPTY_FILTERS: SHDashboardFilters = {
  city: null,
  jobType: null,
  entity: null,
  community: null,
  stage: null,
  status: null,
  drillYear: null,
  drillQuarter: null,
  drillMonth: null,
  timePeriod: "all",
};

export default function SunshineDashboard() {
  const [activeTab, setActiveTab] = useState<SHTab>("construction-dashboard");
  const [filters, setFilters] = useState<SHDashboardFilters>(EMPTY_FILTERS);
  const [drawerDetail, setDrawerDetail] = useState<DrillDetail | null>(null);
  const [mode, setMode] = useState<"night" | "day">("night");
  const [isFullPage, setIsFullPage] = useState(false);

  // Backward compatibility: if an old state points to the removed land-subdivisions tab, send users to land pipeline.
  useEffect(() => {
    if (activeTab === "land-subdivisions") setActiveTab("land-pipeline");
  }, [activeTab]);

  useEffect(() => {
    const saved = window.localStorage.getItem("sh-mode");
    if (saved === "day" || saved === "night") setMode(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sh-mode", mode);
  }, [mode]);

  useEffect(() => {
    if (!isFullPage) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullPage(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullPage]);

  useEffect(() => {
    if (!isFullPage) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullPage]);

  /* Filtered data */
  const filteredJobs = useMemo(() => jobs.filter(j => matchFilters(j, filters)), [filters]);
  const filteredSales = useMemo(() => sales.filter(s => matchFilters(s, filters)), [filters]);
  const filteredLoans = useMemo(() => loans.filter(l => matchFilters(l, filters)), [filters]);
  const filteredLand = useMemo(() => landDeals.filter(d => matchFilters(d, filters)), [filters]);
  const filteredPermits = useMemo(() => permits.filter(p => matchFilters(p, filters)), [filters]);
  const filteredUnits = useMemo(() => propertyUnits.filter(u => matchFilters(u, filters)), [filters]);
  const filteredSubs = useMemo(() => subdivisions.filter(s => matchFilters(s, filters)), [filters]);
  const filteredAudits = useMemo(() => auditJobs.filter(a => matchFilters(a, filters)), [filters]);

  const setCommunity = (community: string | null) =>
    setFilters(prev => ({ ...prev, community: prev.community === community ? null : community }));

  const setStage = (stage: string | null) =>
    setFilters(prev => ({ ...prev, stage: prev.stage === stage ? null : stage }));

  const setCity = (city: string | null) =>
    setFilters(prev => ({ ...prev, city: prev.city === city ? null : city }));

  const setStatus = (status: string | null) =>
    setFilters(prev => ({ ...prev, status: prev.status === status ? null : status }));

  const setDrillYear = (year: number | null) =>
    setFilters(prev => ({ ...prev, drillYear: prev.drillYear === year ? null : year, drillQuarter: null, drillMonth: null }));

  const setDrillQuarter = (quarter: number | null) =>
    setFilters(prev => ({ ...prev, drillQuarter: prev.drillQuarter === quarter ? null : quarter, drillMonth: null }));

  const setDrillMonth = (month: number | null) =>
    setFilters(prev => ({ ...prev, drillMonth: prev.drillMonth === month ? null : month }));

  const clearFilter = (key: keyof SHDashboardFilters) => {
    if (key === "drillYear") {
      setFilters(prev => ({ ...prev, drillYear: null, drillQuarter: null, drillMonth: null }));
    } else if (key === "drillQuarter") {
      setFilters(prev => ({ ...prev, drillQuarter: null, drillMonth: null }));
    } else {
      setFilters(prev => ({ ...prev, [key]: key === "timePeriod" ? "all" : null }));
    }
  };

  const closeDrawer = useCallback(() => setDrawerDetail(null), []);

  const filterCount = useMemo(() => {
    let n = 0;
    if (filters.city) n++;
    if (filters.jobType) n++;
    if (filters.entity) n++;
    if (filters.community) n++;
    if (filters.stage) n++;
    if (filters.status) n++;
    if (filters.drillYear) n++;
    if (filters.drillQuarter) n++;
    if (filters.drillMonth) n++;
    if (filters.timePeriod !== "all") n++;
    return n;
  }, [filters]);

  const contextMeta = useMemo(() => {
    if (activeTab.startsWith("construction") && activeTab !== "construction-subdivisions") return { scopeLabel: "Construction Jobs", rows: filteredJobs.length, dateBasis: "Job start date" };
    if (activeTab === "construction-subdivisions") return { scopeLabel: "Subdivision Portfolio", rows: filteredSubs.length, dateBasis: "Project start date" };
    if (activeTab.startsWith("sales")) return { scopeLabel: "Sales Contracts", rows: filteredSales.length, dateBasis: "Contract date" };
    if (activeTab.startsWith("loans")) return { scopeLabel: "Construction Loans", rows: filteredLoans.length, dateBasis: "Loan start date" };
    if (activeTab.startsWith("land")) return { scopeLabel: "Land Deals", rows: filteredLand.length, dateBasis: "Contract date" };
    if (activeTab.startsWith("permitting")) return { scopeLabel: "Permit Records", rows: filteredPermits.length, dateBasis: "Submitted date" };
    if (activeTab.startsWith("pm")) return { scopeLabel: "Property Units", rows: filteredUnits.length, dateBasis: "Lease start date" };
    if (activeTab.startsWith("audits")) return { scopeLabel: "Audit Jobs", rows: filteredAudits.length, dateBasis: "Job start date" };
    return { scopeLabel: "Dashboard Data", rows: 0, dateBasis: undefined };
  }, [activeTab, filteredAudits.length, filteredJobs.length, filteredLand.length, filteredLoans.length, filteredPermits.length, filteredSales.length, filteredSubs.length, filteredUnits.length]);

  const filterSummary = useMemo(() => {
    const summary: string[] = [];
    if (filters.city) summary.push(`City: ${filters.city}`);
    if (filters.entity) summary.push(`Entity: ${filters.entity}`);
    if (filters.community) summary.push(`Community: ${filters.community}`);
    if (filters.stage) summary.push(`Stage: ${filters.stage}`);
    if (filters.status) summary.push(`Status: ${filters.status}`);
    if (filters.drillYear) summary.push(`Year: ${filters.drillYear}`);
    if (filters.drillQuarter) summary.push(`Quarter: Q${filters.drillQuarter}`);
    if (filters.drillMonth) summary.push(`Month: ${new Date(2000, filters.drillMonth - 1).toLocaleString("en-US", { month: "short" })}`);
    if (filters.timePeriod !== "all") summary.push(`Period: ${filters.timePeriod}`);
    return summary;
  }, [filters]);

  const domainLabel = useMemo(() => {
    if (activeTab.startsWith("construction")) return "Construction";
    if (activeTab.startsWith("sales")) return "Sales";
    if (activeTab.startsWith("loans")) return "Loans";
    if (activeTab.startsWith("land")) return "Land";
    if (activeTab.startsWith("permitting")) return "Permitting";
    if (activeTab.startsWith("pm")) return "Property Management";
    if (activeTab.startsWith("audits")) return "Audits";
    return "Dashboard";
  }, [activeTab]);

  const onDrill = useCallback((detail: DrillDetail) => {
    const labelMetric = detail.label.split("—")[0]?.trim() || detail.type;
    const scopedCount = detail.scopedJobCodes?.length;
    const scopeLabel = detail.scopeLabel ??
      `${contextMeta.scopeLabel} · ${scopedCount ? `${scopedCount} scoped jobs` : `${contextMeta.rows} current rows`}`;
    setDrawerDetail({
      ...detail,
      domain: detail.domain ?? domainLabel,
      metric: detail.metric ?? labelMetric,
      dateBasis: detail.dateBasis ?? contextMeta.dateBasis,
      scopeLabel,
      filterSummary,
    });
  }, [contextMeta.dateBasis, contextMeta.rows, contextMeta.scopeLabel, domainLabel, filterSummary]);

  const tabContent = () => {
    switch (activeTab) {
      /* Construction */
      case "construction-dashboard":
        return <ConstructionDashboardTab jobs={filteredJobs} onCommunityClick={setCommunity} onStageClick={setStage} onTabChange={setActiveTab} onStatusClick={setStatus} onDrill={onDrill} drillYear={filters.drillYear} drillQuarter={filters.drillQuarter} drillMonth={filters.drillMonth} onYearClick={setDrillYear} onQuarterClick={setDrillQuarter} onMonthClick={setDrillMonth} />;
      case "construction-pipeline":
        return <ConstructionPipelineTab jobs={filteredJobs} onDrill={onDrill} onStageClick={setStage} />;
      case "construction-cycle":
        return <ConstructionCycleTimeTab jobs={filteredJobs} onDrill={onDrill} onCityClick={setCity} />;
      case "construction-cost":
        return <ConstructionCostTab jobs={filteredJobs} onDrill={onDrill} onCommunityClick={setCommunity} />;
      case "construction-subdivisions":
        return <SubdivisionPipelineTab subdivisions={filteredSubs} onDrill={onDrill} />;

      /* Sales */
      case "sales-dashboard":
        return <SalesDashboardTab sales={filteredSales} onCommunityClick={setCommunity} onCityClick={setCity} onTabChange={setActiveTab} onStatusClick={setStatus} onDrill={onDrill} drillYear={filters.drillYear} drillQuarter={filters.drillQuarter} drillMonth={filters.drillMonth} onYearClick={setDrillYear} onQuarterClick={setDrillQuarter} onMonthClick={setDrillMonth} />;
      case "sales-pipeline":
        return <SalesPipelineTab sales={filteredSales} onDrill={onDrill} />;

      /* Loans */
      case "loans-dashboard":
        return <LoansDashboardTab loans={filteredLoans} onCommunityClick={setCommunity} onCityClick={setCity} onTabChange={setActiveTab} onStatusClick={setStatus} onDrill={onDrill} drillYear={filters.drillYear} drillQuarter={filters.drillQuarter} drillMonth={filters.drillMonth} onYearClick={setDrillYear} onQuarterClick={setDrillQuarter} onMonthClick={setDrillMonth} />;
      case "loans-pipeline":
        return <LoansPipelineTab loans={filteredLoans} onDrill={onDrill} />;

      /* Land */
      case "land-dashboard":
        return <LandDashboardTab deals={filteredLand} onCommunityClick={setCommunity} onCityClick={setCity} onTabChange={setActiveTab} onStatusClick={setStatus} onDrill={onDrill} drillYear={filters.drillYear} drillQuarter={filters.drillQuarter} drillMonth={filters.drillMonth} onYearClick={setDrillYear} onQuarterClick={setDrillQuarter} onMonthClick={setDrillMonth} />;
      case "land-pipeline":
        return <LandPipelineTab deals={filteredLand} onDrill={onDrill} />;

      /* Permitting */
      case "permitting-dashboard":
        return <PermittingDashboardTab permits={filteredPermits} onCommunityClick={setCommunity} onCityClick={setCity} onTabChange={setActiveTab} onStatusClick={setStatus} onDrill={onDrill} drillYear={filters.drillYear} drillQuarter={filters.drillQuarter} drillMonth={filters.drillMonth} onYearClick={setDrillYear} onQuarterClick={setDrillQuarter} onMonthClick={setDrillMonth} />;
      case "permitting-pipeline":
        return <PermittingPipelineTab permits={filteredPermits} onDrill={onDrill} />;

      /* Property Management */
      case "pm-dashboard":
        return <PropertyMgmtDashboardTab units={filteredUnits} onCommunityClick={setCommunity} onCityClick={setCity} onTabChange={setActiveTab} onStatusClick={setStatus} onDrill={onDrill} drillYear={filters.drillYear} drillQuarter={filters.drillQuarter} drillMonth={filters.drillMonth} onYearClick={setDrillYear} onQuarterClick={setDrillQuarter} onMonthClick={setDrillMonth} />;
      case "pm-pipeline":
        return <PMPipelineTab units={filteredUnits} onDrill={onDrill} />;

      /* Audits */
      case "audits-dashboard":
        return <AuditsDashboardTab audits={filteredAudits} onCommunityClick={setCommunity} onCityClick={setCity} onTabChange={setActiveTab} onStatusClick={setStatus} onDrill={onDrill} drillYear={filters.drillYear} drillQuarter={filters.drillQuarter} drillMonth={filters.drillMonth} onYearClick={setDrillYear} onQuarterClick={setDrillQuarter} onMonthClick={setDrillMonth} />;
      case "audits-pipeline":
        return <AuditsPipelineTab audits={filteredAudits} onDrill={onDrill} />;

      default:
        return null;
    }
  };

  /* Shell + its siblings (backdrop + exit FAB) — rendered inline when not
   * fullpage, portaled to document.body when fullpage.
   * Portaling escapes ANY ancestor stacking context, fixed-containing-block,
   * overflow clip, or transform that would otherwise trap the z-120 shell
   * below the site header (z-50). This is the only reliable cross-browser
   * way to guarantee the fullpage shell covers the whole viewport. */
  const shellMarkup = (
    <div className="sh-dashboard" data-sh-mode={mode} data-sh-fullpage={isFullPage ? "true" : "false"}>
      {isFullPage && (
        <>
          <div
            className="sh-fullpage-backdrop"
            aria-hidden
            onClick={() => setIsFullPage(false)}
          />
          <button
            type="button"
            className="sh-fullpage-exit-fab"
            onClick={() => setIsFullPage(false)}
          >
            Exit Full Page
          </button>
        </>
      )}
      <div className={`sh-shell ${isFullPage ? "sh-shell-fullpage" : ""}`} style={{ position: "relative" }}>
        <ShellBar
          mode={mode}
          isFullPage={isFullPage}
          onToggleMode={() => setMode(prev => prev === "night" ? "day" : "night")}
          onToggleFullPage={() => setIsFullPage(prev => !prev)}
        />
        <FilterBar filters={filters} onChange={setFilters} />
        <RailNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="sh-main">
          <SHDataContextStrip scopeLabel={contextMeta.scopeLabel} rows={contextMeta.rows} filterCount={filterCount} dateBasis={contextMeta.dateBasis} />
          <Suspense fallback={<TabLoader />}>
            {tabContent()}
          </Suspense>
        </div>
        <SHDrawer detail={drawerDetail} onClose={closeDrawer} filters={filters} />
      </div>
    </div>
  );

  if (isFullPage && typeof document !== "undefined") {
    return createPortal(shellMarkup, document.body);
  }
  return shellMarkup;
}
