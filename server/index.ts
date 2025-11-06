import "dotenv/config";
import express from "express";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Only add middleware for /api routes to prevent interference with client requests
  app.use("/api", express.json());
  app.use("/api", express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
