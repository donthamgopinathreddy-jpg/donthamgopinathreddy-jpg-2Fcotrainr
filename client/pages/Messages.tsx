import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

export default function Messages() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const { conversations, loading, fetchConversations } = useMessages();
  const [displayConversations, setDisplayConversations] = useState<any[]>([]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchConversations();
    }
  }, [userProfile?.id]);

  useEffect(() => {
    setDisplayConversations(conversations);
  }, [conversations]);

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-950" : "bg-white"
      }`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div
          className={`sticky top-0 z-40 border-b px-4 py-6 flex items-center justify-between ${
            theme === "dark"
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div>
            <h1
              className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Messages
            </h1>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Chat with trainers
            </p>
          </div>
        </div>

        {/* Conversations List */}
        <div className="px-4 py-4 space-y-2">
          {loading && displayConversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : displayConversations.length > 0 ? (
            displayConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.other_user_id}`)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl transition-colors text-left border ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                  {conv.other_user_name?.charAt(0) || "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {conv.other_user_name || "Unknown"}
                    </h3>
                    <span
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {conv.last_message_time || ""}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {conv.last_message || "No messages yet"}
                  </p>
                </div>

                {/* Unread Badge */}
                {conv.unread_count > 0 && (
                  <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {conv.unread_count}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <MessageCircle
                  className={`w-8 h-8 ${
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  }`}
                />
              </div>
              <h2
                className={`text-lg font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                No messages yet
              </h2>
              <p
                className={`text-sm max-w-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Start a conversation with your favorite trainers and
                nutritionists
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
