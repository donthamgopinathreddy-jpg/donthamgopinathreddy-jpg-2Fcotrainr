import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or Anon Key. Check your environment variables.",
  );
}

// Determine the API endpoint based on environment
// In browser, use the proxy endpoint to avoid CORS issues
const getApiUrl = () => {
  // In development or if running on same domain, use proxy
  if (typeof window !== "undefined") {
    const currentUrl = new URL(window.location.href);
    const isLocalhost = currentUrl.hostname === "localhost" || currentUrl.hostname === "127.0.0.1";

    // Use direct Supabase URL for localhost development, proxy for production
    if (isLocalhost) {
      return supabaseUrl;
    } else {
      // Use relative proxy URL for production
      return `${currentUrl.origin}/supabase-api`;
    }
  }
  return supabaseUrl;
};

// For Capacitor native apps, we need to use Preferences instead of localStorage
let storageImpl: any = localStorage;

// Check if we're in a Capacitor environment
if (typeof window !== "undefined" && (window as any).Capacitor) {
  try {
    const { Preferences } = (window as any).Capacitor.Plugins;
    if (Preferences) {
      storageImpl = {
        getItem: (key: string) =>
          Preferences.get({ key }).then((result: any) => result.value),
        setItem: (key: string, value: string) =>
          Preferences.set({ key, value }),
        removeItem: (key: string) => Preferences.remove({ key }),
      };
    }
  } catch (error) {
    console.warn(
      "Could not initialize Capacitor storage, falling back to localStorage",
    );
  }
}

// Create client with proper configuration
const apiUrl = getApiUrl();
console.log("Supabase API endpoint:", apiUrl);

export const supabase = createClient(apiUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: storageImpl,
    detectSessionInUrl: true,
  },
});
