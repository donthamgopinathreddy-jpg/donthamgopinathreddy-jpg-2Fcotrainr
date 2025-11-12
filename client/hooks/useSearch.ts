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
      const searchTerm = query.toLowerCase();

      // Search in users table by username or full_name
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, username, full_name, profile_picture_url, location, bio, role, verified"
        )
        .or(
          `username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`
        )
        .limit(20);

      if (error) {
        console.error("Error searching users:", error);
        setResults([]);
        return;
      }

      // Get followers count and rating for each user
      if (data) {
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
              console.error(`Error getting stats for user ${user.id}:`, err);
              return {
                ...user,
                followers_count: 0,
                rating: undefined,
              };
            }
          })
        );

        setResults(usersWithStats as SearchUser[]);
      }
    } catch (error) {
      console.error("Search error:", error);
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
