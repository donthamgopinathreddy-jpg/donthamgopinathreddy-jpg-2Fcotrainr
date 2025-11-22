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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log("[API] Initializing Supabase API wrapper");
console.log("[API] Environment check:");
console.log(
  "[API] VITE_SUPABASE_URL:",
  process.env.VITE_SUPABASE_URL ? "set" : "not set",
);
console.log(
  "[API] SUPABASE_URL:",
  process.env.SUPABASE_URL ? "set" : "not set",
);
console.log("[API] Final SUPABASE_URL:", SUPABASE_URL ? "set" : "not set");
console.log(
  "[API] VITE_SUPABASE_ANON_KEY:",
  process.env.VITE_SUPABASE_ANON_KEY ? "set" : "not set",
);
console.log(
  "[API] SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "set" : "not set",
);
console.log(
  "[API] Final SUPABASE_ANON_KEY:",
  SUPABASE_ANON_KEY ? "set" : "not set",
);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const errorMsg = `[API] Missing Supabase configuration. SUPABASE_URL: ${!!SUPABASE_URL}, SUPABASE_ANON_KEY: ${!!SUPABASE_ANON_KEY}`;
  console.error(errorMsg);
  console.error(
    "[API] Available env vars:",
    Object.keys(process.env).filter(
      (k) => k.includes("SUPABASE") || k.includes("VITE"),
    ),
  );
  throw new Error(errorMsg);
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
  try {
    console.log("[API] Sign in endpoint called");

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("[API] Missing email or password");
      return res.status(400).json({
        error: "Missing email or password",
      });
    }

    console.log("[API] Sign in attempt for:", email);

    // Call Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[API] Sign in error:", error.message);
      return res.status(401).json({
        error: error.message || "Authentication failed",
      });
    }

    if (!data?.user) {
      console.error("[API] No user returned from auth");
      return res.status(401).json({
        error: "Authentication failed",
      });
    }

    console.log("[API] Sign in successful for:", email);
    console.log("[API] Returning user and session");

    // Ensure we're sending valid JSON
    const responseObj = {
      session: data.session,
      user: data.user,
    };

    console.log("[API] Response object prepared:", {
      hasSession: !!responseObj.session,
      hasUser: !!responseObj.user,
      userEmail: responseObj.user?.email,
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(responseObj);
  } catch (error) {
    console.error("[API] Sign in error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("[API] Sending error response:", message);

    res.setHeader("Content-Type", "application/json");
    res.status(500).json({
      error: message,
    });
  }
});

// Sign up endpoint
router.post("/auth/signup", async (req: Request, res: Response) => {
  try {
    console.log("[API] Sign up endpoint called");
    console.log("[API] Request body:", JSON.stringify(req.body, null, 2));

    const { email, password, options, role = "client" } = req.body;

    if (!email || !password) {
      console.log("[API] Missing email or password for signup");
      return res.status(400).json({
        error: "Missing email or password",
      });
    }

    console.log("[API] Sign up attempt for:", email, "with role:", role);

    console.log("[API] Calling Supabase auth.signUp...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.data || {},
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      console.error("[API] Supabase auth signup error:", {
        message: error.message,
        status: error.status,
        code: (error as any).code,
        details: (error as any).details,
      });
      return res.status(400).json({
        error: error.message || "Authentication failed",
        status: error.status,
        details: (error as any).details,
      });
    }

    console.log("[API] Supabase auth response:", {
      userId: data.user?.id,
      userEmail: data.user?.email,
      sessionExists: !!data.session,
    });

    const userId = data.user?.id;
    if (!userId) {
      console.error("[API] No user ID in auth response");
      return res.status(400).json({
        error: "No user ID returned from auth",
      });
    }

    console.log("[API] Sign up successful for:", email);

    // Create user profile in database (server-side with full permissions)
    try {
      console.log("[API] Creating user profile in database...");
      const profileData = {
        id: userId,
        email,
        username: options?.data?.username || email.split("@")[0],
        full_name: options?.data?.full_name || "",
        role: options?.data?.role || "client",
        gender: options?.data?.gender || null,
        weight_kg: options?.data?.weight_kg || null,
        height_cm: options?.data?.height_cm || null,
        phone_number: options?.data?.phone_number || null,
        age: options?.data?.age || null,
        date_of_birth: options?.data?.date_of_birth || null,
      };

      const { error: profileError } = await supabase.from("users").insert([
        profileData,
      ]);

      if (profileError) {
        console.error("[API] Profile creation error:", profileError);
        // Don't fail - user is already created in auth
        console.warn(
          "[API] Profile creation failed but auth was successful, continuing...",
        );
      } else {
        console.log("[API] User profile created successfully");
      }
    } catch (profileErr: any) {
      console.error("[API] Unexpected error creating profile:", profileErr);
      // Don't fail - user is already created in auth
    }

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

// Get user profile endpoint
router.get("/users/profile", async (req: Request, res: Response) => {
  try {
    console.log("[API] Get user profile endpoint called");

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

    // First get the current user from auth
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      console.error("[API] Error getting auth user:", authError?.message);
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    console.log("[API] Fetching profile for user:", user.id);

    // Fetch user profile from users table
    const { data, error } = await userClient
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("[API] Error fetching user profile:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return res.status(400).json({
        error: error.message || "Failed to fetch user profile",
      });
    }

    console.log("[API] Successfully fetched user profile for:", user.id);

    res.json({
      data,
    });
  } catch (error) {
    console.error("[API] Unexpected error in get profile:", error);
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
