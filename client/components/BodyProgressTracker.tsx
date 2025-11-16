import { Camera, TrendingDown, Upload } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ProgressPhoto {
  id: string;
  date: string;
  emoji: string;
  month: string;
}

export default function BodyProgressTracker() {
  const { theme } = useTheme();

  const progressData = [
    { month: "Jan", weight: 85, progress: 0 },
    { month: "Feb", weight: 83, progress: 2 },
    { month: "Mar", weight: 81, progress: 4 },
    { month: "Apr", weight: 79, progress: 6 },
    { month: "May", weight: 77, progress: 8 },
    { month: "Jun", weight: 75, progress: 10 },
  ];

  const photos: ProgressPhoto[] = [
    { id: "1", date: "Jan 15", emoji: "📸", month: "Jan" },
    { id: "2", date: "Mar 10", emoji: "📸", month: "Mar" },
    { id: "3", date: "May 20", emoji: "📸", month: "May" },
  ];

  const maxWeight = Math.max(...progressData.map((d) => d.weight));
  const minWeight = Math.min(...progressData.map((d) => d.weight));
  const weightRange = maxWeight - minWeight;

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl ${
        theme === "dark"
          ? "bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-gray-900/50 border border-indigo-700/30"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-white border border-indigo-300/40"
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
            <TrendingDown className="w-5 h-5 text-purple-500" />
            Progress Tracker
          </h3>
          <p
            className={`text-xs mt-1 flex items-center gap-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span className="font-semibold text-green-500">-10 kg</span> from your start
          </p>
        </div>
        <div className="text-3xl">📊</div>
      </div>

      {/* Weight Chart */}
      <div className="mb-8">
        <div className="flex items-end justify-between gap-1 h-32 mb-4 px-2">
          {progressData.map((data, idx) => {
            const normalized =
              ((data.weight - minWeight) / weightRange) * 100 || 50;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 group hover:opacity-80 cursor-pointer ${
                    theme === "dark"
                      ? "bg-gradient-to-t from-purple-500 to-indigo-400"
                      : "bg-gradient-to-t from-purple-400 to-indigo-300"
                  }`}
                  style={{ height: `${normalized}%`, minHeight: "8px" }}
                />
                <span
                  className={`text-xs font-bold ${
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  {data.month}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div
            className={`p-3 rounded-xl text-center ${
              theme === "dark"
                ? "bg-indigo-900/30 border border-indigo-700/40"
                : "bg-indigo-100/40 border border-indigo-300/40"
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Current
            </p>
            <p
              className={`text-xl font-bold ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              75 kg
            </p>
          </div>

          <div
            className={`p-3 rounded-xl text-center ${
              theme === "dark"
                ? "bg-purple-900/30 border border-purple-700/40"
                : "bg-purple-100/40 border border-purple-300/40"
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Goal
            </p>
            <p
              className={`text-xl font-bold ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            >
              70 kg
            </p>
          </div>

          <div
            className={`p-3 rounded-xl text-center ${
              theme === "dark"
                ? "bg-green-900/30 border border-green-700/40"
                : "bg-green-100/40 border border-green-300/40"
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Progress
            </p>
            <p
              className={`text-xl font-bold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              71%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-semibold ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Goal Progress
            </span>
            <span
              className={`text-xs font-bold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              5 kg to go
            </span>
          </div>
          <div
            className={`relative h-3 rounded-full overflow-hidden border ${
              theme === "dark"
                ? "bg-gray-700/50 border-purple-700/30"
                : "bg-gray-200/50 border-purple-300/30"
            }`}
          >
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-700`}
              style={{ width: "71%" }}
            />
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div>
        <h4
          className={`text-sm font-bold mb-4 flex items-center gap-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <Camera className="w-4 h-4 text-purple-500" />
          Progress Photos
        </h4>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative aspect-square rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 ${
                theme === "dark"
                  ? "bg-gray-700/50 border border-gray-600/30 hover:border-purple-500/50"
                  : "bg-gray-100/50 border border-gray-300/30 hover:border-purple-400/50"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {photo.emoji}
              </div>
              <p
                className={`absolute bottom-0 left-0 right-0 text-xs font-bold text-center py-1 bg-black/30 text-white ${
                  theme === "dark" ? "" : ""
                }`}
              >
                {photo.date}
              </p>
            </div>
          ))}

          {/* Add Photo Button */}
          <button
            className={`relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 group ${
              theme === "dark"
                ? "bg-gradient-to-br from-purple-900/40 to-purple-900/20 border border-purple-700/50 hover:border-purple-500/80 hover:shadow-lg hover:shadow-purple-500/20"
                : "bg-gradient-to-br from-purple-100 to-purple-50/50 border border-purple-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-300/30"
            }`}
          >
            <div className="flex flex-col items-center">
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold mt-1">Add</span>
            </div>
          </button>
        </div>

        <button
          className={`w-full py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
            theme === "dark"
              ? "bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white"
              : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
          }`}
        >
          Take Progress Photo
        </button>
      </div>
    </div>
  );
}
