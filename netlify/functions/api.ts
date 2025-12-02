import serverless from "serverless-http";
import express from "express";
import { createClient } from "@supabase/supabase-js";

console.log("[Netlify] Initializing API function");

// Get Supabase credentials
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://hnxdlgdkyboctsvfktwe.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGRsZ2RreWJvY3RzdmZrdHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM0NTQsImV4cCI6MjA4MDE3OTQ1NH0.DZPvC7diiNoANXgDxnb7T-ynYg6JUW4cfEILoJfABSI";

// Create Supabase client
let supabase: any = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("[Netlify] Supabase client initialized");
} catch (error) {
  console.error("[Netlify] Failed to create Supabase client:", error);
}

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log("[Netlify] Request:", req.method, req.path, req.originalUrl);
  next();
});

// Health check endpoint - must come first
app.get("/health", (req, res) => {
  console.log("[Netlify] Health check OK");
  res.json({
    status: "ok",
    message: "API is running",
  });
});

// Also handle /api/health for direct access
app.get("/api/health", (req, res) => {
  console.log("[Netlify] Health check OK (with /api prefix)");
  res.json({
    status: "ok",
    message: "API is running",
  });
});

// Login endpoint
app.post("/auth/login", async (req, res) => {
  try {
    console.log("[Netlify] Login request received");

    if (!supabase) {
      console.error("[Netlify] Supabase not initialized");
      res.setHeader("Content-Type", "application/json");
      return res.status(503).json({
        error: "Service unavailable",
        message: "Supabase is not initialized",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("[Netlify] Missing email or password");
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error: "Missing credentials",
      });
    }

    console.log("[Netlify] Attempting login for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Netlify] Auth error:", error.message);
      res.setHeader("Content-Type", "application/json");
      return res.status(401).json({
        error: error.message || "Authentication failed",
      });
    }

    if (!data?.user) {
      console.error("[Netlify] No user in response");
      res.setHeader("Content-Type", "application/json");
      return res.status(401).json({
        error: "Authentication failed",
      });
    }

    console.log("[Netlify] Login successful for:", email);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      session: data.session,
      user: data.user,
      token: data.session?.access_token || "",
    });
  } catch (error: any) {
    console.error("[Netlify] Login error:", error.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// Also handle /api/auth/login for direct access
app.post("/api/auth/login", async (req, res) => {
  console.log("[Netlify] Redirecting /api/auth/login to /auth/login");
  // Reuse the handler above by stripping /api
  req.url = "/auth/login";
  app._router.handle(req, res);
});

// Signup endpoint
app.post("/auth/signup", async (req, res) => {
  try {
    console.log("[Netlify] Signup request");

    if (!supabase) {
      res.setHeader("Content-Type", "application/json");
      return res.status(503).json({ error: "Service unavailable" });
    }

    const { email, password, username, full_name } = req.body;

    if (!email || !password) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: "Missing credentials" });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0],
          full_name: full_name || "",
        },
        emailRedirectTo: "https://cotrainr.netlify.app/login",
      },
    });

    if (error) {
      console.error("[Netlify] Signup error:", error.message);
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: error.message });
    }

    console.log("[Netlify] Signup successful");
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      session: data.session,
      user: data.user,
      token: data.session?.access_token || "",
    });
  } catch (error: any) {
    console.error("[Netlify] Signup error:", error.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  console.error("[Netlify] 404 - Route not found:", req.method, req.path);
  res.setHeader("Content-Type", "application/json");
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Netlify] Error:", err.message);
  res.setHeader("Content-Type", "application/json");
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

console.log("[Netlify] Express app configured");

// Export serverless handler
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  try {
    console.log("[Netlify] ========================================");
    console.log("[Netlify] Handler called with:", {
      method: event.httpMethod,
      path: event.path,
      rawPath: event.rawPath,
    });

    // Normalize path - ensure it starts with /
    if (event.path && !event.path.startsWith("/")) {
      event.path = "/" + event.path;
    }

    // If path is /api/..., keep it as is (Express will handle it)
    console.log("[Netlify] Final path:", event.path);
    console.log("[Netlify] ========================================");

    const response = await serverlessHandler(event, context);

    console.log("[Netlify] Response:", {
      statusCode: response.statusCode,
      hasBody: !!response.body,
    });

    return response;
  } catch (error: any) {
    console.error("[Netlify] Handler error:", error.message);
    console.error("[Netlify] Stack:", error.stack?.split("\n").slice(0, 3).join("\n"));

    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.message || "Internal server error",
      }),
    };
  }
};
