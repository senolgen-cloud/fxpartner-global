"use client";

import Link from "@/components/LocaleLink";
import { useTr, useTrf } from "@/components/useTr";
import { useUnreadCount } from "@/components/NotificationProvider";

// Just the button and its badge.
//
// The polling, the in-app card and the chime all live in
// NotificationProvider, mounted once in the layout. This renders twice —
// once in the phone header, once in the desktop cluster — and each is only
// hidden from the other by CSS, so anything stateful in here would run
// twice: two requests a minute, and a notification chiming and appearing
// in duplicate.
export default function HeaderBell({ size = "mobile" }: { size?: "mobile" | "desktop" }) {
  const tr = useTr();
  const trf = useTrf();
  const unread = useUnreadCount();
  const box = size === "desktop" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "desktop" ? 19 : 22;

  return (
    <Link
      href="/account"
      aria-label={unread > 0 ? trf("Bildirimler, {n} okunmamış", { n: unread }) : tr("Bildirimler")}
      title={tr("Bildirimler")}
      className={`relative inline-flex ${box} items-center justify-center rounded-xl text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink`}
    >
      <svg
        width={icon}
        height={icon}
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
        <span className="absolute end-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[10px] font-semibold leading-none text-on-signal">
          {unread}
        </span>
      )}
    </Link>
  );
}
