import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  author_role?: string;
  user_liked?: boolean;
}

export interface CreatePostInput {
  content: string;
  image_url?: string;
  video_url?: string;
}

export const usePosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  // Fetch all posts with author details
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Enrich with user details
        const userIds = [...new Set(data.map((p) => p.user_id))];
        const { data: users } = await supabase
          .from("users")
          .select("id, full_name, profile_picture_url, role")
          .in("id", userIds);

        const userMap = new Map(
          (users || []).map((u) => [u.id, u])
        );

        const enriched: Post[] = data.map((post) => {
          const author = userMap.get(post.user_id);
          return {
            ...post,
            author_name: author?.full_name || "Unknown",
            author_avatar: author?.profile_picture_url,
            author_role: author?.role as "trainer" | "client" | undefined,
          };
        });

        setPosts(enriched);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postInput: CreatePostInput) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          ...postInput,
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch user details for the new post
      const { data: userData } = await supabase
        .from("users")
        .select("id, full_name, profile_picture_url, role")
        .eq("id", user.id)
        .single();

      const newPost: Post = {
        ...data,
        author_name: userData?.full_name,
        author_avatar: userData?.profile_picture_url,
        author_role: userData?.role,
      };

      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  // Delete a post
  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  };

  // Like a post (optimistic update)
  const likePost = async (postId: string) => {
    try {
      const isLiked = userLikes.has(postId);
      const delta = isLiked ? -1 : 1;

      // Optimistic update
      setUserLikes((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes_count: Math.max(0, p.likes_count + delta) }
            : p
        )
      );

      // Update in database
      const { data, error } = await supabase
        .from("posts")
        .select("likes_count")
        .eq("id", postId)
        .single();

      if (error) throw error;

      // Persist the change
      const { error: updateError } = await supabase
        .from("posts")
        .update({ likes_count: data.likes_count + delta })
        .eq("id", postId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert optimistic update
      await fetchPosts();
    }
  };

  // Increment comments count
  const incrementComments = async (postId: string) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
        )
      );

      const { data, error } = await supabase
        .from("posts")
        .select("comments_count")
        .eq("id", postId)
        .single();

      if (error) throw error;

      await supabase
        .from("posts")
        .update({ comments_count: data.comments_count + 1 })
        .eq("id", postId);
    } catch (error) {
      console.error("Error incrementing comments:", error);
      await fetchPosts();
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    deletePost,
    likePost,
    incrementComments,
    refetch: fetchPosts,
  };
};
