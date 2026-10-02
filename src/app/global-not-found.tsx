import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, JetBrains_Mono, Noto_Sans_Arabic } from "next/font/google";
import GlobalNotFoundBody from "@/components/GlobalNotFoundBody";
import { notFoundTitle } from "@/components/NotFoundBody";
import { defaultLocale } from "@/lib/i18n";
import "./globals.css";

/**
 * The 404 for every address that matches no route.
 *
 * The root layout here is the [locale] segment, so an unmatched URL has no
 * layout Next can put [locale]/not-found.tsx inside, and it used to fall
 * through to Next's bare default: "404: This page could not be found." in
 * English on a white page, with nothing to click, whatever tree the reader
 * was in. That includes every unknown slug proxy.ts rewrites to
 * /_bulunamadi. Next's docs name exactly this case — a root layout under a
 * top-level dynamic segment — as what global-not-found is for.
 *
 * It answers with a real 404 status and Next adds noindex itself. It is a
 * full document because it renders outside every layout: the fonts and
 * globals.css are imported here for that reason, and only the faces the
 * page uses.
 */
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: `404 | ${notFoundTitle(defaultLocale)} | FXPARTNER`,
};

export default function GlobalNotFound() {
  return (
    <html
      lang="tr"
      className={`${geist.variable} ${jetbrainsMono.variable} ${notoArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-text-dark">
        <header className="bg-ink px-6 py-4">
          {/* The localized way home is the button below; this one is the
              brand mark and goes to the root, which proxy.ts redirects. */}
          <Link href="/" className="inline-flex">
            <Image src="/fxpartner-logo.png" alt="FXPARTNER" width={900} height={232} className="h-8 w-auto" />
          </Link>
        </header>
        <GlobalNotFoundBody />
      </body>
    </html>
  );
}
