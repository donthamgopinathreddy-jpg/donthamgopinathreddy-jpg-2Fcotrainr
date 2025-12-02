import path from "path";
import express from "express";
import { createServer } from "./index";
import { existsSync } from "fs";

console.log('[node-build] Starting server initialization...');

let app: any = null;

try {
  app = createServer();
  console.log('[node-build] Server created successfully');
} catch (error) {
  console.error('[node-build] Failed to create server:', error);
  console.error('[node-build] Stack trace:', error instanceof Error ? error.stack : '');
  throw error;
}

const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

console.log('[node-build] Checking for static files at:', distPath);
const hasStaticFiles = existsSync(distPath) && existsSync(path.join(distPath, "index.html"));
console.log('[node-build] Static files available:', hasStaticFiles);

if (hasStaticFiles) {
  console.log('[node-build] Serving static files');
  app.use(express.static(distPath));

  // Handle React Router - serve index.html for all non-API routes
  app.get("*", (req: any, res: any) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
      console.log('[node-build] API route not found, returning 404 JSON:', req.method, req.path);
      return res.status(404).json({ error: "API endpoint not found" });
    }

    const indexPath = path.join(distPath, "index.html");
    console.log('[node-build] Serving index.html for route:', req.method, req.path);
    res.sendFile(indexPath);
  });
} else {
  console.warn('[node-build] No static files found - frontend not built');
  app.get("*", (req: any, res: any) => {
    res.status(404).json({ error: "Frontend not built. Please run: npm run build" });
  });
}

const server = app.listen(port, () => {
  console.log(`🚀 [node-build] Server running on port ${port}`);
  console.log(`📱 [node-build] Frontend: http://localhost:${port}`);
  console.log(`🔧 [node-build] API: http://localhost:${port}/api`);
  console.log(`✅ [node-build] Server startup complete`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
});
