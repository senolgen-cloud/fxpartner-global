"use client";

import Image from "next/image";
// Client helpers, not the server tr(): this component has no "use client"
// of its own, but BrokerList does, so it is compiled into the client bundle
// — where the per-request locale store does not exist and tr() would quietly
// return Turkish to every reader.
import { useTr, useTrf } from "@/components/useTr";
import Link from "@/components/LocaleLink";
import ChevronRight from "@/components/ChevronRight";
import { categoryInfo, type Broker, type BrokerCategory } from "@/data/brokers";
import TiltWrapper from "./TiltWrapper";
import MiniScoreRings from "./MiniScoreRings";
import type { BrokerReviewStats } from "@/lib/brokerReviews";
import { useLocalizedData } from "@/components/useLocalizedData";

function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ratingWord(rating: number): string {
  if (rating >= 4.5) return "Mükemmel";
  if (rating >= 3.5) return "Çok İyi";
  if (rating >= 2.5) return "Ortalama";
  return "Zayıf";
}

// Compact star + word + (optional real review count) row — same rating
// vocabulary as ReviewBadge/broker detail hero, just condensed for a list
// card. Never fabricates a review count: omits that clause entirely when
// there's no rated-comment data for this broker yet.
function RatingRow({ broker, reviewStats }: { broker: Broker; reviewStats?: BrokerReviewStats }) {
  const tr = useTr();
  const trf = useTrf();
  const full = Math.round(broker.rating);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < full ? "text-gold" : "text-hairline"}>
            ★
          </span>
        ))}
      </div>
      <span className="tabular-stat text-sm font-semibold text-text-on-ink">
        {broker.rating.toFixed(1)}
      </span>
      <span className="text-xs text-text-on-ink-muted">{tr(ratingWord(broker.rating))}</span>
      {reviewStats && reviewStats.ratingCount > 0 && (
        <span className="text-xs text-text-on-ink-muted">
          · {trf("{count} yorum", { count: reviewStats.ratingCount })}
        </span>
      )}
    </div>
  );
}

function CardBody({
  broker,
  featured,
  reviewStats,
}: {
  broker: Broker;
  featured: boolean;
  reviewStats?: BrokerReviewStats;
}) {
  const tr = useTr();
  const trf = useTrf();
  const categories = useLocalizedData(categoryInfo);
  return (
    <div className={featured ? "featured-card-depth-sm" : ""}>
      {broker.promotion && (
        <div className="mb-4 flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-gold" aria-hidden="true">
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6L12 2z" />
          </svg>
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
            {broker.promotion.tag}
          </span>
        </div>
      )}

      {/* lg, not sm. The right-hand half — three score rings and two
          buttons — is shrink-0 at 495px, and the left half needs about 394
          more before the name has room. Going horizontal at 640px left the
          name block 38px wide: the broker name truncated to nothing and the
          rating stacked one word per line. It goes horizontal when the row
          can actually hold both halves. */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={`hidden shrink-0 font-poppins font-extrabold leading-none text-white/[0.06] transition-colors group-hover:text-gold/40 sm:block ${
              featured
                ? "featured-card-depth sm:text-6xl md:text-7xl"
                : "sm:text-4xl md:text-5xl"
            }`}
            aria-hidden="true"
          >
            {String(broker.rank).padStart(2, "0")}
          </span>
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-ink p-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] ${
                featured ? "h-16 w-16" : "h-12 w-12"
              }`}
            >
              {broker.logo ? (
                <Image
                  src={broker.logo}
                  alt={broker.name}
                  fill
                  sizes={featured ? "64px" : "48px"}
                  className="object-contain"
                />
              ) : (
                <span className="font-poppins text-sm font-semibold text-text-on-ink" aria-hidden="true">
                  {getMonogram(broker.name)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3
                className={`flex items-baseline gap-2 font-poppins font-semibold text-text-on-ink ${
                  featured ? "text-xl sm:text-2xl md:text-3xl" : "text-base sm:text-lg md:text-xl"
                }`}
              >
                <span className="notranslate truncate">{broker.name}</span>
                <span className="shrink-0 font-mono text-[11px] font-normal text-gold sm:hidden">
                  #{String(broker.rank).padStart(2, "0")}
                </span>
              </h3>
              <p className="mt-1 truncate text-sm text-text-on-ink-muted">
                En iyi {broker.bestFor.charAt(0).toLowerCase() + broker.bestFor.slice(1)}
              </p>
              <div className="mt-2">
                <RatingRow broker={broker} reviewStats={reviewStats} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <MiniScoreRings broker={broker} tone="dark" />
          {/* One row, not two stacked pills.
              These were two bordered rounded-full buttons that wrapped onto
              separate lines on a phone and took roughly a hundred pixels of
              a card whose actual content is the score. Two pills of equal
              visual weight also make the reader choose between them, when
              only one of the two is the action.
              So: one filled primary, one ghost secondary that reads as a
              link rather than a button, rounded-xl rather than full, and
              side by side at every width. Still 44px tall — the weight
              comes off the borders and the fill, not off the tap target,
              which is the one dimension a thumb actually needs. */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <a
              href={broker.referralUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              aria-label={trf("{broker} - Siteye Git", { broker: broker.name })}
              className="inline-flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-xl bg-signal px-4 text-[13px] font-semibold text-on-signal transition-colors hover:bg-signal-strong sm:flex-none sm:px-5"
            >
              {tr("Siteye Git")}
            </a>
            <Link
              href={`/brokers/${broker.slug}`}
              title={`${broker.name} tam inceleme`}
              className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl px-3 text-[13px] font-medium text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink"
            >
              {tr("İnceleme")}
              <ChevronRight />
            </Link>
          </div>
        </div>
      </div>

      {broker.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-hairline pt-4">
          {broker.categories.map((c) => (
            <Link
              key={c}
              href={`/categories/${categoryInfo[c as BrokerCategory].slug}`}
              className="rounded-full border border-hairline px-2.5 py-1 text-[11px] text-text-on-ink-muted transition-colors hover:border-signal hover:text-signal"
            >
              {categories[c as BrokerCategory].label}
            </Link>
          ))}
        </div>
      )}

      {/* The disclosure the rest of the site promises is made here:
          the home page pillar, the FAQ and the footer all tell the
          reader it is on the card, so it has to be on the card. */}
      {broker.referralUrl && (
        <p className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-text-on-ink-muted">
          {tr("Ortak bağlantı — hesap açılışından komisyon alırız; sıralamayı etkilemez.")}
        </p>
      )}
    </div>
  );
}

export default function RankedBrokerCard({
  broker,
  featured = false,
  reviewStats,
}: {
  broker: Broker;
  featured?: boolean;
  reviewStats?: BrokerReviewStats;
}) {
  const tr = useTr();

  if (featured) {
    return (
      <article className="group relative">
        <TiltWrapper>
          <div className="featured-card-ring relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-ink-soft to-ink p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] sm:p-6 md:p-8">
            <span className="absolute right-6 top-6 hidden rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold sm:inline-block">
              {tr("En Yüksek Puan")}
            </span>
            <CardBody broker={broker} featured reviewStats={reviewStats} />
          </div>
        </TiltWrapper>
      </article>
    );
  }

  return (
    <article className="group relative">
      <TiltWrapper>
        <div className="rounded-2xl border border-hairline bg-ink-soft/60 p-5 transition-colors hover:border-gold/30 sm:p-6">
          <CardBody broker={broker} featured={false} reviewStats={reviewStats} />
        </div>
      </TiltWrapper>
    </article>
  );
}
