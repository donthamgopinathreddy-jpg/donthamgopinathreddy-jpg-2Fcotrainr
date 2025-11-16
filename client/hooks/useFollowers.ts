import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface FollowerUser {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  username: string;
  bio?: string;
}

export function useFollowers(userId?: string) {
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowers = useCallback(async () => {
    if (!userId) {
      setFollowers([]);
      setFollowing([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: followersData, error: followersError } = await supabase
        .from("followers")
        .select("follower_id, follower:follower_id(id, full_name, profile_picture_url, username, bio)")
        .eq("following_id", userId);

      if (followersError) {
        console.debug("Fetch followers error:", followersError?.code, followersError?.message);
        setFollowers([]);
      } else if (followersData) {
        const parsedFollowers = followersData
          .filter((f: any) => f.follower && f.follower.id)
          .map((f: any) => ({
            id: f.follower.id,
            full_name: f.follower.full_name || "",
            profile_picture_url: f.follower.profile_picture_url,
            username: f.follower.username,
            bio: f.follower.bio,
          }));
        setFollowers(parsedFollowers);
      }

      const { data: followingData, error: followingError } = await supabase
        .from("followers")
        .select("following_id, following:following_id(id, full_name, profile_picture_url, username, bio)")
        .eq("follower_id", userId);

      if (followingError) {
        console.debug("Fetch following error:", followingError?.code, followingError?.message);
        setFollowing([]);
      } else if (followingData) {
        const parsedFollowing = followingData
          .filter((f: any) => f.following && f.following.id)
          .map((f: any) => ({
            id: f.following.id,
            full_name: f.following.full_name || "",
            profile_picture_url: f.following.profile_picture_url,
            username: f.following.username,
            bio: f.following.bio,
          }));
        setFollowing(parsedFollowing);
      }

      setError(null);
    } catch (err) {
      console.debug("Fetch followers/following error:", err instanceof Error ? err.message : String(err));
      setError("Failed to load followers");
      setFollowers([]);
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowers();
  }, [userId, fetchFollowers]);

  return {
    followers,
    following,
    loading,
    error,
    refetch: fetchFollowers,
  };
}
