import "dotenv/config";
import express from "express";
import path from "path";
import { handleDemo } from "./routes/demo";
import apiRouter from "./routes/api";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();

  console.log("[Server] Creating Express server");

  // Add JSON middleware globally for proper request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add logging middleware to see all requests
  app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.path}`);
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    console.log("[Server] Ping endpoint called");
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Supabase API wrapper - all auth and data operations go through here
  console.log("[Server] Registering /api/supabase/ routes");
  app.use("/api/supabase/", apiRouter);

  // Serve static files from the dist/spa directory in production
  const staticDir = path.join(__dirname, "../dist/spa");
  console.log("[Server] Static directory:", staticDir);
  app.use(express.static(staticDir));

  // Catch-all handler: serve index.html for all non-API routes
  // This allows React Router to handle client-side routing
  app.get("*", (_req, res) => {
    console.log("[Server] Serving index.html for route:", _req.path);
    res.sendFile(path.join(staticDir, "index.html"));
  });

  return app;
}
