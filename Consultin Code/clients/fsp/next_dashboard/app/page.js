import { getDashboardData } from "../lib/dashboard-data.js";
import DashboardShell from "../components/dashboard-shell.js";

export const revalidate = 86400; // re-query BigQuery once every 24 hours

export default async function Home() {
  const dashboard = await getDashboardData();
  return <DashboardShell dashboard={dashboard} />;
}
