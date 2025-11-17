import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Simple test endpoint to verify the API is working
router.get("/test", (_req: Request, res: Response) => {
  console.log("[API] Test endpoint called");
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log("[API] Initializing Supabase API wrapper");
console.log("[API] SUPABASE_URL:", SUPABASE_URL);
console.log("[API] SUPABASE_ANON_KEY present:", !!SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

// Create a Supabase client on the server side
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Health check
router.get("/health", async (_req: Request, res: Response) => {
  try {
    console.log("[API] Health check requested");

    // Test if we can reach Supabase
    console.log("[API] Testing Supabase connectivity...");

    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });

    console.log(
      "[API] Supabase connectivity test status:",
      testResponse.status,
    );

    res.json({
      status: "ok",
      message: "Supabase API wrapper is running",
      supabase_reachable: testResponse.ok,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API] Health check error:", error);
    res.status(500).json({
      status: "error",
      message: "Supabase API wrapper health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Auth endpoints
router.post("/auth/signin", async (req: Request, res: Response) => {
  console.log("[API] ===== SIGN IN REQUEST RECEIVED =====");
  console.log("[API] Method:", req.method);
  console.log("[API] Path:", req.path);
  console.log("[API] Headers:", {
    "content-type": req.headers["content-type"],
    "content-length": req.headers["content-length"],
  });

  try {
    console.log("[API] Parsing request body...");
    const { email, password } = req.body;

    console.log("[API] Request body parsed:");
    console.log("[API] Email provided:", !!email);
    console.log("[API] Password provided:", !!password);

    if (!email || !password) {
      console.error("[API] ❌ Missing email or password in request");
      console.error("[API] Received body:", JSON.stringify(req.body));
      return res.status(400).json({
        error: "Missing email or password",
      });
    }

    console.log("[API] ✓ Sign in attempt for:", email);
    console.log("[API] Supabase URL configured:", !!SUPABASE_URL);
    console.log("[API] Supabase Key configured:", !!SUPABASE_ANON_KEY);

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[API] ❌ Missing Supabase configuration");
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    console.log("[API] Calling Supabase auth.signInWithPassword...");

    // Call Supabase auth with timeout protection
    const timeoutMs = 8000; // 8 second timeout
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Supabase auth request timeout")),
        timeoutMs,
      );
    });

    let result: any;
    try {
      result = await Promise.race([authPromise, timeoutPromise]);
    } catch (timeoutError) {
      console.error("[API] Auth timeout error:", timeoutError);
      return res.status(504).json({
        error: "Authentication service timeout - please try again",
      });
    }

    console.log("[API] Supabase response received");
    console.log("[API] Has error:", !!result.error);
    console.log("[API] Has user:", !!result.data?.user);

    const { data, error } = result;

    // Check for errors
    if (error) {
      console.error("[API] ❌ Sign in error from Supabase:", {
        message: error.message,
        status: error.status,
        code: (error as any).code,
      });

      return res.status(401).json({
        error: error.message || "Authentication failed",
        status: error.status,
      });
    }

    // Verify we got a valid user
    if (!data || !data.user) {
      console.error("[API] ❌ Sign in returned empty user data");
      return res.status(401).json({
        error: "Authentication failed - no user returned",
      });
    }

    console.log("[API] ✓ Sign in successful for:", email);
    console.log("[API] User ID:", data.user.id);
    console.log("[API] Session exists:", !!data.session);

    res.json({
      session: data.session,
      user: data.user,
    });

    console.log("[API] ===== SIGN IN RESPONSE SENT =====");
  } catch (error) {
    console.error("[API] ❌ ===== UNEXPECTED ERROR =====");
    console.error("[API] Error:", error);
    console.error("[API] Error type:", typeof error);
    console.error("[API] Error instanceof Error:", error instanceof Error);

    if (error instanceof Error) {
      console.error("[API] Error name:", error.name);
      console.error("[API] Error message:", error.message);
      console.error("[API] Error stack:", error.stack);
    }

    const statusCode = (error as any)?.status || 500;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("[API] Sending error response:", {
      status: statusCode,
      error: errorMessage,
    });

    res.status(statusCode).json({
      error: errorMessage || "Unknown error",
    });

    console.log("[API] ===== ERROR RESPONSE SENT =====");
  }
});

// Sign up endpoint
router.post("/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, options } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing email or password",
      });
    }

    console.log("[API] Sign up attempt for:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      console.error("[API] Sign up error:", error);
      return res.status(400).json({
        error: error.message,
        status: error.status,
      });
    }

    console.log("[API] Sign up successful for:", email);

    res.json({
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("[API] Unexpected sign up error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Sign out endpoint
router.post("/auth/signout", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({
        error: "Missing authorization header",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create a client with the user's session
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { error } = await userClient.auth.signOut();

    if (error) {
      console.error("[API] Sign out error:", error);
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message: "Signed out successfully",
    });
  } catch (error) {
    console.error("[API] Unexpected sign out error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Notifications endpoint
router.get("/notifications", async (req: Request, res: Response) => {
  try {
    console.log("[API] Notifications endpoint called");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Missing authorization header",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create a client with the user's session
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Fetch notifications with timeout
    const timeoutPromise = new Promise<any>((_, reject) => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error("Notifications fetch timeout"));
      }, 15000);
    });

    const fetchPromise = (async () => {
      try {
        const { data, error } = await userClient
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.error("[API] Supabase notifications error:", error);
        }

        return { data, error };
      } catch (fetchError) {
        console.error("[API] Notifications fetch caught error:", fetchError);
        return {
          data: null,
          error:
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError),
        };
      }
    })();

    try {
      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as any;

      if (response.error) {
        console.error("[API] Notifications fetch error:", response.error);
        // On error, return empty array to prevent app crashes
        return res.json({
          data: [],
        });
      }

      console.log(
        "[API] Notifications fetched successfully, count:",
        response.data?.length || 0,
      );

      res.json({
        data: response.data || [],
      });
    } catch (raceError) {
      console.error("[API] Notifications race error:", raceError);
      // Return empty array instead of error to prevent app crashes
      res.json({
        data: [],
      });
    }
  } catch (error) {
    console.error("[API] Unexpected notifications error:", error);
    console.error("[API] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
    });
    // Return empty array instead of error to prevent app crashes
    res.json({
      data: [],
    });
  }
});

export default router;
