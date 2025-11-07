import { useState } from "react";
import { ArrowLeft, Send, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  senderId: "user" | "trainer";
  content: string;
  timestamp: string;
}

interface ChatThread {
  trainerId: string;
  trainerName: string;
  trainerAvatar: string;
  messages: Message[];
}

const DEMO_CHAT: ChatThread = {
  trainerId: "1",
  trainerName: "Priya Singh",
  trainerAvatar: "PS",
  messages: [
    {
      id: "1",
      senderId: "trainer",
      content: "Hi! Welcome. Let's get started with your fitness journey 💪",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      senderId: "user",
      content: "Thanks! I'm looking to build strength",
      timestamp: "10:32 AM",
    },
    {
      id: "3",
      senderId: "trainer",
      content: "Great! I have a perfect plan for you. Let's start with basic exercises.",
      timestamp: "10:35 AM",
    },
  ],
};

export default function ChatMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(DEMO_CHAT.messages);
  const [newMessage, setNewMessage] = useState("");
  const [isPremium] = useState(false);
  const [messagesUsed] = useState(3);
  const messagesLimit = 10;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (!isPremium && messagesUsed >= messagesLimit) {
      alert("You've reached your free message limit. Upgrade to premium for unlimited chat.");
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      senderId: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate trainer response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          senderId: "trainer",
          content: "Thanks for the message! I'll get back to you soon.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/messages")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{DEMO_CHAT.trainerName}</h1>
          <p className="text-xs text-gray-500">🏋️ Trainer</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.senderId === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.senderId === "user" ? "text-blue-100" : "text-gray-500"}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Limit Banner (if free user) */}
      {!isPremium && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-semibold text-blue-900">
              {messagesLimit - messagesUsed} messages left this week
            </p>
          </div>
          <p className="text-xs text-blue-800 mb-2">
            Upgrade to premium for unlimited chat with all trainers
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
            Upgrade Now
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={!isPremium && messagesUsed >= messagesLimit}
          className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={!isPremium && messagesUsed >= messagesLimit}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
