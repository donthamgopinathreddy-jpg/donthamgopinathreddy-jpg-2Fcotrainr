import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const usePINAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hash PIN securely using Web Crypto API
  const hashPIN = useCallback(async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }, []);

  // Set up PIN for user
  const setupPIN = useCallback(
    async (userId: string, pin: string): Promise<boolean> => {
      if (pin.length < 4 || pin.length > 6) {
        setError("PIN must be between 4 and 6 digits");
        return false;
      }

      if (!/^\d+$/.test(pin)) {
        setError("PIN must contain only digits");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const hashedPin = await hashPIN(pin);

        // Store PIN hash in Supabase (in user_security_settings table)
        const { error: dbError } = await supabase
          .from("user_security_settings")
          .upsert(
            {
              user_id: userId,
              pin_hash: hashedPin,
              pin_enabled: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (dbError) {
          setError(`Failed to save PIN: ${dbError.message}`);
          return false;
        }

        return true;
      } catch (err: any) {
        setError(`Setup failed: ${err?.message || "Unknown error"}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [hashPIN]
  );

  // Verify PIN
  const verifyPIN = useCallback(
    async (userId: string, pin: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const hashedPin = await hashPIN(pin);

        const { data, error: dbError } = await supabase
          .from("user_security_settings")
          .select("pin_hash")
          .eq("user_id", userId)
          .single();

        if (dbError) {
          setError("PIN verification failed");
          return false;
        }

        if (!data || data.pin_hash !== hashedPin) {
          setError("Incorrect PIN");
          return false;
        }

        return true;
      } catch (err: any) {
        setError(`Verification failed: ${err?.message || "Unknown error"}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [hashPIN]
  );

  // Set up pattern
  const setupPattern = useCallback(
    async (userId: string, pattern: number[]): Promise<boolean> => {
      if (pattern.length < 4) {
        setError("Pattern must have at least 4 points");
        return false;
      }

      if (pattern.length > 9) {
        setError("Pattern can have maximum 9 points");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const patternHash = await hashPIN(pattern.join(","));

        const { error: dbError } = await supabase
          .from("user_security_settings")
          .upsert(
            {
              user_id: userId,
              pattern_hash: patternHash,
              pattern_enabled: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (dbError) {
          setError(`Failed to save pattern: ${dbError.message}`);
          return false;
        }

        return true;
      } catch (err: any) {
        setError(`Setup failed: ${err?.message || "Unknown error"}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [hashPIN]
  );

  // Verify pattern
  const verifyPattern = useCallback(
    async (userId: string, pattern: number[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const patternHash = await hashPIN(pattern.join(","));

        const { data, error: dbError } = await supabase
          .from("user_security_settings")
          .select("pattern_hash")
          .eq("user_id", userId)
          .single();

        if (dbError) {
          setError("Pattern verification failed");
          return false;
        }

        if (!data || data.pattern_hash !== patternHash) {
          setError("Incorrect pattern");
          return false;
        }

        return true;
      } catch (err: any) {
        setError(`Verification failed: ${err?.message || "Unknown error"}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [hashPIN]
  );

  // Check if PIN is enabled
  const isPINEnabled = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from("user_security_settings")
        .select("pin_enabled")
        .eq("user_id", userId)
        .single();

      return data?.pin_enabled || false;
    } catch {
      return false;
    }
  }, []);

  // Check if pattern is enabled
  const isPatternEnabled = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from("user_security_settings")
        .select("pattern_enabled")
        .eq("user_id", userId)
        .single();

      return data?.pattern_enabled || false;
    } catch {
      return false;
    }
  }, []);

  return {
    loading,
    error,
    setupPIN,
    verifyPIN,
    setupPattern,
    verifyPattern,
    isPINEnabled,
    isPatternEnabled,
  };
};
