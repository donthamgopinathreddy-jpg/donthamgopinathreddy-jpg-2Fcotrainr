import { createClient } from "@supabase/supabase-js";

// Supabase config
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  "https://hnxdlgdkyboctsvfktwe.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGRsZ2RreWJvY3RzdmZrdHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM0NTQsImV4cCI6MjA4MDE3OTQ1NH0.DZPvC7diiNoANXgDxnb7T-ynYg6JUW4cfEILoJfABSI";

console.log("[API] Netlify function initialized");

// Create Supabase client
let supabase: any = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("[API] Supabase client created");
} catch (error) {
  console.error("[API] Failed to create Supabase client:", error);
}

// Parse request body
async function parseBody(event: any) {
  try {
    if (event.body) {
      if (event.isBase64Encoded) {
        return JSON.parse(Buffer.from(event.body, "base64").toString("utf-8"));
      }
      return JSON.parse(event.body);
    }
    return {};
  } catch (error) {
    console.error("[API] Failed to parse body:", error);
    return {};
  }
}

// Helper to send response
function sendResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// Main handler
export const handler = async (event: any) => {
  const path = event.path || event.rawPath || "/";
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";

  console.log(`[API] ${method} ${path}`);

  // CORS preflight
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    };
  }

  // Health check
  if ((path === "/health" || path === "/api/health") && method === "GET") {
    return sendResponse(200, {
      status: "ok",
      message: "API is running",
      supabase: !!supabase,
    });
  }

  // Login
  if ((path === "/auth/login" || path === "/api/auth/login") && method === "POST") {
    try {
      const body = await parseBody(event);
      const { email, password } = body;

      if (!email || !password) {
        return sendResponse(400, { error: "Missing email or password" });
      }

      if (!supabase) {
        return sendResponse(503, { error: "Service unavailable" });
      }

      console.log("[API] Login attempt for:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[API] Auth error:", error.message);
        return sendResponse(401, { error: error.message || "Authentication failed" });
      }

      if (!data?.user) {
        console.error("[API] No user in response");
        return sendResponse(401, { error: "Authentication failed" });
      }

      console.log("[API] Login successful for:", email);

      return sendResponse(200, {
        session: data.session,
        user: data.user,
        token: data.session?.access_token || "",
      });
    } catch (error: any) {
      console.error("[API] Login error:", error.message);
      return sendResponse(500, { error: error.message || "Internal server error" });
    }
  }

  // Signup
  if ((path === "/auth/signup" || path === "/api/auth/signup") && method === "POST") {
    try {
      const body = await parseBody(event);
      const { email, password, username, full_name } = body;

      if (!email || !password) {
        return sendResponse(400, { error: "Missing email or password" });
      }

      if (!supabase) {
        return sendResponse(503, { error: "Service unavailable" });
      }

      console.log("[API] Signup attempt for:", email);

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
        console.error("[API] Signup error:", error.message);
        return sendResponse(400, { error: error.message || "Signup failed" });
      }

      console.log("[API] Signup successful");

      return sendResponse(200, {
        session: data.session,
        user: data.user,
        token: data.session?.access_token || "",
        message: "Sign up successful",
      });
    } catch (error: any) {
      console.error("[API] Signup error:", error.message);
      return sendResponse(500, { error: error.message || "Internal server error" });
    }
  }

  // 404
  console.log("[API] 404 - Path not found:", path);
  return sendResponse(404, {
    error: "Not found",
    path,
    method,
  });
};
