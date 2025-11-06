import { MessageCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatConversation {
  trainerId: string;
  trainerName: string;
  trainerAvatar: string;
  category: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

const DEMO_CONVERSATIONS: ChatConversation[] = [
  {
    trainerId: "1",
    trainerName: "Priya Singh",
    trainerAvatar: "PS",
    category: "Gym Trainer",
    lastMessage: "Great! I have a perfect plan for you.",
    timestamp: "2 hours ago",
    unread: 0,
  },
  {
    trainerId: "2",
    trainerName: "Raj Patel",
    trainerAvatar: "RP",
    category: "CrossFit Coach",
    lastMessage: "Ready for tomorrow's session?",
    timestamp: "5 hours ago",
    unread: 1,
  },
  {
    trainerId: "3",
    trainerName: "Neha Verma",
    trainerAvatar: "NV",
    category: "Strength Trainer",
    lastMessage: "Your progress is amazing! Keep it up 💪",
    timestamp: "1 day ago",
    unread: 0,
  },
];

export default function Messages() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 text-sm">Chat with trainers</p>
          </div>
        </div>

        {/* Conversations List */}
        <div className="px-4 py-4 space-y-2">
          {DEMO_CONVERSATIONS.length > 0 ? (
            DEMO_CONVERSATIONS.map((conv) => (
              <button
                key={conv.trainerId}
                onClick={() => navigate(`/chat/${conv.trainerId}`)}
                className="w-full flex items-start gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left border border-gray-200"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                  {conv.trainerAvatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{conv.trainerName}</h3>
                    <span className="text-xs text-gray-600">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{conv.category}</p>
                  <p className="text-sm text-gray-700 truncate">{conv.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">No messages yet</h2>
              <p className="text-gray-600 text-sm max-w-xs">
                Start a conversation with your favorite trainers and nutritionists
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
