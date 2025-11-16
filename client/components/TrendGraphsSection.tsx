import { Lock, TrendingUp } from "lucide-react";

interface Metric {
  name: string;
  icon: string;
  color: string;
}

interface TrendGraphsSectionProps {
  isLocked: boolean;
  metrics: Metric[];
}

export default function TrendGraphsSection({
  isLocked,
  metrics,
}: TrendGraphsSectionProps) {
  // Sample data for the graphs
  const generateChartData = () => [20, 40, 35, 50, 45, 60, 55];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          📊 Trend Graphs
          {isLocked && <Lock className="w-6 h-6 text-orange-500" />}
        </h2>
      </div>

      {isLocked ? (
        // Locked state with blur effect
        <div className="relative">
          {/* Blurred background grid */}
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-6 pointer-events-none">
            {metrics.map((metric, i) => (
              <div
                key={i}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/20 p-6 opacity-30"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  {metric.name}
                </h3>
                <div className="h-40 bg-gradient-to-t from-gray-200 to-transparent dark:from-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Lock overlay with blur */}
          <div className="relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-white/20 p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50 rounded-3xl blur-2xl opacity-50"></div>
            <div className="relative z-10 space-y-4">
              <TrendingUp className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trend Graphs Locked
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                Upgrade to Basic or Premium to view your health trends and
                progress analytics.
              </p>
              <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl transition-all inline-block">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Unlocked - show trend graphs
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-gray-700/60 p-6 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">{metric.icon}</span>
                  {metric.name}
                </h3>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  +8%
                </span>
              </div>

              {/* Chart */}
              <div className={`h-40 bg-gradient-to-t ${metric.color} opacity-10 dark:opacity-20 rounded-lg flex items-end justify-around p-4 mb-4`}>
                {generateChartData().map((height, i) => (
                  <div
                    key={i}
                    className={`w-3 rounded-t-lg transition-all duration-500 hover:opacity-100 opacity-80 bg-gradient-to-t ${metric.color}`}
                    style={{ height: `${height}%` }}
                    title={`Day ${i + 1}: ${height}%`}
                  ></div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Avg
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    43.6
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Max
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">60</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Min
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">20</p>
                </div>
              </div>

              {/* Timeline */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                📅 Last 7 days
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
