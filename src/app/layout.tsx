import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import NotificationOptIn from "@/components/NotificationOptIn";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import NewsletterPopup from "@/components/NewsletterPopup";
import QuickAccessHub from "@/components/QuickAccessHub";
import LiveSupportWidget from "@/components/LiveSupportWidget";
import GoogleTranslateWidget from "@/components/GoogleTranslateWidget";
import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import MobileBottomNav from "@/components/MobileBottomNav";
import { MoreMenuProvider } from "@/components/MoreMenuContext";
import MoreMenuOverlay from "@/components/MoreMenuOverlay";
import BrokerHeroSlider from "@/components/BrokerHeroSlider";
import { brokers } from "@/data/brokers";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { auth } from "@/auth";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";
const topBrokers = [...brokers].sort((a, b) => a.rank - b.rank).slice(0, 3);

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
    default: "FXPARTNER | Forex Sinyalleri, Piyasa Analizi ve Broker Karşılaştırma",
    template: "%s | FXPARTNER",
  },
  // Kept tight (~155-160 chars) for the search-snippet <meta name="description">,
  // where Google visually truncates past that length. The richer,
  // entity-focused version below (openGraph/twitter) is what AI answer
  // engines and social previews actually render in full, so it doesn't
  // need the same length discipline — see organizationSchema() in
  // lib/schema.ts for the matching JSON-LD description AI crawlers read.
  description:
    "FXPARTNER; gerçek zamanlı forex sinyalleri, yapay zeka destekli piyasa analizi, teknik/temel analiz ve güvenilir broker karşılaştırmaları sunan finans platformudur.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FXPARTNER | Forex Sinyalleri, Piyasa Analizi ve Broker Karşılaştırma",
    description:
      "FXPARTNER, forex ve finans piyasalarını takip eden yatırımcılar için gerçek zamanlı sinyaller, teknik ve temel analiz, yapay zeka destekli piyasa analizi, ekonomik veri yorumları ve güvenilir broker bilgileriyle kapsamlı bir finans ekosistemi sunar.",
    url: SITE_URL,
    siteName: "FXPARTNER",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FXPARTNER | Forex Sinyalleri, Piyasa Analizi ve Broker Karşılaştırma",
    description:
      "FXPARTNER, forex ve finans piyasalarını takip eden yatırımcılar için gerçek zamanlı sinyaller, teknik ve temel analiz, yapay zeka destekli piyasa analizi, ekonomik veri yorumları ve güvenilir broker bilgileriyle kapsamlı bir finans ekosistemi sunar.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const accountHref = signedIn ? "/account" : "/account/login";

  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-text-dark pb-24 sm:pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        <MoreMenuProvider>
          <div className="sticky top-0 z-40">
            <Header standalone={false} />
            <BrokerHeroSlider brokers={brokers} />
          </div>
          {children}
          <div className="fixed inset-x-0 bottom-0 z-40">
            <MobileBottomNav />
            <Ticker />
          </div>
          {/* Mounted here (not nested inside the sticky header's z-40
              stacking context) so its own fixed z-[60] can actually paint
              above the mobile bottom nav/ticker — see MoreMenuOverlay. */}
          <MoreMenuOverlay signedIn={signedIn} accountHref={accountHref} />
        </MoreMenuProvider>
        <NotificationOptIn />
        <AddToHomeScreen />
        <NewsletterPopup />
        <QuickAccessHub topBrokers={topBrokers} />
        <LiveSupportWidget />
        <GoogleTranslateWidget />
        <Analytics />
      </body>
    </html>
  );
}
