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

      // Search by username
      const { data: usernameResults, error: error1 } = await supabase
        .from("users")
        .select("id, username, full_name, profile_picture_url, bio, role")
        .ilike("username", searchTerm);

      // Search by full_name
      const { data: nameResults, error: error2 } = await supabase
        .from("users")
        .select("id, username, full_name, profile_picture_url, bio, role")
        .ilike("full_name", searchTerm);

      if (error1) {
        console.error("Username search error:", error1.message);
      }

      if (error2) {
        console.error("Name search error:", error2.message);
      }

      // Combine results and remove duplicates
      const allUsers = [...(usernameResults || []), ...(nameResults || [])];
      const uniqueUsers = Array.from(
        new Map(allUsers.map((u) => [u.id, u])).values()
      ).slice(0, 20);

      if (uniqueUsers.length === 0) {
        setResults([]);
        setLoading(false);
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
