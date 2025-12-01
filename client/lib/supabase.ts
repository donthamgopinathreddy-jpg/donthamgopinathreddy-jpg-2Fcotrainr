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

// Custom storage implementation that validates session data
class SessionStorage {
  private storage: Storage | any;
  private isCapacitor: boolean;

  constructor() {
    this.isCapacitor = false;

    // Check if we're in a Capacitor environment
    if (typeof window !== "undefined" && (window as any).Capacitor) {
      try {
        const { Preferences } = (window as any).Capacitor.Plugins;
        if (Preferences) {
          this.storage = Preferences;
          this.isCapacitor = true;
          console.log("[SessionStorage] Using Capacitor Preferences");
          return;
        }
      } catch (error) {
        console.warn(
          "[SessionStorage] Could not initialize Capacitor storage, falling back to localStorage",
        );
      }
    }

    this.storage = localStorage;
    console.log("[SessionStorage] Using localStorage");
  }

  async getItem(key: string): Promise<string | null> {
    try {
      let value: string | null = null;

      if (this.isCapacitor) {
        const result = await this.storage.get({ key });
        value = result?.value || null;
      } else {
        value = this.storage.getItem(key);
      }

      if (!value) {
        return null;
      }

      // Validate session data
      if (key.includes("auth") || key.includes("session")) {
        try {
          const parsed = JSON.parse(value);
          if (parsed?.session && !parsed.session.access_token) {
            console.warn(
              "[SessionStorage] Detected corrupted session (missing access_token), clearing it",
            );
            await this.removeItem(key);
            return null;
          }
        } catch (e) {
          // If it's not JSON, just return it as is
        }
      }

      return value;
    } catch (error) {
      console.error("[SessionStorage] Error reading from storage:", error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Validate session data before storing
      if (key.includes("auth") || key.includes("session")) {
        try {
          const parsed = JSON.parse(value);
          // Only require access_token, refresh_token is optional
          if (parsed?.session) {
            if (!parsed.session.access_token) {
              console.warn(
                "[SessionStorage] Prevented storing session without access_token",
              );
              return;
            }
            if (!parsed.session.refresh_token) {
              console.warn(
                "[SessionStorage] Storing session without refresh_token (may need to re-login on page reload):",
                {
                  hasAccessToken: !!parsed.session.access_token,
                  hasRefreshToken: !!parsed.session.refresh_token,
                  expiresIn: parsed.session.expires_in,
                },
              );
            }
          }
        } catch (e) {
          // If it's not JSON, just store it
        }
      }

      if (this.isCapacitor) {
        await this.storage.set({ key, value });
      } else {
        this.storage.setItem(key, value);
      }
    } catch (error) {
      console.error("[SessionStorage] Error writing to storage:", error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isCapacitor) {
        await this.storage.remove({ key });
      } else {
        this.storage.removeItem(key);
      }
    } catch (error) {
      console.error("[SessionStorage] Error removing from storage:", error);
    }
  }
}

const storageImpl = new SessionStorage();

// Create client with proper configuration
const apiUrl = getApiUrl();

console.log("[Supabase] Initializing client", {
  apiUrl,
  originalUrl: supabaseUrl,
});

export const supabase = createClient(apiUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    storage: storageImpl as any,
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
      if (session) {
        console.log(
          "[Supabase] Session refreshed, has refresh_token:",
          !!session.refresh_token,
        );
      }
      break;
    case "TOKEN_REFRESH_FAILED":
      console.error("[Supabase] TOKEN_REFRESH_FAILED event triggered");
      handleTokenRefreshFailure();
      break;
    case "SIGNED_OUT":
      console.log("[Supabase] User signed out");
      break;
    case "SIGNED_IN":
      console.log(
        "[Supabase] User signed in, session has refresh_token:",
        !!session?.refresh_token,
      );
      break;
    default:
      break;
  }
});
