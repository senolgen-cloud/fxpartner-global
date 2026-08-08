import Image from "next/image";
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
  if (broker.adImage) {
    return (
      <a
        href={broker.referralUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={`${broker.name} — Sponsorlu, Hesap Aç`}
        className="block overflow-hidden rounded-2xl border border-hairline transition-opacity hover:opacity-90"
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
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-hairline bg-ink px-6 py-5 text-text-on-ink sm:flex-row sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-soft text-xs font-semibold text-text-on-ink">
          {broker.logo ? (
            <Image src={broker.logo} alt="" fill sizes="48px" className="object-contain p-1.5" />
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
        Hesap Aç →
      </a>
    </div>
  );
}
