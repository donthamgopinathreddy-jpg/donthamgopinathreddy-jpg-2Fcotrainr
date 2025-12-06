import { useState } from "react";
import {
  X,
  Footprints,
  Flame,
  Droplets,
  MapPin,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

  const bgGradient =
    colorClasses[color as keyof typeof colorClasses] || colorClasses.orange;

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
                  <p className="text-xs font-medium text-foreground">
                    {days[date.getDay()]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground">
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

  const handleSaveStepsTarget = () => {
    const newSteps = parseInt(editSteps);
    if (!isNaN(newSteps) && newSteps > 0) {
      // Here you would call an update function from parent
      // For now, we'll just close the edit mode
      setIsEditing(false);
      console.log("Steps target updated to:", newSteps);
    }
  };

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
            {/* Edit Steps Target Card */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Daily Steps Goal
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editSteps}
                    onChange={(e) => setEditSteps(e.target.value)}
                    className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-foreground"
                    placeholder="Enter steps goal"
                  />
                  <button
                    onClick={handleSaveStepsTarget}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-2xl font-bold text-foreground">
                  {targets.steps.toLocaleString()} steps
                </p>
              )}
            </div>

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
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Select Week
              </h3>
              <div className="flex items-center justify-between mb-4">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ChevronLeft size={20} className="text-muted-foreground" />
                </button>
                <span className="text-sm font-medium text-foreground min-w-[150px] text-center">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ChevronRight size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Mini Calendar */}
              <div className="grid grid-cols-7 gap-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {day}
                    </p>
                    <button className="w-full aspect-square text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                      {idx + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Weekly Insights
              </h3>
              <p className="text-xs text-blue-800">
                You're on track with most metrics! Keep up the consistency for
                better results.
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
