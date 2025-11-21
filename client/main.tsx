import { createRoot } from "react-dom/client";
import App from "./App";

// Global error handler for Supabase token refresh errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (
      event.message?.includes("Refresh Token") ||
      event.message?.includes("Invalid Refresh Token")
    ) {
      console.error("[App] Token refresh error caught:", event.error);
      event.preventDefault();
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason?.message?.includes("Refresh Token") ||
      event.reason?.message?.includes("Invalid Refresh Token") ||
      event.reason?.message?.includes("AuthApiError")
    ) {
      console.error("[App] Unhandled token refresh error:", event.reason);
      event.preventDefault();
    }
  });
}

console.log(
  "main.tsx: Starting app initialization at",
  new Date().toISOString(),
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("main.tsx: Root element not found!");
  throw new Error("Root element with id 'root' not found");
}

console.log("main.tsx: Root element found, creating React root");

const startRender = Date.now();

try {
  const root = createRoot(rootElement);
  console.log(
    "main.tsx: React root created, rendering App at",
    new Date().toISOString(),
  );

  root.render(<App />);

  const renderTime = Date.now() - startRender;
  console.log(
    "main.tsx: App render called successfully after",
    renderTime,
    "ms",
  );
} catch (error) {
  const errorTime = Date.now() - startRender;
  console.error("main.tsx: Error rendering app after", errorTime, "ms:", error);
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; font-family: system-ui; padding: 20px;">
        <div style="text-align: center; max-width: 600px;">
          <h1 style="color: #d32f2f; margin-bottom: 10px;">App Error</h1>
          <p style="color: #666; margin-bottom: 20px;">${error instanceof Error ? error.message : String(error)}</p>
          <details style="text-align: left; background: #fff; padding: 15px; border-radius: 8px; font-size: 12px;">
            <summary style="cursor: pointer; color: #666; margin-bottom: 10px;">Stack trace</summary>
            <pre style="overflow: auto; max-height: 200px; color: #d32f2f; margin: 0;">
${error instanceof Error ? error.stack : String(error)}
            </pre>
          </details>
        </div>
      </div>
    `;
  }
}

// Clean up service workers later, after app is fully mounted
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {
            // Ignore errors
          });
        });
      });
    }, 5000);
  });
}
