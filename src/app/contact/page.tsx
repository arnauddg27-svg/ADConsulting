import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact A.D. Homes & Consulting | Discovery Call for Residential Homebuilders",
  description:
    "Schedule a discovery call to discuss data infrastructure, operational reporting, and builder decision tools for your homebuilding operation.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
