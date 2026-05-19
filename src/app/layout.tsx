import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MarketingTracking from "@/components/analytics/MarketingTracking";
import PageAmbient from "@/components/ui/PageAmbient";

const siteUrl = "https://consulting.aderpsystems.com";
const siteTitle = "AD ERP SYSTEMS | Builder Operations Reporting";
const siteDescription =
  "Operating reports for residential builders and developers that help reduce overruns, improve cycle times, protect margin, and catch variances before they become losses.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "residential builder operating reports",
    "homebuilder schedule reporting",
    "builder budget variance reporting",
    "construction margin protection",
    "construction cycle time reporting",
    "builder operational performance improvement",
    "residential construction reporting",
    "construction variance control",
    "builder accountability reporting",
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
        alt: "AD ERP SYSTEMS - Builder Operations Reporting",
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
          <PageAmbient />
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
