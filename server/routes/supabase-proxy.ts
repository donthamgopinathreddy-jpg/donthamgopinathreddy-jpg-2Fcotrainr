import express, { Request, Response } from "express";

const router = express.Router();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

// Use a middleware function to handle all requests
const proxyHandler = async (req: Request, res: Response) => {
  try {
    // Get the path from the request
    // Remove the /supabase-api prefix to get the actual path
    const path = req.url;
    
    // Build the full Supabase URL
    const url = new URL(`${SUPABASE_URL}${path}`);

    // Copy query parameters (they're already in req.url)
    const headers: Record<string, string> = {
      apikey: SUPABASE_ANON_KEY!,
      "Content-Type": "application/json",
    };

    // Copy authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Make the request to Supabase
    const supabaseRes = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

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

    // Send response
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Supabase proxy error:", error);
    res.status(500).json({
      error: "Failed to proxy request to Supabase",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// Handle all HTTP methods
router.get("/:path(*)", proxyHandler);
router.post("/:path(*)", proxyHandler);
router.put("/:path(*)", proxyHandler);
router.patch("/:path(*)", proxyHandler);
router.delete("/:path(*)", proxyHandler);
router.options("/:path(*)", proxyHandler);

export default router;
