"use client";

import { useState, useMemo, useCallback } from "react";
import "./sunshine-tokens.css";
import ShellBar from "./ShellBar";
import RailNav from "./RailNav";
import FilterBar from "./FilterBar";
import SHDrawer from "./SHDrawer";
import type { DrillDetail } from "./SHDrawer";
import {
  jobs, sales, loans, landDeals, permits, propertyUnits,
  matchFilters,
} from "@/lib/sunshine-homes-data";
import type { SHTab, SHDashboardFilters } from "@/types/sunshine-homes";

/* Tab components */
import ConstructionDashboardTab from "./tabs/ConstructionDashboardTab";
import ConstructionPipelineTab from "./tabs/ConstructionPipelineTab";
import ConstructionCycleTimeTab from "./tabs/ConstructionCycleTimeTab";
import ConstructionCostTab from "./tabs/ConstructionCostTab";
import SalesDashboardTab from "./tabs/SalesDashboardTab";
import LoansDashboardTab from "./tabs/LoansDashboardTab";
import LandDashboardTab from "./tabs/LandDashboardTab";
import PermittingDashboardTab from "./tabs/PermittingDashboardTab";
import PropertyMgmtDashboardTab from "./tabs/PropertyMgmtDashboardTab";

const EMPTY_FILTERS: SHDashboardFilters = {
  city: null,
  jobType: null,
  entity: null,
  community: null,
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

  const setCommunity = (community: string | null) =>
    setFilters(prev => ({ ...prev, community: prev.community === community ? null : community }));

  const onDrill = useCallback((detail: DrillDetail) => setDrawerDetail(detail), []);
  const closeDrawer = useCallback(() => setDrawerDetail(null), []);

  const tabContent = () => {
    switch (activeTab) {
      case "construction-dashboard":
        return <ConstructionDashboardTab jobs={filteredJobs} onCommunityClick={setCommunity} onTabChange={setActiveTab} onDrill={onDrill} />;
      case "construction-pipeline":
        return <ConstructionPipelineTab jobs={filteredJobs} onDrill={onDrill} />;
      case "construction-cycle":
        return <ConstructionCycleTimeTab jobs={filteredJobs} />;
      case "construction-cost":
        return <ConstructionCostTab jobs={filteredJobs} onDrill={onDrill} />;
      case "sales-dashboard":
        return <SalesDashboardTab sales={filteredSales} onCommunityClick={setCommunity} onDrill={onDrill} />;
      case "loans-dashboard":
        return <LoansDashboardTab loans={filteredLoans} onDrill={onDrill} />;
      case "land-dashboard":
        return <LandDashboardTab deals={filteredLand} onCommunityClick={setCommunity} onDrill={onDrill} />;
      case "permitting-dashboard":
        return <PermittingDashboardTab permits={filteredPermits} onCommunityClick={setCommunity} />;
      case "pm-dashboard":
        return <PropertyMgmtDashboardTab units={filteredUnits} />;
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
          {tabContent()}
        </main>
        <SHDrawer detail={drawerDetail} onClose={closeDrawer} />
      </div>
    </div>
  );
}
