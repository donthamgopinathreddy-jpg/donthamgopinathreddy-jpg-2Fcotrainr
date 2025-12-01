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
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Add CORS headers for development
  app.use((req, res, next) => {
    // Allow requests from the Vite dev server
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Max-Age', '3600');

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // Add detailed logging middleware to see all requests
  app.use((req, res, next) => {
    console.log(
      `[Server] ${req.method} ${req.path} (url: ${req.url}, originalUrl: ${req.originalUrl})`
    );
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log(`[Server] Request body:`, req.body);
    }
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

  // Check if we're in production mode
  const isProduction = process.env.NODE_ENV === 'production';
  const staticDir = path.join(__dirname, '../dist/spa');
  console.log('[Server] Node environment:', process.env.NODE_ENV || 'development');
  console.log('[Server] Static directory:', staticDir);

  if (isProduction && fs.existsSync(staticDir)) {
    console.log('[Server] ✅ Production mode: Serving static files from dist/spa');
    app.use(express.static(staticDir));

    // Catch-all handler: serve index.html for all non-API routes
    // This allows React Router to handle client-side routing
    app.use((_req, res) => {
      console.log('[Server] Serving index.html for route:', _req.path);
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  } else {
    console.log('[Server] 📝 Development mode: NOT serving static files (Vite handles frontend)');
    console.log('[Server] Only API routes will be handled here, frontend requests will 404');
  }

  return app;
}
