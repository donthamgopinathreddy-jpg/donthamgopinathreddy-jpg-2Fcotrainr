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

  // Check if user is in demo mode
  const isDemoMode = () => {
    return user?.id?.startsWith("demo-user") || user?.id?.includes("demo");
  };

  // Fetch all posts with author details
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const isDemo = isDemoMode();

      if (isDemo) {
        // Load from localStorage in demo mode
        const demoPosts = localStorage.getItem(`posts_demo_${user?.id}`);
        setPosts(demoPosts ? JSON.parse(demoPosts) : []);
        setLoading(false);
        return;
      }

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
          .select("id, full_name, username, profile_picture_url, role")
          .in("id", userIds);

        const userMap = new Map((users || []).map((u) => [u.id, u]));

        const enriched: Post[] = data.map((post) => {
          const author = userMap.get(post.user_id);
          return {
            ...post,
            author_name: author?.full_name || author?.username || "Unknown",
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
      const isDemo = isDemoMode();
      const createdAt = new Date().toISOString();

      if (isDemo) {
        // Create post in localStorage in demo mode
        const newPost: Post = {
          id: `local-${Date.now()}`,
          user_id: user.id,
          content: postInput.content,
          image_url: postInput.image_url,
          video_url: postInput.video_url,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          created_at: createdAt,
          updated_at: createdAt,
          author_name: user.user_metadata?.full_name || "You",
          author_avatar: user.user_metadata?.picture,
        };

        const demoPosts = localStorage.getItem(`posts_demo_${user.id}`);
        const existingPosts = demoPosts ? JSON.parse(demoPosts) : [];
        const updatedPosts = [newPost, ...existingPosts];

        localStorage.setItem(
          `posts_demo_${user.id}`,
          JSON.stringify(updatedPosts),
        );
        setPosts(updatedPosts);
        return newPost;
      }

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
        .select("id, full_name, username, profile_picture_url, role")
        .eq("id", user.id)
        .single();

      const newPost: Post = {
        ...data,
        author_name: userData?.full_name || userData?.username || "Unknown",
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
      const isDemo = isDemoMode();

      if (isDemo) {
        // Delete from localStorage in demo mode
        const demoPosts = localStorage.getItem(`posts_demo_${user?.id}`);
        if (demoPosts) {
          const existingPosts = JSON.parse(demoPosts);
          const updatedPosts = existingPosts.filter(
            (p: Post) => p.id !== postId,
          );
          localStorage.setItem(
            `posts_demo_${user?.id}`,
            JSON.stringify(updatedPosts),
          );
        }
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        return;
      }

      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  };

  // Create notification helper
  const createNotification = async (
    postId: string,
    type: "like" | "comment",
  ) => {
    if (!user) return;

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post || post.user_id === user.id) return;

      await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: user.id,
        type,
        post_id: postId,
      });
    } catch (error) {
      console.warn("Error creating notification:", error);
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
            : p,
        ),
      );

      const isDemo = isDemoMode();

      if (isDemo) {
        // Update in localStorage in demo mode
        const demoPosts = localStorage.getItem(`posts_demo_${user?.id}`);
        if (demoPosts) {
          const existingPosts = JSON.parse(demoPosts);
          const updatedPosts = existingPosts.map((p: Post) =>
            p.id === postId
              ? { ...p, likes_count: Math.max(0, p.likes_count + delta) }
              : p,
          );
          localStorage.setItem(
            `posts_demo_${user?.id}`,
            JSON.stringify(updatedPosts),
          );
        }
        return;
      }

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

      // Create notification for like only
      if (!isLiked && delta === 1) {
        await createNotification(postId, "like");
      }
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
          p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p,
        ),
      );

      const isDemo = isDemoMode();

      if (isDemo) {
        // Update in localStorage in demo mode
        const demoPosts = localStorage.getItem(`posts_demo_${user?.id}`);
        if (demoPosts) {
          const existingPosts = JSON.parse(demoPosts);
          const updatedPosts = existingPosts.map((p: Post) =>
            p.id === postId
              ? { ...p, comments_count: p.comments_count + 1 }
              : p,
          );
          localStorage.setItem(
            `posts_demo_${user?.id}`,
            JSON.stringify(updatedPosts),
          );
        }
        return;
      }

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
