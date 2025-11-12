import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useMemo } from "react";

const COLOR_MAP: Record<string, { gradient: string; text: string; lightBg: string; icon: string }> = {
  steps: {
    gradient: "from-orange-400 to-orange-600",
    text: "text-orange-600",
    lightBg: "bg-orange-100",
    icon: "👟",
  },
  calories: {
    gradient: "from-red-400 to-red-600",
    text: "text-red-600",
    lightBg: "bg-red-100",
    icon: "🔥",
  },
  water: {
    gradient: "from-cyan-400 to-blue-600",
    text: "text-cyan-600",
    lightBg: "bg-cyan-100",
    icon: "💧",
  },
};

const UNIT_MAP: Record<string, string> = {
  steps: "steps",
  calories: "kcal",
  water: "liters",
};

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface DayData {
  day: string;
  value: number;
  max: number;
  date: string;
}

export default function ActivityDetail() {
  const navigate = useNavigate();
  const { type = "steps" } = useParams();
  const { userProfile } = useAuth();
  const { theme } = useTheme();
  const colors = COLOR_MAP[type] || COLOR_MAP.steps;
  const unit = UNIT_MAP[type] || "units";

  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  const selectedDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + selectedDayOffset);
    return date;
  }, [selectedDayOffset]);

  const isToday = selectedDayOffset === 0;

  // Calculate week dates
  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }, []);

  // Get user stats
  const stepsCompleted = userProfile?.bio ? parseInt(userProfile.bio.split("|")[0] || "0") : 0;
  const waterConsumed = userProfile?.bio ? parseFloat(userProfile.bio.split("|")[1] || "0") : 0;
  const caloriesBurned = Math.round(stepsCompleted * 0.05);

  // Generate weekly data
  const weeklyData: DayData[] = useMemo(() => {
    const data: DayData[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekDates[i]);
      let value = 0;
      let max = type === "water" ? 2.5 : type === "calories" ? 2500 : 10000;

      // Only show today's data
      if (i === new Date().getDay()) {
        if (type === "steps") {
          value = stepsCompleted;
        } else if (type === "calories") {
          value = caloriesBurned;
        } else if (type === "water") {
          value = waterConsumed;
        }
      }

      data.push({
        day: DAY_NAMES[date.getDay()],
        value,
        max,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }

    return data;
  }, [type, stepsCompleted, caloriesBurned, waterConsumed, weekDates]);

  const maxValue = Math.max(...weeklyData.map((d) => d.max));
  const average = weeklyData.reduce((sum, day) => sum + day.value, 0) / weeklyData.length;
  const total = weeklyData.reduce((sum, day) => sum + day.value, 0);

  const getBarHeight = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  const getTitle = () => {
    switch (type) {
      case "steps":
        return "Daily Activity";
      case "calories":
        return "Calories Burned";
      case "water":
        return "Water Intake";
      default:
        return "Activity";
    }
  };

  return (
    <div className={`min-h-screen pb-24 ${theme === "dark" ? "bg-gray-950" : "bg-white"}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border-b`}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-800 text-white"
                : "hover:bg-gray-100 text-gray-900"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {getTitle()}
            </h1>
            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {FULL_DAY_NAMES[selectedDate.getDay()]}
            </p>
          </div>
        </div>

        {/* Week Day Picker */}
        <div className={`max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-2 ${
          theme === "dark" ? "border-gray-800 border-t" : "border-gray-200 border-t"
        }`}>
          {weekDates.map((date, idx) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dayOffset = idx - new Date().getDay();
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedDayOffset(dayOffset)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isSelected
                    ? "bg-orange-600 text-white"
                    : theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="text-xs font-semibold">{DAY_NAMES[date.getDay()]}</span>
                <span className="text-xs font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Large Stats Card */}
        <div className={`relative rounded-2xl overflow-hidden border p-8 text-center space-y-4 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
            : "bg-gradient-to-br from-gray-50 to-white border-gray-200"
        }`}>
          <div className="relative space-y-4">
            {/* Icon */}
            <div className="text-6xl">{colors.icon}</div>

            {/* Main Value */}
            <div>
              <div className={`text-5xl font-bold ${colors.text}`}>
                {type === "water" ? total.toFixed(1) : Math.round(total).toLocaleString()}
              </div>
              <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                / {type === "water" ? "2.5" : type === "calories" ? "2500" : "10,000"} {unit}
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`rounded-full h-2 overflow-hidden ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}>
              <div
                className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                style={{
                  width: `${Math.min((total / (type === "water" ? 2.5 : type === "calories" ? 2500 : 10000)) * 100, 100)}%`,
                }}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className={`rounded-lg p-2 text-center ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}>
                <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Avg
                </div>
                <div className={`text-sm font-bold ${colors.text}`}>
                  {type === "water" ? average.toFixed(1) : Math.round(average)}
                </div>
              </div>
              <div className={`rounded-lg p-2 text-center ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}>
                <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Peak
                </div>
                <div className={`text-sm font-bold ${colors.text}`}>
                  {type === "water"
                    ? Math.max(...weeklyData.map((d) => d.value)).toFixed(1)
                    : Math.max(...weeklyData.map((d) => d.value))}
                </div>
              </div>
              <div className={`rounded-lg p-2 text-center ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}>
                <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Total
                </div>
                <div className={`text-sm font-bold ${colors.text}`}>
                  {type === "water" ? total.toFixed(1) : total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className={`rounded-2xl p-6 space-y-4 border ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-bold flex items-center gap-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              <Calendar className={`w-5 h-5 ${colors.text}`} />
              Weekly Breakdown
            </h3>
            <span className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              This Week
            </span>
          </div>

          {/* Daily Chart */}
          <div className={`rounded-lg p-4 ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-50"
          }`}>
            <div className="space-y-3">
              {weeklyData.map((dayData, idx) => (
                <div key={idx} className="space-y-1">
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold w-12 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}>
                      {dayData.day}
                    </span>
                    <div className="flex-1 flex justify-end">
                      <div className="text-right">
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {type === "water" ? dayData.value.toFixed(1) : dayData.value.toLocaleString()}
                        </span>
                        <span className={`text-xs ml-1 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-600"
                        }`}>
                          {type === "water" ? `/ ${dayData.max}L` : `/ ${dayData.max.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className={`relative h-8 rounded-lg overflow-hidden border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}>
                    <div
                      className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                      style={{ width: `${getBarHeight(dayData.value, maxValue)}%` }}
                    >
                      {getBarHeight(dayData.value, maxValue) > 20 && (
                        <div className="h-full flex items-center justify-end pr-2">
                          <span className="text-xs font-bold text-white">
                            {type === "water" ? dayData.value.toFixed(1) : dayData.value.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className={`text-xs ${
                    theme === "dark" ? "text-gray-500" : "text-gray-600"
                  }`}>
                    {dayData.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className={`rounded-lg p-4 space-y-3 border ${
            theme === "dark"
              ? "bg-gray-900 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Weekly Avg</span>
              </div>
              <span className={`font-bold ${colors.text}`}>
                {type === "water" ? average.toFixed(1) : Math.round(average).toLocaleString()} {unit}
              </span>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        {total === 0 && !isToday && (
          <div className={`rounded-xl p-4 border text-center text-sm ${
            theme === "dark"
              ? "bg-gray-800/30 border-gray-700 text-gray-400"
              : "bg-gray-100 border-gray-200 text-gray-600"
          }`}>
            No data for this day
          </div>
        )}
      </div>
    </div>
  );
}
