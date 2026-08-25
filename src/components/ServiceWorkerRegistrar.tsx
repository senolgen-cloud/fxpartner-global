"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on every visit.
 *
 * It used to be registered only inside NotificationOptIn, when someone
 * turned alerts on. That was enough for push and not enough for anything
 * else: Chrome will not offer "Install app" — on Android or the desktop —
 * unless a worker with a fetch handler is already registered, so the prompt
 * never fired and the Home Screen icon was only ever reachable on iOS,
 * where Safari uses apple-touch-icon and asks no such thing.
 *
 * Registration is idempotent, so the opt-in flow still works unchanged; it
 * finds this registration instead of making its own.
 *
 * Deferred to the load event so it never competes with the first render for
 * bandwidth — nothing on the page is waiting for it.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // A failed registration costs the install prompt and nothing else.
        // Not worth an error in the console of every visitor whose browser
        // or privacy setting refuses it.
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
