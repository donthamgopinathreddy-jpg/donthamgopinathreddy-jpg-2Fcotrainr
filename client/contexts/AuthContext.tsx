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

  // Check auth state on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking auth state...");

        // Set a timeout of 8 seconds for auth check (Supabase can be slow on Fly.dev)
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.warn("Auth check timeout - proceeding without session");
            resolve(null);
          }, 8000);
        });

        const authPromise = (async () => {
          // First check if there's a session
          const {
            data: { session },
          } = await supabase.auth.getSession();
          console.log("Session found:", session?.user?.email);

          if (session?.user) {
            if (isMounted) {
              setUser(session.user);
            }
            await fetchUserProfile(session.user.id);
          } else {
            // If no session, try getUser as backup
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              if (isMounted) {
                setUser(user);
              }
              await fetchUserProfile(user.id);
            } else {
              if (isMounted) {
                setUser(null);
              }
            }
          }
        })();

        // Race between auth check and timeout
        await Promise.race([authPromise, timeoutPromise]);
      } catch (error) {
        console.error("Error checking auth:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          // Mark loading as done AFTER auth check completes
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
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

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        const errorMsg = error?.message || error?.details || String(error);
        console.debug("Error fetching user profile:", errorMsg);
        return;
      }

      if (data) {
        console.debug("User profile fetched successfully:", data);
        setUserProfile(data);
      }
    } catch (error: any) {
      // Silently continue - app works without profile data initially
      console.debug("Profile fetch error (non-blocking):", error?.message);
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

      // Use our API wrapper instead of calling Supabase directly
      console.log("[Auth] Sending request to /api/supabase/auth/signin");

      const response = await fetch("/api/supabase/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("[Auth] Received response with status:", response.status);

      if (!response.ok) {
        console.log("[Auth] Response not ok, parsing error...");
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error("[Auth] Could not parse error response as JSON");
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.error("[Auth] Sign in error from API:", errorData);
        throw new Error(errorData.error || "Sign in failed");
      }

      const { session, user } = await response.json();

      console.log("[Auth] Sign in successful for user:", user?.email);

      if (session) {
        // Store the session in Supabase client
        await supabase.auth.setSession(session);
      }

      if (user) {
        setUser(user);
        await fetchUserProfile(user.id);
      }
    } catch (error: any) {
      console.error("[Auth] Error signing in:", error);
      console.error("[Auth] Error type:", error?.name);
      console.error("[Auth] Error message:", error?.message);
      const errorMessage = error?.message || String(error);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      // Try to logout from Supabase, but don't fail if it errors
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (signoutError) {
        console.warn("Supabase signOut error (non-critical):", signoutError);
        // Continue anyway - we'll still clear local state
      }
    } finally {
      // Always clear local auth state, regardless of server response
      setUser(null);
      setUserProfile(null);

      // Also clear any stored session
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("supabase.auth.token");
        } catch (e) {
          console.warn("Could not clear localStorage:", e);
        }
      }
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
