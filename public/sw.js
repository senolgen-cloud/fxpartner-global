// FXPARTNER service worker. Deliberately minimal — push display, click
// routing, and a fetch handler that does nothing. No offline caching, so it
// cannot interfere with Next.js’s own asset serving or serve a stale price.

self.addEventListener("push", (event) => {
  let data = { title: "FXPARTNER", body: "", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Non-JSON payload — fall back to the defaults above.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      // The square app icon, not /fxpartner-logo.png. That file is the wide
      // horizontal wordmark used in the header, the footer and the welcome
      // email, where a lockup belongs — dropped into a notification's
      // square icon slot it letterboxed down to an illegible strip, and it
      // still carried the old artwork after the icons were rebuilt.
      icon: "/icon-fxpartner-2026-192.png",
      // No badge on purpose. Android renders it as a monochrome silhouette,
      // so any full-bleed colour image becomes a solid blob; with none set
      // the platform falls back to the app icon, which is the better of the
      // two. A real badge would be a dedicated transparent monochrome mark.
      data: { url: data.url },
      // Explicit, not just relying on the platform default: silent:false is
      // what actually makes the OS play its notification sound, and the
      // vibrate pattern is the mobile equivalent for phones on silent/DND
      // where sound alone wouldn't be felt. Both matter here specifically
      // because these are trading signals — a missed one is a missed entry.
      silent: false,
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = clientsList.find((c) => c.url === targetUrl);
      if (existing) {
        await existing.focus();
        return;
      }
      await self.clients.openWindow(targetUrl);
    })()
  );
});

// Present so the site can be installed, and deliberately doing nothing.
//
// Chrome will not offer "Install app" — on Android or the desktop — for a
// site whose service worker has no fetch handler. Until this existed the
// install prompt never fired at all, which meant the Home Screen icon was
// only ever reachable on iOS, where Safari uses apple-touch-icon and asks
// no such thing.
//
// It does not call respondWith, so every request goes to the network
// exactly as it would with no worker registered. That is the point: this
// site serves live prices and open positions, and a cache in front of them
// would show someone a signal that has already closed.
self.addEventListener("fetch", () => {});
