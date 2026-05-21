import type { Metadata } from "next";

import MobileKpiDashboard from "./MobileKpiDashboard";

export const metadata: Metadata = {
  title: "Mobile KPI Dashboard | AD ERP SYSTEMS",
  description:
    "A phone-first KPI-only sample dashboard for builder schedule, budget, margin, and follow-up review.",
};

export default function MobileKpiDashboardPage() {
  return <MobileKpiDashboard />;
}
