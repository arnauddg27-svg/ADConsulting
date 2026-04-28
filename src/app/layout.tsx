import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MarketingTracking from "@/components/analytics/MarketingTracking";
import PageAmbient from "@/components/ui/PageAmbient";

const siteUrl = "https://consulting.aderpsystems.com";
const siteTitle = "A.D. Homes & Consulting | Custom Data Platforms for Residential Homebuilders";
const siteDescription =
  "Custom data platforms for residential homebuilders. We centralize ERP, spreadsheet, finance, API, and export data in a structured warehouse, apply builder KPI logic, and deliver reporting systems, dashboards, and operational tools.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "residential homebuilder data platform",
    "custom data platforms for residential homebuilders",
    "builder ERP data extraction",
    "centralized builder data",
    "builder reporting systems",
    "builder dashboards",
    "construction data warehouse",
    "cost to complete analysis",
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "A.D. Homes & Consulting",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "A.D. Homes & Consulting - Custom Data Platforms for Residential Homebuilders",
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
    <html lang="en">
      <body className="font-sans antialiased">
        <MarketingTracking />
        <div className="relative min-h-screen overflow-x-hidden">
          <PageAmbient />
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
