import Image from "next/image";
import Link from "next/link";
import type { Broker } from "@/data/brokers";

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

function Card({ broker }: { broker: Broker }) {
  return (
    <Link
      href={`/brokers/${broker.slug}`}
      className="group flex w-[248px] shrink-0 items-center gap-3.5 rounded-2xl border border-hairline bg-ink-soft/70 p-4 transition-colors hover:border-signal/50 hover:bg-ink-soft"
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink p-2">
        {broker.logo ? (
          <Image
            src={broker.logo}
            alt={broker.name}
            fill
            sizes="44px"
            className="object-contain"
          />
        ) : (
          <span className="font-display text-sm font-semibold text-text-on-ink" aria-hidden="true">
            {getMonogram(broker.name)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-display text-sm font-semibold text-text-on-ink">
            {broker.name}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-gold">
            #{String(broker.rank).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-text-on-ink-muted transition-colors group-hover:text-text-on-ink">
          {broker.tagline}
        </p>
      </div>
    </Link>
  );
}

function Row({ brokers, hidden }: { brokers: Broker[]; hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-4 pr-4"
    >
      {brokers.map((b, i) => (
        <Card key={`${hidden ? "dup" : "src"}-${b.slug}-${i}`} broker={b} />
      ))}
    </div>
  );
}

export default function BrokerHeroSlider({ brokers }: { brokers: Broker[] }) {
  const sorted = [...brokers].sort((a, b) => a.rank - b.rank);

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="broker-slider-track flex w-max">
        <Row brokers={sorted} />
        <Row brokers={sorted} hidden />
      </div>
    </div>
  );
}
