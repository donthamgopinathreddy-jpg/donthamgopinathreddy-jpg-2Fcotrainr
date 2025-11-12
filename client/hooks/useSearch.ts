import { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SearchUser {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
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

      // Query only columns that exist in the users table
      const { data, error } = await supabase
        .from("users")
        .select("id, username, full_name, profile_picture_url, bio, role")
        .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
        .limit(20);

      if (error) {
        const errorMsg = error?.message || "Failed to search users";
        console.error("Search error:", errorMsg);
        setResults([]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Transform results and get trainer details for trainers
      const transformedResults: SearchUser[] = await Promise.all(
        data.map(async (user) => {
          let verified = false;
          let rating = undefined;

          // Get trainer details if user is a trainer
          if (user.role === "trainer") {
            try {
              const { data: trainerData } = await supabase
                .from("trainers")
                .select("verified, rating")
                .eq("id", user.id)
                .single();

              if (trainerData) {
                verified = trainerData.verified || false;
                rating = trainerData.rating;
              }
            } catch (err) {
              console.debug(`Could not fetch trainer details for ${user.id}`);
            }
          }

          return {
            id: user.id,
            username: user.username || "",
            full_name: user.full_name || "",
            profile_picture_url: user.profile_picture_url,
            bio: user.bio,
            followers_count: 0,
            rating: rating,
            verified: verified,
            role: user.role || "client",
          };
        })
      );

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
