import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | Custom Data Platforms for Residential Homebuilders",
  description:
    "Book a discovery call to review your systems, reporting needs, and fit for a custom data platform built for residential homebuilders.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
