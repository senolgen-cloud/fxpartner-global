import Link from "next/link";
import { brokers } from "@/data/brokers";

export default function Highlights() {
  const featured = [...brokers]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  return (
    <div className="border-b border-hairline bg-ink">
      <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-6 py-2.5">
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
          Öne Çıkanlar
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {featured.map((b) => (
            <Link
              key={b.slug}
              href={`/brokerlar/${b.slug}`}
              className="whitespace-nowrap rounded-full border border-hairline px-3 py-1 font-mono text-[11px] text-text-on-ink-muted transition-colors hover:border-text-on-ink hover:text-text-on-ink"
            >
              {b.accentNote} · <span className="text-text-on-ink">{b.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
