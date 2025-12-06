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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="text-orange-600 font-semibold"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="font-bold text-gray-900">
              {selectedConversation.participant1?.username ||
                selectedConversation.participant2?.username}
            </h2>
            <p className="text-xs text-gray-500">Active now</p>
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
                    ? "bg-orange-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="text-sm break-words">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${message.sender_id === localStorage.getItem("userId") ? "text-orange-100" : "text-gray-500"}`}
                >
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-orange-600 font-semibold mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
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
          <p className="text-gray-600 text-lg">No conversations yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Start chatting with trainers
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className="w-full px-4 py-3 bg-white hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                👤
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">
                  {conv.participant1?.username || conv.participant2?.username}
                </p>
                <p className="text-xs text-gray-500">Click to open chat</p>
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
