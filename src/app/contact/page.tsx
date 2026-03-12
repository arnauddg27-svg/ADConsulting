import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact A.D. Homes & Consulting | Free Builder Operations Consultation — Orlando",
  description:
    "Schedule a free 30-minute consultation about construction dashboards, KPI reporting, financial modeling, and operations improvement for Orlando and Central Florida home builders.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
