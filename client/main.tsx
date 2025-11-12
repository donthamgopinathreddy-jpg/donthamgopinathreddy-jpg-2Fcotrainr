import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element with id 'root' not found in HTML");
}

const root = createRoot(rootElement);

// Wrap in try-catch to log errors but don't interfere with React rendering
try {
  root.render(<App />);
} catch (error) {
  console.error("Error rendering app:", error);
  // Let React handle the error - don't create a second root
}

// Disable service worker to prevent conflicts with Supabase API calls
// Run asynchronously to not block app rendering
if ("serviceWorker" in navigator) {
  // Defer cleanup to prevent blocking the app
  setTimeout(() => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch(() => {
          // Silently ignore errors
        });
      });
    }).catch(() => {
      // Silently ignore errors
    });
  }, 1000);
}
