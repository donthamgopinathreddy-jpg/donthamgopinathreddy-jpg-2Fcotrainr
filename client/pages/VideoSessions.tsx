import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Video, Calendar, Play, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { useTrainerClients } from "@/hooks/useTrainerClients";

interface ScheduledMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  roomId: string;
  link: string;
  selectedClients: string[];
  clientNames: string[];
  notificationSent: boolean;
}

export default function VideoSessions() {
  const navigate = useNavigate();
  const { clients } = useTrainerClients();
  const [meetingIdInput, setMeetingIdInput] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [generatedMeetingLink, setGeneratedMeetingLink] = useState("");
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([]);

  // Notification checker - runs every minute
  useEffect(() => {
    const notificationTimer = setInterval(() => {
      const now = new Date();
      
      scheduledMeetings.forEach((meeting) => {
        if (meeting.notificationSent) return; // Already sent
        
        const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
        const tenMinutesBefore = new Date(meetingDateTime.getTime() - 10 * 60 * 1000);
        
        if (now >= tenMinutesBefore && now < meetingDateTime) {
          // Send notification
          sendNotification(meeting);
          
          // Mark as sent
          setScheduledMeetings(prev =>
            prev.map(m =>
              m.id === meeting.id ? { ...m, notificationSent: true } : m
            )
          );
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(notificationTimer);
  }, [scheduledMeetings]);

  const sendNotification = (meeting: ScheduledMeeting) => {
    // Browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Meeting Starting Soon!", {
        body: `${meeting.title} starts in 10 minutes at ${meeting.time}`,
        icon: "https://cdn.builder.io/api/v1/image/assets%2Fc659d255956c4643b6576a691786eec0%2Fe823f4816a094df5bccc1efcb008e8ff?format=webp&width=800",
      });
    }
    
    // App toast notification
    toast.info(`🔔 Meeting "${meeting.title}" starts in 10 minutes!`);
  };

  const handleJoinMeeting = () => {
    if (!meetingIdInput.trim()) {
      alert("Please enter a meeting ID");
      return;
    }
    navigate(`/video-meeting?room=${meetingIdInput}`);
    toast.success("Joining meeting...");
  };

  const handleGenerateMeetingLink = () => {
    if (!meetingTitle || !meetingDate || !meetingTime) {
      alert("Please fill in all fields");
      return;
    }
    const uniqueId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const link = `${window.location.origin}/video-meeting?room=${uniqueId}&title=${encodeURIComponent(meetingTitle)}&time=${meetingDate} ${meetingTime}`;
    setGeneratedMeetingLink(link);
    toast.success("Meeting link generated!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedMeetingLink);
    toast.success("Link copied to clipboard!");
  };

  const handleSendToClients = () => {
    if (selectedClients.length === 0) {
      alert("Please select at least one client");
      return;
    }

    const clientNames = selectedClients
      .map(id => clients.find(c => c.id === id)?.name || "Unknown")
      .join(", ");

    // Request notification permission if not already granted
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Extract room ID from link
    const roomId = generatedMeetingLink.split("room=")[1]?.split("&")[0] || "";

    // Add to scheduled meetings list
    const newMeeting: ScheduledMeeting = {
      id: roomId,
      title: meetingTitle,
      date: meetingDate,
      time: meetingTime,
      roomId: roomId,
      link: generatedMeetingLink,
      selectedClients: selectedClients,
      clientNames: clientNames.split(", "),
      notificationSent: false,
    };

    setScheduledMeetings([...scheduledMeetings, newMeeting]);

    toast.success(`✓ Meeting scheduled and sent to ${selectedClients.length} client(s)`);

    // Reset form
    setGeneratedMeetingLink("");
    setMeetingTitle("");
    setMeetingDate("");
    setMeetingTime("");
    setSelectedClients([]);
  };

  const handleStartMeeting = (meeting: ScheduledMeeting) => {
    navigate(`/video-meeting?room=${meeting.roomId}&title=${encodeURIComponent(meeting.title)}`);
    toast.success("Starting meeting...");
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setScheduledMeetings(scheduledMeetings.filter(m => m.id !== meetingId));
    toast.success("Meeting removed");
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Sessions</h1>
          <p className="text-sm text-gray-600">Manage and join meetings</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Scheduled Meetings List */}
        {scheduledMeetings.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Meetings</h2>
            <div className="space-y-3">
              {scheduledMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 space-y-3"
                >
                  {/* Meeting Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base">{meeting.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(meeting.date, meeting.time)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  {/* Clients List */}
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Clients: {meeting.clientNames.length}</p>
                    <p className="text-xs text-gray-600">{meeting.clientNames.join(", ")}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartMeeting(meeting)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meeting.link);
                        toast.success("Link copied!");
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join Meeting Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Video className="w-7 h-7 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Join a Meeting</h2>
          </div>
          <p className="text-sm text-gray-600">Enter the meeting ID to join an existing session</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter meeting ID..."
              value={meetingIdInput}
              onChange={(e) => setMeetingIdInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleJoinMeeting()}
              className="flex-1 bg-white border-2 border-blue-400 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            />
            <button
              onClick={handleJoinMeeting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Join
            </button>
          </div>
        </div>

        {/* Schedule Meeting Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Schedule a Meeting</h2>
          </div>

          {!generatedMeetingLink ? (
            <>
              <p className="text-sm text-gray-600">Create a new meeting for your clients</p>

              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g., Group Training Session"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full bg-white border-2 border-purple-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full bg-white border-2 border-purple-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full bg-white border-2 border-purple-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Clients</label>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-white p-3 rounded-lg border-2 border-purple-300">
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <label key={client.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClients([...selectedClients, client.id]);
                            } else {
                              setSelectedClients(selectedClients.filter(id => id !== client.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 accent-purple-600"
                        />
                        <span className="text-sm text-gray-900 font-medium">{client.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No clients available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">{selectedClients.length} client(s) selected</p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateMeetingLink}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:opacity-90"
              >
                Generate Link
              </button>
            </>
          ) : (
            <>
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-3">
                <p className="text-sm font-bold text-gray-900">✓ Meeting Link Generated!</p>
                <div className="flex items-center gap-2 bg-white border-2 border-green-300 rounded px-3 py-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedMeetingLink}
                    className="flex-1 bg-transparent text-xs text-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="text-green-600 hover:text-green-700 font-bold transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                onClick={handleSendToClients}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Send to Clients & Schedule
              </button>

              <button
                onClick={() => {
                  setGeneratedMeetingLink("");
                  setMeetingTitle("");
                  setMeetingDate("");
                  setMeetingTime("");
                  setSelectedClients([]);
                }}
                className="w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Schedule Another
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
