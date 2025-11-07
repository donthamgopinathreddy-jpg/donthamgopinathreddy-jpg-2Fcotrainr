// Service Worker Disabled
// This file exists only to unregister any previously installed service worker
// It does NOT cache or intercept ANY requests

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
  // Clear all caches on activation
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// CRITICAL: Do NOT intercept any fetch requests
// This prevents "body stream already read" errors with API calls
