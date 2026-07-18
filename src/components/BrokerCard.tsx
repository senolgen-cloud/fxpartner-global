import Image from "next/image";
import Link from "next/link";
import type { Broker, BrokerCategory } from "@/data/brokers";
import { categoryInfo } from "@/data/brokers";
import RatingStars from "./RatingStars";
import TrustIndex from "./TrustIndex";

function getMonogram(name: string): string {
  const camelSplit = name
    .trim()
    .replace(/([a-zçğıöşü])([A-ZÇĞİÖŞÜ])/g, "$1 $2");
  const words = camelSplit.split(/\s+/);
  if (words.length > 1) {
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function BrokerCard({ broker }: { broker: Broker }) {
  return (
    <article className="lift-on-hover group relative border-b border-hairline-light py-10 first:pt-0 last:border-b-0">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex shrink-0 items-start gap-5 md:w-56">
          <span
            className="font-display text-6xl font-light leading-none text-hairline-light transition-colors group-hover:text-signal"
            aria-hidden="true"
          >
            {String(broker.rank).padStart(2, "0")}
          </span>
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink">
              {broker.logo ? (
                <Image
                  src={broker.logo}
                  alt={broker.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span
                  className="font-display text-sm font-semibold text-text-on-ink"
                  aria-hidden="true"
                >
                  {getMonogram(broker.name)}
                </span>
              )}
            </div>
            <h3 className="mt-2 font-display text-2xl font-semibold text-text-dark">
              {broker.name}
            </h3>
            <p className="mt-1 text-sm text-text-muted">{broker.tagline}</p>
            <div className="mt-3">
              <RatingStars rating={broker.rating} />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="lg:grid lg:grid-cols-[1fr_216px] lg:gap-10">
            <div>
              <p className="max-w-2xl text-[15px] leading-relaxed text-text-dark/90">
                {broker.summary}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-hairline-light py-4 sm:grid-cols-4">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                    Min. Yatırım
                  </dt>
                  <dd className="tabular-stat mt-1 font-mono text-sm text-text-dark">
                    {broker.minDeposit}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                    Maks. Kaldıraç
                  </dt>
                  <dd className="tabular-stat mt-1 font-mono text-sm text-text-dark">
                    {broker.maxLeverage}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                    Platformlar
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-text-dark">
                    {broker.platforms.join(" / ")}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                    Kuruluş
                  </dt>
                  <dd className="tabular-stat mt-1 font-mono text-sm text-text-dark">
                    {broker.founded}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {broker.regulators.map((r) => (
                  <span
                    key={r}
                    className="rounded-full border border-hairline-light px-2.5 py-1 font-mono text-[11px] text-text-muted"
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
                      href={`/kategoriler/${categoryInfo[c as BrokerCategory].slug}`}
                      className="rounded-full border border-signal/30 px-2.5 py-1 font-mono text-[11px] text-signal transition-colors hover:border-signal hover:bg-signal/10"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 shrink-0 rounded-2xl border border-hairline-light bg-paper p-5 lg:mt-0">
              <TrustIndex broker={broker} tone="light" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={broker.referralUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="lift-on-hover rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft hover:shadow-lg hover:shadow-ink/20"
            >
              Hesap Aç
            </a>
            <Link
              href={`/brokerlar/${broker.slug}`}
              className="rounded-full border border-hairline-light px-5 py-2.5 text-sm font-medium text-text-dark transition-colors hover:border-text-dark"
            >
              Detaylı İnceleme →
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
              {broker.accentNote}
            </span>
          </div>
          <p className="mt-3 font-mono text-[10px] text-text-muted">
            Ortaklık linki{broker.partnerCode ? ` · Ortak Kodu: ${broker.partnerCode}` : ""} · T&Cs Apply
          </p>
        </div>
      </div>
    </article>
  );
}
