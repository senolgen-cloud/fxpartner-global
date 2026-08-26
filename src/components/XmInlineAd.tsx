import Image from "next/image";
import { tr } from "@/lib/chrome";
import { trData } from "@/lib/localizeContent";
import { getInlineAdCopy } from "@/lib/xm";
import { getBrokerBySlug } from "@/data/brokers";

// Sponsored slot rendered *inside* the body of a blog post — between sections
// in the "inline" variant, and once more after the last section in the
// "final" variant. Separate from BrokerAdBanner (which sits at the top of the
// article) because these slots are sold per-article rather than rotated.
//
// The advertiser follows the post: a post that pins its slot via
// `adBrokerSlug` (src/data/blog.ts) advertises that broker here too, so a
// LiteFinance campaign piece doesn't carry a competitor's unit in its body.
// Posts that pin nothing fall back to XM, the standing advertiser.
//
// Both variants carry a visible "Sponsorlu" label and rel="sponsored" so the
// unit is distinguishable from editorial content and declared to crawlers,
// per affiliate-disclosure practice.

type Variant = "inline" | "final";

export default function XmInlineAd({
  variant = "inline",
  brokerSlug,
}: {
  variant?: Variant;
  brokerSlug?: string;
}) {
  const { slug, copy } = getInlineAdCopy(brokerSlug);
  // The copy table lives in lib/xm.ts and is keyed by broker; it is prose,
  // so it goes through the same walk every other data table uses.
  const text = trData(copy);
  const broker = getBrokerBySlug(slug);
  if (!broker) return null;

  // satori isn't involved here, but the same webp caveat applies to the
  // monogram fallback: a broker without a renderable logo just shows its name.
  const logo = broker.logo;

  if (variant === "inline") {
    return (
      <aside
        aria-label={tr("Sponsorlu içerik")}
        className="my-12 overflow-hidden rounded-2xl border border-hairline bg-ink text-text-on-ink"
      >
        <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {logo && (
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-soft">
                <Image src={logo} alt={`${broker.name} logo`} fill sizes="48px" className="object-contain p-1.5" />
              </span>
            )}
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Sponsorlu</span>
              <p className="notranslate mt-0.5 font-poppins text-base font-semibold text-text-on-ink">
                {broker.name}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-text-on-ink-muted">{text.pitch}</p>
            </div>
          </div>
          <a
            href={text.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="w-full shrink-0 rounded-full bg-signal px-5 py-2.5 text-center text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong sm:w-auto"
          >
            {text.ctaLabel}
          </a>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label={tr("Sponsorlu içerik")}
      className="mt-14 overflow-hidden rounded-2xl border border-hairline bg-ink text-text-on-ink"
    >
      <div className="px-6 py-7 sm:px-8 sm:py-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Sponsorlu</span>
        <div className="mt-3 flex items-center gap-4">
          {logo && (
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-soft">
              <Image src={logo} alt={`${broker.name} logo`} fill sizes="44px" className="object-contain p-1.5" />
            </span>
          )}
          <h3 className="notranslate font-poppins text-xl font-semibold text-text-on-ink">{broker.name}</h3>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">{text.finalPitch}</p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {text.points.map((point) => (
            <li key={point} className="flex gap-2.5 text-[13px] leading-snug text-text-on-ink-muted">
              <span className="mt-[3px] shrink-0 text-signal">–</span>
              {point}
            </li>
          ))}
        </ul>
        <a
          href={text.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-6 inline-block rounded-full bg-signal px-6 py-3 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
        >
          {text.ctaLabel}
        </a>
        <p className="mt-4 text-[11px] leading-relaxed text-text-on-ink-muted/70">
          {tr("Bu bir reklamdır. FXPARTNER, bu bağlantı üzerinden açılan hesaplardan komisyon kazanabilir; bu, sizin ödediğiniz spread veya komisyonu değiştirmez. Kaldıraçlı işlemler yüksek risk içerir.")}
        </p>
      </div>
    </aside>
  );
}
