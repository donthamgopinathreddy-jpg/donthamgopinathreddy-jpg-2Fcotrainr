import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface DailyStats {
  date: string;
  distance: number;
  day: string;
  dayName: string;
}

export default function InsightsDistance() {
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
          .select("date, distance_km")
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
              distance: item.distance_km || 0,
              day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
              dayName: dayNames[date.getDay()],
            };
          });
          setWeeklyData(formattedData);

          let streak = 0;
          for (let i = formattedData.length - 1; i >= 0; i--) {
            if (formattedData[i].distance >= 1.4) {
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

  const maxDistance = Math.max(...weeklyData.map((d) => d.distance), 10);
  const avgDistance =
    weeklyData.length > 0
      ? (
          weeklyData.reduce((sum, d) => sum + d.distance, 0) / weeklyData.length
        ).toFixed(1)
      : "0";
  const totalDistance = weeklyData
    .reduce((sum, d) => sum + d.distance, 0)
    .toFixed(1);
  const bestDay = weeklyData.reduce(
    (best, current) =>
      current.distance > best.distance ? current : best,
    { distance: 0, day: "N/A", date: "", dayName: "N/A" },
  );

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-[430px] mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Weekly Distance</h1>
        </div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 pt-6 space-y-6">
        {/* Animated Streak Counter */}
        {currentStreak > 0 && (
          <div className="animate-pulse">
            <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-3xl p-6 shadow-lg border border-green-200">
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

          <div className="bg-white rounded-2xl p-4 shadow-md border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Total</p>
              <p className="text-xl font-bold text-green-600">
                {totalDistance}km
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-700"
                style={{ width: `${Math.min((parseFloat(totalDistance) / 50) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">50km weekly target</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Avg per Day</p>
              <p className="text-xl font-bold text-emerald-600">
                {avgDistance}km
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min((parseFloat(avgDistance) / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">10km daily goal</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md border border-teal-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Best Day</p>
              <p className="text-xl font-bold text-teal-600">
                {bestDay.distance.toFixed(2)}km
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700"
                style={{ width: `${Math.min((bestDay.distance / maxDistance) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {bestDay.day !== "N/A" ? `${bestDay.dayName}` : "No data"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md border border-cyan-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">Progress</p>
              <p className="text-xl font-bold text-cyan-600">
                {Math.round((parseFloat(totalDistance) / 50) * 100)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700"
                style={{ width: `${Math.min((parseFloat(totalDistance) / 50) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.max(0, 50 - parseFloat(totalDistance)).toFixed(1)}km to goal
            </p>
          </div>
        </div>

        {/* Daily Breakdown Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100">
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
                      <p className="text-sm font-bold text-green-600">
                        {day.distance.toFixed(2)}km
                      </p>
                      <p className="text-xs text-gray-500">
                        {day.distance >= 1.4 ? "✓ Goal" : `${(1.4 - day.distance).toFixed(1)}km to go`}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        day.distance >= 1.4
                          ? "bg-gradient-to-r from-green-500 to-green-400"
                          : "bg-gradient-to-r from-emerald-500 to-teal-400"
                      }`}
                      style={{ width: `${(day.distance / maxDistance) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-6 border border-green-200">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Insights</h3>
              <p className="text-sm text-gray-700 mt-2">
                {parseFloat(totalDistance) >= 50
                  ? "🎯 Amazing distance covered this week!"
                  : parseFloat(totalDistance) >= 30
                    ? "🚶 Good distance! Keep walking."
                    : "🚶 Increase your walking distance."}
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
