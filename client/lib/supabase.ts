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

// Custom fetch to handle proxy/middleware response body issues
const customFetch = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        ...options?.headers,
        // Add headers to prevent proxy interference
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    // Handle response body reading issues
    if (!response.ok && response.status >= 500) {
      // Clone the response to avoid "body already read" issues
      const cloned = response.clone();
      const text = await cloned.text();
      throw new Error(`Server error ${response.status}: ${text}`);
    }

    return response;
  } catch (error: any) {
    // Log fetch errors for debugging
    console.error("Fetch error:", error);
    throw error;
  }
};

// Create client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: storageImpl,
    detectSessionInUrl: true,
    flowType: "implicit",
  },
  global: {
    fetch: customFetch,
    headers: {
      "Cache-Control": "no-cache",
    },
  },
});
