import 'dotenv/config';
import express from 'express';
import path from 'path';
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

  // Add logging middleware to see all requests
  app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.path}`);
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
  console.log('[Server] Registering /api/supabase/ routes');
  app.use('/api/supabase/', apiRouter);

  // Proxy auth routes to Supabase API routes (for backward compatibility with frontend)
  // These routes rewrite the request URL and pass it to the apiRouter
  app.post('/api/auth/signup', async (req, res, next) => {
    console.log('[Server] ========================================');
    console.log('[Server] Received POST /api/auth/signup');
    console.log('[Server] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[Server] Forwarding to apiRouter at /auth/signup');
    console.log('[Server] ========================================');
    req.url = '/auth/signup';
    apiRouter(req, res, next);
  });

  app.post('/api/auth/login', async (req, res, next) => {
    console.log('[Server] Forwarding POST /api/auth/login to supabase auth/signin');
    req.url = '/auth/signin';
    apiRouter(req, res, next);
  });

  app.post('/api/auth/signin', async (req, res, next) => {
    console.log('[Server] Forwarding POST /api/auth/signin to apiRouter');
    req.url = '/auth/signin';
    apiRouter(req, res, next);
  });

  app.post('/api/auth/reset-password', async (req, res, next) => {
    console.log(
      '[Server] Forwarding POST /api/auth/reset-password to supabase auth/reset-password'
    );
    req.url = '/auth/reset-password';
    apiRouter(req, res, next);
  });

  app.get('/api/users/profile', async (req, res, next) => {
    console.log('[Server] Forwarding GET /api/users/profile to apiRouter');
    req.url = '/users/profile';
    apiRouter(req, res, next);
  });

  // Serve static files from the dist/spa directory in production
  const staticDir = path.join(__dirname, '../dist/spa');
  console.log('[Server] Static directory:', staticDir);
  app.use(express.static(staticDir));

  // Catch-all handler: serve index.html for all non-API routes
  // This allows React Router to handle client-side routing
  app.use((_req, res) => {
    console.log('[Server] Serving index.html for route:', _req.path);
    res.sendFile(path.join(staticDir, 'index.html'));
  });

  return app;
}
