import Image from "next/image";
import type { Broker } from "@/data/brokers";

// The right rail: a 160x600 skyscraper beside long-form content on wide
// screens, sticky so it stays with the reader down a 3000-word guide.
//
// Only appears from xl (1280px) up. Below that the article already fills
// the width, and a 160px column would either squeeze the text column or
// push the rail off-screen. The caller renders nothing at all when no
// sponsor has a tall creative, so the layout never holds an empty gutter
// open — see getSkyscraperBroker.
//
// top-[170px] clears the sticky chrome above it: the logo bar plus the
// broker slider come to ~150px on desktop, and the rest is breathing room.
export default function BrokerSkyscraperAd({ broker }: { broker: Broker }) {
  if (!broker.adImageTall) return null;

  return (
    <aside className="hidden shrink-0 py-16 xl:block" aria-label="Sponsorlu">
      <div className="sticky top-[170px]">
        <a
          href={broker.adUrlTall ?? broker.adUrl ?? broker.referralUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={`${broker.name} — Sponsorlu, Resmi Sitesi`}
          className="block overflow-hidden rounded-2xl border border-hairline transition-opacity hover:opacity-90"
        >
          <span className="sr-only">Sponsorlu — {broker.name}</span>
          <Image
            src={broker.adImageTall}
            alt={`${broker.name} reklamı`}
            width={broker.adImageTallWidth ?? 160}
            height={broker.adImageTallHeight ?? 600}
            sizes="160px"
            className="h-auto w-40"
          />
        </a>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
          Sponsorlu
        </p>
      </div>
    </aside>
  );
}
