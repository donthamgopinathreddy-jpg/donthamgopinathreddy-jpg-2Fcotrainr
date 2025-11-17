import express, { Request, Response, NextFunction } from "express";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log("[Proxy Init] VITE_SUPABASE_URL:", SUPABASE_URL);
console.log("[Proxy Init] VITE_SUPABASE_ANON_KEY present:", !!SUPABASE_ANON_KEY);
console.log("[Proxy Init] All env vars starting with VITE:", Object.keys(process.env).filter(k => k.startsWith("VITE")));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[Proxy Init] ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

// Create middleware function that can be used with app.use()
export default function supabaseProxy(_req: Request, res: Response, next: NextFunction) {
  // This is a no-op - actual proxy logic is in the server
  next();
}

// Main proxy handler for both REST and Auth endpoints
export async function handleSupabaseProxy(req: Request, res: Response) {
  // Add CORS headers immediately
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-supabase-auth-token");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Log the incoming request
  console.log(`[Proxy] Received ${req.method} ${req.originalUrl || req.url}`);
  console.log(`[Proxy] Base URL: ${SUPABASE_URL}`);
  console.log(`[Proxy] Has anon key: ${!!SUPABASE_ANON_KEY}`);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("[Proxy] Handling CORS preflight");
    res.status(200).end();
    return;
  }

  try {
    // Get the path from the request
    // When mounted at /supabase-api/, Express strips that prefix
    let path = req.url;

    // The path at this point should be something like:
    // /rest/v1/users?select=*
    // /auth/v1/token
    // etc. (the /supabase-api prefix is already removed by Express routing)

    if (!path.startsWith("/")) {
      path = "/" + path;
    }

    // Build the full Supabase URL by appending the path
    if (!SUPABASE_URL) {
      throw new Error("VITE_SUPABASE_URL is not set");
    }

    const fullUrl = `${SUPABASE_URL}${path}`;
    console.log(`[Proxy] Full URL: ${fullUrl}`);

    const url = new URL(fullUrl);

    const headers: Record<string, string> = {
      apikey: SUPABASE_ANON_KEY!,
      "Content-Type": req.headers["content-type"] || "application/json",
    };

    // Copy relevant headers from the request
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (req.headers["x-supabase-auth-token"]) {
      headers["x-supabase-auth-token"] = req.headers["x-supabase-auth-token"] as string;
    }

    // For POST/PUT requests, parse and forward the body
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (typeof req.body === "string") {
        body = req.body;
      } else if (req.body) {
        body = JSON.stringify(req.body);
      }
    }

    // Make the request to Supabase
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (body) {
      fetchOptions.body = body;
    }

    console.log(`[Supabase Proxy] Fetching: ${url.toString()}`);

    const supabaseRes = await fetch(url.toString(), fetchOptions);

    // Get the response body
    const buffer = await supabaseRes.arrayBuffer();

    // Set status
    res.status(supabaseRes.status);

    // Copy relevant response headers
    supabaseRes.headers.forEach((value, key) => {
      // Skip sensitive headers and ones we've already set
      if (!["set-cookie", "connection", "transfer-encoding", "access-control-allow-origin", "access-control-allow-methods", "access-control-allow-headers"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    console.log(`[Supabase Proxy] Response: ${supabaseRes.status}`);

    // Send response
    res.send(Buffer.from(buffer));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("[Supabase Proxy] Error:", errorMsg);
    console.error("[Supabase Proxy] Stack:", errorStack);

    res.status(500).json({
      error: "Failed to proxy request to Supabase",
      details: errorMsg,
      path: req.url,
      method: req.method,
    });
  }
}
