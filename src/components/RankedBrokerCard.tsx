import Image from "next/image";
import Link from "next/link";
import type { Broker, BrokerCategory } from "@/data/brokers";
import { categoryInfo } from "@/data/brokers";
import RatingStars from "./RatingStars";
import TrustIndex from "./TrustIndex";
import TiltWrapper from "./TiltWrapper";

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

function CardBody({ broker, featured }: { broker: Broker; featured: boolean }) {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <div className="flex shrink-0 items-start gap-5 md:w-56">
        <span
          className={`font-poppins font-extrabold leading-none text-white/[0.06] transition-colors group-hover:text-gold/40 ${
            featured ? "featured-card-depth text-8xl" : "text-6xl"
          }`}
          aria-hidden="true"
        >
          {String(broker.rank).padStart(2, "0")}
        </span>
        <div className={featured ? "featured-card-depth-sm" : ""}>
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-ink p-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
            {broker.logo ? (
              <Image
                src={broker.logo}
                alt={broker.name}
                fill
                sizes="48px"
                className="object-contain"
              />
            ) : (
              <span className="font-poppins text-sm font-semibold text-text-on-ink" aria-hidden="true">
                {getMonogram(broker.name)}
              </span>
            )}
          </div>
          <h3
            className={`mt-3 font-poppins font-semibold text-text-on-ink ${
              featured ? "text-3xl" : "text-xl"
            }`}
          >
            {broker.name}
          </h3>
          <p className="mt-1 text-sm text-text-on-ink-muted">{broker.tagline}</p>
          <div className="mt-3">
            <RatingStars rating={broker.rating} />
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="lg:grid lg:grid-cols-[1fr_216px] lg:gap-10">
          <div>
            <p className="max-w-2xl text-[15px] leading-relaxed text-text-on-ink-muted">
              {broker.summary}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-hairline py-4 sm:grid-cols-4">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  Min. Deposit
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-sm text-text-on-ink">
                  {broker.minDeposit}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  Max. Leverage
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-sm text-text-on-ink">
                  {broker.maxLeverage}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  Platforms
                </dt>
                <dd className="mt-1 font-mono text-sm text-text-on-ink">
                  {broker.platforms.join(" / ")}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  Founded
                </dt>
                <dd className="tabular-stat mt-1 font-mono text-sm text-text-on-ink">
                  {broker.founded}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              {broker.regulators.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-hairline px-2.5 py-1 font-mono text-[11px] text-text-on-ink-muted"
                >
                  {r}
                </span>
              ))}
            </div>

            {broker.categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {broker.categories.map((c) => (
                  <Link
                    key={c}
                    href={`/categories/${categoryInfo[c as BrokerCategory].slug}`}
                    className="rounded-full border border-signal/30 px-2.5 py-1 font-mono text-[11px] text-signal transition-colors hover:border-signal hover:bg-signal/10"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 shrink-0 rounded-2xl border border-hairline bg-ink p-5 lg:mt-0">
            <TrustIndex broker={broker} tone="dark" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={broker.referralUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="lift-on-hover rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong hover:shadow-lg hover:shadow-signal/30"
          >
            Open Account
          </a>
          <Link
            href={`/brokers/${broker.slug}`}
            className="rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:border-text-on-ink"
          >
            Full Review →
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
            {broker.accentNote}
          </span>
        </div>
        <p className="mt-3 font-mono text-[10px] text-text-on-ink-muted">
          Affiliate link{broker.partnerCode ? ` · Partner Code: ${broker.partnerCode}` : ""} · T&Cs Apply
        </p>
      </div>
    </div>
  );
}

export default function RankedBrokerCard({
  broker,
  featured = false,
}: {
  broker: Broker;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <article className="group relative">
        <TiltWrapper>
          <div className="featured-card-ring relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-ink-soft to-ink p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] md:p-10">
            <span className="absolute right-6 top-6 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              Top Rated
            </span>
            <CardBody broker={broker} featured />
          </div>
        </TiltWrapper>
      </article>
    );
  }

  return (
    <article className="group relative rounded-2xl border border-hairline bg-ink-soft/60 p-8 transition-colors hover:border-hairline/80">
      <CardBody broker={broker} featured={false} />
    </article>
  );
}
