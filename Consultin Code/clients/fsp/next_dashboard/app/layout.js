import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "FSP — Builder Ops Console",
  description: "Warehouse-backed construction dashboard for Florida Sun Partners",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={sans.variable}>{children}</body>
    </html>
  );
}
