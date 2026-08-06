import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apotek Dashboard - Bali Bagas Medika",
  description: "Dashboard monitoring Apotek Bali Bagas Medika",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
