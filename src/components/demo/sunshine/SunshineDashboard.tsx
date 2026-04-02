"use client";

import { useState, useMemo, useCallback, Suspense, lazy } from "react";
import "./sunshine-tokens.css";
import ShellBar from "./ShellBar";
import RailNav from "./RailNav";
import FilterBar from "./FilterBar";
import SHDrawer from "./SHDrawer";
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
  timePeriod: "all",
};

export default function SunshineDashboard() {
  const [activeTab, setActiveTab] = useState<SHTab>("construction-dashboard");
  const [filters, setFilters] = useState<SHDashboardFilters>(EMPTY_FILTERS);
  const [drawerDetail, setDrawerDetail] = useState<DrillDetail | null>(null);

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

  const onDrill = useCallback((detail: DrillDetail) => setDrawerDetail(detail), []);
  const closeDrawer = useCallback(() => setDrawerDetail(null), []);

  const tabContent = () => {
    switch (activeTab) {
      /* Construction */
      case "construction-dashboard":
        return <ConstructionDashboardTab jobs={filteredJobs} onCommunityClick={setCommunity} onTabChange={setActiveTab} onDrill={onDrill} />;
      case "construction-pipeline":
        return <ConstructionPipelineTab jobs={filteredJobs} onDrill={onDrill} />;
      case "construction-cycle":
        return <ConstructionCycleTimeTab jobs={filteredJobs} onDrill={onDrill} />;
      case "construction-cost":
        return <ConstructionCostTab jobs={filteredJobs} onDrill={onDrill} />;
      case "construction-subdivisions":
        return <SubdivisionPipelineTab subdivisions={filteredSubs} onDrill={onDrill} />;

      /* Sales */
      case "sales-dashboard":
        return <SalesDashboardTab sales={filteredSales} onCommunityClick={setCommunity} onDrill={onDrill} />;
      case "sales-pipeline":
        return <SalesPipelineTab sales={filteredSales} onDrill={onDrill} />;

      /* Loans */
      case "loans-dashboard":
        return <LoansDashboardTab loans={filteredLoans} onDrill={onDrill} />;
      case "loans-pipeline":
        return <LoansPipelineTab loans={filteredLoans} onDrill={onDrill} />;

      /* Land */
      case "land-dashboard":
        return <LandDashboardTab deals={filteredLand} onCommunityClick={setCommunity} onDrill={onDrill} />;
      case "land-pipeline":
        return <LandPipelineTab deals={filteredLand} onDrill={onDrill} />;
      case "land-subdivisions":
        return <SubdivisionPipelineTab subdivisions={filteredSubs} onDrill={onDrill} />;

      /* Permitting */
      case "permitting-dashboard":
        return <PermittingDashboardTab permits={filteredPermits} onCommunityClick={setCommunity} onDrill={onDrill} />;
      case "permitting-pipeline":
        return <PermittingPipelineTab permits={filteredPermits} onDrill={onDrill} />;

      /* Property Management */
      case "pm-dashboard":
        return <PropertyMgmtDashboardTab units={filteredUnits} onDrill={onDrill} />;
      case "pm-pipeline":
        return <PMPipelineTab units={filteredUnits} onDrill={onDrill} />;

      /* Audits */
      case "audits-dashboard":
        return <AuditsDashboardTab audits={filteredAudits} onDrill={onDrill} />;
      case "audits-pipeline":
        return <AuditsPipelineTab audits={filteredAudits} onDrill={onDrill} />;

      default:
        return null;
    }
  };

  return (
    <div className="sh-dashboard">
      <div className="sh-shell" style={{ position: "relative" }}>
        <ShellBar />
        <FilterBar filters={filters} onChange={setFilters} />
        <RailNav activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="sh-main">
          <Suspense fallback={<TabLoader />}>
            {tabContent()}
          </Suspense>
        </main>
        <SHDrawer detail={drawerDetail} onClose={closeDrawer} />
      </div>
    </div>
  );
}
