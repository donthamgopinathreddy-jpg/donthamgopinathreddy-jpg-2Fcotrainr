import { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SearchUser {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  bio?: string;
  rating?: number;
  verified?: boolean;
  role: "client" | "trainer";
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const searchTerm = `%${query.toLowerCase()}%`;

      // Search by username - with timeout handling
      let usernameResults: any[] = [];
      try {
        const response = await Promise.race([
          supabase
            .from("users")
            .select("id, username, full_name, profile_picture_url, bio, role")
            .ilike("username", searchTerm)
            .limit(10),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Username search timeout")), 5000)
          ),
        ]);
        
        if (response && !response.error) {
          usernameResults = response.data || [];
        }
      } catch (err: any) {
        console.warn("Username search failed:", err?.message);
      }

      // Search by full_name - with timeout handling
      let nameResults: any[] = [];
      try {
        const response = await Promise.race([
          supabase
            .from("users")
            .select("id, username, full_name, profile_picture_url, bio, role")
            .ilike("full_name", searchTerm)
            .limit(10),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Name search timeout")), 5000)
          ),
        ]);

        if (response && !response.error) {
          nameResults = response.data || [];
        }
      } catch (err: any) {
        console.warn("Name search failed:", err?.message);
      }

      clearTimeout(timeoutId);

      // Combine results and remove duplicates
      const allUsers = [...usernameResults, ...nameResults];
      const uniqueUsers = Array.from(
        new Map(allUsers.map((u) => [u.id, u])).values()
      ).slice(0, 20);

      if (uniqueUsers.length === 0) {
        setResults([]);
        return;
      }

      // Transform results
      const transformedResults: SearchUser[] = uniqueUsers.map((user) => ({
        id: user.id || "",
        username: user.username || "",
        full_name: user.full_name || "",
        profile_picture_url: user.profile_picture_url,
        bio: user.bio,
        rating: undefined,
        verified: false,
        role: (user.role as "client" | "trainer") || "client",
      }));

      setResults(transformedResults);
    } catch (err: any) {
      const errorMsg =
        err instanceof Error ? err.message : String(err) || "Search failed";
      console.error("Search error:", errorMsg);
      setError("Failed to search. Please check your connection and try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    searchUsers,
  };
};
