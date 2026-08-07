import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import BonusPopup from "@/components/BonusPopup";
import TelegramPopup from "@/components/TelegramPopup";
import NotificationOptIn from "@/components/NotificationOptIn";
import GoogleTranslateWidget from "@/components/GoogleTranslateWidget";
import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import BrokerHeroSlider from "@/components/BrokerHeroSlider";
import { brokers } from "@/data/brokers";
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
  // Prevents Chrome's own native "translate this page?" prompt/banner
  // from firing on top of our own LanguageSwitcher-driven translation —
  // without this, visitors could see two separate translate UIs stacked.
  other: {
    google: "notranslate",
  },
  // Required for web push on iOS Safari (16.4+): it only works once the
  // site is added to the Home Screen as an installed web app — a bare
  // Safari tab can't receive push at all there. manifest.json +
  // appleWebApp below make that install path available; NotificationOptIn
  // detects the "not installed yet on iOS" case and prompts to add to
  // Home Screen instead of trying (and silently failing) to subscribe.
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FXPARTNER",
  },
  icons: {
    icon: "/fxpartner-icon.png",
    apple: "/fxpartner-icon.png",
  },
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
      <body className="min-h-full flex flex-col bg-paper text-text-dark pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        <div className="sticky top-0 z-40">
          <Header standalone={false} />
          <BrokerHeroSlider brokers={brokers} />
        </div>
        {children}
        <div className="fixed inset-x-0 bottom-0 z-40">
          <Ticker />
        </div>
        <TelegramPopup />
        <BonusPopup />
        <NotificationOptIn />
        <GoogleTranslateWidget />
        <Analytics />
      </body>
    </html>
  );
}
