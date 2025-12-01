import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { handleDemo } from './routes/demo';
import apiRouter from './routes/api';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();

  console.log('[Server] Creating Express server');

  // Add JSON middleware globally for proper request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add detailed logging middleware to see all requests
  app.use((req, res, next) => {
    console.log(
      `[Server] ${req.method} ${req.path} (url: ${req.url}, originalUrl: ${req.originalUrl})`
    );
    next();
  });

  // Example API routes
  app.get('/api/ping', (_req, res) => {
    console.log('[Server] Ping endpoint called');
    const ping = process.env.PING_MESSAGE ?? 'ping';
    res.json({ message: ping });
  });

  app.get('/api/demo', handleDemo);

  // Supabase API wrapper - all auth and data operations go through here
  // IMPORTANT: This MUST come before static file serving
  console.log('[Server] Registering /api routes');
  app.use('/api', apiRouter);

  // Serve static files from the dist/spa directory in production
  const staticDir = path.join(__dirname, '../dist/spa');
  console.log('[Server] Static directory:', staticDir);

  // Serve static files if they exist, otherwise skip
  if (fs.existsSync(staticDir)) {
    console.log('[Server] Serving static files from dist/spa');
    app.use(express.static(staticDir));

    // Catch-all handler: serve index.html for all non-API routes
    // This allows React Router to handle client-side routing
    app.use((_req, res) => {
      console.log('[Server] Serving index.html for route:', _req.path);
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  } else {
    console.log(
      '[Server] Static directory does not exist (development mode - Vite should be serving frontend)'
    );

    // In development mode, return 404 for non-API requests
    // (Vite will serve the frontend)
    app.use((_req, res) => {
      console.log('[Server] Request to non-API endpoint in dev mode:', _req.path);
      res.status(404).json({ error: 'Not found. Frontend should be served by Vite dev server.' });
    });
  }

  return app;
}
