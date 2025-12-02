import serverless from "serverless-http";
import express from "express";
import apiRouter from "../../server/routes/api.js";

console.log("[Netlify] Initializing API function");
console.log("[Netlify] NODE_ENV:", process.env.NODE_ENV);
console.log("[Netlify] SUPABASE_URL:", process.env.SUPABASE_URL ? "✓" : "✗");
console.log(
  "[Netlify] SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "✓" : "✗",
);
console.log(
  "[Netlify] VITE_SUPABASE_URL:",
  process.env.VITE_SUPABASE_URL ? "✓" : "✗",
);
console.log(
  "[Netlify] VITE_SUPABASE_ANON_KEY:",
  process.env.VITE_SUPABASE_ANON_KEY ? "✓" : "✗",
);

// Create a minimal Express app for serverless
const app = express();

// Add JSON middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Add CORS headers
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
  res.header("Access-Control-Max-Age", "3600");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Add request logging
app.use((req, res, next) => {
  console.log("[Netlify] Request:", req.method, req.path);
  next();
});

// Mount API routes at root / (Netlify redirect strips /api prefix)
console.log("[Netlify] Mounting API routes");
try {
  const apiRouter = require("../../server/routes/api").default;
  app.use("/", apiRouter);
  console.log("[Netlify] API routes mounted successfully");
} catch (error) {
  console.error("[Netlify] Failed to load API routes:", error);
  // Add a fallback error handler if routes fail to load
  app.use("/", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({
      error: "API failed to initialize",
      message: error instanceof Error ? error.message : String(error),
    });
  });
}

// Catch-all 404 handler (for debugging)
app.use((req: any, res: any) => {
  console.error("[Netlify] 404 Not Found:", {
    method: req.method,
    path: req.path,
    url: req.url,
  });

  res.setHeader("Content-Type", "application/json");
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path,
    url: req.url,
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Netlify] Error handler caught:", {
    message: err?.message,
    status: err?.status || 500,
  });

  res.setHeader("Content-Type", "application/json");
  res.status(err?.status || 500).json({
    error: err?.message || "Internal server error",
    message: err?.message || "An unexpected error occurred",
  });
});

console.log("[Netlify] Express app created successfully");

const netlifyHandler = serverless(app);

// Wrap handler with error logging
export const handler = async (event: any, context: any) => {
  try {
    console.log("[Netlify] ========================================");
    console.log("[Netlify] Request received:", {
      method: event.httpMethod,
      path: event.path,
      rawPath: event.rawPath,
      headers: Object.keys(event.headers || {}),
    });
    console.log("[Netlify] ========================================");

    const response = await netlifyHandler(event, context);

    console.log("[Netlify] Response sent:", {
      statusCode: response.statusCode,
      body: response.body ? response.body.substring(0, 200) : "empty",
    });

    return response;
  } catch (error) {
    console.error("[Netlify] Handler error:", error);
    console.error(
      "[Netlify] Error details:",
      error instanceof Error ? error.stack : String(error),
    );

    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
        message: "Failed to process request",
      }),
    };
  }
};
