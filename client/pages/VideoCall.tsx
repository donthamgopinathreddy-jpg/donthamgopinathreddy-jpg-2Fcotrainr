import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";

export default function VideoCall() {
  const navigate = useNavigate();
  const { requestCamera, requestMicrophone } = usePermissions();
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [isActive, setIsActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const requestMediaPermissions = async () => {
      try {
        const cameraGranted = await requestCamera();
        const micGranted = await requestMicrophone();

        if (!cameraGranted) {
          toast.warning("Camera permission denied. Your video will be off.");
          setIsVideoOff(true);
        }
        if (!micGranted) {
          toast.warning("Microphone permission denied. You will be muted.");
          setIsMuted(true);
        }
      } catch (error) {
        console.debug("Media permission request error:", error);
      }
    };

    requestMediaPermissions();
  }, [requestCamera, requestMicrophone]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleEndCall = () => {
    setIsActive(false);
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white relative overflow-hidden pb-24">
      {/* Video Feed Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-20" />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-white/30 text-2xl font-bold">
            No Screenshots/Recording
          </p>
          <p className="text-white/20 text-sm mt-2">
            User ID: #12345 • {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Timer Display */}
      <div className="relative z-10 mb-8">
        <div
          className={`text-6xl font-bold text-center transition-all ${
            timeLeft < 60 ? "text-red-400 animate-pulse" : "text-white"
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        {timeLeft < 60 && (
          <p className="text-red-400 text-center mt-2 font-semibold">
            Trial ending soon!
          </p>
        )}
      </div>

      {/* Trainer Info */}
      <div className="relative z-10 text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
          PS
        </div>
        <h2 className="text-2xl font-bold">Priya Singh</h2>
        <p className="text-gray-300">Gym Trainer</p>
      </div>

      {/* Control Buttons */}
      <div className="relative z-10 flex gap-4 justify-center">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all ${
            isMuted
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-all ${
            isVideoOff
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {isVideoOff ? (
            <VideoOff className="w-6 h-6" />
          ) : (
            <Video className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-gray-400 text-sm">
          This is a 10-minute free trial session
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Video will end automatically at 0:00
        </p>
      </div>
    </div>
  );
}
