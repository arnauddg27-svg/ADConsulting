import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import DemoPageClient from "@/components/demo/DemoPageClient";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sunshine Homes Demo | Builder Operations Platform — A.D. Homes & Consulting",
  description:
    "Explore a full-featured builder operations dashboard for Sunshine Homes — lifecycle navigation, KPI tracking, construction pipeline, sales analytics, loan management, and cross-filtering.",
};

export default function DemoPage() {
  return (
    <div className={spaceGrotesk.variable}>
      <DemoPageClient />
    </div>
  );
}
