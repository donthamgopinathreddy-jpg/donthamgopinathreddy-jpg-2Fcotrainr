import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  const isDemoMode = () => {
    return user?.id?.startsWith("demo-user") || user?.id?.includes("demo");
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // In demo mode, return mock results
      if (isDemoMode()) {
        const DEMO_USERS: SearchUser[] = [
          {
            id: "demo-trainer-1",
            username: "demo_trainer",
            full_name: "Demo Trainer",
            profile_picture_url: undefined,
            bio: "Demo trainer for testing",
            role: "trainer",
          },
          {
            id: "demo-user-1",
            username: "demo_user",
            full_name: "Demo User",
            profile_picture_url: undefined,
            bio: "Demo user for testing",
            role: "client",
          },
        ];

        const filtered = DEMO_USERS.filter(
          (u) =>
            u.username.toLowerCase().includes(query.toLowerCase()) ||
            u.full_name.toLowerCase().includes(query.toLowerCase()),
        );

        setResults(filtered);
        setLoading(false);
        return;
      }

      // Create search term - remove spaces for username matching
      // Match from the beginning (no leading %) so "J" shows all names starting with J
      const searchTermWithSpaces = `${query.toLowerCase()}%`;
      const searchTermNoSpaces = `${query.toLowerCase().replace(/\s+/g, "")}%`;
      let allUsers: any[] = [];

      // Search by username (with and without spaces)
      try {
        const { data } = await supabase
          .from("users")
          .select("id, username, full_name, profile_picture_url, bio, role")
          .ilike("username", searchTermNoSpaces)
          .limit(10);

        if (data) {
          allUsers = [...allUsers, ...data];
        }
      } catch (err) {
        console.warn("Username search failed");
      }

      // Search by full_name (with spaces)
      try {
        const { data } = await supabase
          .from("users")
          .select("id, username, full_name, profile_picture_url, bio, role")
          .ilike("full_name", searchTermWithSpaces)
          .limit(10);

        if (data) {
          allUsers = [...allUsers, ...data];
        }
      } catch (err) {
        console.warn("Name search failed");
      }

      // Remove duplicates
      const uniqueUsers = Array.from(
        new Map(allUsers.map((u) => [u.id, u])).values(),
      ).slice(0, 20);

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
    } catch (err: any) {
      console.error("Search error:", err?.message);
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
