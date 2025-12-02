import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface DailyStats {
  date: string;
  steps: number;
  day: string;
  dayName: string;
}

export default function InsightsSteps() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!userProfile?.id) return;

      try {
        const today = new Date();
        const sevenDaysAgo = new Date(
          today.getTime() - 7 * 24 * 60 * 60 * 1000,
        );

        const { data, error } = await supabase
          .from("daily_stats")
          .select("date, steps")
          .eq("user_id", userProfile.id)
          .gte("date", sevenDaysAgo.toISOString().split("T")[0])
          .lte("date", today.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (data) {
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const formattedData = (data || []).map((item: any) => {
            const date = new Date(item.date);
            return {
              date: item.date,
              steps: item.steps || 0,
              day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
              dayName: dayNames[date.getDay()],
            };
          });
          setWeeklyData(formattedData);

          // Calculate streak from most recent date backwards
          let streak = 0;
          for (let i = formattedData.length - 1; i >= 0; i--) {
            if (formattedData[i].steps >= 10000) {
              streak++;
            } else {
              break;
            }
          }
          setCurrentStreak(streak);
        }
      } catch (error) {
        console.error("Error fetching weekly data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [userProfile?.id]);

  const maxSteps = Math.max(...weeklyData.map((d) => d.steps), 10000);
  const avgSteps =
    weeklyData.length > 0
      ? Math.round(
          weeklyData.reduce((sum, d) => sum + d.steps, 0) / weeklyData.length,
        )
      : 0;
  const totalSteps = weeklyData.reduce((sum, d) => sum + d.steps, 0);
  const bestDay = weeklyData.reduce(
    (best, current) => (current.steps > best.steps ? current : best),
    { steps: 0, day: "N/A", date: "", dayName: "N/A" },
  );

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-[430px] mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Weekly Steps</h1>
        </div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 pt-6 space-y-6">
        {/* Animated Streak Counter */}
        {currentStreak > 0 && (
          <div className="animate-pulse">
            <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl p-6 shadow-lg border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="animate-bounce">
                  <Flame size={28} className="text-white drop-shadow-lg" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold opacity-90">Current Streak</p>
                  <p className="text-white text-3xl font-bold">{currentStreak}</p>
                </div>
              </div>
              <p className="text-white text-sm opacity-90">
                {currentStreak === 1
                  ? "Keep it going! 🎯"
                  : `Amazing! ${currentStreak} days in a row! 🔥`}
              </p>
            </div>
          </div>
        )}

        {/* Analytical Tiles - Bar Style */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-900 px-1">Weekly Analytics</h2>

          {/* Total Steps Tile */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Total Steps</p>
              <p className="text-xl font-bold text-orange-600">
                {totalSteps.toLocaleString()}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700"
                style={{ width: `${Math.min((totalSteps / 70000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">70,000 steps weekly target</p>
          </div>

          {/* Average Steps Tile */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-yellow-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Avg per Day</p>
              <p className="text-xl font-bold text-yellow-600">
                {avgSteps.toLocaleString()}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-700"
                style={{ width: `${Math.min((avgSteps / 10000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">10,000 daily goal</p>
          </div>

          {/* Best Day Tile */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Best Day</p>
              <p className="text-xl font-bold text-red-600">
                {bestDay.steps.toLocaleString()}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
                style={{ width: `${Math.min((bestDay.steps / maxSteps) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {bestDay.day !== "N/A" ? `${bestDay.dayName}` : "No data"}
            </p>
          </div>

          {/* Goal Progress Tile */}
          <div className="bg-white rounded-2xl p-4 shadow-md border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Goal Progress</p>
              <p className="text-xl font-bold text-green-600">
                {totalSteps >= 70000 ? "100" : Math.round((totalSteps / 70000) * 100)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-700"
                style={{ width: `${Math.min((totalSteps / 70000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.max(0, 70000 - totalSteps).toLocaleString()} steps to goal
            </p>
          </div>
        </div>

        {/* Daily Breakdown Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Daily Breakdown</h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : weeklyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <div className="space-y-5">
              {weeklyData.map((day, idx) => (
                <div key={day.date} className="animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{day.dayName}</p>
                      <p className="text-xs text-gray-500">{formatDateFull(day.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">
                        {day.steps.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {day.steps >= 10000 ? "✓ Goal" : `${10000 - day.steps} to go`}
                      </p>
                    </div>
                  </div>

                  {/* Animated Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        day.steps >= 10000
                          ? "bg-gradient-to-r from-green-500 to-green-400"
                          : "bg-gradient-to-r from-orange-500 to-yellow-400"
                      }`}
                      style={{ width: `${(day.steps / maxSteps) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-6 border border-orange-200">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Insights</h3>
              <p className="text-sm text-gray-700 mt-2">
                {totalSteps >= 70000
                  ? "🔥 Great work! You've crushed your weekly goal!"
                  : totalSteps >= 50000
                    ? "💪 Keep it up! You're on track."
                    : "👟 Get moving! Increase your daily steps."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
