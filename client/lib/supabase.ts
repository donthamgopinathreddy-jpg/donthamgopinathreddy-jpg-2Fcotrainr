import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or Anon Key. Check your environment variables."
  );
}

// For Capacitor native apps, we need to use Preferences instead of localStorage
let storageImpl: any = localStorage;

// Check if we're in a Capacitor environment
if (typeof window !== "undefined" && (window as any).Capacitor) {
  try {
    const { Preferences } = (window as any).Capacitor.Plugins;
    if (Preferences) {
      storageImpl = {
        getItem: (key: string) => Preferences.get({ key }).then((result: any) => result.value),
        setItem: (key: string, value: string) => Preferences.set({ key, value }),
        removeItem: (key: string) => Preferences.remove({ key }),
      };
    }
  } catch (error) {
    console.warn("Could not initialize Capacitor storage, falling back to localStorage");
  }
}

// Create client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: storageImpl,
    detectSessionInUrl: true,
  },
});
