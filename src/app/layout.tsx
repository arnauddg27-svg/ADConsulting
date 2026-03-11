import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "A.D. Homes & Consulting | Homebuilder Operations — Central Florida",
  description:
    "Operations consulting for Central Florida builders and development firms. Dashboards, KPI systems, financial modeling, ERP optimization, and process improvement.",
  keywords: [
    "construction operations consulting",
    "Central Florida builder",
    "real estate development consulting",
    "ERP optimization",
    "construction dashboard",
    "home builder consulting",
    "construction KPI",
    "financial modeling construction",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="relative min-h-screen overflow-x-hidden">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
