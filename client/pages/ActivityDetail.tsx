import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useMemo } from "react";

const COLOR_MAP: Record<
  string,
  { gradient: string; text: string; lightBg: string; icon: string }
> = {
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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayData {
  day: string;
  date: string;
  value: number;
  max: number;
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

  const stepsCompleted = (() => {
    try {
      const val = userProfile?.bio
        ? parseInt(userProfile.bio.split("|")[0] || "0", 10)
        : 0;
      return isNaN(val) ? 0 : val;
    } catch {
      return 0;
    }
  })();

  const waterConsumed = (() => {
    try {
      const val = userProfile?.bio
        ? parseFloat(userProfile.bio.split("|")[1] || "0")
        : 0;
      return isNaN(val) ? 0 : val;
    } catch {
      return 0;
    }
  })();

  const caloriesBurned = (() => {
    const val = Math.round(stepsCompleted * 0.05);
    return isNaN(val) ? 0 : val;
  })();

  const weeklyData: DayData[] = useMemo(() => {
    const data: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekDates[i]);
      let value = 0;
      let max = type === "water" ? 2.5 : type === "calories" ? 2500 : 10000;

      if (date.toDateString() === new Date().toDateString()) {
        value =
          type === "water"
            ? waterConsumed
            : type === "calories"
              ? caloriesBurned
              : stepsCompleted;
      }

      data.push({
        day: DAY_NAMES[date.getDay()],
        date: date.getDate().toString(),
        value: value,
        max: max,
      });
    }

    return data;
  }, [weekDates, stepsCompleted, waterConsumed, caloriesBurned, type]);

  const totalSteps = weeklyData.reduce((sum, day) => sum + day.value, 0);
  const averageSteps = Math.round(totalSteps / 7);
  const maxBarValue = Math.max(...weeklyData.map((d) => d.max), 1);

  const getTitle = () => {
    if (type === "steps") return "Daily Steps";
    if (type === "calories") return "Calories Burned";
    return "Water Consumption";
  };

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`min-h-screen pb-24 ${
        theme === "dark" ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <div
        className={`sticky top-0 z-40 border-b ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
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
            <h1
              className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              {colors.icon} {getTitle()}
            </h1>
            <p
              className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {formattedDate}
            </p>
          </div>
        </div>

        <div
          className={`max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-2 overflow-x-auto ${
            theme === "dark"
              ? "border-gray-800 border-t"
              : "border-gray-200 border-t"
          }`}
        >
          {weekDates.map((date, idx) => {
            const isSelected =
              date.toDateString() === selectedDate.toDateString();
            const dayOffset = idx - new Date().getDay();

            return (
              <button
                key={idx}
                onClick={() => setSelectedDayOffset(dayOffset)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-orange-600 text-white"
                    : theme === "dark"
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="text-xs font-semibold">
                  {DAY_NAMES[date.getDay()]}
                </span>
                <span className="text-xs font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div
          className={`relative rounded-2xl overflow-hidden p-8 text-center space-y-4 ${
            theme === "dark"
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-gradient-to-br from-gray-50 to-white"
          }`}
        >
          <div className="relative space-y-4">
            {/* Icon with Horizontal Progress Bar Below */}
            <div className="flex flex-col items-center py-6 gap-4">
              {/* Icon */}
              <div className="text-7xl">{colors.icon}</div>

              {/* Horizontal Progress Bar */}
              <div className="w-64">
                <div
                  className={`rounded-full h-3 overflow-hidden ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                    style={{
                      width: `${Math.min(
                        (selectedDate.toDateString() === new Date().toDateString()
                          ? type === "water"
                            ? waterConsumed / 2.5
                            : type === "calories"
                              ? caloriesBurned / 2500
                              : stepsCompleted / 10000
                          : 0) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className={`text-5xl font-bold ${colors.text} !text-inherit`}>
                {type === "water"
                  ? selectedDate.toDateString() === new Date().toDateString()
                    ? waterConsumed.toFixed(1)
                    : "0.0"
                  : type === "calories"
                    ? selectedDate.toDateString() === new Date().toDateString()
                      ? caloriesBurned
                      : "0"
                    : selectedDate.toDateString() === new Date().toDateString()
                      ? stepsCompleted.toLocaleString()
                      : "0"}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {type === "water"
                  ? "/ 2.5"
                  : type === "calories"
                    ? "/ 2500"
                    : "/ 10,000"}{" "}
                {unit}
              </div>
            </div>

            <div
              className={`text-xs font-semibold ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl p-6 space-y-6 ${
            theme === "dark" ? "bg-gray-800/50" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`font-bold flex items-center gap-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              <Calendar className={`w-5 h-5 ${colors.text}`} />
              {type === "steps"
                ? "Weekly Steps"
                : type === "calories"
                  ? "Weekly Calories"
                  : "Weekly Water"}
            </h3>
            <span
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              This Week
            </span>
          </div>

          <div
            className={`rounded-lg p-4 space-y-2 ${
              theme === "dark" ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Weekly Average
              </span>
              <span className={`font-bold text-lg ${colors.text}`}>
                {averageSteps.toLocaleString()} {unit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Weekly Total
              </span>
              <span className={`font-bold text-lg ${colors.text}`}>
                {totalSteps.toLocaleString()} {unit}
              </span>
            </div>
          </div>

          {/* Vertical Bar Chart - Old Style */}
          <div
            className={`rounded-lg p-6 ${
              theme === "dark" ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            <div className="flex items-end justify-around gap-2 h-48">
              {weeklyData.map((dayData, idx) => {
                const safeValue = isNaN(dayData.value) ? 0 : dayData.value;
                const safeMax = isNaN(dayData.max) || dayData.max <= 0 ? 1 : dayData.max;
                const barHeightPercent = (safeValue / safeMax) * 100;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
                    {/* Vertical Bar */}
                    <div className="w-full flex flex-col items-center justify-end h-full relative group">
                      <div
                        className={`w-full bg-gradient-to-t ${colors.gradient} rounded-t-lg transition-all duration-300 hover:opacity-80`}
                        style={{
                          height: `${barHeightPercent}%`,
                          minHeight: barHeightPercent > 0 ? "4px" : "0px",
                        }}
                        title={`${dayData.day} ${dayData.date}: ${safeValue.toLocaleString()} ${unit}`}
                      />

                      {/* Value on top of bar */}
                      {barHeightPercent > 0 && (
                        <div
                          className={`absolute -top-6 text-xs font-bold ${colors.text}`}
                        >
                          {safeValue.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Day and Date Label */}
                    <div className="text-center">
                      <div
                        className={`text-xs font-semibold ${
                          theme === "dark" ? "text-gray-300" : "text-gray-900"
                        }`}
                      >
                        {dayData.day}
                      </div>
                      <div
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        {dayData.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {type === "steps" && (
            <div
              className={`rounded-lg p-4 text-center text-sm ${
                theme === "dark"
                  ? "bg-gray-900 text-gray-400"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <p>
                Only today's data is shown. Previous days' data will appear once
                logged.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
