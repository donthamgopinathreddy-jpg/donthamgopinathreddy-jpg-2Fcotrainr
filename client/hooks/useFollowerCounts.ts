import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface FollowerCounts {
  followers_count: number;
  following_count: number;
}

export const useFollowerCounts = (userId?: string) => {
  const [counts, setCounts] = useState<FollowerCounts>({
    followers_count: 0,
    following_count: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCounts = async (id: string) => {
    if (!id) return;

    setLoading(true);
    try {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("followers_count, following_count")
          .eq("id", id)
          .single();

        if (error) {
          console.warn("Follower counts fetch error:", error?.message || error?.code);
          setCounts({ followers_count: 0, following_count: 0 });
          return;
        }

        setCounts({
          followers_count: data?.followers_count || 0,
          following_count: data?.following_count || 0,
        });
      } catch (supabaseError) {
        console.warn(
          "Follower counts supabase error:",
          supabaseError instanceof Error ? supabaseError.message : "unknown",
        );
        setCounts({ followers_count: 0, following_count: 0 });
      }
    } catch (error) {
      console.warn(
        "Follower counts outer error:",
        error instanceof Error ? error.message : "unknown",
      );
      setCounts({ followers_count: 0, following_count: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCounts(userId);
    }
  }, [userId]);

  return {
    counts,
    loading,
    refetch: fetchCounts,
  };
};
