import type { Metadata } from "next";
import BookingQualifier from "@/components/contact/BookingQualifier";

export const metadata: Metadata = {
  title: "Book a Discovery Call | AD ERP SYSTEMS",
  description:
    "Confirm fit for a discovery call about custom data platforms for residential builders and developers.",
};

export default function BookPage() {
  return <BookingQualifier />;
}
