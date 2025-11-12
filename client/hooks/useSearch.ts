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

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      // Simple query with only essential columns
      const { data, error } = await supabase
        .from("users")
        .select("id, username, full_name, profile_picture_url, bio, role")
        .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
        .limit(20);

      if (error) {
        console.error("Search error - Column error:", error.message);
        setResults([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No search results found for:", query);
        setResults([]);
        setLoading(false);
        return;
      }

      console.log("Search results:", data);

      // Transform results
      const transformedResults: SearchUser[] = data.map((user) => ({
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Search exception:", errorMsg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    searchUsers,
  };
};
