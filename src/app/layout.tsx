import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import BonusPopup from "@/components/BonusPopup";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FXPARTNER | Forex Broker Comparison and Reviews",
  description:
    "XM, AvaTrade, Tickmill, Lite Finance, EXNESS, and more — forex broker reviews compared by trustworthiness, spread, leverage, and platform support. Part of the FXPARTNER ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-text-dark">
        {children}
        <BonusPopup />
      </body>
    </html>
  );
}
