import type { Metadata } from "next";
import DemoPageClient from "@/components/demo/DemoPageClient";

export const metadata: Metadata = {
  title: "Builder Dashboard Sample | Construction Reporting & KPI Demo — Orlando",
  description:
    "Explore a sample construction operations dashboard with project tracking, cost reporting, budget analysis, and schedule visibility built for Central Florida home builders.",
};

export default function DemoPage() {
  return <DemoPageClient />;
}
