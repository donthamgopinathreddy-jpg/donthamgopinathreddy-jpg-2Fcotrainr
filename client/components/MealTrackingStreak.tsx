import { Utensils, CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface DayData {
  day: string;
  logged: boolean;
  meals: number;
}

export default function MealTrackingStreak() {
  const { theme } = useTheme();

  const days: DayData[] = [
    { day: "Mon", logged: true, meals: 3 },
    { day: "Tue", logged: true, meals: 3 },
    { day: "Wed", logged: true, meals: 2 },
    { day: "Thu", logged: true, meals: 3 },
    { day: "Fri", logged: false, meals: 0 },
    { day: "Sat", logged: true, meals: 3 },
    { day: "Sun", logged: true, meals: 3 },
  ];

  const loggingStreak = days.filter((d) => d.logged).length;
  const totalMeals = days.reduce((sum, d) => sum + d.meals, 0);

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl ${
        theme === "dark"
          ? "bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-gray-900/50 border border-emerald-700/30"
          : "bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-300/40"
      }`}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className={`text-lg font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <Utensils className="w-5 h-5 text-emerald-500" />
            Meal Logging Streak
          </h3>
          <p
            className={`text-xs mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {loggingStreak}/7 days logged
          </p>
        </div>
        <div className="text-3xl">🍽️</div>
      </div>

      {/* 7-Day Horizontal Streak */}
      <div className="mb-6">
        <div className="flex gap-2 justify-between">
          {days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`relative w-full aspect-square rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 cursor-pointer group hover:scale-105 ${
                  day.logged
                    ? theme === "dark"
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-400/40"
                    : theme === "dark"
                      ? "bg-gray-700/40 border border-gray-600/30 text-gray-400"
                      : "bg-gray-100/50 border border-gray-300/30 text-gray-500"
                }`}
              >
                {day.logged ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-xl">○</span>
                )}
              </div>
              <div className="text-center w-full">
                <p
                  className={`text-xs font-bold ${
                    day.logged
                      ? theme === "dark"
                        ? "text-emerald-400"
                        : "text-emerald-600"
                      : theme === "dark"
                        ? "text-gray-500"
                        : "text-gray-500"
                  }`}
                >
                  {day.day}
                </p>
                {day.logged && (
                  <p
                    className={`text-xs font-semibold ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {day.meals} 🍴
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className={`p-3 rounded-2xl text-center ${
            theme === "dark"
              ? "bg-emerald-900/30 border border-emerald-700/40"
              : "bg-emerald-100/40 border border-emerald-300/40"
          }`}
        >
          <p
            className={`text-xs font-semibold ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Streak
          </p>
          <p
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-emerald-400" : "text-emerald-600"
            }`}
          >
            {loggingStreak}
          </p>
        </div>

        <div
          className={`p-3 rounded-2xl text-center ${
            theme === "dark"
              ? "bg-teal-900/30 border border-teal-700/40"
              : "bg-teal-100/40 border border-teal-300/40"
          }`}
        >
          <p
            className={`text-xs font-semibold ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Total Meals
          </p>
          <p
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-teal-400" : "text-teal-600"
            }`}
          >
            {totalMeals}
          </p>
        </div>
      </div>

      <button
        className={`w-full py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
          theme === "dark"
            ? "bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white"
            : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        }`}
      >
        + Log Meal
      </button>
    </div>
  );
}
