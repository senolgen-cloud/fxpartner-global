// FXPARTNER web push service worker. Deliberately minimal — no offline
// caching/PWA behavior, just push display and click routing, so it can't
// interfere with Next.js's own asset serving.

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
      icon: "/fxpartner-logo.png",
      badge: "/fxpartner-logo.png",
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
