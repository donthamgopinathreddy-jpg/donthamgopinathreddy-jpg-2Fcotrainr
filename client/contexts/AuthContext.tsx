import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { authApi, setAuthToken, getAuthToken } from "@/lib/api";

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
  resetPassword: (email: string, method: "email" | "phone") => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database directly
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("[Auth] ===== FETCH USER PROFILE =====");
      console.log("[Auth] Fetching profile for User ID:", userId);

      // Skip if no user ID
      if (!userId) {
        console.warn("[Auth] No userId provided");
        return;
      }

      // Fetch directly from Supabase using the authenticated user's UUID
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[Auth] ❌ Error fetching profile from database:", error);
        console.error("[Auth] Error code:", error?.code);
        console.error("[Auth] Error message:", error?.message);
        return;
      }

      if (data) {
        console.log("[Auth] ✅ User profile fetched successfully");
        console.log("[Auth] Profile data keys:", Object.keys(data));
        console.log("[Auth] Profile ID:", data.id);
        console.log("[Auth] Profile email:", data.email);
        console.log("[Auth] Has cover_image_url:", !!data.cover_image_url);
        console.log(
          "[Auth] Has profile_picture_url:",
          !!data.profile_picture_url,
        );
        setUserProfile(data);
      }
      console.log("[Auth] ===== END FETCH =====");
    } catch (error: any) {
      console.error(
        "[Auth] ❌ Catch error fetching user profile:",
        error?.message,
      );
      // Silently fail - profile is optional
    }
  };

  // Manual token refresh with validation
  const manualRefreshToken = async () => {
    try {
      console.log("[Auth] Attempting manual token refresh...");
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.refresh_token) {
        console.warn(
          "[Auth] No refresh_token available - cannot auto-refresh, will sign out on next API call",
        );
        return;
      }

      // Manually refresh the token
      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession(currentSession);

      if (refreshError) {
        console.error("[Auth] Token refresh failed:", refreshError);
        await supabase.auth.signOut();
        setUser(null);
        setUserProfile(null);
        toast.error("Session expired. Please sign in again.");
        return;
      }

      if (refreshedSession) {
        console.log("[Auth] Token refreshed successfully");
        setUser(refreshedSession.user);
      }
    } catch (error) {
      console.error("[Auth] Manual token refresh error:", error);
      setUser(null);
      setUserProfile(null);
    }
  };

  // Subscribe to real-time profile changes
  useEffect(() => {
    if (!userProfile?.id) return;

    const channel = supabase
      .channel(`profile_${userProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${userProfile.id}`,
        },
        (payload) => {
          console.log("Profile updated in realtime:", payload);
          if (payload.new) {
            setUserProfile(payload.new as UserProfile);
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userProfile?.id]);

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
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.warn(
              "[Auth] Session check error (may be token refresh issue):",
              sessionError,
            );
            // Clear invalid session
            if (isMounted) {
              setUser(null);
              setUserProfile(null);
            }
            return;
          }

          if (isMounted) {
            if (session?.user) {
              console.log("Session found:", session.user.email);
              if (!session.refresh_token) {
                console.warn(
                  "[Auth] Session found but missing refresh_token - user may need to re-login on page reload",
                );
              }
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
        } catch (sessionError: any) {
          console.warn(
            "Session check failed, continuing without initial session:",
            sessionError?.message,
          );
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.warn("Failed to clear session after error:", signOutError);
          }
          if (isMounted) {
            setUser(null);
            setUserProfile(null);
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

          if (event === "TOKEN_REFRESH_FAILED") {
            console.error("[Auth] Token refresh failed during listener");
            toast.error("Session expired. Please sign in again.");
            if (isMounted) {
              setUser(null);
              setUserProfile(null);
            }
            return;
          }

          // Handle token refresh errors and signed out
          if (event === "SIGNED_OUT" || !session) {
            if (isMounted) {
              setUser(null);
              setUserProfile(null);
            }
            return;
          }

          if (isMounted) {
            setUser(session?.user || null);

            if (session?.user) {
              // Fetch profile without blocking
              fetchUserProfile(session.user.id).catch((err) => {
                console.warn("Profile fetch failed:", err);
              });
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleRefreshFailure = () => {
      console.warn("[Auth] Token refresh failure detected - forcing sign out");
      setUser(null);
      setUserProfile(null);
      toast.error("Session expired. Please sign in again.");
    };

    window.addEventListener(
      "supabase-token-refresh-failed",
      handleRefreshFailure,
    );
    return () => {
      window.removeEventListener(
        "supabase-token-refresh-failed",
        handleRefreshFailure,
      );
    };
  }, []);

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
      country_code?: string;
      age?: number;
      date_of_birth?: string;
    },
  ) => {
    try {
      console.log("[Auth] ========== SIGNUP START ==========");
      console.log("[Auth] Email:", email);
      console.log("[Auth] Username:", userData.username);
      console.log("[Auth] Full Name:", userData.full_name);
      console.log("[Auth] Role:", userData.role);
      console.log("[Auth] Gender:", userData.gender);
      console.log("[Auth] Phone:", userData.phone_number);
      console.log("[Auth] Height (cm):", userData.height_cm);
      console.log("[Auth] Weight (kg):", userData.weight_kg);

      const requestPayload = {
        email,
        username: userData.username,
        password,
        full_name: userData.full_name,
        gender: userData.gender,
        height: userData.height_cm,
        weight: userData.weight_kg,
        phone_number: userData.phone_number,
        country_code: userData.country_code,
        role: userData.role,
      };

      console.log(
        "[Auth] Request payload:",
        JSON.stringify(requestPayload, null, 2),
      );
      console.log("[Auth] Making POST request to /api/auth/signup");

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      console.log("[Auth] Response status:", response.status);
      console.log("[Auth] Response status text:", response.statusText);
      console.log("[Auth] Response headers:", {
        contentType: response.headers.get("content-type"),
      });

      let errorData: any = {};
      let data: any = null;

      try {
        const responseText = await response.text();
        console.log("[Auth] Raw response text:", responseText);

        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error("[Auth] Failed to parse response:", parseError);
        errorData = { message: "Invalid response from server" };
      }

      if (!response.ok) {
        console.error("[Auth] ❌ Signup failed");
        console.error("[Auth] Status code:", response.status);
        console.error("[Auth] Error data:", data || errorData);

        const errorMessage =
          data?.message ||
          data?.error ||
          errorData.message ||
          `Signup failed: ${response.statusText}`;

        console.error("[Auth] Error message:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log("[Auth] ✅ Signup response received");
      console.log("[Auth] Response data:", {
        hasUser: !!data?.user,
        userEmail: data?.user?.email,
        hasSession: !!data?.session,
        hasToken: !!data?.token,
      });

      if (!data?.user) {
        console.error("[Auth] ❌ No user in response");
        throw new Error("No user data returned from signup");
      }

      console.log("[Auth] Sign up successful for user:", data.user.email);

      // Store session and user data
      if (data.session?.access_token) {
        console.log("[Auth] Setting auth token from session");
        setAuthToken(data.session.access_token);
      } else if (data.token) {
        console.log("[Auth] Setting auth token from response");
        setAuthToken(data.token);
      } else {
        console.warn("[Auth] ⚠️ No token in response");
      }

      // Update user state
      console.log("[Auth] Updating user state");
      setUser(data.user as any);
      setUserProfile(data.user);

      console.log("[Auth] ========== SIGNUP SUCCESS ==========");
    } catch (error: any) {
      console.error("[Auth] ========== SIGNUP ERROR ==========");
      console.error("[Auth] Error type:", error?.name);
      console.error("[Auth] Error message:", error?.message);
      console.error("[Auth] Error stack:", error?.stack);
      console.error("[Auth] ========== END ERROR ==========");

      const errorMessage = error?.message || "Failed to create account";
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[Auth] Signing in user:", email);

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Call backend auth endpoint (proxies to /auth/signin on server)
      console.log("[Auth] Making fetch request to /api/auth/login");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("[Auth] Response received, status:", response.status);

      // Read response body only once
      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        console.error("[Auth] Failed to parse response:", e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        console.error("[Auth] API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });
        const errorMsg =
          data?.error ||
          data?.message ||
          `Login failed (${response.status}): ${response.statusText}`;
        throw new Error(errorMsg);
      }
      console.log("[Auth] Response JSON parsed:", {
        hasSession: !!data.session,
        hasUser: !!data.user,
        userEmail: data.user?.email,
        hasToken: !!data.token,
      });

      if (!data.user) {
        throw new Error("No user returned from login response");
      }

      console.log("[Auth] Sign in successful for user:", data.user.email);

      // Store session and user data
      if (data.session?.access_token) {
        console.log("[Auth] Setting auth token from session");
        setAuthToken(data.session.access_token);
      } else if (data.token) {
        console.log("[Auth] Setting auth token from response");
        setAuthToken(data.token);
      }

      // Update user state
      console.log("[Auth] Updating user state with:", {
        id: data.user.id,
        email: data.user.email,
      });
      setUser(data.user as any);
      setUserProfile(data.user);

      console.log("[Auth] User state updated successfully");
    } catch (error: any) {
      console.error("[Auth] Error signing in:", error);
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

      // Clear auth token from API service
      authApi.logout();

      // Clear any stored session
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("authToken");
          sessionStorage.clear();
          console.log("[Auth] Cleared auth token");
        } catch (e) {
          console.warn("Could not clear storage:", e);
        }
      }

      console.log("[Auth] Sign out completed successfully");
      return true;
    } catch (error) {
      console.error("[Auth] Unexpected sign out error:", error);
      // Still clear state even if there's an error
      setUser(null);
      setUserProfile(null);
      authApi.logout();

      // Clear storage anyway
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("authToken");
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

      console.log("[Auth] ===== PROFILE UPDATE START =====");
      console.log("[Auth] User ID (UUID):", user.id);
      console.log("[Auth] Update fields:", Object.keys(updates));

      // Update the user's profile using their authenticated UUID
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select("id, email, cover_image_url, profile_picture_url");

      console.log("[Auth] Database response:", {
        dataReceived: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
      });

      if (error) {
        // Retry on "body stream already read" error
        if (
          error?.message?.includes("body stream already read") &&
          retryCount < 2
        ) {
          console.warn(
            `[Auth] Retrying profile update (attempt ${retryCount + 1}/2)...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
          return updateProfile(updates, retryCount + 1);
        }

        console.error("[Auth] ❌ UPDATE FAILED:");
        console.error("[Auth] Code:", error?.code);
        console.error("[Auth] Message:", error?.message);
        console.error("[Auth] Details:", error?.details);
        const errorMsg =
          error?.message || JSON.stringify(error) || "Unknown error";
        throw new Error(errorMsg);
      }

      // Update local state immediately
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));

      // Log what was saved
      if (data && data[0]) {
        console.log("[Auth] ✅ UPDATE SUCCESSFUL");
        console.log("[Auth] Saved data - ID:", data[0].id);
        console.log(
          "[Auth] Saved data - Has cover_image_url:",
          !!data[0].cover_image_url,
        );
      }

      // Fetch fresh data from database to confirm save
      setTimeout(async () => {
        try {
          const { data: freshData, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (fetchError) {
            console.warn(
              "[Auth] ⚠️ Could not verify save - fetch error:",
              fetchError?.message,
            );
            return;
          }

          if (freshData) {
            console.log("[Auth] ✅ DATABASE VERIFICATION:");
            console.log(
              "[Auth] Cover image saved:",
              !!freshData.cover_image_url,
            );
            console.log(
              "[Auth] Profile picture saved:",
              !!freshData.profile_picture_url,
            );
          }
        } catch (err) {
          console.warn("[Auth] Could not verify save:", err);
        }
      }, 800);

      console.log("[Auth] ===== PROFILE UPDATE END =====");
    } catch (error: any) {
      // Retry on network errors
      if (
        error?.message?.includes("body stream already read") &&
        retryCount < 2
      ) {
        console.warn(
          `[Auth] Retrying profile update (attempt ${retryCount + 1}/2)...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        return updateProfile(updates, retryCount + 1);
      }

      const errorMsg =
        error?.message || String(error) || "Failed to update profile";
      console.error("[Auth] ❌ UPDATE ERROR:", errorMsg);
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

  const resetPassword = async (email: string, method: "email" | "phone") => {
    try {
      console.log(`[Auth] Requesting password reset via ${method} for:`, email);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          method,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Password reset failed: ${response.statusText}`,
        );
      }

      toast.success(
        `Password reset link sent to your ${method === "email" ? "email" : "phone number"}!`,
      );
      console.log("[Auth] Password reset successful");
    } catch (error: any) {
      console.error("[Auth] Error resetting password:", error);
      const errorMessage =
        error?.message || "Failed to reset password. Please try again.";
      toast.error(errorMessage);
      throw new Error(errorMessage);
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
        resetPassword,
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
