import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export const useMessages = (recipientId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  // Check if user is in demo mode
  const isDemoMode = () => {
    return user?.id?.startsWith("demo-user") || user?.id?.includes("demo");
  };

  // Fetch conversations for current user
  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const isDemo = isDemoMode();

      if (isDemo) {
        // Load from localStorage in demo mode
        const demoConversations = localStorage.getItem(
          `conversations_demo_${user.id}`,
        );
        const conversations = demoConversations
          ? JSON.parse(demoConversations)
          : [];
        setConversations(conversations);

        // Calculate total unread messages from demo conversations
        const totalUnread = conversations.reduce(
          (sum: number, conv: Conversation) => sum + (conv.unread_count || 0),
          0,
        );
        setTotalUnreadMessages(totalUnread);
        setLoading(false);
        return;
      }

      // Fetch conversations where user is a participant
      const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (conversationError) throw conversationError;

      if (!conversationData || conversationData.length === 0) {
        setConversations([]);
        setTotalUnreadMessages(0);
        return;
      }

      // For each conversation, get messages and user details
      const conversationList: Conversation[] = [];
      let totalUnreadMessages = 0;

      for (const conv of conversationData) {
        // Determine the other participant
        const otherUserId =
          conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id;

        // Fetch messages for this conversation
        const { data: messages, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (messagesError) {
          console.error("Error fetching messages for conversation:", messagesError);
          continue;
        }

        // Fetch other user's details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("username, full_name, profile_picture_url")
          .eq("id", otherUserId)
          .single();

        if (userError || !userData) {
          console.error("Error fetching user details:", userError);
          continue;
        }

        // Count unread messages in this conversation
        const { data: unreadData, error: unreadError } = await supabase
          .from("messages")
          .select("id")
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        const unreadCount = unreadError ? 0 : (unreadData?.length || 0);
        totalUnreadMessages += unreadCount;

        const lastMsg = messages && messages.length > 0 ? messages[0] : null;

        conversationList.push({
          id: conv.id,
          other_user_id: otherUserId,
          other_user_name: userData.full_name || userData.username,
          other_user_avatar: userData.profile_picture_url,
          last_message: lastMsg?.content,
          last_message_time: lastMsg?.created_at || conv.last_message_at,
          unread_count: unreadCount,
        });
      }

      setConversations(conversationList);
      setTotalUnreadMessages(totalUnreadMessages);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
      setTotalUnreadMessages(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation (otherUserId is actually conversationId)
  const fetchMessages = async (conversationIdOrUserId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const isDemo = isDemoMode();

      if (isDemo) {
        // Load from localStorage in demo mode
        const demoMessages = localStorage.getItem(
          `messages_demo_${user.id}_${conversationIdOrUserId}`,
        );
        setMessages(demoMessages ? JSON.parse(demoMessages) : []);
        setLoading(false);
        return;
      }

      // First, check if this is a conversation ID or user ID
      // If it contains '-', assume it's a UUID (conversation ID)
      let conversationId = conversationIdOrUserId;

      if (!conversationIdOrUserId.includes('-')) {
        // This might be a user ID, need to find the conversation
        const { data: convData, error: convError } = await supabase
          .from("conversations")
          .select("id")
          .or(
            `and(participant1_id.eq.${user.id},participant2_id.eq.${conversationIdOrUserId}),and(participant1_id.eq.${conversationIdOrUserId},participant2_id.eq.${user.id})`,
          )
          .single();

        if (convError || !convData) {
          console.warn("No conversation found with user:", conversationIdOrUserId);
          setMessages([]);
          return;
        }
        conversationId = convData.id;
      }

      // Fetch all messages in the conversation
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark unread messages as read
      if (data && Array.isArray(data)) {
        const unreadIds = data
          .filter((m) => !m.is_read && m.sender_id !== user.id)
          .map((m) => m.id);

        if (unreadIds.length > 0) {
          await supabase
            .from("messages")
            .update({ is_read: true })
            .in("id", unreadIds);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) return;

    try {
      const isDemo = isDemoMode();
      const createdAt = new Date().toISOString();

      if (isDemo) {
        // Save to localStorage in demo mode
        const newMessage: Message = {
          id: `local-${Date.now()}`,
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          is_read: false,
          created_at: createdAt,
        };

        const key = `messages_demo_${user.id}_${recipientId}`;
        const demoMessages = localStorage.getItem(key);
        const existingMessages = demoMessages ? JSON.parse(demoMessages) : [];
        const updatedMessages = [...existingMessages, newMessage];

        localStorage.setItem(key, JSON.stringify(updatedMessages));
        setMessages((prev) => [...prev, newMessage]);

        // Update conversations
        const conversationsKey = `conversations_demo_${user.id}`;
        const demoConversations = localStorage.getItem(conversationsKey);
        const existingConversations = demoConversations
          ? JSON.parse(demoConversations)
          : [];

        const conversationIndex = existingConversations.findIndex(
          (c: Conversation) => c.other_user_id === recipientId,
        );

        if (conversationIndex >= 0) {
          existingConversations[conversationIndex] = {
            ...existingConversations[conversationIndex],
            last_message: content,
            last_message_time: createdAt,
          };
        }

        localStorage.setItem(
          conversationsKey,
          JSON.stringify(existingConversations),
        );

        return newMessage;
      }

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Recalculate total unread messages whenever conversations change
  useEffect(() => {
    const total = conversations.reduce(
      (sum, conv) => sum + conv.unread_count,
      0,
    );
    setTotalUnreadMessages(total);
  }, [conversations]);

  useEffect(() => {
    if (recipientId) {
      fetchMessages(recipientId);
    } else {
      fetchConversations();
    }
  }, [user, recipientId]);

  return {
    messages,
    conversations,
    loading,
    fetchMessages,
    fetchConversations,
    sendMessage,
    totalUnreadMessages,
  };
};
