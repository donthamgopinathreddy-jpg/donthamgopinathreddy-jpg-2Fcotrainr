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

  // Fetch conversations for current user using backend API
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

      // Get auth token from storage
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.warn("No auth token available for fetching conversations");
        setConversations([]);
        setTotalUnreadMessages(0);
        return;
      }

      // Use backend API endpoint instead of direct Supabase query
      const response = await fetch("/api/conversations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        console.error("Error response from API:", response.status);
        setConversations([]);
        setTotalUnreadMessages(0);
        return;
      }

      const result = await response.json();
      const conversationList = result.data || [];

      // Calculate total unread
      const totalUnread = conversationList.reduce(
        (sum: number, conv: Conversation) => sum + (conv.unread_count || 0),
        0,
      );

      setConversations(conversationList);
      setTotalUnreadMessages(totalUnread);
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

      if (!conversationIdOrUserId.includes("-")) {
        // This might be a user ID, need to find the conversation
        const { data: convData, error: convError } = await supabase
          .from("conversations")
          .select("id")
          .or(
            `and(participant1_id.eq.${user.id},participant2_id.eq.${conversationIdOrUserId}),and(participant1_id.eq.${conversationIdOrUserId},participant2_id.eq.${user.id})`,
          )
          .single();

        if (convError || !convData) {
          console.warn(
            "No conversation found with user:",
            conversationIdOrUserId,
          );
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
  const sendMessage = async (
    conversationIdOrRecipientId: string,
    content: string,
  ) => {
    if (!user) return;

    try {
      const isDemo = isDemoMode();
      const createdAt = new Date().toISOString();

      if (isDemo) {
        // Save to localStorage in demo mode
        const newMessage: Message = {
          id: `local-${Date.now()}`,
          sender_id: user.id,
          recipient_id: conversationIdOrRecipientId,
          content,
          is_read: false,
          created_at: createdAt,
        };

        const key = `messages_demo_${user.id}_${conversationIdOrRecipientId}`;
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
          (c: Conversation) => c.other_user_id === conversationIdOrRecipientId,
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

      // Get or create conversation if needed
      let conversationId = conversationIdOrRecipientId;

      if (!conversationIdOrRecipientId.includes("-")) {
        // This is a user ID, find or create conversation
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .or(
            `and(participant1_id.eq.${user.id},participant2_id.eq.${conversationIdOrRecipientId}),and(participant1_id.eq.${conversationIdOrRecipientId},participant2_id.eq.${user.id})`,
          )
          .single();

        if (existingConv) {
          conversationId = existingConv.id;
        } else {
          // Create new conversation
          const { data: newConv, error: convError } = await supabase
            .from("conversations")
            .insert({
              participant1_id: user.id,
              participant2_id: conversationIdOrRecipientId,
            })
            .select()
            .single();

          if (convError || !newConv) {
            throw new Error("Failed to create conversation");
          }
          conversationId = newConv.id;
        }
      }

      // Insert the message
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Add recipient_id field for compatibility with Message interface
      const messageWithRecipient = {
        ...data,
        recipient_id: conversationIdOrRecipientId,
      };

      setMessages((prev) => [...prev, messageWithRecipient]);
      return messageWithRecipient;
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
