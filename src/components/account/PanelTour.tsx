"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTr } from "@/components/useTr";

type Stop = { anchor: string; title: string; body: string };

/**
 * A four-stop tour of the panel, shown once.
 *
 * It points at things that are already on the screen rather than explaining
 * the panel in the abstract: a member reading "your cashback appears here"
 * while looking at the cashback form learns where, which is the only part
 * they cannot work out for themselves.
 *
 * Anchored by data-tour attributes on the real sections, so a stop whose
 * section is not rendered for this member — the cashback form is not always
 * there — is skipped rather than pointing at nothing.
 *
 * "Seen" is written on finish AND on skip. Someone who dismissed a tour has
 * decided about it, and showing it again on their next visit would be the
 * software disagreeing with them.
 */
export default function PanelTour({ finish }: { finish: () => Promise<void> }) {
  const tr = useTr();

  const stops: Stop[] = [
    {
      anchor: "figures",
      title: tr("Hesabın canlı durumu"),
      body: tr(
        "Takip edilen hesapta şu an açık olan işlem sayısı, son 30 günün isabet oranı ve size işlenen toplam iade."
      ),
    },
    {
      anchor: "bell",
      title: tr("Bildirimler"),
      body: tr(
        "Yeni sinyaller, kapanan işlemler ve hesabınıza işlenen iadeler burada birikir. Zilde bir sayı varsa okumadığınız bir şey var demektir."
      ),
    },
    {
      anchor: "profile",
      title: tr("Paneli kendinize göre ayarlayın"),
      body: tr(
        "Size nasıl hitap edeceğimizi ve panelin vurgu rengini buradan seçersiniz. Ülke ve broker seçiminiz hangi kampanyaların size uygun olduğunu belirler."
      ),
    },
    {
      anchor: "cashback",
      title: tr("İşlem hesabınızı bağlayın"),
      body: tr(
        "Kazanç iadesi ancak bağlı bir işlem hesabıyla takip edilebilir. Hesabınızı bağladığınızda tutarlar buraya işlenir."
      ),
    },
  ];

  const [live, setLive] = useState<Stop[]>([]);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardH, setCardH] = useState(0);
  const card = useRef<HTMLDivElement | null>(null);

  // Only the stops whose section actually exists on this member's panel.
  useEffect(() => {
    const present = stops.filter((s) =>
      document.querySelector(`[data-tour="${s.anchor}"]`)
    );
    setLive(present);
    if (present.length === 0) void finish();
    // Built once, on mount: the stops are static and the anchors do not move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = live[i];

  const place = useCallback(() => {
    if (!current) return;
    const el = document.querySelector(`[data-tour="${current.anchor}"]`);
    if (!el) return;
    setRect(el.getBoundingClientRect());
  }, [current]);

  useLayoutEffect(() => {
    if (!current) return;
    const el = document.querySelector(`[data-tour="${current.anchor}"]`);
    if (!el) return;

    // Placed before the scroll starts, not after it is assumed to have
    // finished. Waiting a fixed delay left the spotlight one stop behind the
    // card — it lit the figures while the card read "Notifications" — and no
    // delay is the right one, because a smooth scroll takes as long as the
    // distance requires.
    place();
    el.scrollIntoView({ block: "center", behavior: "smooth" });

    // Then follow it until the page is actually still. Not for a fixed
    // stretch: the scroll down to the cashback form takes about two seconds
    // here, and a fixed 800ms window froze the spotlight more than a second
    // before the page stopped moving — the highlight ended up on whatever
    // had been passing at the time.
    let raf = 0;
    let lastY = -1;
    let stillSince = 0;
    const giveUpAt = performance.now() + 4000;
    const follow = () => {
      place();
      const y = Math.round(window.scrollY);
      if (y === lastY) {
        if (!stillSince) stillSince = performance.now();
      } else {
        lastY = y;
        stillSince = 0;
      }
      const settled = stillSince && performance.now() - stillSince > 150;
      if (!settled && performance.now() < giveUpAt) raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(raf);
  }, [current, place]);

  useEffect(() => {
    if (!current) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") void close();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("keydown", onKey);
    };
    // next/close are recreated every render and are stable in behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, place]);

  const [done, setDone] = useState(false);

  async function close() {
    setDone(true);
    await finish();
  }

  function next() {
    if (i + 1 < live.length) setI(i + 1);
    else void close();
  }

  if (done || !current || !rect || typeof document === "undefined") return null;

  const pad = 8;
  // Measured, not estimated: these four cards are different heights in three
  // languages, and a guess put the last one under the floating chat button.
  const h = cardH || 220;
  const gap = 16;
  const below = rect.bottom + gap;
  const above = rect.top - gap - h;
  const cardTop =
    below + h + gap <= window.innerHeight
      ? below
      : above >= gap
        ? above
        : Math.max(gap, window.innerHeight - h - gap);
  const cardWidth = Math.min(340, window.innerWidth - 32);
  const cardLeft = Math.min(
    Math.max(16, rect.left + rect.width / 2 - cardWidth / 2),
    window.innerWidth - cardWidth - 16
  );

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={current.title}>
      {/* The spotlight is one element with a very large spread shadow, so the
          dimming and the hole are the same shape and can never drift apart. */}
      <div
        aria-hidden="true"
        onClick={next}
        className="pointer-events-auto absolute rounded-2xl ring-2 ring-signal transition-all duration-300"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
        }}
      />

      <div
        ref={(el) => {
          card.current = el;
          const next = el?.offsetHeight ?? 0;
          if (next && next !== cardH) setCardH(next);
        }}
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
        className="absolute rounded-2xl border border-hairline bg-ink-soft p-5 shadow-2xl motion-safe:animate-[fadeIn_0.2s_ease-out]"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
          {i + 1}/{live.length}
        </p>
        <h2 className="mt-2 font-display text-lg font-semibold text-text-on-ink">
          {current.title}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-text-on-ink-muted">{current.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void close()}
            className="text-[13px] text-text-on-ink-muted underline-offset-4 transition-colors hover:text-text-on-ink hover:underline"
          >
            {tr("Turu atla")}
          </button>
          <button
            type="button"
            onClick={next}
            autoFocus
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
          >
            {i + 1 < live.length ? tr("Sonraki") : tr("Anladım")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
