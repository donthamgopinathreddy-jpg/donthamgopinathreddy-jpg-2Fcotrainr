import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface DayData {
  day: string;
  value: number;
  max: number;
  date: string;
}

const ACTIVITY_DATA: Record<string, { title: string; unit: string; data: DayData[] }> = {
  steps: {
    title: "Weekly Steps",
    unit: "steps",
    data: [
      { day: "Mon", value: 8420, max: 10000, date: "Jan 8" },
      { day: "Tue", value: 9200, max: 10000, date: "Jan 9" },
      { day: "Wed", value: 7850, max: 10000, date: "Jan 10" },
      { day: "Thu", value: 10200, max: 10000, date: "Jan 11" },
      { day: "Fri", value: 9800, max: 10000, date: "Jan 12" },
      { day: "Sat", value: 11500, max: 10000, date: "Jan 13" },
      { day: "Sun", value: 8950, max: 10000, date: "Jan 14" },
    ],
  },
  calories: {
    title: "Weekly Calories",
    unit: "kcal",
    data: [
      { day: "Mon", value: 1850, max: 2500, date: "Jan 8" },
      { day: "Tue", value: 2100, max: 2500, date: "Jan 9" },
      { day: "Wed", value: 1950, max: 2500, date: "Jan 10" },
      { day: "Thu", value: 2200, max: 2500, date: "Jan 11" },
      { day: "Fri", value: 2450, max: 2500, date: "Jan 12" },
      { day: "Sat", value: 2300, max: 2500, date: "Jan 13" },
      { day: "Sun", value: 2050, max: 2500, date: "Jan 14" },
    ],
  },
  water: {
    title: "Weekly Water Intake",
    unit: "liters",
    data: [
      { day: "Mon", value: 2.2, max: 2.5, date: "Jan 8" },
      { day: "Tue", value: 2.4, max: 2.5, date: "Jan 9" },
      { day: "Wed", value: 2.0, max: 2.5, date: "Jan 10" },
      { day: "Thu", value: 2.5, max: 2.5, date: "Jan 11" },
      { day: "Fri", value: 2.3, max: 2.5, date: "Jan 12" },
      { day: "Sat", value: 2.1, max: 2.5, date: "Jan 13" },
      { day: "Sun", value: 2.4, max: 2.5, date: "Jan 14" },
    ],
  },
};

const COLOR_MAP: Record<string, { bar: string; bg: string; text: string }> = {
  steps: {
    bar: "from-orange-600 to-amber-500",
    bg: "shadow-orange-600/50",
    text: "text-orange-600",
  },
  calories: {
    bar: "from-red-600 via-red-500 to-red-600",
    bg: "shadow-red-600/50",
    text: "text-red-600",
  },
  water: {
    bar: "from-cyan-600 to-blue-600",
    bg: "shadow-cyan-600/50",
    text: "text-cyan-600",
  },
};

export default function ActivityDetail() {
  const navigate = useNavigate();
  const { type = "steps" } = useParams();
  const activity = ACTIVITY_DATA[type] || ACTIVITY_DATA.steps;
  const colors = COLOR_MAP[type] || COLOR_MAP.steps;

  const getBarHeight = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  const average =
    activity.data.reduce((sum, day) => sum + day.value, 0) / activity.data.length;
  const max = Math.max(...activity.data.map((d) => d.max));

  return (
    <div className="min-h-screen bg-white pb-24 l-shape-bg fitness-gradient-1">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
            <p className="text-sm text-gray-700">This Week</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Average</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {type === "water" ? average.toFixed(1) : Math.round(average).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{activity.unit}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Peak</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {type === "water"
                  ? Math.max(...activity.data.map((d) => d.value)).toFixed(1)
                  : Math.max(...activity.data.map((d) => d.value)).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{activity.unit}</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-card border border-border rounded-2xl p-6 l-shape-bg fitness-gradient-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Daily Activity</h3>
              <span className="text-xs text-muted-foreground">Weekly Overview</span>
            </div>

            {/* Chart Container */}
            <div className="space-y-4">
              {activity.data.map((dayData, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{dayData.day}</span>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${colors.text}`}>
                        {type === "water" ? dayData.value.toFixed(1) : dayData.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        {type === "water"
                          ? `/ ${dayData.max}L`
                          : `/ ${dayData.max.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden flex items-center">
                    <div
                      className={`h-full bg-gradient-to-r ${colors.bar} transition-all duration-500 shadow-lg ${colors.bg} flex items-center justify-end pr-2`}
                      style={{ width: `${getBarHeight(dayData.value, max)}%` }}
                    >
                      {dayData.value >= max * 0.4 && (
                        <span className="text-xs font-bold text-white">
                          {type === "water"
                            ? dayData.value.toFixed(1)
                            : dayData.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{dayData.date}</p>
                </div>
              ))}
            </div>

            {/* Footer Stats */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly Average</span>
                <span className={`font-bold ${colors.text}`}>
                  {type === "water" ? average.toFixed(1) : Math.round(average).toLocaleString()}{" "}
                  {activity.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weekly Total</span>
                <span className={`font-bold ${colors.text}`}>
                  {type === "water"
                    ? (
                        activity.data.reduce((sum, d) => sum + d.value, 0) /
                        (type === "water" ? 1 : 1)
                      ).toFixed(1)
                    : activity.data.reduce((sum, d) => sum + d.value, 0).toLocaleString()}{" "}
                  {activity.unit}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
