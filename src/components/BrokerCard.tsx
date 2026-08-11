import Image from "next/image";
import Link from "next/link";
import type { Broker } from "@/data/brokers";
import MiniScoreRings from "./MiniScoreRings";

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
    <article className="lift-on-hover group relative border-b border-hairline-light py-6 first:pt-0 last:border-b-0 sm:py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className="shrink-0 font-display text-4xl font-light leading-none text-hairline-light transition-colors group-hover:text-signal md:text-5xl"
            aria-hidden="true"
          >
            {String(broker.rank).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink p-2">
              {broker.logo ? (
                <Image
                  src={broker.logo}
                  alt={broker.name}
                  fill
                  sizes="48px"
                  className="object-contain"
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
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-semibold text-text-dark md:text-xl">
                <span className="notranslate">{broker.name}</span>
              </h3>
              <p className="mt-1 truncate text-sm text-text-muted">
                Best for {broker.bestFor.charAt(0).toLowerCase() + broker.bestFor.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <MiniScoreRings broker={broker} tone="light" />
          <div className="flex items-center gap-3">
            <a
              href={broker.referralUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft hover:shadow-lg hover:shadow-ink/20"
            >
              Open Account
            </a>
            <Link
              href={`/brokers/${broker.slug}`}
              title={`${broker.name} full review`}
              className="rounded-full border border-hairline-light px-5 py-2.5 text-sm font-medium text-text-dark transition-colors hover:border-text-dark"
            >
              Full Review →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
