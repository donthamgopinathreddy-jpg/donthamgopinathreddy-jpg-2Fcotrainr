import "dotenv/config";
import express from "express";
import { handleDemo } from "./routes/demo";
import apiRouter from "./routes/api";

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

  return app;
}
