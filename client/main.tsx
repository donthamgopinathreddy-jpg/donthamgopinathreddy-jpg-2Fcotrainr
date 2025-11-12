import { createRoot } from "react-dom/client";
import App from "./App";

console.log("main.tsx: Starting app initialization");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("main.tsx: Root element not found!");
  throw new Error("Root element with id 'root' not found");
}

console.log("main.tsx: Root element found, creating React root");

try {
  const root = createRoot(rootElement);
  console.log("main.tsx: React root created, rendering App");

  root.render(<App />);

  console.log("main.tsx: App rendered successfully");
} catch (error) {
  console.error("main.tsx: Error rendering app:", error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; font-family: system-ui;">
      <div style="text-align: center; max-width: 600px;">
        <h1 style="color: #d32f2f; margin-bottom: 10px;">App Error</h1>
        <p style="color: #666; margin-bottom: 20px;">${error instanceof Error ? error.message : String(error)}</p>
        <pre style="background: #fff; padding: 15px; border-radius: 8px; text-align: left; overflow: auto; max-height: 200px; font-size: 12px; color: #d32f2f;">
${error instanceof Error ? error.stack : String(error)}
        </pre>
      </div>
    </div>
  `;
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
