import { createRoot } from "react-dom/client";
import App from "./App";

// Error boundary fallback UI
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif"
  }}>
    <div style={{ maxWidth: "600px", textAlign: "center" }}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>App Error</h1>
      <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
        {error?.message || "An unexpected error occurred"}
      </p>
      <pre style={{
        backgroundColor: "#fff",
        padding: "15px",
        borderRadius: "8px",
        overflow: "auto",
        textAlign: "left",
        fontSize: "12px",
        maxHeight: "300px",
        color: "#d32f2f"
      }}>
        {error?.stack || "No stack trace available"}
      </pre>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#ff9500",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Reload Page
      </button>
    </div>
  </div>
);

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element with id 'root' not found in HTML");
  }

  const root = createRoot(rootElement);
  root.render(<App />);

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
} catch (error) {
  console.error("Failed to mount app:", error);
  document.body.innerHTML = "";
  const root = createRoot(document.body);
  root.render(<ErrorFallback error={error instanceof Error ? error : new Error(String(error))} />);
}
