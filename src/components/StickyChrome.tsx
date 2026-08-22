"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMoreMenu } from "@/components/MoreMenuContext";

// The sticky stack at the top of every page: the logo bar, and the broker
// slider pinned under it. On a phone that is ~150px of permanent chrome,
// against a bottom nav + ticker holding the other end of the screen. The
// logo bar earns its row when you arrive and nothing at all once you are
// reading, so scrolling down slides it away and scrolling back up returns
// it.
//
// It slides the whole stack up by exactly the logo bar's height rather than
// collapsing that bar's height, and the difference matters. Collapsing it
// changes the document flow, the browser's scroll anchoring compensates by
// moving the scroll position, that reads as a scroll in the opposite
// direction, and the bar flickers open/closed several times a second. A
// transform leaves layout untouched, so nothing feeds back: the slider ends
// up at the top edge and the row the logo occupied shows page content.
//
// Phone widths only — at md and up the stack is left alone.

// Below this much scroll the bar always shows: near the top of a page there
// is no space pressure, and it stops a short bounce from hiding it.
const ALWAYS_VISIBLE_ABOVE = 80;

// Ignore scrolls smaller than this so a stray twitch or the iOS
// rubber-band doesn't toggle the bar.
const DIRECTION_THRESHOLD = 6;

const PHONE_QUERY = "(max-width: 767px)";

export default function StickyChrome({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [barHeight, setBarHeight] = useState(0);
  const [isPhone, setIsPhone] = useState(false);
  const { open: moreMenuOpen } = useMoreMenu();
  const lastY = useRef(0);

  // Measured, not hard-coded: the bar is h-14 today and the number would rot
  // the first time someone changes its padding.
  const measure = useCallback(() => {
    const bar = ref.current?.querySelector("header");
    setBarHeight(bar ? bar.getBoundingClientRect().height : 0);
  }, []);

  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY);
    const sync = () => setIsPhone(phone.matches);
    sync();
    measure();

    phone.addEventListener("change", sync);
    window.addEventListener("resize", measure);
    return () => {
      phone.removeEventListener("change", sync);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    lastY.current = window.scrollY;
    let queued = false;

    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const y = Math.max(0, window.scrollY);
        const delta = y - lastY.current;

        if (y <= ALWAYS_VISIBLE_ABOVE) setCollapsed(false);
        else if (delta > DIRECTION_THRESHOLD) setCollapsed(true);
        else if (delta < -DIRECTION_THRESHOLD) setCollapsed(false);

        if (Math.abs(delta) > DIRECTION_THRESHOLD) lastY.current = y;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The full-screen menu opens from the bottom nav while the bar may be
  // hidden; leaving it hidden underneath means it slides back the moment the
  // overlay closes, which reads as a glitch.
  const shift = isPhone && collapsed && !moreMenuOpen ? barHeight : 0;

  return (
    <div
      ref={ref}
      className="sticky top-0 z-40 transition-transform duration-300 ease-out motion-reduce:transition-none"
      style={shift ? { transform: `translateY(-${shift}px)` } : undefined}
      // Nothing here leaves the tab order while it is off-screen, so a
      // keyboard user tabbing into the logo or the nav needs it back.
      onFocusCapture={() => setCollapsed(false)}
    >
      {children}
    </div>
  );
}
