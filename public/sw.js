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
