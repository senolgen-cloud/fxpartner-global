import Image from "next/image";
import Link from "next/link";
import type { Broker } from "@/data/brokers";
import TiltWrapper from "./TiltWrapper";
import MiniScoreRings from "./MiniScoreRings";

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
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={`shrink-0 font-poppins font-extrabold leading-none text-white/[0.06] transition-colors group-hover:text-gold/40 ${
            featured ? "featured-card-depth text-6xl md:text-7xl" : "text-4xl md:text-5xl"
          }`}
          aria-hidden="true"
        >
          {String(broker.rank).padStart(2, "0")}
        </span>
        <div
          className={`flex min-w-0 items-center gap-3.5 ${featured ? "featured-card-depth-sm" : ""}`}
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-ink p-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
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
          <div className="min-w-0">
            <h3
              className={`truncate font-poppins font-semibold text-text-on-ink ${
                featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
              }`}
            >
              <span className="notranslate">{broker.name}</span>
            </h3>
            <p className="mt-1 truncate text-sm text-text-on-ink-muted">
              Best for {broker.bestFor.charAt(0).toLowerCase() + broker.bestFor.slice(1)}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`flex shrink-0 flex-col items-center gap-3 sm:flex-row sm:gap-4 ${
          featured ? "featured-card-depth-sm" : ""
        }`}
      >
        <MiniScoreRings broker={broker} tone="dark" />
        <div className="flex items-center gap-3">
          <a
            href={broker.referralUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="lift-on-hover rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong hover:shadow-lg hover:shadow-signal/30"
          >
            Open Account
          </a>
          <Link
            href={`/brokers/${broker.slug}`}
            title={`${broker.name} full review`}
            className="rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:border-text-on-ink"
          >
            Full Review →
          </Link>
        </div>
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
          <div className="featured-card-ring relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-ink-soft to-ink p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] sm:p-6 md:p-8">
            <span className="absolute right-6 top-6 hidden rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold sm:inline-block">
              Top Rated
            </span>
            <CardBody broker={broker} featured />
          </div>
        </TiltWrapper>
      </article>
    );
  }

  return (
    <article className="group relative">
      <TiltWrapper>
        <div className="rounded-2xl border border-hairline bg-ink-soft/60 p-5 transition-colors hover:border-gold/30 sm:p-6">
          <CardBody broker={broker} featured={false} />
        </div>
      </TiltWrapper>
    </article>
  );
}
