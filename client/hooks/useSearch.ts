import { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SearchUser {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  location?: string;
  bio?: string;
  followers_count?: number;
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

      // Single query to search both username and full_name
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
        .limit(20);

      if (error) {
        const errorMsg = error?.message || "Failed to search users";
        console.error("Error searching users:", errorMsg);
        setResults([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Transform results without making additional queries
      const transformedResults: SearchUser[] = data.map((user) => ({
        id: user.id,
        username: user.username || "",
        full_name: user.full_name || "",
        profile_picture_url: user.profile_picture_url,
        location: user.location,
        bio: user.bio,
        followers_count: user.followers_count || 0,
        rating: user.rating,
        verified: user.verified || false,
        role: user.role || "client",
      }));

      setResults(transformedResults);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Search error:", errorMsg);
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
