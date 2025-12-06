import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Send } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useMessages } from "@/hooks/useMessages";
import { toast } from "sonner";

export default function MobileMessages() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { conversations, messages, loading, sendMessage } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  const selectedMessages = selectedConversation
    ? messages.filter((m: any) => m.conversation_id === selectedConversation.id)
    : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation.id, messageText);
      setMessageText("");
      toast.success("Message sent");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  if (selectedConversation) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"}`}>
        {/* Header */}
        <div className={`backdrop-blur-md border-b px-4 py-3 flex items-center gap-3 ${theme === "dark" ? "bg-gray-950/95 border-gray-800/50" : "bg-white/80 border-purple-200/30"}`}>
          <button
            onClick={() => setSelectedConversation(null)}
            className="text-orange-600 font-semibold"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {selectedConversation.participant1?.username ||
                selectedConversation.participant2?.username}
            </h2>
            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Active now</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
          {selectedMessages.map((message: any, idx: number) => (
            <div
              key={idx}
              className={`flex ${message.sender_id === localStorage.getItem("userId") ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  message.sender_id === localStorage.getItem("userId")
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none"
                    : theme === "dark"
                    ? "bg-gray-700 text-gray-100 rounded-bl-none"
                    : "bg-white/80 text-gray-900 rounded-bl-none border border-purple-200/30"
                }`}
              >
                <p className="text-sm break-words">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${message.sender_id === localStorage.getItem("userId") ? "text-purple-100" : theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-md border-t px-4 py-3 safe-area-inset-bottom ${theme === "dark" ? "bg-gray-950/95 border-gray-800/50" : "bg-white/80 border-purple-200/30"}`}>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-md border-b px-4 py-3 ${theme === "dark" ? "bg-gray-950/95 border-gray-800/50" : "bg-white/80 border-purple-200/30"}`}>
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-2 font-semibold mb-4 ${theme === "dark" ? "text-purple-400 hover:text-purple-300" : "text-orange-600 hover:text-orange-700"}`}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Messages</h1>
      </div>

      {/* Search */}
      <div className={`px-4 py-4 backdrop-blur-md border-b ${theme === "dark" ? "bg-gray-950/95 border-gray-800/50" : "bg-white/80 border-purple-200/30"}`}>
        <div className="relative">
          <Search className={`absolute left-3 top-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            className={`w-full pl-10 pr-4 py-2 rounded-full border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white/80 border-purple-200/30 text-gray-900 placeholder-gray-500"}`}
          />
        </div>
      </div>

      {/* Conversations */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>No conversations yet</p>
          <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Start chatting with trainers
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className={`w-full px-4 py-3 backdrop-blur-sm border-b flex items-center gap-3 transition-colors ${theme === "dark" ? "bg-gray-800/50 hover:bg-gray-700/50 border-gray-800/50" : "bg-white/60 hover:bg-white/80 border-purple-200/30"}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                👤
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {conv.participant1?.username || conv.participant2?.username}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Click to open chat</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
            </button>
          ))}
        </div>
      )}

      {/* New Message Button */}
      <button className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
        <Plus size={28} />
      </button>
    </div>
  );
}
