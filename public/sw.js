// This service worker is intentionally disabled to prevent conflicts with Supabase
// See: https://github.com/supabase/supabase-js/issues/644

// Unregister this worker immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.matchAll().then((clients) => {
    return Promise.all(clients.map(client => client.postMessage({ type: "SKIP_WAITING" })));
  }));
  self.clients.claim();
});

// DO NOT cache or intercept any requests
// This prevents the "body stream already read" error
self.addEventListener("fetch", (event) => {
  // Do nothing - let browser handle all requests
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
