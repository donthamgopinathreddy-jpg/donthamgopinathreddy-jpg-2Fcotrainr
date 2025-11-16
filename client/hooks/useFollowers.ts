import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface FollowerUser {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  username: string;
  bio?: string;
  role?: "client" | "trainer";
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
        .from("follows")
        .select(
          "follower_id, users!follower_id(id, full_name, profile_picture_url, username, bio, role)",
        )
        .eq("following_id", userId);

      if (followersError) {
        console.debug(
          "Fetch followers error:",
          followersError?.code,
          followersError?.message,
        );
        setFollowers([]);
      } else if (followersData) {
        const parsedFollowers = followersData
          .filter((f: any) => f.users && f.users.id)
          .map((f: any) => ({
            id: f.users.id,
            full_name: f.users.full_name || "",
            profile_picture_url: f.users.profile_picture_url,
            username: f.users.username,
            bio: f.users.bio,
            role: f.users.role,
          }));
        setFollowers(parsedFollowers);
      }

      const { data: followingData, error: followingError } = await supabase
        .from("follows")
        .select(
          "following_id, users!following_id(id, full_name, profile_picture_url, username, bio, role)",
        )
        .eq("follower_id", userId);

      if (followingError) {
        console.debug(
          "Fetch following error:",
          followingError?.code,
          followingError?.message,
        );
        setFollowing([]);
      } else if (followingData) {
        const parsedFollowing = followingData
          .filter((f: any) => f.users && f.users.id)
          .map((f: any) => ({
            id: f.users.id,
            full_name: f.users.full_name || "",
            profile_picture_url: f.users.profile_picture_url,
            username: f.users.username,
            bio: f.users.bio,
            role: f.users.role,
          }));
        setFollowing(parsedFollowing);
      }

      setError(null);
    } catch (err) {
      console.debug(
        "Fetch followers/following error:",
        err instanceof Error ? err.message : String(err),
      );
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
