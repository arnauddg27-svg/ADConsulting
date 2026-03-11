import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | Homebuilder Operations Consulting",
  description:
    "Schedule a free consultation about dashboards, KPI reporting, financial modeling, and operations improvement for Central Florida builders and development firms.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
