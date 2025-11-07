import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Video,
  TrendingUp,
  Calendar,
  Utensils,
  Edit2,
  Save,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useTrainerClients } from "@/hooks/useTrainerClients";

export default function TrainerClientDetail() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { getClientStats, updateClientNotes } = useTrainerClients();
  const client = getClientStats(clientId || "");

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(client?.notes || "");

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Client not found</p>
      </div>
    );
  }

  const handleSaveNotes = () => {
    updateClientNotes(client.id, notes);
    setIsEditingNotes(false);
  };

  const bmi = Math.round((client.weight_kg / (client.height_cm / 100) ** 2) * 10) / 10;
  const weightRemaining = client.goal_weight_kg ? client.goal_weight_kg - client.weight_kg : 0;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate("/trainer-dashboard")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <Logo size="sm" />
        <div className="w-10" />
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Client Header */}
        <div className="text-center mb-8">
          <img
            src={client.avatar}
            alt={client.name}
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-200"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{client.name}</h1>
          <p className="text-gray-600">{client.goal_type.replace("_", " ")}</p>
          <p className="text-xs text-gray-500 mt-2">Joined {client.joined_date}</p>
        </div>

        {/* Goal Progress */}
        <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Progress to Goal</h3>
            <span className="text-2xl font-bold text-cyan-700">{client.progress_percentage}%</span>
          </div>
          <div className="bg-white/50 rounded-full h-3 overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
              style={{ width: `${client.progress_percentage}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-600 text-xs">Current</p>
              <p className="font-bold text-gray-900">{client.weight_kg} kg</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Remaining</p>
              <p className="font-bold text-gray-900">
                {weightRemaining > 0 ? "-" : "+"}
                {Math.abs(weightRemaining)} kg
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Goal</p>
              <p className="font-bold text-gray-900">{client.goal_weight_kg} kg</p>
            </div>
          </div>
        </div>

        {/* Body Metrics */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Body Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Height</p>
              <p className="text-xl font-bold text-gray-900">{client.height_cm} cm</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Current Weight</p>
              <p className="text-xl font-bold text-gray-900">{client.weight_kg} kg</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">BMI</p>
              <p className="text-xl font-bold text-gray-900">{bmi}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Weight Change</p>
              <p className={`text-xl font-bold ${client.current_stats.weight_progress_kg < 0 ? "text-green-600" : "text-gray-900"}`}>
                {client.current_stats.weight_progress_kg > 0 ? "+" : ""}
                {client.current_stats.weight_progress_kg} kg
              </p>
            </div>
          </div>
        </div>

        {/* Training Sessions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Training Activity</h2>
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-center gap-3">
              <Video className="w-6 h-6 text-cyan-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Video Sessions</p>
                <p className="text-xs text-gray-600">{client.video_session_count} completed</p>
              </div>
              <p className="text-2xl font-bold text-cyan-600">{client.video_session_count}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Booked Sessions</p>
                <p className="text-xs text-gray-600">
                  {client.sessions_completed}/{client.total_sessions}
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((client.sessions_completed / client.total_sessions) * 100)}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
              <Utensils className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Meal Logs</p>
                <p className="text-xs text-gray-600">
                  {client.meal_logs_this_week}/21 this week
                </p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((client.meal_logs_this_week / 21) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Daily Averages */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Weekly Averages</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <p className="text-gray-700">Daily Calories</p>
              <p className="font-bold text-gray-900">{client.current_stats.calories_avg_daily} cal</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <p className="text-gray-700">Daily Protein</p>
              <p className="font-bold text-gray-900">{client.current_stats.protein_g_avg_daily}g</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <p className="text-gray-700">Workouts/Week</p>
              <p className="font-bold text-gray-900">{client.current_stats.workout_frequency_weekly}x</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-700">Avg Session Duration</p>
              <p className="font-bold text-gray-900">{client.avg_session_duration_min} min</p>
            </div>
          </div>
        </div>

        {/* Trainer Notes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Trainer Notes</h2>
            <button
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isEditingNotes ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </button>
          </div>

          {isEditingNotes ? (
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this client..."
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <button
                onClick={handleSaveNotes}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Notes
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">{notes || "No notes yet. Click edit to add notes."}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message
          </button>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Video className="w-5 h-5" />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
