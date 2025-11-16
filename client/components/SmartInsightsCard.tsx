import { TrendingUp, TrendingDown, Activity, Heart, Zap } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Metric {
  label: string;
  value: string;
  unit: string;
  trend: number;
  icon: React.ReactNode;
  color: string;
}

export default function SmartInsightsCard() {
  const { theme } = useTheme();

  const metrics: Metric[] = [
    {
      label: "Avg Steps",
      value: "8,542",
      unit: "steps/day",
      trend: 12,
      icon: <Activity className="w-5 h-5" />,
      color: "from-orange-400 to-orange-600",
    },
    {
      label: "Calories Burned",
      value: "2,145",
      unit: "kcal/day",
      trend: 8,
      icon: <Zap className="w-5 h-5" />,
      color: "from-red-400 to-red-600",
    },
    {
      label: "Heart Rate Avg",
      value: "72",
      unit: "bpm",
      trend: -5,
      icon: <Heart className="w-5 h-5" />,
      color: "from-pink-400 to-pink-600",
    },
  ];

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50"
          : "bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/50"
      }`}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="mb-6">
        <h3
          className={`text-lg font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          } flex items-center gap-2`}
        >
          <Activity className="w-5 h-5 text-orange-500" />
          This Week's Insights
        </h3>
        <p
          className={`text-xs mt-1 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Your weekly performance summary
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`group rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:scale-105 ${
              theme === "dark"
                ? "bg-gradient-to-br from-gray-700/40 to-gray-800/40 border border-gray-600/30 hover:border-gray-500/50"
                : "bg-gradient-to-br from-gray-50/60 to-white/60 border border-gray-200/40 hover:border-gray-300/60"
            }`}
            style={{
              boxShadow:
                theme === "dark"
                  ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                  : "0 8px 32px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${metric.color} text-white group-hover:scale-110 transition-transform`}
              >
                {metric.icon}
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  metric.trend >= 0
                    ? theme === "dark"
                      ? "bg-green-900/40 text-green-300"
                      : "bg-green-100 text-green-700"
                    : theme === "dark"
                      ? "bg-blue-900/40 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {metric.trend >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(metric.trend)}%
              </div>
            </div>

            <p
              className={`text-xs font-medium mb-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {metric.label}
            </p>

            <p
              className={`text-2xl font-bold mb-1 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {metric.value}
            </p>

            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {metric.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
