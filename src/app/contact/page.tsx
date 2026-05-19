import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | AD ERP SYSTEMS",
  description:
    "Book a discovery call to review builder reporting systems for schedule, budget, margin, and owner follow-up visibility.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
