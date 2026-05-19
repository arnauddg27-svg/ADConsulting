import type { Metadata } from "next";
import DemoDashboardClient from "./DemoDashboardClient";

export const metadata: Metadata = {
  title: "Sample Dashboard | AD ERP SYSTEMS",
  description:
    "Explore a full-screen sample builder operations dashboard with lifecycle navigation, KPI tracking, construction pipeline, sales analytics, loan management, and cross-filtering.",
};

export default function DemoPage() {
  return <DemoDashboardClient />;
}
