import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GlassyTile from "@/components/GlassyTile";
import StreaksCard from "@/components/StreaksCard";
import {
  Footprints,
  Droplets,
  Flame,
  Users,
  Briefcase,
  Activity,
  MessageSquare,
  ChevronDown,
  TrendingUp,
  Award,
  Calendar,
  Target,
  Video,
  CheckCircle,
  User,
  Heart,
  Share2,
  MessageCircle as MessageIcon,
  Newspaper,
  MapPin,
  UserCheck,
  Settings,
  Copy,
  Check,
  Play,
  Clock,
  X,
} from "lucide-react";
import { useTrainerClients } from "@/hooks/useTrainerClients";
import { toast } from "sonner";

// Sample posts data
interface PostData {
  id: string;
  authorName: string;
  authorRole: "trainer" | "client";
  authorAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  followed: boolean;
  createdAt: string;
}

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

const LATEST_POSTS: PostData[] = [
  {
    id: "1",
    authorName: "Priya Singh",
    authorRole: "trainer",
    authorAvatar: "PS",
    content:
      "🔥 New transformation! Check out my client Rahul's amazing 12-week journey. Consistency is key! #FitnessJourney",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop",
    likes: 324,
    comments: 47,
    shares: 23,
    liked: false,
    followed: false,
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    authorName: "Amit Kumar",
    authorRole: "client",
    authorAvatar: "AK",
    content:
      "Day 30 of my fitness journey! Started with my trainer Raj at CrossFit. Already seeing results 💪",
    image:
      "https://images.unsplash.com/photo-1552672260-7bdde322fa4f?w=500&h=500&fit=crop",
    likes: 156,
    comments: 28,
    shares: 12,
    liked: true,
    followed: false,
    createdAt: "4 hours ago",
  },
  {
    id: "3",
    authorName: "Neha Verma",
    authorRole: "trainer",
    authorAvatar: "NV",
    content:
      "💡 Tip: Start your workout with a 5-min warm-up. It increases blood flow and prevents injuries. Tag someone who needs this!",
    likes: 542,
    comments: 89,
    shares: 156,
    liked: false,
    followed: false,
    createdAt: "6 hours ago",
  },
];

const MOTIVATIONAL_QUOTES = [
  "Lead by example! Keep crushing your goals! 🚀",
  "Your growth inspires your clients! 💪",
  "Great trainers stay trained! 🎯",
  "Consistency in coaching creates clients' success! 🏛️",
  "Train hard, teach harder! ⚡",
];

export default function TrainerHome() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") || "stats";
  const [latestPosts, setLatestPosts] = useState<PostData[]>(LATEST_POSTS);

  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop",
  );
  const [profileImage, setProfileImage] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Trainer",
  );

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const { clients, selectedClient, setSelectedClient } = useTrainerClients();
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [stepsTarget, setStepsTarget] = useState(10000);
  const [editStepsTarget, setEditStepsTarget] = useState(stepsTarget);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] =
    useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [generatedMeetingLink, setGeneratedMeetingLink] = useState("");
  const [scheduledMeetings, setScheduledMeetings] = useState<
    ScheduledMeeting[]
  >(() => {
    try {
      const saved = localStorage.getItem("scheduledMeetings");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const toggleView = (newView: string) => {
    setSearchParams({ view: newView });
  };

  // Listen for changes to localStorage (synced from VideoSessions page)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("scheduledMeetings");
        setScheduledMeetings(saved ? JSON.parse(saved) : []);
      } catch {
        setScheduledMeetings([]);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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

  const handleStartMeeting = (meeting: ScheduledMeeting) => {
    navigate(
      `/video-meeting?room=${meeting.roomId}&title=${encodeURIComponent(meeting.title)}`,
    );
    toast.success("Starting meeting...");
  };

  // Calculate trainer's personal stats
  const quote =
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const trainerWeight = 78;
  const trainerHeight = 178; // cm
  const waterGoal = Math.round(((trainerWeight * 30) / 1000) * 10) / 10;

  // Calculate BMI
  const heightInMeters = trainerHeight / 100;
  const bmi =
    Math.round((trainerWeight / (heightInMeters * heightInMeters)) * 10) / 10;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return {
        category: "Underweight",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    if (bmi < 25)
      return {
        category: "Normal",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    if (bmi < 30)
      return {
        category: "Overweight",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    return { category: "Obese", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const bmiStatus = getBMICategory(bmi);

  const stepsGoal = stepsTarget;
  const stepsCompleted = 9200;
  const caloriesBurned = Math.round(stepsCompleted * 0.05);
  const waterConsumed = 2.5;

  const handleSaveTargets = () => {
    setStepsTarget(editStepsTarget);
    setShowTargetsModal(false);
    toast.success("Steps target updated!");
  };

  const stepsPercent = Math.round((stepsCompleted / stepsGoal) * 100);
  const caloriesPercent = Math.round((caloriesBurned / 400) * 100);
  const waterPercent = Math.round((waterConsumed / waterGoal) * 100);

  // Clients view stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.progress_percentage > 0).length;
  const avgProgress = Math.round(
    clients.reduce((sum, c) => sum + c.progress_percentage, 0) / clients.length,
  );
  const totalVideoSessions = clients.reduce(
    (sum, c) => sum + c.video_session_count,
    0,
  );

  const handleClientClick = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setSelectedClient(client || null);
    navigate(`/trainer/client/${clientId}`);
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
      .map((id) => clients.find((c) => c.id === id)?.name || "Unknown")
      .join(", ");
    alert(
      `Meeting link sent to: ${clientNames}\n\nLink: ${generatedMeetingLink}`,
    );
    toast.success(`Sent to ${selectedClients.length} client(s)`);
  };

  const handleJoinMeeting = () => {
    if (!meetingIdInput.trim()) {
      alert("Please enter a meeting ID");
      return;
    }
    navigate(`/video-meeting?room=${meetingIdInput}`);
    toast.success("Joining meeting...");
  };

  return (
    <div
      className={`min-h-screen pb-36 ${
        theme === "light" ? "bg-white" : "bg-gray-950"
      }`}
    >
      {/* Conditional View Rendering */}
      {view === "stats" ? (
        <>
          {/* Hero Header with Cover Image */}
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 h-64">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />

            <label className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all">
              <svg
                className="w-5 h-5 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
            </label>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-6">
              <p className="text-white text-base font-medium">{quote}</p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="max-w-md mx-auto px-4 -mt-16 relative z-20 mb-8">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg cursor-pointer shadow-lg transition-all">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome Back
                </h1>
                <p className="text-gray-600 text-sm">Coach, stay fit! 💪</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-md mx-auto px-4 -mt-8 pb-8 relative z-20 space-y-6">
            {/* Progress Bars Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 l-shape-bg fitness-gradient-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  Today's Stats
                </h2>
                <button
                  onClick={() => {
                    setEditStepsTarget(stepsTarget);
                    setShowTargetsModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-semibold"
                >
                  <Settings className="w-4 h-4" />
                  Edit Steps
                </button>
              </div>

              {/* Steps Progress */}
              <button
                onClick={() => navigate("/activity/steps")}
                className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-gray-900">Steps</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    12500 / {stepsGoal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500 shadow-lg shadow-orange-600/50"
                    style={{ width: `${Math.min(stepsPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {stepsPercent}% of daily goal
                </p>
              </button>

              {/* Calories Progress */}
              <button
                onClick={() => navigate("/meals")}
                className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-gray-900">
                      Calories Burned
                    </span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    620 cal
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-500 shadow-lg shadow-red-600/50"
                    style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  ~620 cal from 12500 steps
                </p>
              </button>

              {/* Water Progress */}
              <button
                onClick={() => navigate("/meals")}
                className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Water</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    3.2 / {waterGoal} L
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500 shadow-lg shadow-blue-600/50"
                    style={{ width: `${Math.min(waterPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {waterPercent}% of daily goal
                </p>
              </button>
            </div>

            {/* BMI Index Card */}
            <div
              className={`${bmiStatus.bgColor} border-2 border-gray-200 rounded-2xl p-6 space-y-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className={`w-6 h-6 ${bmiStatus.color}`} />
                  <h2 className="text-lg font-bold text-gray-900">BMI Index</h2>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${bmiStatus.color} mb-2`}>
                  {bmi}
                </div>
                <p className={`text-sm font-semibold ${bmiStatus.color} mb-3`}>
                  {bmiStatus.category}
                </p>
                <p className="text-xs text-gray-600">
                  Height: {trainerHeight}cm | Weight: {trainerWeight}kg
                </p>
              </div>
              <div className="flex gap-2 text-xs text-gray-700">
                <div className="flex-1 text-center">
                  <p className="font-semibold">Normal</p>
                  <p className="text-gray-500">18.5 - 24.9</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="font-semibold">Overweight</p>
                  <p className="text-gray-500">25 - 29.9</p>
                </div>
              </div>
            </div>

            {/* Quick Access Tiles */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Quick Access
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/meals")}
                  className="bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 rounded-2xl p-5 border border-orange-200 hover:shadow-lg hover:shadow-orange-300/50 transition-all transform hover:scale-105"
                >
                  <Flame className="w-7 h-7 text-orange-600 mb-2" />
                  <p className="font-bold text-gray-900 text-sm">Track Meals</p>
                  <p className="text-xs text-gray-600">Log nutrition</p>
                </button>
                <button
                  onClick={() => toggleView("clients")}
                  className="bg-gradient-to-br from-cyan-100 via-blue-100 to-teal-100 rounded-2xl p-5 border border-cyan-200 hover:shadow-lg hover:shadow-cyan-300/50 transition-all transform hover:scale-105"
                >
                  <Users className="w-7 h-7 text-cyan-600 mb-2" />
                  <p className="font-bold text-gray-900 text-sm">
                    View Clients
                  </p>
                  <p className="text-xs text-gray-600">Manage team</p>
                </button>
                <button
                  onClick={() => navigate("/feed")}
                  className="bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 rounded-2xl p-5 border border-purple-200 hover:shadow-lg hover:shadow-purple-300/50 transition-all transform hover:scale-105"
                >
                  <Newspaper className="w-7 h-7 text-purple-600 mb-2" />
                  <p className="font-bold text-gray-900 text-sm">Feed</p>
                  <p className="text-xs text-gray-600">See other users</p>
                </button>
                <button
                  onClick={() => navigate("/discover")}
                  className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-2xl p-5 border border-green-200 hover:shadow-lg hover:shadow-green-300/50 transition-all transform hover:scale-105"
                >
                  <MapPin className="w-7 h-7 text-green-600 mb-2" />
                  <p className="font-bold text-gray-900 text-sm">Network</p>
                  <p className="text-xs text-gray-600">Find trainers</p>
                </button>
                <button
                  onClick={() => navigate("/video-sessions")}
                  className="w-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl p-5 border border-blue-200 hover:shadow-lg hover:shadow-blue-300/50 transition-all transform hover:scale-105 text-left"
                >
                  <Video className="w-7 h-7 text-blue-600 mb-2" />
                  <p className="font-bold text-gray-900 text-sm">
                    Video Session
                  </p>
                  <p className="text-xs text-gray-600">
                    Schedule or join meetings
                  </p>
                </button>
                <button
                  onClick={() => navigate("/diet-plans")}
                  className="bg-gradient-to-br from-green-100 via-lime-100 to-emerald-100 rounded-2xl p-5 border border-green-200 hover:shadow-lg hover:shadow-green-300/50 transition-all transform hover:scale-105"
                >
                  <span className="text-2xl mb-2 block">🥗</span>
                  <p className="font-bold text-gray-900 text-sm">Diet Plans</p>
                  <p className="text-xs text-gray-600">Create & share</p>
                </button>
                <button
                  onClick={() => navigate("/achievements")}
                  className="bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-2xl p-5 border border-yellow-200 hover:shadow-lg hover:shadow-yellow-300/50 transition-all transform hover:scale-105"
                >
                  <span className="text-2xl mb-2 block">🏆</span>
                  <p className="font-bold text-gray-900 text-sm">
                    Achievements
                  </p>
                  <p className="text-xs text-gray-600">View milestones</p>
                </button>
                <button
                  onClick={() => navigate("/training-modes")}
                  className="bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 rounded-2xl p-5 border border-pink-200 hover:shadow-lg hover:shadow-pink-300/50 transition-all transform hover:scale-105"
                >
                  <span className="text-2xl mb-2 block">🎯</span>
                  <p className="font-bold text-gray-900 text-sm">
                    Training Modes
                  </p>
                  <p className="text-xs text-gray-600">Update preferences</p>
                </button>
              </div>
            </div>

            {/* Streaks Card */}
            <StreaksCard compact={false} />

            {/* Latest Posts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Latest Posts
                </h2>
                <button
                  onClick={() => navigate("/feed")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {latestPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all"
                  >
                    {/* Post Header */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {post.authorAvatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">
                            {post.authorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {post.createdAt}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setLatestPosts(
                              latestPosts.map((p) =>
                                p.id === post.id
                                  ? { ...p, followed: !p.followed }
                                  : p,
                              ),
                            )
                          }
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold text-xs transition-all flex-shrink-0 ${
                            post.followed
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {post.followed ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Following
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3" />
                              Follow
                            </>
                          )}
                        </button>
                      </div>

                      {/* Post Content */}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {post.content}
                      </p>

                      {/* Post Image */}
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post"
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}

                      {/* Post Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-3">
                        <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                          <Heart
                            className={`w-4 h-4 ${post.liked ? "fill-red-600 text-red-600" : ""}`}
                          />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <MessageIcon className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Clients View */}
          <div className="max-w-md mx-auto px-4 py-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Manage Clients 👥
              </h1>
              <p className="text-gray-600">
                Track your clients' progress and growth
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-cyan-700" />
                  <p className="text-xs text-cyan-700 font-medium">
                    Total Clients
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {totalClients}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {activeClients} active
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                  <p className="text-xs text-purple-700 font-medium">
                    Avg Progress
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {avgProgress}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Overall completion</p>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-5 h-5 text-green-700" />
                  <p className="text-xs text-green-700 font-medium">
                    Video Sessions
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {totalVideoSessions}
                </p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>

              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-amber-700" />
                  <p className="text-xs text-amber-700 font-medium">
                    Milestones
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {clients.filter((c) => c.progress_percentage >= 80).length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Near goal</p>
              </div>
            </div>

            {/* Clients List */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Clients
              </h2>
              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Client Header */}
                    <div
                      onClick={() =>
                        setExpandedClient(
                          expandedClient === client.id ? null : client.id,
                        )
                      }
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">
                              {client.name}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {client.goal_type.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {client.progress_percentage}%
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedClient === client.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
                          style={{ width: `${client.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedClient === client.id && (
                      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50 space-y-4">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">
                              Weight Progress
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {client.current_stats.weight_progress_kg > 0
                                ? "+"
                                : ""}
                              {client.current_stats.weight_progress_kg} kg
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">
                              Sessions
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {client.sessions_completed}/
                              {client.total_sessions}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">
                              Meal Logs
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {client.meal_logs_this_week}/21
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Videos</p>
                            <p className="text-lg font-bold text-gray-900">
                              {client.video_session_count}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleClientClick(client.id)}
                            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Activity className="w-4 h-4" />
                            Details
                          </button>
                          <button className="flex-1 bg-gray-100 text-gray-900 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Steps Target Edit Modal */}
      {showTargetsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Edit Daily Steps Target
            </h2>
            <p className="text-sm text-gray-600">
              Set your daily step goal. Calories burned and water intake are
              calculated automatically.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Steps Goal
              </label>
              <input
                type="number"
                value={editStepsTarget}
                onChange={(e) =>
                  setEditStepsTarget(parseInt(e.target.value) || 0)
                }
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-2">
                • Calories burned = steps × 0.05 cal
              </p>
              <p className="text-xs text-gray-500">
                • Water goal = weight × 30ml (currently {waterGoal}L)
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowTargetsModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTargets}
                className="flex-1 bg-primary text-primary-foreground font-medium py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleMeetingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 max-h-screen overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 my-4">
            <h2 className="text-lg font-bold text-gray-900">
              Schedule Video Meeting
            </h2>

            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                placeholder="e.g., Group Training Session"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Client Selection */}
            {!generatedMeetingLink && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Clients to Invite
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <label
                        key={client.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClients([
                                ...selectedClients,
                                client.id,
                              ]);
                            } else {
                              setSelectedClients(
                                selectedClients.filter(
                                  (id) => id !== client.id,
                                ),
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-900">
                          {client.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">
                      No clients available
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedClients.length} client(s) selected
                </p>
              </div>
            )}

            {/* Generated Link Display */}
            {generatedMeetingLink && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                <p className="text-sm font-semibold text-gray-900">
                  Meeting Link Generated!
                </p>
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedMeetingLink}
                    className="flex-1 bg-transparent text-xs text-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              {!generatedMeetingLink ? (
                <>
                  <button
                    onClick={() => {
                      setShowScheduleMeetingModal(false);
                      setMeetingTitle("");
                      setMeetingDate("");
                      setMeetingTime("");
                      setSelectedClients([]);
                      setGeneratedMeetingLink("");
                    }}
                    className="flex-1 bg-gray-100 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateMeetingLink}
                    className="flex-1 bg-primary text-primary-foreground font-medium py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Generate Link
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setGeneratedMeetingLink("");
                      setMeetingTitle("");
                      setMeetingDate("");
                      setMeetingTime("");
                      setSelectedClients([]);
                    }}
                    className="flex-1 bg-gray-100 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Schedule New
                  </button>
                  <button
                    onClick={handleSendToClients}
                    className="flex-1 bg-primary text-primary-foreground font-medium py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Send to Clients
                  </button>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowScheduleMeetingModal(false);
                setMeetingTitle("");
                setMeetingDate("");
                setMeetingTime("");
                setSelectedClients([]);
                setGeneratedMeetingLink("");
              }}
              className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium py-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
