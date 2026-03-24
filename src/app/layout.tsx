import type { Metadata } from "next";
import { Sora, DM_Sans, Space_Grotesk } from "next/font/google";
import Script from "next/script";
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = "https://consulting.aderpsystems.com";
const siteTitle = "A.D. Homes & Consulting | Custom Data Ecosystems for Residential Homebuilders";
const siteDescription =
  "Custom operational intelligence platforms for residential homebuilders across North America. ERP extraction, centralized data warehouses, lifecycle dashboards, pro forma tools, and client-owned delivery.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
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
        alt: "A.D. Homes & Consulting - Custom Data Ecosystems for Residential Homebuilders",
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
    <html lang="en" className={`${sora.variable} ${dmSans.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', {
              analytics_storage: 'granted'
            });
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
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
