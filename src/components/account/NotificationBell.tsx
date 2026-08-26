"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTr } from "@/components/useTr";
import Link from "@/components/LocaleLink";

export type BellItem = {
  id: string;
  /** ISO, for the <time> element. */
  at: string;
  /** Human, already formatted in the reader's locale by the server. */
  when: string;
  title: string;
  detail: string | null;
  href: string;
  kind: string;
};

/**
 * The bell in the panel header.
 *
 * Opening the list is what marks everything read — there is no separate
 * "mark all read" control, because a member who has just looked at the list
 * has in fact read it. The badge clears on open rather than waiting for the
 * server, since the count is the one thing they are watching while clicking.
 *
 * The list is portalled to the body and positioned fixed, not absolutely
 * inside the header. The header is a rounded gradient card with
 * overflow-hidden, and an absolutely positioned dropdown inside it is simply
 * cut off — which is exactly what happened: the panel rendered with all
 * twenty items at x = -174, invisible.
 *
 * Items arrive already translated. This is a client component and the server
 * tr() would hand every reader Turkish here.
 */
export default function NotificationBell({
  items,
  unread,
  markSeen,
}: {
  items: BellItem[];
  unread: number;
  markSeen: () => Promise<void>;
}) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(unread);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  const place = useCallback(() => {
    const b = button.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(320, window.innerWidth - margin * 2);
    // Hangs from the button's right edge where there is room, and slides back
    // inside the viewport where there is not.
    const left = Math.min(
      Math.max(margin, r.right - width),
      window.innerWidth - width - margin
    );
    setPos({ top: r.bottom + 8, left, width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (button.current?.contains(t) || panel.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    // Capture, so it also follows any scrolling container between here and
    // the document.
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && count > 0) {
      setCount(0);
      void markSeen();
    }
  }

  const label = count > 0 ? `${tr("Bildirimler")} (${count})` : tr("Bildirimler");

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-text-on-ink transition-colors hover:border-text-on-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
          <path
            d="M12 3a5.5 5.5 0 0 0-5.5 5.5c0 3-.9 4.7-1.7 5.7-.4.5 0 1.3.7 1.3h13c.7 0 1.1-.8.7-1.3-.8-1-1.7-2.7-1.7-5.7A5.5 5.5 0 0 0 12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M10 19a2 2 0 0 0 4 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1 font-mono text-[10px] font-semibold text-on-signal"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panel}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            className="fixed z-50 overflow-hidden rounded-2xl border border-hairline bg-ink-soft text-start shadow-2xl motion-safe:animate-[fadeIn_0.15s_ease-out]"
          >
            <p className="border-b border-hairline px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-on-ink-muted">
              {tr("Bildirimler")}
            </p>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-text-on-ink-muted">
                {tr("Son 30 günde yeni bir şey yok.")}
              </p>
            ) : (
              <ul className="max-h-[min(20rem,60vh)] divide-y divide-hairline overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 transition-colors hover:bg-ink"
                    >
                      <span className="block text-sm font-medium text-text-on-ink">{n.title}</span>
                      {n.detail && (
                        <span className="mt-0.5 block text-[13px] text-text-on-ink-muted">
                          {n.detail}
                        </span>
                      )}
                      <time
                        dateTime={n.at}
                        className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-on-ink-muted"
                      >
                        {n.when}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
