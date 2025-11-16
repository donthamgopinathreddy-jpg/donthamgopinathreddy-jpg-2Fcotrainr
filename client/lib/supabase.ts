import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or Anon Key. Check your environment variables.",
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

// Custom fetch wrapper with retry logic and better error handling
const createFetchWithRetry = () => {
  return async (url: string | Request, options?: RequestInit) => {
    let lastError: Error | null = null;
    const maxRetries = 1;
    const retryDelay = 300;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Create a timeout for the fetch request (reduced from 10s to 5s)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(timeout);
          return response;
        } finally {
          clearTimeout(timeout);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on abort errors (timeouts)
        if (lastError.name === "AbortError") {
          lastError = new Error("Request timeout - Supabase server not responding");
          // Still throw timeout errors without retry
          throw lastError;
        }

        // Retry on network errors, but not on the last attempt
        if (attempt < maxRetries) {
          console.debug(
            `Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }

        // If we've exhausted retries, throw the error
        throw lastError;
      }
    }

    // This should never be reached, but just in case
    if (lastError) {
      throw lastError;
    }

    throw new Error("Unknown fetch error");
  };
};

// Create client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: storageImpl,
    detectSessionInUrl: true,
  },
  global: {
    fetch: createFetchWithRetry(),
  },
});
