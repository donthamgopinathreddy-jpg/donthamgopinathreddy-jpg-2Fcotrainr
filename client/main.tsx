import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);

// Disable service worker to prevent conflicts with Supabase API calls
// Run asynchronously to not block app rendering
if ("serviceWorker" in navigator) {
  // Defer cleanup to prevent blocking the app
  setTimeout(() => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {
            // Silently ignore errors
          });
        });
      })
      .catch(() => {
        // Silently ignore errors
      });
  }, 1000);
}
