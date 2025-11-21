import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or Anon Key. Check your environment variables.",
  );
}

// Always use the direct Supabase URL - it should handle CORS properly
const getApiUrl = () => {
  console.log("[Supabase] Using direct Supabase URL:", supabaseUrl);
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

console.log("[Supabase] Initializing client", {
  apiUrl,
  originalUrl: supabaseUrl,
});

export const supabase = createClient(apiUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: storageImpl,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

const handleTokenRefreshFailure = async () => {
  console.error(
    "[Supabase] Token refresh failed - clearing local session to avoid errors",
  );
  try {
    await supabase.auth.signOut();
  } catch (signOutError) {
    console.error(
      "[Supabase] Failed to sign out after refresh failure:",
      signOutError,
    );
  }

  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("supabase-token-refresh-failed", {
          detail: { reason: "INVALID_REFRESH_TOKEN" },
        }),
      );
    }
  } catch (eventError) {
    console.warn(
      "[Supabase] Could not dispatch refresh failure event",
      eventError,
    );
  }
};

// Handle token refresh errors gracefully
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case "TOKEN_REFRESHED":
      console.log("[Supabase] Token refreshed successfully");
      break;
    case "TOKEN_REFRESH_FAILED":
      handleTokenRefreshFailure();
      break;
    case "SIGNED_OUT":
      console.log("[Supabase] User signed out");
      break;
    case "SIGNED_IN":
      console.log("[Supabase] User signed in");
      break;
    default:
      break;
  }
});
