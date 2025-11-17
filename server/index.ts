import "dotenv/config";
import express from "express";
import { handleDemo } from "./routes/demo";
import apiRouter from "./routes/api";

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

  // Supabase API wrapper - all auth and data operations go through here
  app.use("/api/supabase/", apiRouter);

  return app;
}
