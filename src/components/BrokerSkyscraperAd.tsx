import Image from "next/image";
import type { Broker } from "@/data/brokers";

// The right rail: a skyscraper beside long-form content on wide screens,
// sticky so it stays with the reader down a 3000-word guide.
//
// Only appears from xl (1280px) up. Below that the article already fills
// the width, and a 160px column would either squeeze the text column or
// push the rail off-screen. The caller renders nothing at all when no
// sponsor has a tall creative, so the layout never holds an empty gutter
// open — see getSkyscraperBroker.
//
// top-[170px] clears the sticky chrome above it: the logo bar plus the
// broker slider come to ~150px on desktop, and the rest is breathing room.
// The slot is a ~600px column, and the width follows from the creative's
// own shape rather than being fixed at 160: a true 160x600 skyscraper keeps
// its native width, while a squarer portrait creative widens until it fills
// the same height. Capped at 208px — the article column and the rail have
// to fit inside max-w-[68rem] together (768 + 32 gap + 208 = 1008).
//
// Without this a 821x1915 creative rendered 160px wide came out 373px tall,
// shorter than the slot and with its body text at ~7px.
const SLOT_HEIGHT = 600;
const MAX_WIDTH = 208;

export default function BrokerSkyscraperAd({ broker }: { broker: Broker }) {
  if (!broker.adImageTall) return null;

  const w = broker.adImageTallWidth ?? 160;
  const h = broker.adImageTallHeight ?? 600;
  const railWidth = Math.min(MAX_WIDTH, Math.round(SLOT_HEIGHT * (w / h)));

  return (
    <aside className="hidden shrink-0 py-16 xl:block" aria-label="Sponsorlu">
      <div className="sticky top-[170px]" style={{ width: railWidth }}>
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
            width={w}
            height={h}
            sizes={`${railWidth}px`}
            className="h-auto w-full"
          />
        </a>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
          Sponsorlu
        </p>
      </div>
    </aside>
  );
}
