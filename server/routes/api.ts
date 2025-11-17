import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

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
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Supabase API wrapper is running",
  });
});

// Auth endpoints
router.post("/auth/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing email or password",
      });
    }

    console.log("[API] Sign in attempt for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[API] Sign in error:", error);
      return res.status(401).json({
        error: error.message,
        status: error.status,
      });
    }

    console.log("[API] Sign in successful for:", email);

    res.json({
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("[API] Unexpected sign in error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
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

export default router;
