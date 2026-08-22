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
import StickyChrome from "@/components/StickyChrome";
import Ticker from "@/components/Ticker";
import MobileBottomNav from "@/components/MobileBottomNav";
import { MoreMenuProvider } from "@/components/MoreMenuContext";
import MoreMenuOverlay from "@/components/MoreMenuOverlay";
import BrokerHeroSlider from "@/components/BrokerHeroSlider";
import { brokers } from "@/data/brokers";
import { localizeBrokers } from "@/lib/localizeContent";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { auth } from "@/auth";
import { LocaleProvider } from "@/components/LocaleProvider";
import { defaultLocale, hreflangCode, htmlLang, isLocale, locales, localePath, ogLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";
const rankedBrokers = [...brokers].sort((a, b) => a.rank - b.rank);

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

// Per-locale, because the title, the description and above all the
// hreflang set differ by tree. hreflang is what stops Google reading /ua as
// a duplicate of / and picking one: every page advertises its siblings, and
// x-default points at Turkish, which is the tree with the bare URL.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const t = getDictionary(locale);
  const languages = Object.fromEntries(
    locales.map((l) => [hreflangCode[l], localePath(l, "/")])
  );

  return {
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
  // Two framings of the same logo, by how much room the slot has. The
  // browser tab renders at 16-32px, where the FXPARTNER wordmark under the
  // monogram is an unreadable smudge, so `icon` (and app/favicon.ico) carry
  // the FX mark alone. The Home Screen / installed-app icon is large enough
  // for the full lockup, so apple-touch-icon and manifest.json keep it.
  icons: {
    icon: [
      { url: "/fxpartner-mark-192.png", sizes: "192x192", type: "image/png" },
      { url: "/fxpartner-mark-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/fxpartner-icon.png",
  },
  title: {
    default: t["site.title"],
    template: "%s | FXPARTNER",
  },
  // Kept tight (~155-160 chars) for the search-snippet <meta name="description">,
  // where Google visually truncates past that length. The richer,
  // entity-focused version below (openGraph/twitter) is what AI answer
  // engines and social previews actually render in full, so it doesn't
  // need the same length discipline — see organizationSchema() in
  // lib/schema.ts for the matching JSON-LD description AI crawlers read.
  description:
    t["site.description"],
  alternates: {
    canonical: localePath(locale, "/"),
    languages: { ...languages, "x-default": "/" },
  },
  openGraph: {
    title: t["site.title"],
    description:
      t["site.longDescription"],
    url: SITE_URL,
    siteName: "FXPARTNER",
    type: "website",
    // Every page's content is Turkish now, so this is the correct default —
    // Next.js merges it into every child route's openGraph unless a page
    // explicitly overrides it, so setting it once here covers the whole site.
    locale: ogLocale[locale],
  },
  twitter: {
    card: "summary_large_image",
    title: t["site.title"],
    description:
      t["site.longDescription"],
  },
  };
}

// Every locale tree is a build target. Turkish is reachable at both / (via
// the rewrite in proxy.ts) and nothing else — the prefix only exists in the
// URL for the other two.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const accountHref = signedIn ? "/account" : "/account/login";
  const localizedBrokers = localizeBrokers(rankedBrokers, locale);
  const topBrokers = localizedBrokers.slice(0, 3);

  return (
    <html
      lang={htmlLang[locale]}
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
        <LocaleProvider locale={locale}>
          <MoreMenuProvider>
          <StickyChrome>
            <Header standalone={false} />
            <BrokerHeroSlider brokers={localizedBrokers} />
          </StickyChrome>
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
        </LocaleProvider>
      </body>
    </html>
  );
}
