"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/LocaleLink";
import { useTr, useTrf } from "@/components/useTr";
import { armAudioUnlock, playChime } from "@/lib/chime";

type Item = {
  id: string;
  at: string;
  title: string;
  titleVars: Record<string, string | number>;
  detail: string | null;
  detailVars: Record<string, string | number>;
  href: string;
};

// How often the badge asks. A minute is slow enough that the count query is
// a rounding error against a page load and fast enough that a member with
// the app open hears about a signal while it is still worth hearing about.
const POLL_MS = 60_000;

// The bell in the header: the unread badge, and — while the app is actually
// open in front of someone — an in-app card and a chime when something
// arrives.
//
// IN-APP IS A SEPARATE PROBLEM FROM PUSH, which is why this exists at all.
// The service worker's push handler covers the case where the app is closed
// or in the background. With the app open and focused, a system notification
// is either suppressed by the platform or lands as a duplicate of a screen
// the member is already looking at. This is the foreground half.
export default function HeaderBell() {
  const tr = useTr();
  const trf = useTrf();
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<Item[] | null>(null);
  // Null until the first poll answers. Without this the first response
  // would look like a jump from 0 to N and announce a backlog the member
  // has been carrying for days as if it had just happened.
  const lastCount = useRef<number | null>(null);

  useEffect(() => armAudioUnlock(), []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const { unread: n } = (await res.json()) as { unread: number };
      setUnread(n);

      const previous = lastCount.current;
      lastCount.current = n;
      if (previous === null || n <= previous) return;

      // Only now — after the count has genuinely risen — fetch what to say.
      const full = await fetch("/api/notifications?items=1", { cache: "no-store" });
      if (!full.ok) return;
      const { items } = (await full.json()) as { items: Item[] };
      if (items.length === 0) return;
      setToast(items.slice(0, n - previous));
      playChime();
    } catch {
      // Offline or a failed request: the badge keeps its last known value
      // rather than dropping to zero and telling the member their
      // notifications went away.
    }
  }, []);

  useEffect(() => {
    // The rule follows poll() down to a setState and flags it, but the call
    // is asynchronous: nothing is set until a fetch answers, which is the
    // "setState in a callback when external state changes" shape the rule's
    // own guidance describes. The alternative — waiting for the first
    // interval — would leave the badge blank for a minute after every load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void poll();
    const id = setInterval(() => {
      // Nothing to announce to a tab nobody is looking at, and polling a
      // hidden tab is the kind of thing that drains a phone in a pocket.
      if (document.visibilityState === "visible") void poll();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [poll]);

  return (
    <>
      <Link
        href="/account"
        aria-label={
          unread > 0 ? trf("Bildirimler, {n} okunmamış", { n: unread }) : tr("Bildirimler")
        }
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-on-ink transition-colors hover:bg-ink-soft"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          // The count is capped at 20 by the server, so this never has to
          // render a number too wide for the dot.
          <span className="absolute end-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[10px] font-semibold leading-none text-on-signal">
            {unread}
          </span>
        )}
      </Link>

      {toast && toast.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-3 top-3 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:end-4 sm:w-80"
        >
          {toast.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setToast(null)}
              className="flex items-start gap-3 rounded-2xl border border-hairline bg-ink-soft p-3.5 shadow-2xl motion-safe:animate-[popIn_0.2s_ease-out]"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal/15 text-signal">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-text-on-ink">
                  {trf(item.title, item.titleVars)}
                </span>
                {item.detail && (
                  <span className="mt-0.5 block truncate font-mono text-xs text-text-on-ink-muted">
                    {trf(item.detail, item.detailVars)}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setToast(null);
                }}
                aria-label={tr("Kapat")}
                className="-me-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-on-ink-muted transition-colors hover:text-text-on-ink"
              >
                ×
              </button>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
