import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);

// Completely disable service worker to prevent conflicts with Supabase API calls
if ("serviceWorker" in navigator) {
  // Unregister all existing service workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().catch((error) => {
        console.log("Error unregistering service worker:", error);
      });
    });
  });

  // Clear all caches
  if ("caches" in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).catch((error) => {
          console.log("Error clearing cache:", error);
        });
      });
    });
  }
}
