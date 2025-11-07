import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: "client" | "trainer";
  gender?: string;
  weight_kg?: number;
  height_cm?: number;
  profile_picture_url?: string;
  cover_image_url?: string;
  bio?: string;
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user || null);

        if (user) {
          await fetchUserProfile(user.id);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        // Create a default profile if fetch fails
        setUserProfile({
          id: userId,
          username: "user",
          full_name: "User",
          email: "",
          role: "client",
        });
        return;
      }
      setUserProfile(data);
    } catch (error: any) {
      console.error("Error fetching user profile:", error?.message || error);
      // Create a default profile if fetch fails
      setUserProfile({
        id: userId,
        username: "user",
        full_name: "User",
        email: "",
        role: "client",
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
    }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);

        // Create user profile in users table asynchronously
        // Don't wait for this to complete to avoid blocking signup
        supabase.from("users").insert({
          id: data.user.id,
          email,
          username: userData.username,
          full_name: userData.full_name,
          role: userData.role,
          gender: userData.gender,
          weight_kg: userData.weight_kg,
          height_cm: userData.height_cm,
        }).then(({ error: profileError }) => {
          if (profileError) {
            console.error("Profile creation error:", profileError?.message || JSON.stringify(profileError));
          } else if (userData.role === "trainer") {
            // Create trainer profile
            supabase.from("trainers").insert({
              id: data.user.id,
            }).catch((err) => console.error("Trainer profile error:", err?.message || err));
          }
        }).catch((err) => {
          console.error("Profile insert catch error:", err?.message || err);
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      const errorMessage = error?.message || JSON.stringify(error);
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      const errorMessage = error?.message || JSON.stringify(error);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
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
        email: role === "trainer" ? "demo-trainer@cotrainr.app" : "demo@cotrainr.app",
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
        email: role === "trainer" ? "demo-trainer@cotrainr.app" : "demo@cotrainr.app",
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
