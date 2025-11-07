import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Phone, MessageCircle, Users, Settings, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  pictureUrl: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isTrainer: boolean;
}

const MOCK_PARTICIPANTS: Participant[] = [
  { id: "1", name: "Priya Singh", avatar: "PS", pictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSingh", isMuted: false, isVideoOff: false, isTrainer: true },
  { id: "2", name: "Amit Kumar", avatar: "AK", pictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AmitKumar", isMuted: true, isVideoOff: false, isTrainer: false },
  { id: "3", name: "Neha Verma", avatar: "NV", pictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=NehaVerma", isMuted: false, isVideoOff: false, isTrainer: false },
  { id: "4", name: "Raj Patel", avatar: "RP", pictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=RajPatel", isMuted: false, isVideoOff: true, isTrainer: false },
  { id: "5", name: "Sarah Chen", avatar: "SC", pictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen", isMuted: false, isVideoOff: false, isTrainer: false },
  { id: "6", name: "Mike Johnson", avatar: "MJ", pictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MikeJohnson", isMuted: true, isVideoOff: false, isTrainer: false },
];

export default function VideoMeeting() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Find the trainer in the meeting
  const trainerParticipant = participants.find(p => p.isTrainer);
  const isCurrentUserTrainer = true; // In a real app, this would come from auth context
  const [chatMessages, setChatMessages] = useState([
    { id: 1, name: "Priya Singh", message: "Welcome everyone! Let's begin the session.", time: "2:15 PM" },
    { id: 2, name: "Amit Kumar", message: "Thanks for the session Priya!", time: "2:18 PM" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: chatMessages.length + 1,
          name: "You",
          message: newMessage,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setNewMessage("");
    }
  };

  const handleEndCall = () => {
    navigate("/");
  };

  const toggleMute = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    const newMutedState = !participant?.isMuted;

    setParticipants(
      participants.map((p) =>
        p.id === participantId ? { ...p, isMuted: newMutedState } : p
      )
    );

    if (isCurrentUserTrainer && participant && !participant.isTrainer) {
      toast.info(`${participant.name} is now ${newMutedState ? "muted" : "unmuted"}`);
    }
  };

  const toggleVideo = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    const newVideoOffState = !participant?.isVideoOff;

    setParticipants(
      participants.map((p) =>
        p.id === participantId ? { ...p, isVideoOff: newVideoOffState } : p
      )
    );

    if (isCurrentUserTrainer && participant && !participant.isTrainer) {
      toast.info(`${participant.name}'s camera is now ${newVideoOffState ? "off" : "on"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-white font-bold">Group Training Session</h1>
            <p className="text-gray-400 text-xs">{participants.length} participants</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
            title="Toggle chat"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors" title="Share screen">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors" title="Settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`relative rounded-lg overflow-hidden bg-gray-800 aspect-video flex items-center justify-center group ${
                  participant.isTrainer ? "border-2 border-primary" : "border border-gray-700"
                }`}
              >
                {/* Video Background */}
                {participant.isVideoOff ? (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-700">
                    <img
                      src={participant.pictureUrl}
                      alt={participant.name}
                      className="w-32 h-32 rounded-full object-cover mb-3 border-4 border-gray-600"
                    />
                    <p className="text-gray-300 font-semibold">{participant.name}</p>
                    <p className="text-gray-400 text-xs mt-1">Camera off</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden">
                    {/* Video stream placeholder with particle effect */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="w-full h-full bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 result=%22noise%22 /></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23noise)%22 opacity=%220.5%22/></svg>')] animate-pulse"></div>
                    </div>
                    {/* Profile picture overlay in top-left corner */}
                    <img
                      src={participant.pictureUrl}
                      alt={participant.name}
                      className="absolute bottom-3 right-3 w-12 h-12 rounded-full object-cover border-2 border-white z-10"
                    />
                  </div>
                )}

                {/* Trainer Badge */}
                {participant.isTrainer && (
                  <div className="absolute top-2 left-2 bg-primary text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                    Trainer
                  </div>
                )}

                {/* Participant Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white font-semibold text-sm">{participant.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {participant.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                    {participant.isVideoOff && <VideoOff className="w-3 h-3 text-red-500" />}
                  </div>
                </div>

                {/* Trainer Controls - Visible on hover if current user is trainer and this is a client */}
                {isCurrentUserTrainer && !participant.isTrainer && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-black/60 rounded-lg p-1">
                    <button
                      onClick={() => toggleMute(participant.id)}
                      className={`p-2 rounded-full transition-colors ${
                        participant.isMuted
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                      title={participant.isMuted ? "Unmute client" : "Mute client"}
                    >
                      {participant.isMuted ? (
                        <MicOff className="w-4 h-4 text-white" />
                      ) : (
                        <Mic className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleVideo(participant.id)}
                      className={`p-2 rounded-full transition-colors ${
                        participant.isVideoOff
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                      title={participant.isVideoOff ? "Turn on client camera" : "Turn off client camera"}
                    >
                      {participant.isVideoOff ? (
                        <VideoOff className="w-4 h-4 text-white" />
                      ) : (
                        <Video className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-700 px-4 py-3">
              <h2 className="text-white font-bold">Chat</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold">{msg.name}</p>
                    <p className="text-gray-400 text-xs">{msg.time}</p>
                  </div>
                  <p className="text-gray-300 bg-gray-700 rounded px-3 py-2">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-700 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Send a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-primary text-gray-900 px-3 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-colors ${
            isMuted
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-colors ${
            isVideoOff
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? (
            <VideoOff className="w-6 h-6 text-white" />
          ) : (
            <Video className="w-6 h-6 text-white" />
          )}
        </button>

        <div className="w-px h-8 bg-gray-700" />

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          title="End call"
        >
          <Phone className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
