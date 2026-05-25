import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "Apotek Dashboard - Bali Bagas Medika",
  description: "Monitoring penjualan, LPH, dan faktur apotek",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
