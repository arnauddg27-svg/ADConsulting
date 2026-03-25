"use client";

import { useState, useMemo } from "react";
import "../sunshine/sunshine-tokens.css";
import BHShellBar from "./BHShellBar";
import RailNav from "../sunshine/RailNav";
import FilterBar from "../sunshine/FilterBar";
import {
  jobs, sales, loans, landDeals, permits, propertyUnits,
  matchFilters, SECTIONS,
} from "@/lib/brite-homes-data";
import type { SHTab, SHDashboardFilters } from "@/types/sunshine-homes";

/* Tab components */
import BHConstructionDashboardTab from "./tabs/BHConstructionDashboardTab";
import BHConstructionPipelineTab from "./tabs/BHConstructionPipelineTab";
import BHConstructionCycleTab from "./tabs/BHConstructionCycleTab";
import BHConstructionCostTab from "./tabs/BHConstructionCostTab";
import BHSalesDashboardTab from "./tabs/BHSalesDashboardTab";
import BHLoansDashboardTab from "./tabs/BHLoansDashboardTab";
import BHLandDashboardTab from "./tabs/BHLandDashboardTab";
import BHPermittingDashboardTab from "./tabs/BHPermittingDashboardTab";
import BHPropertyMgmtTab from "./tabs/BHPropertyMgmtTab";

const EMPTY_FILTERS: SHDashboardFilters = {
  city: null,
  jobType: null,
  entity: null,
  community: null,
  timePeriod: "all",
};

export default function BriteHomesDashboard() {
  const [activeTab, setActiveTab] = useState<SHTab>("construction-dashboard");
  const [filters, setFilters] = useState<SHDashboardFilters>(EMPTY_FILTERS);

  const filteredJobs = useMemo(() => jobs.filter(j => matchFilters(j, filters)), [filters]);
  const filteredSales = useMemo(() => sales.filter(s => matchFilters(s, filters)), [filters]);
  const filteredLoans = useMemo(() => loans.filter(l => matchFilters(l, filters)), [filters]);
  const filteredLand = useMemo(() => landDeals.filter(d => matchFilters(d, filters)), [filters]);
  const filteredPermits = useMemo(() => permits.filter(p => matchFilters(p, filters)), [filters]);
  const filteredUnits = useMemo(() => propertyUnits.filter(u => matchFilters(u, filters)), [filters]);

  const setCommunity = (community: string | null) =>
    setFilters(prev => ({ ...prev, community: prev.community === community ? null : community }));

  const tabContent = () => {
    switch (activeTab) {
      case "construction-dashboard":
        return <BHConstructionDashboardTab jobs={filteredJobs} onCommunityClick={setCommunity} onTabChange={setActiveTab} />;
      case "construction-pipeline":
        return <BHConstructionPipelineTab jobs={filteredJobs} />;
      case "construction-cycle":
        return <BHConstructionCycleTab jobs={filteredJobs} />;
      case "construction-cost":
        return <BHConstructionCostTab jobs={filteredJobs} />;
      case "sales-dashboard":
        return <BHSalesDashboardTab sales={filteredSales} onCommunityClick={setCommunity} />;
      case "loans-dashboard":
        return <BHLoansDashboardTab loans={filteredLoans} />;
      case "land-dashboard":
        return <BHLandDashboardTab deals={filteredLand} onCommunityClick={setCommunity} />;
      case "permitting-dashboard":
        return <BHPermittingDashboardTab permits={filteredPermits} onCommunityClick={setCommunity} />;
      case "pm-dashboard":
        return <BHPropertyMgmtTab units={filteredUnits} />;
      default:
        return null;
    }
  };

  return (
    <div className="sh-dashboard">
      <div className="sh-shell" style={{ position: "relative" }}>
        <BHShellBar />
        <FilterBar filters={filters} onChange={setFilters} />
        <RailNav activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="sh-main">
          {tabContent()}
        </main>
      </div>
    </div>
  );
}
