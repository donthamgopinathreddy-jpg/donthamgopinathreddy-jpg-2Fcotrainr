import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

interface DayData {
  day: string;
  value: number;
  max: number;
  date: string;
}

const COLOR_MAP: Record<string, { bar: string; bg: string; text: string; lightBg: string }> = {
  steps: {
    bar: "from-orange-600 to-amber-500",
    bg: "shadow-orange-600/50",
    text: "text-orange-600",
    lightBg: "bg-orange-100",
  },
  calories: {
    bar: "from-red-600 via-red-500 to-red-600",
    bg: "shadow-red-600/50",
    text: "text-red-600",
    lightBg: "bg-red-100",
  },
  water: {
    bar: "from-cyan-600 to-blue-600",
    bg: "shadow-cyan-600/50",
    text: "text-cyan-600",
    lightBg: "bg-cyan-100",
  },
};

const UNIT_MAP: Record<string, string> = {
  steps: "steps",
  calories: "kcal",
  water: "liters",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ActivityDetail() {
  const navigate = useNavigate();
  const { type = "steps" } = useParams();
  const { userProfile } = useAuth();
  const colors = COLOR_MAP[type] || COLOR_MAP.steps;
  const unit = UNIT_MAP[type] || "units";

  // Generate weekly data based on user's current activity
  const weeklyData = useMemo(() => {
    const today = new Date();
    const data: DayData[] = [];
    
    // Calculate the start of this week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // Get user's current stats
    const stepsCompleted = userProfile?.bio ? parseInt(userProfile.bio.split("|")[0] || "0") : 0;
    const waterConsumed = userProfile?.bio ? parseFloat(userProfile.bio.split("|")[1] || "0") : 0;

    // Generate 7 days with only today having data
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      
      let value = 0;
      let max = 10000;

      if (isToday) {
        if (type === "steps") {
          value = stepsCompleted;
          max = userProfile?.bio ? parseInt(userProfile.bio.split("|")[0] || "0") > 0 ? 10000 : 10000 : 10000;
        } else if (type === "calories") {
          value = Math.round(stepsCompleted * 0.05);
          max = 2500;
        } else if (type === "water") {
          value = waterConsumed;
          max = 2.5;
        }
      }

      data.push({
        day: DAY_NAMES[i],
        value,
        max,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }

    return data;
  }, [type, userProfile]);

  const average = weeklyData.reduce((sum, day) => sum + day.value, 0) / weeklyData.length;
  const total = weeklyData.reduce((sum, day) => sum + day.value, 0);
  const peak = Math.max(...weeklyData.map((d) => d.value));
  const maxValue = Math.max(...weeklyData.map((d) => d.max));

  const getBarHeight = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  const getTitleIcon = () => {
    switch (type) {
      case "steps":
        return "👟";
      case "calories":
        return "🔥";
      case "water":
        return "💧";
      default:
        return "📊";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "steps":
        return "Weekly Steps";
      case "calories":
        return "Calories Burned";
      case "water":
        return "Water Intake";
      default:
        return "Activity";
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getTitleIcon()} {getTitle()}
            </h1>
            <p className="text-xs text-gray-600">This Week</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`${colors.lightBg} rounded-xl p-4 text-center`}>
            <p className="text-xs text-gray-600 mb-1">Average</p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {type === "water" ? average.toFixed(1) : Math.round(average).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{unit}</p>
          </div>

          <div className={`${colors.lightBg} rounded-xl p-4 text-center`}>
            <p className="text-xs text-gray-600 mb-1">Peak</p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {type === "water" ? peak.toFixed(1) : peak.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{unit}</p>
          </div>

          <div className={`${colors.lightBg} rounded-xl p-4 text-center`}>
            <p className="text-xs text-gray-600 mb-1">Total</p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {type === "water" ? total.toFixed(1) : total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{unit}</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className={`w-5 h-5 ${colors.text}`} />
              <h3 className="font-bold text-gray-900">Daily Breakdown</h3>
            </div>
            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-lg">This Week</span>
          </div>

          {/* Bar Chart */}
          <div className="space-y-3">
            {weeklyData.map((dayData, idx) => (
              <div key={idx} className="space-y-2">
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 w-12">
                    <span className="text-sm font-semibold text-gray-900">{dayData.day}</span>
                  </div>
                  <div className="flex-1 flex justify-end">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${colors.text}`}>
                        {type === "water" ? dayData.value.toFixed(1) : dayData.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {type === "water" ? `/ ${dayData.max}L` : `/ ${dayData.max.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bar */}
                <div className="relative h-8 bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div
                    className={`h-full bg-gradient-to-r ${colors.bar} transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${getBarHeight(dayData.value, maxValue)}%` }}
                  >
                    {getBarHeight(dayData.value, maxValue) > 15 && (
                      <span className="text-xs font-bold text-white">
                        {type === "water" ? dayData.value.toFixed(1) : dayData.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500">{dayData.date}</p>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Weekly Avg</span>
              </div>
              <span className={`font-bold ${colors.text}`}>
                {type === "water" ? average.toFixed(1) : Math.round(average).toLocaleString()} {unit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="w-4 h-4" />
                <span className="text-sm">Weekly Peak</span>
              </div>
              <span className={`font-bold ${colors.text}`}>
                {type === "water" ? peak.toFixed(1) : peak.toLocaleString()} {unit}
              </span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        {total === 0 && (
          <div className={`${colors.lightBg} rounded-xl p-4 border border-gray-200 text-center`}>
            <p className="text-sm text-gray-700">
              No data yet this week. Start tracking to see your progress! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
