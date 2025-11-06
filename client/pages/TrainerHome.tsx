import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/Logo";
import GlassyTile from "@/components/GlassyTile";
import { Footprints, Droplets, Flame, Users, Briefcase, Activity, MessageSquare, ChevronDown, TrendingUp, Award, Calendar, Target, Video, CheckCircle, User } from "lucide-react";
import { useTrainerClients } from "@/hooks/useTrainerClients";

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

  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=300&fit=crop"
  );
  const [profileImage, setProfileImage] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Trainer");

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

  const toggleView = (newView: string) => {
    setSearchParams({ view: newView });
  };

  // Calculate trainer's personal stats
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  const trainerWeight = 78;
  const waterGoalCalculated = Math.round((trainerWeight * 30) / 1000 * 10) / 10;

  const stepsGoal = 10000;
  const stepsCompleted = 9200;
  const caloriesGoal = 2800;
  const caloriesConsumed = 2100;
  const waterConsumed = 2.5;

  const stepsPercent = Math.round((stepsCompleted / stepsGoal) * 100);
  const caloriesPercent = Math.round((caloriesConsumed / caloriesGoal) * 100);
  const waterPercent = Math.round((waterConsumed / waterGoalCalculated) * 100);

  // Clients view stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.progress_percentage > 0).length;
  const avgProgress = Math.round(
    clients.reduce((sum, c) => sum + c.progress_percentage, 0) / clients.length
  );
  const totalVideoSessions = clients.reduce((sum, c) => sum + c.video_session_count, 0);

  const handleClientClick = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setSelectedClient(client || null);
    navigate(`/trainer/client/${clientId}`);
  };

  return (
    <div className="min-h-screen bg-white pb-36">
      {/* Logo Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-center py-3">
        <Logo size="sm" />
      </div>

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
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-600 text-sm">Coach, stay fit! 💪</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-md mx-auto px-4 -mt-8 pb-8 relative z-20 space-y-6">
            {/* Progress Bars Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 l-shape-bg fitness-gradient-1">
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
                    {stepsCompleted.toLocaleString()} / {stepsGoal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500 shadow-lg shadow-orange-600/50"
                    style={{ width: `${Math.min(stepsPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{stepsPercent}% of daily goal</p>
              </button>

              {/* Calories Progress */}
              <button
                onClick={() => navigate("/meals")}
                className="w-full text-left hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-gray-900">Calories</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {caloriesConsumed.toLocaleString()} / {caloriesGoal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-500 shadow-lg shadow-red-600/50"
                    style={{ width: `${Math.min(caloriesPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{caloriesPercent}% of daily goal</p>
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
                    {waterConsumed} / {waterGoalCalculated} L
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500 shadow-lg shadow-blue-600/50"
                    style={{ width: `${Math.min(waterPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{waterPercent}% of daily goal</p>
              </button>
            </div>

            {/* Quick Access Tiles */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 gap-3">
                <GlassyTile
                  icon={<Flame className="w-6 h-6 text-red-600" />}
                  title="Track Meals"
                  subtitle="Log your nutrition"
                  onClick={() => navigate("/meals")}
                  variant="primary"
                />
                <GlassyTile
                  icon={<Users className="w-6 h-6 text-purple-600" />}
                  title="View Clients"
                  subtitle="Manage your team"
                  onClick={() => toggleView("clients")}
                  variant="secondary"
                />
                <GlassyTile
                  icon={<Briefcase className="w-6 h-6 text-green-600" />}
                  title="Post Update"
                  subtitle="Share with community"
                  onClick={() => navigate("/feed")}
                  variant="primary"
                />
                <GlassyTile
                  icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
                  title="Messages"
                  subtitle="Chat with clients"
                  onClick={() => navigate("/messages")}
                  variant="secondary"
                />
                <GlassyTile
                  icon={<User className="w-6 h-6 text-indigo-600" />}
                  title="My Profile"
                  subtitle="View your settings"
                  onClick={() => navigate("/profile")}
                  variant="primary"
                />
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
              <p className="text-gray-600">Track your clients' progress and growth</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-cyan-700" />
                  <p className="text-xs text-cyan-700 font-medium">Total Clients</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
                <p className="text-xs text-gray-600 mt-1">{activeClients} active</p>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                  <p className="text-xs text-purple-700 font-medium">Avg Progress</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{avgProgress}%</p>
                <p className="text-xs text-gray-600 mt-1">Overall completion</p>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-5 h-5 text-green-700" />
                  <p className="text-xs text-green-700 font-medium">Video Sessions</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalVideoSessions}</p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>

              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-amber-700" />
                  <p className="text-xs text-amber-700 font-medium">Milestones</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {clients.filter((c) => c.progress_percentage >= 80).length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Near goal</p>
              </div>
            </div>

            {/* Clients List */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Clients</h2>
              <div className="space-y-3">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Client Header */}
                    <div
                      onClick={() => setExpandedClient(
                        expandedClient === client.id ? null : client.id
                      )}
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
                            <h3 className="font-bold text-gray-900">{client.name}</h3>
                            <p className="text-xs text-gray-600">{client.goal_type.replace("_", " ")}</p>
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
                            <p className="text-xs text-gray-600 mb-1">Weight Progress</p>
                            <p className="text-lg font-bold text-gray-900">
                              {client.current_stats.weight_progress_kg > 0 ? "+" : ""}
                              {client.current_stats.weight_progress_kg} kg
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Sessions</p>
                            <p className="text-lg font-bold text-gray-900">
                              {client.sessions_completed}/{client.total_sessions}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Meal Logs</p>
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

      {/* View Toggle at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-md mx-auto flex gap-2">
          <button
            onClick={() => toggleView("stats")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              view === "stats"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            My Stats
          </button>
          <button
            onClick={() => toggleView("clients")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              view === "clients"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Users className="w-5 h-5" />
            My Clients
          </button>
        </div>
      </div>
    </div>
  );
}
