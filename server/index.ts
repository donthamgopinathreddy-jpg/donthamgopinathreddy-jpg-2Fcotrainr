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

  // Proxy auth routes to NestJS backend (running on port 3001)
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("[Server] Forwarding POST /api/auth/signup to NestJS backend on port 3001");
      const response = await fetch("http://localhost:3001/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("[Server] Error forwarding auth/signup:", error);
      res.status(500).json({ error: "Failed to reach authentication service" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("[Server] Forwarding POST /api/auth/login to NestJS backend on port 3001");
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("[Server] Error forwarding auth/login:", error);
      res.status(500).json({ error: "Failed to reach authentication service" });
    }
  });

  // Supabase API wrapper - all auth and data operations go through here
  console.log("[Server] Registering /api/supabase/ routes");
  app.use("/api/supabase/", apiRouter);

  // Serve static files from the dist/spa directory in production
  const staticDir = path.join(__dirname, "../dist/spa");
  console.log("[Server] Static directory:", staticDir);
  app.use(express.static(staticDir));

  // Catch-all handler: serve index.html for all non-API routes
  // This allows React Router to handle client-side routing
  app.use((_req, res) => {
    console.log("[Server] Serving index.html for route:", _req.path);
    res.sendFile(path.join(staticDir, "index.html"));
  });

  return app;
}
