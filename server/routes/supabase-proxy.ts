import express, { Request, Response } from "express";

const router = express.Router();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

// Proxy all requests to Supabase REST API
router.all("*", async (req: Request, res: Response) => {
  try {
    const path = req.baseUrl.replace("/supabase-api", "") || req.url;
    // Build the full Supabase URL
    const url = new URL(`${SUPABASE_URL}${path}`);

    // Copy query parameters
    Object.entries(req.query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    // Prepare headers
    const headers: Record<string, string> = {
      apikey: SUPABASE_ANON_KEY!,
      "Content-Type": "application/json",
      Authorization: "",
    };

    // Copy relevant headers from request
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Make the request to Supabase
    const supabaseRes = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

    // Copy response headers (except sensitive ones)
    const responseHeaders = new Headers(supabaseRes.headers);
    responseHeaders.delete("set-cookie");
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    // Stream the response
    const buffer = await supabaseRes.arrayBuffer();
    res.status(supabaseRes.status);

    // Set response headers
    responseHeaders.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Supabase proxy error:", error);
    res.status(500).json({
      error: "Failed to proxy request to Supabase",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
