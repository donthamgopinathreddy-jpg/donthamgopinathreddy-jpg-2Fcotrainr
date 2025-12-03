import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, TrendingUp } from "lucide-react";

interface MetricData {
  day: string;
  date: Date;
  value: number;
}

interface MetricDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  unit: string;
  target: number;
  color: string;
  weeklyData: number[];
}

export default function MetricDetailsModal({
  isOpen,
  onClose,
  title,
  icon,
  unit,
  target,
  color,
  weeklyData,
}: MetricDetailsModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!isOpen) return null;

  // Generate past 7 days
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const weekData: MetricData[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return {
      day: days[date.getDay()],
      date,
      value: weeklyData[i] || 0,
    };
  });

  const maxValue = Math.max(...weeklyData, target);
  const weeklyAverage = Math.round(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length);
  const weeklyTotal = weeklyData.reduce((a, b) => a + b, 0);

  // Determine color classes based on color prop
  const colorClasses = {
    orange: "from-orange-500 to-yellow-500",
    red: "from-red-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
  } as Record<string, string>;

  const bgGradient = colorClasses[color as keyof typeof colorClasses] || colorClasses.purple;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <div
        className={`bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${bgGradient} text-white p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-white/80 text-sm">Weekly overview</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center">
              <p className="text-gray-600 text-xs font-medium mb-1">Total</p>
              <p className={`text-2xl font-bold bg-gradient-to-r ${bgGradient} bg-clip-text text-transparent`}>
                {weeklyTotal.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">{unit}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center">
              <p className="text-gray-600 text-xs font-medium mb-1">Average</p>
              <p className={`text-2xl font-bold bg-gradient-to-r ${bgGradient} bg-clip-text text-transparent`}>
                {weeklyAverage.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">{unit}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 text-center">
              <p className="text-gray-600 text-xs font-medium mb-1">Target</p>
              <p className={`text-2xl font-bold bg-gradient-to-r ${bgGradient} bg-clip-text text-transparent`}>
                {target.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">{unit}</p>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={16} className={`text-${color}-500`} />
              This Week
            </h3>

            <div className="space-y-2">
              {weekData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{item.day}</p>
                      <p className="text-xs text-gray-500">
                        {item.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {item.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${bgGradient} transition-all duration-500`}
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selector */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Select Week</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-900 min-w-[100px] text-center">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
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
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Insights</h3>
            <p className="text-xs text-blue-800">
              Your weekly average is {weeklyAverage} {unit}. Keep up the consistency!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
