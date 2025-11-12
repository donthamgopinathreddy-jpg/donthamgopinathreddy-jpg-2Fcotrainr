import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Zap, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

interface HourlyData {
  hour: number;
  value: number;
}

export default function ActivityDetail() {
  const navigate = useNavigate();
  const { type = "steps" } = useParams();
  const { userProfile } = useAuth();
  const colors = COLOR_MAP[type] || COLOR_MAP.steps;
  const unit = UNIT_MAP[type] || "units";

  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Get selected date
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

  // Generate hourly data
  const hourlyData: HourlyData[] = useMemo(() => {
    const data: HourlyData[] = [];
    
    if (!isToday) {
      // Past days show 0
      for (let i = 0; i < 24; i++) {
        data.push({ hour: i, value: 0 });
      }
      return data;
    }

    // Today - distribute current value throughout the day
    const currentHour = new Date().getHours();
    let remaining = 0;

    if (type === "steps") {
      remaining = stepsCompleted;
    } else if (type === "calories") {
      remaining = caloriesBurned;
    } else if (type === "water") {
      remaining = waterConsumed;
    }

    // Distribute value across hours up to current time
    const hoursActive = Math.max(1, currentHour);
    const valuePerHour = remaining / hoursActive;

    for (let i = 0; i < 24; i++) {
      if (i < currentHour) {
        data.push({ 
          hour: i, 
          value: Math.round(valuePerHour * (0.5 + Math.random())) 
        });
      } else {
        data.push({ hour: i, value: 0 });
      }
    }

    return data;
  }, [type, stepsCompleted, caloriesBurned, waterConsumed, isToday]);

  const maxHourlyValue = Math.max(...hourlyData.map((d) => d.value), 1);

  // Calculate stats
  const totalValue = hourlyData.reduce((sum, d) => d.value, 0);
  const activeHours = hourlyData.filter((d) => d.value > 0).length;

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

  const getTimeRange = () => {
    const hour = new Date().getHours();
    return `9:00 AM - ${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"} · ${hourlyData.filter(d => d.value > 0).length} records`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{getTitle()}</h1>
            <p className="text-xs text-gray-400">{FULL_DAY_NAMES[selectedDate.getDay()]}</p>
          </div>
        </div>

        {/* Week Day Picker */}
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-2">
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
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
        <div className={`relative rounded-3xl overflow-hidden border border-gray-700 p-8 text-center space-y-4`}>
          {/* Gradient Background */}
          <div
            className={`absolute inset-0 opacity-10 bg-gradient-to-br ${colors.gradient}`}
          />

          <div className="relative space-y-4">
            {/* Icon */}
            <div className="text-6xl">{colors.icon}</div>

            {/* Main Value */}
            <div>
              <div className={`text-5xl font-bold ${colors.text}`}>
                {type === "water" ? totalValue.toFixed(1) : Math.round(totalValue).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">
                / {type === "water" ? "2.5" : type === "calories" ? "2500" : "10,000"} {unit}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-800 rounded-full h-2 overflow-hidden mt-2">
              <div
                className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                style={{
                  width: `${Math.min(
                    (totalValue / (type === "water" ? 2.5 : type === "calories" ? 2500 : 10000)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400">Time</div>
                <div className={`text-sm font-bold ${colors.text}`}>{activeHours} hrs</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400">Avg/hour</div>
                <div className={`text-sm font-bold ${colors.text}`}>
                  {type === "water" ? (totalValue / Math.max(activeHours, 1)).toFixed(2) : Math.round(totalValue / Math.max(activeHours, 1))}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400">Peak</div>
                <div className={`text-sm font-bold ${colors.text}`}>
                  {type === "water" ? Math.max(...hourlyData.map(d => d.value)).toFixed(1) : Math.max(...hourlyData.map(d => d.value))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Breakdown */}
        <div className="bg-gray-800/50 rounded-2xl p-6 space-y-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Zap className={`w-5 h-5 ${colors.text}`} />
              Hourly Breakdown
            </h3>
            <span className="text-xs text-gray-400">{getTimeRange()}</span>
          </div>

          {/* Bar Chart */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-end justify-between gap-1 h-32">
              {hourlyData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  {/* Bar */}
                  <div
                    className={`w-full bg-gradient-to-t ${colors.gradient} rounded-t-sm transition-all duration-300 group-hover:opacity-75`}
                    style={{
                      height: `${Math.max((data.value / maxHourlyValue) * 100, 2)}%`,
                    }}
                    title={`${data.hour}:00 - ${data.value}`}
                  />
                  {/* Hour Label (show every 3 hours) */}
                  {idx % 3 === 0 && (
                    <span className="text-xs text-gray-500 mt-1">
                      {data.hour === 0 ? "12 AM" : data.hour < 12 ? `${data.hour} AM` : data.hour === 12 ? "12 PM" : `${data.hour - 12} PM`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-3">
          {/* Detail Card 1 */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className={`w-5 h-5 ${colors.text}`} />
                <span className="text-gray-300">Active Duration</span>
              </div>
              <span className={`font-bold ${colors.text}`}>{activeHours} hours</span>
            </div>
          </div>

          {/* Detail Card 2 */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className={`w-5 h-5 ${colors.text}`} />
                <span className="text-gray-300">Total {type}</span>
              </div>
              <span className={`font-bold ${colors.text}`}>
                {type === "water" ? totalValue.toFixed(1) : Math.round(totalValue).toLocaleString()} {unit}
              </span>
            </div>
          </div>
        </div>

        {/* No Data Message */}
        {totalValue === 0 && !isToday && (
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700 text-center text-gray-400 text-sm">
            No data for this day
          </div>
        )}
      </div>
    </div>
  );
}
