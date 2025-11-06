import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  Award,
  Target,
  Activity,
  Video,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useTrainerClients } from "@/hooks/useTrainerClients";
import { useAuth } from "@/contexts/AuthContext";

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { clients, selectedClient, setSelectedClient } = useTrainerClients();
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

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
    <div className="min-h-screen bg-white">
      {/* Logo Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-center py-3">
        <Logo size="sm" />
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {userProfile?.full_name?.split(" ")[0] || "Coach"}! 👋
          </h1>
          <p className="text-gray-600">Manage your clients and track their progress</p>
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

                    {/* Current Stats */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                      <p className="text-xs font-bold text-gray-900 uppercase">Weekly Average</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Calories/day</p>
                          <p className="font-bold text-gray-900">
                            {client.current_stats.calories_avg_daily}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Protein/day</p>
                          <p className="font-bold text-gray-900">
                            {client.current_stats.protein_g_avg_daily}g
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Workouts/week</p>
                          <p className="font-bold text-gray-900">
                            {client.current_stats.workout_frequency_weekly}x
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Duration</p>
                          <p className="font-bold text-gray-900">
                            {client.avg_session_duration_min}min
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Trainer Notes */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-bold text-gray-900 mb-2">NOTES</p>
                      <p className="text-sm text-gray-700">{client.notes}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClientClick(client.id)}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        View Details
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-4 text-left hover:shadow-lg transition-all">
              <Users className="w-6 h-6 text-cyan-600 mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Add New Client</p>
            </button>
            <button className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 text-left hover:shadow-lg transition-all">
              <Calendar className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Schedule Session</p>
            </button>
            <button className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4 text-left hover:shadow-lg transition-all">
              <Target className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Set Goals</p>
            </button>
            <button className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-4 text-left hover:shadow-lg transition-all">
              <Award className="w-6 h-6 text-amber-600 mb-2" />
              <p className="font-semibold text-gray-900 text-sm">Achievements</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
