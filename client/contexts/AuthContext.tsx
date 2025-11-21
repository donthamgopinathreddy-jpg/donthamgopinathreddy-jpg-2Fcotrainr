import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: "client" | "trainer" | "admin";
  gender?: string;
  weight_kg?: number;
  height_cm?: number;
  profile_picture_url?: string;
  cover_image_url?: string;
  bio?: string;
  phone_number?: string;
  age?: number;
  date_of_birth?: string;
  subscription_plan?: "free" | "basic" | "premium";
}

interface DemoUser {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    role?: string;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  demoMode: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount and listen for changes
  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");

        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn(
              "Auth initialization timeout - forcing load state to false",
            );
            setLoading(false);
          }
        }, 5000);

        // First check if there's already a session
        try {
          console.log("[Auth] Checking for existing session...");
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (isMounted) {
            if (session?.user) {
              console.log("Session found:", session.user.email);
              setUser(session.user);
              // Fetch profile asynchronously without blocking initialization
              fetchUserProfile(session.user.id).catch((err) =>
                console.error("Profile fetch error:", err),
              );
            } else {
              console.log("[Auth] No session found - user will need to login");
              setUser(null);
            }
          }
        } catch (sessionError) {
          console.warn(
            "Session check failed, continuing without initial session:",
            sessionError,
          );
          if (isMounted) {
            setUser(null);
          }
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth state on mount
    initializeAuth();

    // Listen for auth state changes
    const setupAuthListener = () => {
      try {
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, session?.user?.email);
          if (isMounted) {
            setUser(session?.user || null);

            if (session?.user) {
              // Fetch profile without blocking
              fetchUserProfile(session.user.id);
            } else {
              setUserProfile(null);
            }
          }
        });

        subscription = authSubscription;
      } catch (error) {
        console.error("Error setting up auth listener:", error);
      }
    };

    setupAuthListener();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);

      // Skip if no user ID
      if (!userId) return;

      // Get current session (should have access token)
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        console.warn("No access token available - cannot fetch profile");
        return;
      }

      // Fetch user profile from API
      const response = await fetch("/api/supabase/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user profile:", response.status);
        return;
      }

      const result = await response.json();

      if (result.data) {
        console.log("User profile fetched successfully");
        setUserProfile(result.data);
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error?.message);
      // Silently fail - profile is optional
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      username: string;
      full_name: string;
      role: "client" | "trainer";
      gender?: string;
      weight_kg?: number;
      height_cm?: number;
      phone_number?: string;
      age?: number;
      date_of_birth?: string;
    },
  ) => {
    try {
      // Use our API wrapper for sign up
      const response = await fetch("/api/supabase/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          options: {
            data: {
              username: userData.username,
              full_name: userData.full_name,
              role: userData.role,
              gender: userData.gender,
              weight_kg: userData.weight_kg,
              height_cm: userData.height_cm,
              phone_number: userData.phone_number,
              age: userData.age,
              date_of_birth: userData.date_of_birth,
            },
          },
        }),
      });

      let responseData: any = {};

      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error("Sign up: Could not parse response as JSON:", parseError);
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: Could not parse response`);
        }
        responseData = {};
      }

      if (!response.ok) {
        const errorMsg = responseData.error || "Sign up failed";
        console.error("Sign up error:", errorMsg);
        throw new Error(errorMsg);
      }

      const { session, user } = responseData;

      if (user) {
        setUser(user);

        // Set the session in Supabase client
        if (session) {
          await supabase.auth.setSession(session);
        }

        // Server has already created the profile during signup
        // Just wait a bit for database replication
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch the created profile (async, non-blocking)
        fetchUserProfile(user.id);

        // Create trainer profile if role is trainer (server handles users table, but trainers table needs separate entry)
        if (userData.role === "trainer") {
          try {
            const { error: trainerError } = await supabase
              .from("trainers")
              .insert({
                id: user.id,
                years_of_experience: 0,
              });
            if (trainerError) {
              console.warn("Trainer profile creation error:", trainerError?.message);
            }
          } catch (err: any) {
            console.warn("Trainer profile creation error:", err?.message);
          }
        }
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      const errorMessage = error?.message || String(error);
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[Auth] Signing in user:", email);

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Use our API wrapper instead of calling Supabase directly
      console.log("[Auth] Sending request to /api/supabase/auth/signin");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch("/api/supabase/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("[Auth] Received response with status:", response.status);

        // Parse the response directly - this reads the stream only once
        let responseData: any = {};

        try {
          // Try to parse as JSON first
          responseData = await response.json();
          console.log("[Auth] Parsed JSON successfully");
        } catch (parseError) {
          console.error("[Auth] Could not parse response as JSON:", parseError);
          // If JSON parsing fails and response is not ok, we'll throw below
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: Could not parse response`);
          }
          responseData = {};
        }

        // Check if response was successful
        if (!response.ok) {
          const errorMessage = responseData?.error || `Sign in failed (${response.status})`;
          throw new Error(errorMessage);
        }

        const { session, user } = responseData;

        if (!user) {
          throw new Error("No user data returned from server");
        }

        console.log("[Auth] Sign in successful for user:", user.email);
        console.log("[Auth] Session received:", {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          user_id: user.id,
        });

        // Update user state immediately for responsive navigation
        setUser(user);

        if (session) {
          // Store the session in Supabase client
          try {
            console.log("[Auth] Setting session in Supabase client...");
            const result = await supabase.auth.setSession(session);
            console.log("[Auth] Session set, result:", {
              hasUser: !!result.data?.user,
              user_id: result.data?.user?.id,
              hasSession: !!result.data?.session,
            });

            // Verify session was set
            const {
              data: { session: verifySession },
            } = await supabase.auth.getSession();
            console.log("[Auth] Verified session after setSession:", {
              hasSession: !!verifySession,
              hasAccessToken: !!verifySession?.access_token,
            });
          } catch (sessionError: any) {
            console.error("[Auth] Error setting session:", {
              message: sessionError?.message,
              cause: sessionError?.cause,
            });
            // Continue anyway - user state is still valid
          }
        } else {
          console.warn("[Auth] No session returned from API");
        }

        // Fetch profile with improved logging (async, non-blocking)
        console.log("[Auth] Fetching user profile for:", user.id);
        fetchUserProfile(user.id);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === "AbortError") {
          throw new Error("Sign in request timed out - please try again");
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error("[Auth] Error signing in:", error);
      console.error("[Auth] Error type:", error?.name);
      console.error("[Auth] Error message:", error?.message);
      const errorMessage = error?.message || "Sign in failed";
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      console.log("[Auth] Starting sign out process");

      // Clear local auth state immediately (first priority)
      console.log("[Auth] Clearing local auth state");
      setUser(null);
      setUserProfile(null);

      // Clear any stored session
      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
          console.log("[Auth] Cleared all localStorage and sessionStorage");
        } catch (e) {
          console.warn("Could not clear storage:", e);
        }
      }

      // Try to logout from Supabase (this may fail if already logged out)
      try {
        await supabase.auth.signOut({ scope: "local" });
        console.log("[Auth] Supabase signOut completed");
      } catch (signoutError) {
        console.warn("Supabase signOut error (non-critical):", signoutError);
        // Continue anyway - local state is already cleared
      }

      console.log("[Auth] Sign out completed successfully");
      return true;
    } catch (error) {
      console.error("[Auth] Unexpected sign out error:", error);
      // Still clear state even if there's an error
      setUser(null);
      setUserProfile(null);

      // Clear storage anyway
      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.warn("Could not clear storage on error:", e);
        }
      }
      throw error;
    }
  };

  const updateProfile = async (
    updates: Partial<UserProfile>,
    retryCount = 0,
  ) => {
    try {
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        // Retry on "body stream already read" error
        if (
          error?.message?.includes("body stream already read") &&
          retryCount < 2
        ) {
          console.warn(`Profile update retry attempt ${retryCount + 1}/2`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          return updateProfile(updates, retryCount + 1);
        }

        const errorMsg =
          error?.message ||
          error?.details ||
          JSON.stringify(error) ||
          "Unknown error";
        throw new Error(errorMsg);
      }

      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error: any) {
      // Retry on network errors
      if (
        error?.message?.includes("body stream already read") &&
        retryCount < 2
      ) {
        console.warn(`Profile update retry attempt ${retryCount + 1}/2`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return updateProfile(updates, retryCount + 1);
      }

      const errorMsg =
        error?.message || String(error) || "Failed to update profile";
      console.error("Error updating profile:", errorMsg);
      throw new Error(errorMsg);
    }
  };

  const demoMode = async (role: "client" | "trainer" = "client") => {
    // Demo mode is only available in development
    if (!import.meta.env.DEV) {
      throw new Error("Demo mode is not available in production");
    }

    try {
      // Create a demo user object
      const demoUser: DemoUser = {
        id: "demo-user-" + Math.random().toString(36).substring(7),
        email:
          role === "trainer"
            ? "demo-trainer@cotrainr.app"
            : "demo@cotrainr.app",
        user_metadata: {
          username: role === "trainer" ? "demo_trainer" : "demo_user",
          full_name: role === "trainer" ? "Demo Trainer" : "Demo User",
          role,
        },
      };

      const demoProfile: UserProfile = {
        id: demoUser.id,
        username: role === "trainer" ? "demo_trainer" : "demo_user",
        full_name: role === "trainer" ? "Demo Trainer" : "Demo User",
        email:
          role === "trainer"
            ? "demo-trainer@cotrainr.app"
            : "demo@cotrainr.app",
        role,
        gender: role === "trainer" ? "male" : "male",
        weight_kg: 75,
        height_cm: 180,
      };

      // Set demo user (use any to bypass User type)
      setUser(demoUser as any);
      setUserProfile(demoProfile);
    } catch (error) {
      console.error("Error entering demo mode:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        demoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
