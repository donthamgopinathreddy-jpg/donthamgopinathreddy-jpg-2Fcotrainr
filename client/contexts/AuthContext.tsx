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
        console.log("Checking auth state...");

        // First check if there's a session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session found:", session?.user?.email);

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          // If no session, try getUser as backup
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUser(user);
            await fetchUserProfile(user.id);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
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
      console.log("Fetching user profile for:", userId);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        console.log("User profile fetched successfully:", data);
        setUserProfile(data);
      } else {
        console.warn("No profile data found for user:", userId);
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error?.message || error);
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

        // Create user profile in users table - WAIT for this to complete
        try {
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            email,
            username: userData.username,
            full_name: userData.full_name,
            role: userData.role,
            gender: userData.gender || null,
            weight_kg: userData.weight_kg || null,
            height_cm: userData.height_cm || null,
          });

          if (profileError) {
            console.error("Profile creation error:", profileError);
          }

          // Create trainer profile if role is trainer
          if (userData.role === "trainer") {
            const { error: trainerError } = await supabase.from("trainers").insert({
              id: data.user.id,
              years_of_experience: 0,
            });
            if (trainerError) {
              console.error("Trainer profile error:", trainerError);
            }
          }
        } catch (err) {
          console.error("Profile creation error:", err);
        }

        // Wait a bit for the database to process
        await new Promise(resolve => setTimeout(resolve, 500));

        // Fetch the created profile
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      const errorMessage = error?.message || String(error);
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
      const errorMessage = error?.message || String(error);
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
