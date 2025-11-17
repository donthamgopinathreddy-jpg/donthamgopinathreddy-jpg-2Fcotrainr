import "dotenv/config";
import express from "express";
import { handleDemo } from "./routes/demo";
import { handleSupabaseProxy } from "./routes/supabase-proxy";

export function createServer() {
  const app = express();

  // Add JSON middleware globally for proper request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Supabase REST API proxy - handle all requests to /supabase-api/*
  // This must come before other routes so it can intercept all supabase-api requests
  app.use("/supabase-api/", handleSupabaseProxy);

  return app;
}
