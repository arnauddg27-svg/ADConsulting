import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact A.D. Homes & Consulting | Discovery Call for Residential Homebuilders",
  description:
    "Schedule a discovery call about builder ERP extraction, centralized reporting, lifecycle dashboards, pro forma tools, and operational intelligence for residential homebuilders across North America.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
