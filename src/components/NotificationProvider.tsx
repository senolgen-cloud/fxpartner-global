"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "@/components/LocaleLink";
import { useTr, useTrf } from "@/components/useTr";
import { armAudioUnlock, playChime } from "@/lib/chime";

export type NotificationItem = {
  id: string;
  at: string;
  title: string;
  titleVars: Record<string, string | number>;
  detail: string | null;
  detailVars: Record<string, string | number>;
  href: string;
};

// How often the badge asks. A minute is slow enough that the count query is
// a rounding error against a page load, and fast enough that a member with
// the app open hears about a signal while it is still worth hearing about.
const POLL_MS = 60_000;

const UnreadContext = createContext(0);

/** The unread count, for any bell that wants to draw a badge. */
export function useUnreadCount() {
  return useContext(UnreadContext);
}

/**
 * Polls once for the whole page, and owns the in-app card and the chime.
 *
 * MOUNTED ONCE, IN THE LAYOUT, and that is the point. The bell appears in
 * two places — the phone header and the desktop cluster — and each is only
 * hidden from the other by CSS, so both are always in the DOM. With the
 * polling inside the button there were two intervals running, two requests
 * a minute, and a notification arriving would have chimed twice and shown
 * the card twice. The button is now just a button; this is the one thing
 * that talks to the server.
 */
export function NotificationProvider({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: ReactNode;
}) {
  const tr = useTr();
  const trf = useTrf();
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<NotificationItem[] | null>(null);
  // Null until the first poll answers. Without it the first response looks
  // like a jump from 0 to N and announces a backlog the member has been
  // carrying for days as though it had just arrived.
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

      const full = await fetch("/api/notifications?items=1", { cache: "no-store" });
      if (!full.ok) return;
      const { items } = (await full.json()) as { items: NotificationItem[] };
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
    if (!signedIn) return;
    // The rule follows poll() down to a setState and flags it, but the call
    // is asynchronous: nothing is set until a fetch answers, which is the
    // "setState in a callback when external state changes" shape the rule's
    // own guidance describes. Waiting for the first interval instead would
    // leave the badge blank for a minute after every load.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void poll();
    const id = setInterval(() => {
      // Nothing to announce to a tab nobody is looking at, and polling a
      // hidden tab is what drains a phone in a pocket.
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
  }, [poll, signedIn]);

  return (
    <UnreadContext.Provider value={unread}>
      {children}
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
              className="menu-panel-in flex items-start gap-3 rounded-2xl border border-hairline bg-ink-soft p-3.5 shadow-2xl"
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
    </UnreadContext.Provider>
  );
}
