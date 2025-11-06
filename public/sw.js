// Minimal service worker that doesn't interfere with API calls
// This prevents the "body stream already read" error from Supabase

const CACHE_NAME = "cotrainr-v1";

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Don't intercept fetch - let all requests go through normally
// This prevents issues with Supabase and other API calls
self.addEventListener("fetch", (event) => {
  // Just pass through all requests without caching
  // This avoids the "body stream already read" error
  return;
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
