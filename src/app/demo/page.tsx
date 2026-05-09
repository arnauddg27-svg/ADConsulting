import type { Metadata } from "next";
import DemoPageClient from "@/components/demo/DemoPageClient";

export const metadata: Metadata = {
  title: "Sample Dashboard | Custom Data Platforms for Residential Builders and Developers",
  description:
    "Explore a sample reporting system built on centralized builder and developer data, showing how dashboards and operational tools support residential operating decisions.",
};

export default function DemoPage() {
  return (
    <div>
      <DemoPageClient />
    </div>
  );
}
