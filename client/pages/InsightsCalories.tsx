import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useStepCounter } from "@/hooks/useStepCounter";

interface DailyStats {
  date: string;
  calories: number;
  day: string;
  dayName: string;
}

const CircularProgress = ({
  value,
  max,
  color,
  label,
  unit,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  unit: string;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-gray-900">
            {percentage.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500">{Math.min(value, max).toLocaleString()}</p>
        </div>
      </div>
      <p className="text-center">
        <span className="block text-xs font-semibold text-gray-600 mb-1">
          {label}
        </span>
        <span className="block text-xs text-gray-500">
          Goal: {max.toLocaleString()} {unit}
        </span>
      </p>
    </div>
  );
};

export default function InsightsCalories() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { steps } = useStepCounter();
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
              calories: Math.round((item.steps || 0) * 0.05),
              day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
              dayName: dayNames[date.getDay()],
            };
          });
          setWeeklyData(formattedData);

          let streak = 0;
          for (let i = formattedData.length - 1; i >= 0; i--) {
            if (formattedData[i].calories >= 200) {
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

  const maxCalories = Math.max(...weeklyData.map((d) => d.calories), 2000);
  const avgCalories =
    weeklyData.length > 0
      ? Math.round(
          weeklyData.reduce((sum, d) => sum + d.calories, 0) /
            weeklyData.length,
        )
      : 0;
  const totalCalories = weeklyData.reduce((sum, d) => sum + d.calories, 0);
  const bestDay = weeklyData.reduce(
    (best, current) =>
      current.calories > best.calories ? current : best,
    { calories: 0, day: "N/A", date: "", dayName: "N/A" },
  );

  const todayCalories = Math.round(steps * 0.05);

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-[430px] mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Weekly Calories</h1>
        </div>
      </div>

      <div className="max-w-[430px] mx-auto px-4 pt-6 space-y-6">
        {/* Animated Streak Counter */}
        {currentStreak > 0 && (
          <div className="animate-pulse">
            <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-3xl p-6 shadow-lg border border-red-200">
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

        {/* Apple/Samsung Style - Circular Progress Rings */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-red-100">
          <h2 className="text-lg font-bold text-gray-900 mb-8 text-center">
            Weekly Summary
          </h2>

          <div className="grid grid-cols-2 gap-8">
            <CircularProgress
              value={totalCalories}
              max={14000}
              color="#dc2626"
              label="Total Burned"
              unit="kcal"
            />
            <CircularProgress
              value={avgCalories}
              max={2000}
              color="#f97316"
              label="Daily Avg"
              unit="kcal"
            />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-red-600">
                {bestDay.calories.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">Best Day</p>
              <p className="text-xs text-gray-500">{bestDay.dayName}</p>
            </div>
            <div className="flex-1 text-center border-l border-gray-200">
              <p className="text-2xl font-bold text-orange-600">
                {todayCalories.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">Today</p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>
          </div>
        </div>

        {/* Weekly Bar Chart - Samsung Health Style */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-red-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Daily Activity</h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : weeklyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {weeklyData.map((day, idx) => {
                const percentage = (day.calories / maxCalories) * 100;
                const achieved = day.calories >= 200;

                return (
                  <div
                    key={day.date}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{day.day}</p>
                        <p className="text-xs text-gray-500">{formatDateFull(day.date)}</p>
                      </div>
                      <p className="text-sm font-bold text-red-600">
                        {day.calories.toLocaleString()} kcal
                      </p>
                    </div>

                    {/* Vertical Bar */}
                    <div className="flex items-end gap-2 h-24">
                      <div className="flex-1 bg-gray-100 rounded-t-lg overflow-hidden">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${
                            achieved
                              ? "bg-gradient-to-t from-green-500 to-green-400"
                              : "bg-gradient-to-t from-red-500 to-orange-400"
                          }`}
                          style={{ height: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-semibold text-gray-700">
                          {percentage.toFixed(0)}%
                        </p>
                        {achieved && (
                          <p className="text-green-600 text-xs font-semibold mt-1">
                            ✓
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl p-6 border border-red-200">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Insights</h3>
              <p className="text-sm text-gray-700 mt-2">
                {totalCalories >= 14000
                  ? "🔥 Excellent! You've been very active this week!"
                  : totalCalories >= 10000
                    ? "💪 Good pace! Keep up the activity."
                    : "👟 Increase your activity to burn more calories."}
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
