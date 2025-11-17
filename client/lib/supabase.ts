import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or Anon Key. Check your environment variables.",
  );
}

// Determine if we should use the proxy
const shouldUseProxy = () => {
  if (typeof window === "undefined") return false;

  const currentUrl = new URL(window.location.href);
  const isLocalhost = currentUrl.hostname === "localhost" || currentUrl.hostname === "127.0.0.1";

  // Use proxy for non-localhost environments to avoid CORS issues
  return !isLocalhost;
};

const getApiUrl = () => {
  if (typeof window !== "undefined" && shouldUseProxy()) {
    const currentUrl = new URL(window.location.href);
    return `${currentUrl.origin}/supabase-api`;
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
const useProxy = shouldUseProxy();

console.log("[Supabase] Initializing client", {
  useProxy,
  apiUrl,
  isDevelopment: typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"),
});

export const supabase = createClient(apiUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: storageImpl,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "X-Supabase-Proxy": useProxy ? "true" : "false",
    },
  },
});
