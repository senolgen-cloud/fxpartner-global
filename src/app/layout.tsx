import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Poppins } from "next/font/google";
import BonusPopup from "@/components/BonusPopup";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FXPARTNER | Forex Broker Comparison and Reviews",
    template: "%s | FXPARTNER",
  },
  description:
    "XM, AvaTrade, Tickmill, Lite Finance, EXNESS, and more — forex broker reviews compared by trustworthiness, spread, leverage, and platform support. Part of the FXPARTNER ecosystem.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FXPARTNER | Forex Broker Comparison and Reviews",
    description:
      "Forex broker reviews compared by trustworthiness, spread, leverage, and platform support.",
    url: SITE_URL,
    siteName: "FXPARTNER",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FXPARTNER | Forex Broker Comparison and Reviews",
    description:
      "Forex broker reviews compared by trustworthiness, spread, leverage, and platform support.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-text-dark">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        {children}
        <BonusPopup />
      </body>
    </html>
  );
}
