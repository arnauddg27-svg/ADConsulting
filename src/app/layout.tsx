import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MarketingTracking from "@/components/analytics/MarketingTracking";


const siteUrl = "https://consulting.aderpsystems.com";
const siteTitle = "AD ERP SYSTEMS | Custom Data Platforms for Residential Builders and Developers";
const siteDescription =
  "Custom data platforms for residential builders and developers. AD ERP SYSTEMS centralizes ERP, spreadsheet, finance, API, and export data in a structured warehouse, applies residential operating KPI logic, and delivers reporting systems, dashboards, and operational tools.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "residential homebuilder data platform",
    "residential developer data platform",
    "custom data platforms for residential homebuilders",
    "custom data platforms for residential developers",
    "builder ERP data extraction",
    "centralized builder data",
    "builder reporting systems",
    "builder dashboards",
    "homebuilder dashboard",
    "homebuilder reporting",
    "builder ERP reporting",
    "construction WIP reporting",
    "residential developer reporting",
    "real estate development dashboard",
    "construction data warehouse",
    "cost to complete analysis",
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AD ERP SYSTEMS",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AD ERP SYSTEMS - Custom Data Platforms for Residential Builders and Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/images/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <MarketingTracking />
        <div className="relative min-h-screen overflow-x-hidden">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
