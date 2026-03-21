import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "A.D. Homes & Consulting | Custom Data Ecosystems for Residential Homebuilders",
  description:
    "Custom operational intelligence platforms for residential homebuilders across North America. ERP extraction, centralized data warehouses, lifecycle dashboards, pro forma tools, and client-owned delivery.",
  keywords: [
    "residential homebuilder data platform",
    "builder ERP data extraction",
    "Buildertrend analytics",
    "Hyphen reporting",
    "Sage construction data warehouse",
    "homebuilder KPI dashboard",
    "builder operational intelligence",
    "construction data warehouse",
    "per job pro forma reporting",
    "builder lifecycle analytics",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <div className="relative min-h-screen overflow-x-hidden">
          <Header />
          <main>{children}</main>
          <Footer />
          <ScrollReveal />
        </div>
      </body>
    </html>
  );
}
