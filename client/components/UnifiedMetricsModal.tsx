import { useState } from "react";
import { X, Footprints, Flame, Droplets, MapPin, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyMetrics {
  steps: number[];
  calories: number[];
  water: number[];
  distance: number[];
}

interface UnifiedMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyData: WeeklyMetrics;
  targets: {
    steps: number;
    calories: number;
    water: number;
    distance: number;
  };
}

const MetricCard = ({
  title,
  icon: Icon,
  unit,
  weeklyData,
  target,
  color,
}: {
  title: string;
  icon: any;
  unit: string;
  weeklyData: number[];
  target: number;
  color: string;
}) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const maxValue = Math.max(...weeklyData, target);
  const total = weeklyData.reduce((a, b) => a + b, 0);
  const average = Math.round(total / weeklyData.length);

  const colorClasses = {
    orange: "from-orange-500 to-yellow-500",
    red: "from-red-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
  } as Record<string, string>;

  const bgGradient = colorClasses[color as keyof typeof colorClasses] || colorClasses.orange;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
      {/* Header */}
      <div className={`bg-gradient-to-r ${bgGradient} text-white p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Icon size={20} />
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-white/70 text-xs mb-1">Total</p>
            <p className="text-2xl font-bold">{total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Average</p>
            <p className="text-2xl font-bold">{average.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Target</p>
            <p className="text-2xl font-bold">{target.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Weekly Data */}
      <div className="p-6 space-y-3">
        {weeklyData.map((value, idx) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - idx));

          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-xs font-medium text-gray-900">{days[date.getDay()]}</p>
                  <p className="text-xs text-gray-500">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {value.toLocaleString()} {unit}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${bgGradient} transition-all duration-500`}
                  style={{
                    width: `${(value / maxValue) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function UnifiedMetricsModal({
  isOpen,
  onClose,
  weeklyData,
  targets,
}: UnifiedMetricsModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editSteps, setEditSteps] = useState(targets.steps.toString());
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const metrics = [
    {
      title: "Steps",
      icon: Footprints,
      unit: "steps",
      data: weeklyData.steps,
      target: targets.steps,
      color: "orange",
    },
    {
      title: "Calories Burned",
      icon: Flame,
      unit: "kcal",
      data: weeklyData.calories,
      target: targets.calories,
      color: "red",
    },
    {
      title: "Water Intake",
      icon: Droplets,
      unit: "ml",
      data: weeklyData.water,
      target: targets.water,
      color: "blue",
    },
    {
      title: "Distance",
      icon: MapPin,
      unit: "km",
      data: weeklyData.distance,
      target: targets.distance,
      color: "green",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your Weekly Stats</h2>
              <p className="text-white/80 text-sm mt-1">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {metrics.map((metric, idx) => (
              <MetricCard
                key={idx}
                title={metric.title}
                icon={metric.icon}
                unit={metric.unit}
                weeklyData={metric.data}
                target={metric.target}
                color={metric.color}
              />
            ))}

            {/* Date Selector */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Week</h3>
              <div className="flex items-center justify-between mb-4">
                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-900 min-w-[150px] text-center">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Mini Calendar */}
              <div className="grid grid-cols-7 gap-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-2">{day}</p>
                    <button className="w-full aspect-square text-xs font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
                      {idx + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Weekly Insights</h3>
              <p className="text-xs text-blue-800">
                You're on track with most metrics! Keep up the consistency for better results.
              </p>
            </div>

            <div className="pb-4" />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
