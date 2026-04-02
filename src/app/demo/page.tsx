import type { Metadata } from "next";
import DemoPageClient from "@/components/demo/DemoPageClient";

export const metadata: Metadata = {
  title: "Sunshine Homes Demo | Builder Operations Platform — A.D. Homes & Consulting",
  description:
    "Explore a full-featured builder operations dashboard for Sunshine Homes — lifecycle navigation, KPI tracking, construction pipeline, sales analytics, loan management, and cross-filtering.",
};

export default function DemoPage() {
  return (
    <div>
      <DemoPageClient />
    </div>
  );
}
