"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

// Records every click on a link that leaves the site — broker and prop-firm
// referral links, copytrade, sponsored slots — without touching any of the
// dozens of components that render them.
//
// One delegated listener on the document, in the capture phase so a
// component that stops propagation still gets counted. sendBeacon because
// the page is about to navigate away (or open a new tab) and a fetch could
// be cancelled before it leaves the browser.
//
// A link can name where it sits with data-placement (on itself or any
// ancestor): the same broker URL in a card, a comparison table and an
// in-article slot is otherwise one row with three meanings.
//
// Also forwarded to Vercel Web Analytics as a custom event, for whenever
// the plan includes them; the database row is the record either way.
export default function OutboundClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Left and middle clicks both open the link; right-click does not.
      if (event.button > 1) return;
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") return;
      if (url.hostname === window.location.hostname) return;

      const placement = anchor.closest("[data-placement]")?.getAttribute("data-placement") ?? null;
      const payload = JSON.stringify({
        href: url.toString(),
        path: window.location.pathname,
        placement,
      });

      try {
        const sent = navigator.sendBeacon?.("/api/click", new Blob([payload], { type: "application/json" }));
        if (!sent) {
          void fetch("/api/click", { method: "POST", body: payload, keepalive: true }).catch(() => {});
        }
      } catch {
        // A statistic, never a reason to break the link.
      }

      try {
        track("outbound_click", { host: url.hostname, path: window.location.pathname, placement });
      } catch {
        // Same.
      }
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  return null;
}
