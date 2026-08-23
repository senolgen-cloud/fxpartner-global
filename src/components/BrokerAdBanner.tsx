"use client";

import Image from "next/image";
// Client helpers, not the server tr(): this component has no "use client"
// of its own, but it is only ever rendered from one, so it is compiled into
// the client bundle — where the per-request locale store does not exist and
// tr() would quietly return Turkish to every reader.
import { useTr } from "@/components/useTr";
import type { Broker } from "@/data/brokers";

function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Sponsored broker banner — same referral CTA pattern as the broker cards
// on the homepage, just repackaged as an inline ad slot for content pages
// (blog posts, the signals board, broker review pages). "Sponsorlu" label
// keeps it distinguishable from editorial content per affiliate-disclosure
// practice.
export default function BrokerAdBanner({ broker }: { broker: Broker }) {
  const tr = useTr();
  if (broker.adImage) {
    // Two anchors rather than two <source>s in one: where a partner's media
    // kit tags each banner size with its own tracking link, the click has to
    // carry the link belonging to the creative that was actually on screen.
    //
    // Which one shows is a container query, not a viewport one, because the
    // same component sits in slots of very different widths: the content
    // slot runs to 768px, while MoreMenuOverlay's swipeable cards are 360px
    // even on a desktop. Keyed to the viewport, a laptop opening that menu
    // got the 728px leaderboard crushed into a 360px card — 44px tall and
    // unreadable. 560px is the switch: above it the leaderboard still reads
    // at 0.77 scale, below it the square is the honest fit.
    const wide = (
      <a
        href={broker.adUrl ?? broker.referralUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={`${broker.name} — Sponsorlu, Hesap Aç`}
        className={`overflow-hidden rounded-2xl border border-hairline transition-opacity hover:opacity-90 ${
          broker.adImageMobile ? "hidden @[560px]:block" : "block"
        }`}
      >
        <span className="sr-only">Sponsorlu — {broker.name}</span>
        <Image
          src={broker.adImage}
          alt={`${broker.name} reklamı`}
          width={broker.adImageWidth ?? 1376}
          height={broker.adImageHeight ?? 768}
          sizes="(min-width: 768px) 768px, 100vw"
          className="h-auto w-full"
        />
      </a>
    );

    if (!broker.adImageMobile) return <div className="@container">{wide}</div>;

    return (
      <div className="@container">
        {wide}
        <a
          href={broker.adUrlMobile ?? broker.adUrl ?? broker.referralUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={`${broker.name} — Sponsorlu, Hesap Aç`}
          className="mx-auto block w-fit overflow-hidden rounded-2xl border border-hairline transition-opacity hover:opacity-90 @[560px]:hidden"
        >
          <span className="sr-only">Sponsorlu — {broker.name}</span>
          <Image
            src={broker.adImageMobile}
            alt={`${broker.name} reklamı`}
            width={broker.adImageMobileWidth ?? 300}
            height={broker.adImageMobileHeight ?? 250}
            sizes="300px"
            className="h-auto max-w-full"
          />
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-hairline bg-ink px-6 py-5 text-text-on-ink sm:flex-row sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-soft text-xs font-semibold text-text-on-ink">
          {broker.logo ? (
            <Image src={broker.logo} alt={`${broker.name} logo`} fill sizes="48px" className="object-contain p-1.5" />
          ) : (
            getMonogram(broker.name)
          )}
        </span>
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Sponsorlu</span>
          <p className="notranslate mt-0.5 truncate font-poppins text-base font-semibold text-text-on-ink">
            {broker.name}
          </p>
          <p className="truncate text-[13px] text-text-on-ink-muted">{broker.tagline}</p>
        </div>
      </div>
      <a
        href={broker.referralUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="w-full shrink-0 rounded-full bg-signal px-5 py-2.5 text-center text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong sm:w-auto"
      >
        {tr("Hesap Aç →")}
      </a>
    </div>
  );
}
