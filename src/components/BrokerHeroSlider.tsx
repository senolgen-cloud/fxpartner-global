"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "@/components/LocaleLink";
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
      title={`${broker.name} incelemesi — ${broker.tagline}`}
      className="group flex w-[188px] shrink-0 items-center gap-2.5 rounded-lg border border-hairline bg-ink-soft/70 px-2.5 py-1.5 transition-colors hover:border-signal/50 hover:bg-ink-soft"
    >
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink p-1">
        {broker.logo ? (
          <Image
            src={broker.logo}
            alt={broker.name}
            fill
            sizes="28px"
            className="object-contain"
          />
        ) : (
          <span className="font-display text-sm font-semibold text-text-on-ink" aria-hidden="true">
            {getMonogram(broker.name)}
          </span>
        )}
      </div>
      {/* Name and rank, and nothing else. The tagline used to sit under
          them and was truncated on every single card — "MT4/MT5 üzerinden
          yükse…" tells a reader nothing they did not already know, and it
          was the reason each card needed two lines. The full tagline is
          still in the link's title, and the review page is one tap away. */}
      <div className="flex min-w-0 items-center gap-2">
        <span className="notranslate truncate font-display text-sm font-semibold text-text-on-ink">
          {broker.name}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-gold">
          #{String(broker.rank).padStart(2, "0")}
        </span>
      </div>
    </Link>
  );
}

function Row({ brokers, hidden }: { brokers: Broker[]; hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-3 pe-3">
      {brokers.map((b, i) => (
        <Card key={`${hidden ? "dup" : "src"}-${b.slug}-${i}`} broker={b} />
      ))}
    </div>
  );
}

// Driven by rAF/transform instead of a CSS animation so it keeps moving
// regardless of the OS-level "reduce motion" setting (Windows' "Animation
// effects" toggle, macOS "Reduce motion", etc. all flip
// prefers-reduced-motion, which previously froze this and fell back to a
// manually-draggable scrollbar). Speed is only reduced, never stopped,
// under that preference — a compromise between full a11y compliance and
// the always-visible marketing carousel this is meant to be.
export default function BrokerHeroSlider({ brokers }: { brokers: Broker[] }) {
  const sorted = [...brokers].sort((a, b) => a.rank - b.rank);
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    const row = rowRef.current;
    if (!track || !row) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = reduceMotion ? 95 : 165; // px/sec

    let rowWidth = row.getBoundingClientRect().width;
    const onResize = () => {
      rowWidth = row.getBoundingClientRect().width;
    };
    window.addEventListener("resize", onResize);

    let offset = 0;
    let last = performance.now();
    let frame = requestAnimationFrame(tick);

    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current && rowWidth > 0) {
        offset = (offset + speed * dt) % rowWidth;
        if (track) track.style.transform = `translateX(-${offset}px)`;
      }
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="border-b border-hairline bg-ink py-1 [@media(max-height:520px)]:hidden">
      <div
        className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
      >
        <div ref={trackRef} className="flex w-max ps-6">
          <div ref={rowRef}>
            <Row brokers={sorted} />
          </div>
          <Row brokers={sorted} hidden />
        </div>
      </div>
    </div>
  );
}
