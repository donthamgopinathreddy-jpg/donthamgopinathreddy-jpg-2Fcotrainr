import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);

// Service Worker temporarily disabled to prevent conflicts with Supabase API calls
// Will be re-enabled after proper cache strategy is implemented
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/sw.js")
//     .then(() => {
//       console.log("Service Worker registered successfully");
//     })
//     .catch((error) => {
//       console.log("Service Worker registration failed:", error);
//     });
// }
