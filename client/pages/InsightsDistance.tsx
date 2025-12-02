import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface DailyStats {
  date: string;
  distance: number;
  day: string;
}

export default function InsightsDistance() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

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
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const formattedData = (data || []).map((item: any) => ({
            date: item.date,
            distance: item.distance_km || 0,
            day: days[new Date(item.date).getDay()],
          }));
          setWeeklyData(formattedData);
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
  const bestDay = weeklyData.reduce((best, current) =>
    current.distance > best.distance ? current : best,
  ) || { distance: 0, day: "N/A", date: "" };

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
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-4 shadow-md border border-green-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-green-600">
              {totalDistance}km
            </p>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-md border border-green-100">
            <p className="text-xs text-gray-600 font-medium mb-1">
              Average/Day
            </p>
            <p className="text-2xl font-bold text-green-600">{avgDistance}km</p>
            <p className="text-xs text-gray-500 mt-1">Per day</p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-md border border-green-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Best Day</p>
            <p className="text-2xl font-bold text-green-600">
              {bestDay.distance.toFixed(2)}km
            </p>
            <p className="text-xs text-gray-500 mt-1">{bestDay.day}</p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-md border border-green-100">
            <p className="text-xs text-gray-600 font-medium mb-1">Goal</p>
            <p className="text-2xl font-bold text-green-600">10km</p>
            <p className="text-xs text-gray-500 mt-1">Weekly target</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-green-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Daily Breakdown
          </h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : weeklyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyData.map((day) => (
                <div key={day.date} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{day.day}</p>
                      <p className="text-xs text-gray-500">{day.date}</p>
                    </div>
                    <p className="text-sm font-bold text-green-600">
                      {day.distance.toFixed(2)}km
                    </p>
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${(day.distance / maxDistance) * 100}%`,
                      }}
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
    </div>
  );
}
