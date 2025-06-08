import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TierZen by Unknown - Tier List Maker",
  description: "Create and share tier lists easily with TierZen.",
  icons: {
    icon: '/globe.svg', // TODO: Replace with your custom favicon.ico or other image file in /public and update this path.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable}`}>{children}</body>
    </html>
  );
}
