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

  // Fetch conversations for current user
  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group messages by conversation
      const conversationMap = new Map<string, Message[]>();
      data?.forEach((msg) => {
        const otherUserId =
          msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, []);
        }
        conversationMap.get(otherUserId)!.push(msg);
      });

      // Fetch user details for each conversation
      const conversationList: Conversation[] = [];
      for (const [otherUserId, msgs] of conversationMap.entries()) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("username, full_name, profile_picture_url")
          .eq("id", otherUserId)
          .single();

        if (!userError && userData) {
          const lastMsg = msgs[0];
          const unreadCount = msgs.filter(
            (m) => !m.is_read && m.recipient_id === user.id
          ).length;

          conversationList.push({
            id: otherUserId,
            other_user_id: otherUserId,
            other_user_name: userData.full_name || userData.username,
            other_user_avatar: userData.profile_picture_url,
            last_message: lastMsg.content,
            last_message_time: lastMsg.created_at,
            unread_count,
          });
        }
      }

      setConversations(conversationList.sort((a, b) => 
        new Date(b.last_message_time || 0).getTime() - 
        new Date(a.last_message_time || 0).getTime()
      ));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark as read
      if (data) {
        const unreadIds = data
          .filter((m) => !m.is_read && m.recipient_id === user.id)
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
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (recipientId: string, content: string) => {
    if (!user) return;

    try {
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
  };
};
