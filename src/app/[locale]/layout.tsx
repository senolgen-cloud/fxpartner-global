import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, JetBrains_Mono, Noto_Sans_Arabic, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import NotificationOptIn from "@/components/NotificationOptIn";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import ChromeGate from "@/components/ChromeGate";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import CookieConsent from "@/components/CookieConsent";
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
import {
  hreflangMap,
  htmlLang,
  isLocale,
  localeDir,
  locales,
  localePath,
  ogLocale,
  type Locale,
} from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { setServerLocale } from "@/lib/serverLocale";
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

// Geist, Poppins and JetBrains Mono are all latin-only: an Arabic page set
// in them falls back to whatever the device happens to have, which on
// Windows is Times-like and on Android is often nothing at all. Noto Sans
// Arabic covers the script properly and carries the weights the display and
// body faces use, so /ar reads as one typeface rather than three.
//
// Loaded on every tree because next/font emits the CSS variable at build
// time and only the /ar tree references it — the font file itself is
// fetched by a browser that actually renders Arabic glyphs.
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

// Per-locale, because the title, the description and above all the
// hreflang set differ by tree. hreflang is what stops Google reading /ua as
// a duplicate of / and picking one: every page advertises its siblings, and
// x-default points at Turkish: the language the site is written in. No tree
// has a bare URL any more, so nothing is the default unless it says so.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  // Not a locale means not a page. Falling back to Turkish here used to be
  // harmless, because /brokerlar really was Turkish; now every real path is
  // prefixed and proxy.ts redirects the ones that are not — except paths that
  // look like files, which it deliberately leaves alone so /sw.js still
  // works. A missing file therefore landed here with raw = "missing.gif" and
  // got the Turkish homepage back with a 200. That is a soft 404: the reader
  // sees the wrong page, and a crawler is told a broken asset URL is a valid
  // one.
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = getDictionary(locale);
  const languages = hreflangMap("/");

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
    // hreflangMap already supplies x-default. It used to be overridden with
    // "/" here, which was right while Turkish lived on the bare URL and is
    // wrong now: "/" issues a 308, and an hreflang pointing at a redirect is
    // one a crawler is entitled to ignore.
    languages,
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

// Every locale tree is a build target, and every one of them is prefixed —
// Turkish included. / and the other unprefixed paths are permanent redirects
// issued by proxy.ts, not routes.
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
  // Same guard as generateMetadata: a first segment that is not a locale is
  // not a page. See the note there for why this stopped being harmless.
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  // Recorded before anything under this layout renders, so tr() in a server
  // component three levels down knows which tree it is in.
  setServerLocale(locale);

  const session = await auth();
  const signedIn = Boolean(session?.user);
  const accountHref = signedIn ? "/account" : "/account/login";
  const localizedBrokers = localizeBrokers(rankedBrokers, locale);
  const topBrokers = localizedBrokers.slice(0, 3);

  return (
    <html
      lang={htmlLang[locale]}
      // On <html>, not lower: set anywhere else and the browser still lays
      // the page out left to right around it, which leaves the scrollbar,
      // the list markers and every inline arrow on the wrong side.
      dir={localeDir[locale]}
      className={`${geist.variable} ${jetbrainsMono.variable} ${poppins.variable} ${notoArabic.variable} h-full antialiased`}
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
          <ChromeGate>
            <StickyChrome>
              <Header standalone={false} />
              <BrokerHeroSlider brokers={localizedBrokers} />
            </StickyChrome>
          </ChromeGate>
          {children}
          <ChromeGate>
            <div data-behind-sheet className="fixed inset-x-0 bottom-0 z-40">
              <MobileBottomNav />
              <Ticker />
            </div>
          </ChromeGate>
          {/* Mounted here (not nested inside the sticky header's z-40
              stacking context) so its own fixed z-[60] can actually paint
              above the mobile bottom nav/ticker — see MoreMenuOverlay. */}
          <MoreMenuOverlay signedIn={signedIn} accountHref={accountHref} />
          </MoreMenuProvider>
          <ServiceWorkerRegistrar />
          <NotificationOptIn />
          <AddToHomeScreen />
          <CookieConsent />
          <ChromeGate>
            <NewsletterPopup />
            <QuickAccessHub topBrokers={topBrokers} />
            <LiveSupportWidget />
          </ChromeGate>
          <GoogleTranslateWidget />
          <Analytics />
        </LocaleProvider>
      </body>
    </html>
  );
}
