import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or Anon Key. Check your environment variables."
  );
}

// Custom storage adapter for Capacitor
class CapacitorStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      // Try Capacitor storage first (native)
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        const { Preferences } = (window as any).Capacitor.Plugins;
        if (Preferences) {
          const { value } = await Preferences.get({ key });
          return value || null;
        }
      }
      // Fallback to localStorage for web
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Storage get error:", error);
      return localStorage.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Try Capacitor storage first (native)
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        const { Preferences } = (window as any).Capacitor.Plugins;
        if (Preferences) {
          await Preferences.set({ key, value });
          return;
        }
      }
      // Fallback to localStorage for web
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Storage set error:", error);
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      // Try Capacitor storage first (native)
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        const { Preferences } = (window as any).Capacitor.Plugins;
        if (Preferences) {
          await Preferences.remove({ key });
          return;
        }
      }
      // Fallback to localStorage for web
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Storage remove error:", error);
      localStorage.removeItem(key);
    }
  }
}

const storage = new CapacitorStorage();

// Create client with proper storage for both web and native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: storage as any,
  },
  global: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});
