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

      // Search in users table by username or full_name
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, username, full_name, profile_picture_url, location, bio, role, verified"
        )
        .or(
          `username.ilike.${searchTerm},full_name.ilike.${searchTerm}`
        )
        .limit(20);

      if (error) {
        const errorMsg = error?.message || JSON.stringify(error) || "Unknown error";
        console.error("Error searching users:", errorMsg);
        setResults([]);
        return;
      }

      // Get followers count and rating for each user
      if (data && data.length > 0) {
        const usersWithStats = await Promise.all(
          data.map(async (user) => {
            try {
              // Get followers count
              const { count: followersCount } = await supabase
                .from("follows")
                .select("*", { count: "exact" })
                .eq("following_id", user.id);

              // Get rating from trainer profile if exists
              let rating = undefined;
              if (user.role === "trainer") {
                const { data: trainerData } = await supabase
                  .from("trainers")
                  .select("rating")
                  .eq("id", user.id)
                  .single();

                rating = trainerData?.rating;
              }

              return {
                ...user,
                followers_count: followersCount || 0,
                rating: rating,
              };
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : String(err);
              console.error(`Error getting stats for user ${user.id}:`, errMsg);
              return {
                ...user,
                followers_count: 0,
                rating: undefined,
              };
            }
          })
        );

        setResults(usersWithStats as SearchUser[]);
      } else {
        setResults([]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
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
