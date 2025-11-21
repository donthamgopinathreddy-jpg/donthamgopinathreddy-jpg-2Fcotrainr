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
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (isMounted) {
            console.log("Session found:", session?.user?.email);
            if (session?.user) {
              setUser(session.user);
              await fetchUserProfile(session.user.id);
            } else {
              // If no session, try getUser as backup
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (user) {
                setUser(user);
                await fetchUserProfile(user.id);
              } else {
                setUser(null);
              }
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
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.email);
          if (isMounted) {
            setUser(session?.user || null);

            if (session?.user) {
              await fetchUserProfile(session.user.id);
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

      // Check current auth state
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      console.log(
        "Current session when fetching profile:",
        currentSession ? "exists" : "missing",
      );

      if (!currentSession?.access_token) {
        console.warn(
          "No access token in session - cannot fetch profile yet",
        );
        return;
      }

      // Use API endpoint to fetch profile with proper server-side authentication
      console.log(
        "[Auth] Fetching profile from API with access token:",
        currentSession.access_token.substring(0, 20) + "...",
      );

      const response = await fetch("/api/supabase/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("API error fetching user profile:", {
          status: response.status,
          error: result.error,
        });
        // Non-blocking error - continue without profile data
        return;
      }

      if (result.data) {
        console.log("User profile fetched successfully:", {
          id: result.data.id,
          email: result.data.email,
          username: result.data.username,
          role: result.data.role,
        });
        setUserProfile(result.data);
      } else {
        console.warn("No profile data returned from API for user:", userId);
      }
    } catch (error: any) {
      console.error("Profile fetch exception:", {
        message: error?.message,
        stack: error?.stack,
      });
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
            },
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error || "Sign up failed";
        console.error("Sign up error:", errorMsg);
        throw new Error(errorMsg);
      }

      const { session, user } = await response.json();

      if (user) {
        setUser(user);

        // Set the session in Supabase client
        if (session) {
          await supabase.auth.setSession(session);
        }

        // Create user profile in users table
        try {
          const { error: profileError } = await supabase.from("users").insert({
            id: user.id,
            email,
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role,
            gender: userData.gender || null,
            weight_kg: userData.weight_kg || null,
            height_cm: userData.height_cm || null,
            phone_number: userData.phone_number || null,
            age: userData.age || null,
            date_of_birth: userData.date_of_birth || null,
          });

          if (profileError) {
            const errorMsg =
              profileError?.message ||
              profileError?.details ||
              String(profileError);
            console.warn("Profile creation error:", errorMsg);
          }

          // Create trainer profile if role is trainer
          if (userData.role === "trainer") {
            const { error: trainerError } = await supabase
              .from("trainers")
              .insert({
                id: user.id,
                years_of_experience: 0,
              });
            if (trainerError) {
              const errorMsg =
                trainerError?.message ||
                trainerError?.details ||
                String(trainerError);
              console.warn("Trainer profile error:", errorMsg);
            }
          }
        } catch (err: any) {
          const errorMsg = err?.message || String(err);
          console.warn("Profile creation error:", errorMsg);
        }

        // Wait a bit for the database to process
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch the created profile
        await fetchUserProfile(user.id);
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

      // Test API connectivity first
      try {
        console.log("[Auth] Testing API connectivity with ping endpoint");
        const pingResponse = await fetch("/api/ping", { method: "GET" });
        console.log("[Auth] Ping response status:", pingResponse.status);
        if (!pingResponse.ok) {
          console.warn("[Auth] API ping failed with status:", pingResponse.status);
        }
      } catch (pingError) {
        console.error("[Auth] API connectivity test failed:", pingError);
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

        // Read response body ONLY ONCE - directly as JSON
        let responseData: any;
        try {
          // Simply parse the JSON - don't check headers or do anything else that might consume the stream
          responseData = await response.json();
          console.log("[Auth] Successfully parsed JSON response");
        } catch (parseError) {
          console.error("[Auth] Could not parse response as JSON:", parseError instanceof Error ? parseError.message : String(parseError));
          console.error("[Auth] Response status:", response.status);
          console.error("[Auth] Content-Type:", response.headers.get("content-type"));
          throw new Error(`Invalid response from server: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
        }

        // Check if response was successful (this doesn't consume the body)
        if (!response.ok) {
          console.error("[Auth] Sign in error from API (status: " + response.status + "):", responseData);
          const errorMessage =
            responseData?.error || `Sign in failed (${response.status})`;
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

        // Fetch profile with improved logging
        console.log("[Auth] Fetching user profile for:", user.id);
        await fetchUserProfile(user.id);
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
