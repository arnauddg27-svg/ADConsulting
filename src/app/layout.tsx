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
  title: "A.D. Homes & Consulting | Custom Operating Systems for Builders — Orlando & Central Florida",
  description:
    "Custom data ecosystems for Central Florida home builders. Automated ingestion, centralized data, and functional applications — job profitability, lot pipeline, vendor scorecards, and more.",
  keywords: [
    "builder operating system",
    "construction data ecosystem Orlando",
    "Central Florida homebuilder consultant",
    "builder data extraction",
    "homebuilder job profitability",
    "construction pipeline tracking",
    "vendor scorecard home builders",
    "builder data warehouse",
    "construction management consulting Orlando",
    "home builder operations technology Florida",
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
