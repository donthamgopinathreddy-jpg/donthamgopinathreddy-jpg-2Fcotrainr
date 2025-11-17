import serverless from "serverless-http";
import { createServer } from "../../server";

console.log("[Netlify] Initializing API function");
console.log("[Netlify] NODE_ENV:", process.env.NODE_ENV);
console.log("[Netlify] VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL ? "✓" : "✗");
console.log("[Netlify] VITE_SUPABASE_ANON_KEY:", process.env.VITE_SUPABASE_ANON_KEY ? "✓" : "✗");

let app: any = null;

try {
  app = createServer();
  console.log("[Netlify] Express app created successfully");
} catch (error) {
  console.error("[Netlify] Failed to create Express app:", error);
  throw error;
}

const netlifyHandler = serverless(app);

// Wrap handler with error logging
export const handler = async (event: any, context: any) => {
  try {
    console.log("[Netlify] Request received:", {
      method: event.httpMethod,
      path: event.path,
      headers: Object.keys(event.headers || {}),
    });

    const response = await netlifyHandler(event, context);

    console.log("[Netlify] Response sent:", {
      statusCode: response.statusCode,
    });

    return response;
  } catch (error) {
    console.error("[Netlify] Handler error:", error);
    console.error("[Netlify] Error details:", error instanceof Error ? error.stack : String(error));

    return {
      statusCode: 502,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
    };
  }
};
