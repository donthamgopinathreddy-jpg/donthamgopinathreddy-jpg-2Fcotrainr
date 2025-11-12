import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useFollows = () => {
  const { user } = useAuth();
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Check if user is in demo mode
  const isDemoMode = () => {
    return user?.id?.startsWith("demo-user") || user?.id?.includes("demo");
  };

  // Fetch current user's following list
  const fetchFollowing = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const isDemo = isDemoMode();

      if (isDemo) {
        // Load from localStorage in demo mode
        const demoFollowing = localStorage.getItem(
          `following_${user.id}`
        );
        setFollowedUsers(
          demoFollowing ? new Set(JSON.parse(demoFollowing)) : new Set()
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (error) {
        console.error("Error fetching follows:", error);
        setFollowedUsers(new Set());
        return;
      }

      const following = new Set(
        (data || []).map((item) => item.following_id)
      );
      setFollowedUsers(following);
    } catch (error) {
      console.error("Error in fetchFollowing:", error);
      setFollowedUsers(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Toggle follow status
  const toggleFollow = async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const isDemo = isDemoMode();
      const newFollowed = new Set(followedUsers);

      if (newFollowed.has(targetUserId)) {
        // Unfollow
        newFollowed.delete(targetUserId);

        if (!isDemo) {
          const { error } = await supabase
            .from("follows")
            .delete()
            .eq("follower_id", user.id)
            .eq("following_id", targetUserId);

          if (error) {
            console.error("Error unfollowing user:", error);
            return false;
          }
        } else {
          // Save to localStorage in demo mode
          localStorage.setItem(
            `following_${user.id}`,
            JSON.stringify(Array.from(newFollowed))
          );
        }
      } else {
        // Follow
        newFollowed.add(targetUserId);

        if (!isDemo) {
          const { error } = await supabase
            .from("follows")
            .insert([
              {
                follower_id: user.id,
                following_id: targetUserId,
              },
            ]);

          if (error) {
            console.error("Error following user:", error);
            return false;
          }
        } else {
          // Save to localStorage in demo mode
          localStorage.setItem(
            `following_${user.id}`,
            JSON.stringify(Array.from(newFollowed))
          );
        }
      }

      setFollowedUsers(newFollowed);
      return true;
    } catch (error) {
      console.error("Error toggling follow:", error);
      return false;
    }
  };

  // Check if user is following someone
  const isFollowing = (userId: string): boolean => {
    return followedUsers.has(userId);
  };

  useEffect(() => {
    if (user) {
      fetchFollowing();
    }
  }, [user?.id]);

  return {
    followedUsers,
    loading,
    toggleFollow,
    isFollowing,
    fetchFollowing,
  };
};
