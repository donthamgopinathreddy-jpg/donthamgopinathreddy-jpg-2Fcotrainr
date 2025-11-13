import { useState, useEffect } from "react";
import { ArrowLeft, Send, Loader } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface OtherUser {
  id: string;
  full_name: string;
  username: string;
}

export default function ChatMessages() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { recipientId } = useParams<{ recipientId: string }>();
  const { user: authUser, userProfile } = useAuth();
  const { messages: dbMessages, loading } = useMessages(recipientId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);

  useEffect(() => {
    if (dbMessages) {
      setMessages(dbMessages);
    }
  }, [dbMessages]);

  useEffect(() => {
    if (recipientId) {
      fetchOtherUser();
    }
  }, [recipientId]);

  const fetchOtherUser = async () => {
    try {
      const { data } = await supabase
        .from("users")
        .select("id, full_name, username")
        .eq("id", recipientId)
        .single();

      if (data) {
        setOtherUser(data);
      }
    } catch (error) {
      console.error("Error fetching other user:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !authUser?.id || !recipientId) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: authUser.id,
        recipient_id: recipientId,
        content: newMessage,
        is_read: false,
      });

      if (error) {
        console.error("Error sending message:", error);
        return;
      }

      const messageToAdd: Message = {
        id: Date.now().toString(),
        sender_id: authUser.id,
        recipient_id: recipientId,
        content: newMessage,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, messageToAdd]);
      setNewMessage("");
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col pb-24 ${
        theme === "dark" ? "bg-gray-950" : "bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 px-4 py-4 flex items-center gap-3 border-b ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <button
          onClick={() => navigate("/messages")}
          className={`p-2 rounded-lg transition-colors ${
            theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1
            className={`text-lg font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {otherUser?.full_name || "Loading..."}
          </h1>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            @{otherUser?.username || ""}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === authUser?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.sender_id === authUser?.id
                    ? "bg-blue-500 text-white rounded-br-none"
                    : theme === "dark"
                      ? "bg-gray-800 text-gray-100 rounded-bl-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender_id === authUser?.id
                      ? "text-blue-100"
                      : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div
        className={`border-t px-4 py-3 flex gap-2 ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isSending}
          className={`flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            theme === "dark"
              ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
              : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500"
          }`}
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSending ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
