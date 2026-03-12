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
  title: "A.D. Homes & Consulting | Construction Operations Consulting — Orlando & Central Florida",
  description:
    "Construction operations consulting for Orlando and Central Florida home builders. Dashboards, KPI reporting, financial modeling, ERP optimization, and process improvement for builders doing 50–200+ homes per year.",
  keywords: [
    "construction operations consulting Orlando",
    "Central Florida homebuilder consultant",
    "builder ERP consulting Florida",
    "homebuilder dashboard reporting",
    "construction KPI systems",
    "financial modeling home builders",
    "home builder operations consulting",
    "construction management consulting Orlando",
    "builder reporting Power BI",
    "real estate development consulting Florida",
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
