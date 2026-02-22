import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ACNH Catalog - Animal Crossing Item & Villager Database",
  description:
    "Browse 12,000+ items, 400+ villagers, DIY recipes, and more from Animal Crossing: New Horizons. Open-source, fast, and ad-free.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
