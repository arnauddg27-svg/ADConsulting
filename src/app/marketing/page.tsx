import type { Metadata } from "next";
import MarketingCommandCenter from "@/components/marketing/MarketingCommandCenter";

export const metadata: Metadata = {
  title: "Marketing Command Center | A.D. Homes & Consulting",
  description:
    "Internal campaign command center for planning Google, Meta, LinkedIn, Calendly, and HubSpot marketing workflows.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MarketingPage() {
  return <MarketingCommandCenter />;
}
