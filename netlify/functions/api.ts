import serverless from "serverless-http";
import express from "express";
import { createClient } from "@supabase/supabase-js";

console.log("[Netlify] Initializing API function");
console.log("[Netlify] NODE_ENV:", process.env.NODE_ENV);
console.log(
  "[Netlify] VITE_SUPABASE_URL:",
  process.env.VITE_SUPABASE_URL ? "✓" : "✗",
);
console.log(
  "[Netlify] VITE_SUPABASE_ANON_KEY:",
  process.env.VITE_SUPABASE_ANON_KEY ? "✓" : "✗",
);

// Get Supabase credentials
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://hnxdlgdkyboctsvfktwe.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGRsZ2RreWJvY3RzdmZrdHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM0NTQsImV4cCI6MjA4MDE3OTQ1NH0.DZPvC7diiNoANXgDxnb7T-ynYg6JUW4cfEILoJfABSI";

console.log("[Netlify] SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
console.log("[Netlify] SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY ? "✓" : "✗");

// Create Supabase client
let supabase: any = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("[Netlify] Supabase client created successfully");
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
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log("[Netlify] Express:", req.method, req.path);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API server is running",
    supabase_initialized: !!supabase,
  });
});

// Login endpoint
app.post("/auth/login", async (req, res) => {
  try {
    console.log("[Netlify] Login request");

    if (!supabase) {
      console.error("[Netlify] Supabase not initialized");
      return res.status(503).json({
        error: "Service unavailable",
        message: "Authentication service is not available",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing email or password",
      });
    }

    console.log("[Netlify] Attempting login for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Netlify] Auth error:", error.message);
      return res.status(401).json({
        error: error.message || "Authentication failed",
      });
    }

    if (!data?.user) {
      console.error("[Netlify] No user data returned");
      return res.status(401).json({
        error: "Authentication failed",
      });
    }

    console.log("[Netlify] Login successful for:", email);

    res.json({
      session: data.session,
      user: data.user,
      token: data.session?.access_token || "",
    });
  } catch (error: any) {
    console.error("[Netlify] Login error:", error.message);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// Signup endpoint
app.post("/auth/signup", async (req, res) => {
  try {
    console.log("[Netlify] Signup request");

    if (!supabase) {
      return res.status(503).json({
        error: "Service unavailable",
      });
    }

    const {
      email,
      password,
      username,
      full_name,
      gender,
      role = "client",
      height,
      weight,
      phone_number,
      country_code,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing email or password",
      });
    }

    console.log("[Netlify] Signup for:", email);

    // Determine redirect URL
    let emailRedirectTo = "https://cotrainr.netlify.app/login";
    if (process.env.URL) {
      emailRedirectTo = `${process.env.URL}/login`;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0],
          full_name: full_name || "",
          gender: gender || "",
          phone_number: phone_number || "",
          country_code: country_code || "",
          role: role || "client",
        },
        emailRedirectTo,
      },
    });

    if (error) {
      console.error("[Netlify] Signup error:", error.message);
      return res.status(400).json({
        error: error.message || "Signup failed",
      });
    }

    console.log("[Netlify] Signup successful for:", email);

    res.json({
      session: data.session,
      user: data.user,
      token: data.session?.access_token || "",
      message: "Sign up successful",
    });
  } catch (error: any) {
    console.error("[Netlify] Signup error:", error.message);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.error("[Netlify] 404:", req.method, req.path);
  res.status(404).json({
    error: "Not found",
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Netlify] Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

console.log("[Netlify] Express app created successfully");

const handler = serverless(app);

// Export handler (Netlify expects 'handler' export)
export const handler = async (event: any, context: any) => {
  try {
    console.log("[Netlify] ========================================");
    console.log("[Netlify] Request:", {
      method: event.httpMethod,
      path: event.path,
      rawPath: event.rawPath,
    });

    // Normalize path
    if (event.path && !event.path.startsWith("/")) {
      event.path = "/" + event.path;
    }

    console.log("[Netlify] Normalized path:", event.path);
    console.log("[Netlify] ========================================");

    const response = await handler(event, context);

    console.log("[Netlify] Response:", {
      statusCode: response.statusCode,
      hasBody: !!response.body,
    });

    return response;
  } catch (error: any) {
    console.error("[Netlify] Handler error:", error.message);
    console.error(
      "[Netlify] Stack:",
      error.stack?.split("\n").slice(0, 5).join("\n"),
    );

    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.message || "Internal server error",
      }),
    };
  }
};
