import express, { Request, Response, NextFunction } from "express";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
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

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Get the path from the request
    let path = req.url;

    // The path at this point might be something like:
    // /rest/v1/users?select=*
    // /auth/v1/token
    // etc. (the /supabase-api prefix is already removed by Express routing)

    // Build the full Supabase URL by appending the path
    const url = new URL(`${SUPABASE_URL}${path}`);

    console.log(`[Supabase Proxy] ${req.method} ${path} -> ${url.href}`);

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
      // Skip sensitive headers
      if (!["set-cookie", "connection", "transfer-encoding"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Add CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");

    console.log(`[Supabase Proxy] Response: ${supabaseRes.status}`);

    // Send response
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("[Supabase Proxy] Error:", error);
    res.status(500).json({
      error: "Failed to proxy request to Supabase",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
