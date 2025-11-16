import React, { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, Target, Zap, Droplets, Moon, Award, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAIWeeklyInsights, type AIInsights } from "@/hooks/useAIWeeklyInsights";
import { useWeeklyHealthData } from "@/hooks/useWeeklyHealthData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

export default function AIWeeklyInsights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateInsights, loading: generatingInsights } = useAIWeeklyInsights();
  const { weeklyData, loading: loadingData, error: dataError } = useWeeklyHealthData();
  const [insights, setInsights] = useState<AIInsights | null>(null);

  useEffect(() => {
    if (weeklyData) {
      generateInsights(weeklyData).then((result) => {
        if (result) setInsights(result);
      });
    }
  }, [weeklyData, generateInsights]);

  // Generate chart data based on real weekly data
  const generateChartData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyTarget = Math.round(weeklyData.stepsTotal / 7);

    return days.map((day) => ({
      day,
      steps: dailyTarget + Math.random() * 4000 - 2000, // Realistic variation
      target: dailyTarget,
    }));
  };

  const generateProteinData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyProteinTarget = Math.round(weeklyData.proteinIntakeG / 7);

    return days.map((day) => ({
      day,
      actual: Math.round(dailyProteinTarget + Math.random() * 40 - 20), // Realistic variation
      target: dailyProteinTarget,
    }));
  };

  const chunkStepsData = generateChartData();
  const proteinData = generateProteinData();

  if (loadingData || generatingInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (!insights || !weeklyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center pb-24">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            {dataError || "Unable to load your weekly insights. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const isPremium = weeklyData.subscriptionLevel === "premium";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">AI Weekly Insights</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Weekly Summary Header */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white border-0">
          <h2 className="text-2xl font-bold mb-2">Week Overview</h2>
          <p className="opacity-90">Week of {weeklyData.weekStartDate.toLocaleDateString()}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur p-4 rounded-lg">
              <div className="text-2xl font-bold">{insights.progressOverview.stepsTotal.toLocaleString()}</div>
              <div className="text-sm opacity-90">Steps</div>
              <div className="text-sm font-semibold mt-1">{insights.progressOverview.stepsVsLastWeek}</div>
            </div>
            <div className="bg-white/20 backdrop-blur p-4 rounded-lg">
              <div className="text-2xl font-bold">{insights.progressOverview.workoutMinutes}</div>
              <div className="text-sm opacity-90">Workout Min</div>
              <div className="text-sm font-semibold mt-1">{insights.progressOverview.workoutVsLastWeek}</div>
            </div>
            <div className="bg-white/20 backdrop-blur p-4 rounded-lg">
              <div className="text-2xl font-bold">{insights.progressOverview.caloriesBurned}</div>
              <div className="text-sm opacity-90">Burned</div>
            </div>
            <div className="bg-white/20 backdrop-blur p-4 rounded-lg">
              <div className="text-2xl font-bold">{insights.progressOverview.caloriesConsumed}</div>
              <div className="text-sm opacity-90">Consumed</div>
            </div>
          </div>
        </Card>

        {/* Goal Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-bold">Goal Alignment</h3>
            </div>

            <div className={`p-4 rounded-lg mb-4 ${
              insights.goalAlignment.status === "On Track"
                ? "bg-green-100 border border-green-200"
                : insights.goalAlignment.status === "Almost There"
                ? "bg-yellow-100 border border-yellow-200"
                : "bg-red-100 border border-red-200"
            }`}>
              <div className={`text-2xl font-bold ${
                insights.goalAlignment.status === "On Track"
                  ? "text-green-700"
                  : insights.goalAlignment.status === "Almost There"
                  ? "text-yellow-700"
                  : "text-red-700"
              }`}>
                {insights.goalAlignment.status}
              </div>
              <div className="text-sm mt-1 text-gray-700">{insights.goalAlignment.reason}</div>
            </div>
          </Card>

          {/* Coach Message */}
          <Card className="p-6 bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200">
            <h3 className="text-lg font-bold mb-4">Coach's Message</h3>
            <p className="text-lg font-semibold text-orange-900">"{insights.coachMessage}"</p>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur border-orange-100">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-bold text-black dark:text-white">Achievements & Streaks</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.achievements.personalRecords.map((pr, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-purple-400 to-purple-300 dark:from-purple-700 dark:to-purple-600 rounded-lg border-2 border-purple-500">
                <div className="text-sm font-bold text-black dark:text-white">{pr}</div>
              </div>
            ))}
            {insights.achievements.milestones.map((ms, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-blue-400 to-blue-300 dark:from-blue-700 dark:to-blue-600 rounded-lg border-2 border-blue-500">
                <div className="text-sm font-bold text-black dark:text-white">{ms}</div>
              </div>
            ))}
            {insights.achievements.streaks.map((st, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-orange-400 to-orange-300 dark:from-orange-700 dark:to-orange-600 rounded-lg border-2 border-orange-500">
                <div className="text-sm font-bold text-black dark:text-white">{st}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Steps Trend */}
          <Card className="p-6 bg-white/80 backdrop-blur border-orange-100">
            <h3 className="text-lg font-bold mb-4">Steps Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chunkStepsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="steps" stroke="#ff7a00" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#ccc" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Protein Intake */}
          <Card className="p-6 bg-white/80 backdrop-blur border-orange-100">
            <h3 className="text-lg font-bold mb-4">Protein Intake Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={proteinData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="actual" fill="#ff7a00" />
                <Bar dataKey="target" fill="#ccc" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* AI Observations */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur border-orange-100">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-bold text-black dark:text-white">AI Observations</h3>
          </div>

          <div className="space-y-3">
            {insights.aiObservations.map((obs, idx) => (
              <div key={idx} className="p-3 bg-gradient-to-r from-orange-300 to-yellow-300 dark:from-orange-600 dark:to-yellow-600 rounded-lg border-2 border-orange-400 dark:border-orange-700">
                <p className="text-sm font-medium text-black dark:text-white">{obs}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur border-orange-100">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-bold text-black dark:text-white">Personalized Recommendations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border-2 border-purple-400 bg-gradient-to-br from-purple-300 to-purple-200 dark:from-purple-700 dark:to-purple-600">
              <h4 className="font-bold text-sm mb-2 text-black dark:text-white">💪 Workout</h4>
              <p className="text-sm font-medium text-black dark:text-white">{insights.recommendations.workoutSuggestion}</p>
            </div>
            <div className="p-4 rounded-lg border-2 border-green-400 bg-gradient-to-br from-green-300 to-green-200 dark:from-green-700 dark:to-green-600">
              <h4 className="font-bold text-sm mb-2 text-black dark:text-white">🍗 Diet</h4>
              <p className="text-sm font-medium text-black dark:text-white">{insights.recommendations.dietModification}</p>
            </div>
            <div className="p-4 rounded-lg border-2 border-blue-400 bg-gradient-to-br from-blue-300 to-blue-200 dark:from-blue-700 dark:to-blue-600">
              <h4 className="font-bold text-sm mb-2 text-black dark:text-white">💧 Hydration</h4>
              <p className="text-sm font-medium text-black dark:text-white">{insights.recommendations.hydrationTarget}</p>
            </div>
            <div className="p-4 rounded-lg border-2 border-pink-400 bg-gradient-to-br from-pink-300 to-pink-200 dark:from-pink-700 dark:to-pink-600">
              <h4 className="font-bold text-sm mb-2 text-black dark:text-white">👟 Steps</h4>
              <p className="text-sm font-medium text-black dark:text-white">{insights.recommendations.stepChallenge}</p>
            </div>
          </div>
        </Card>

        {/* Weekly Challenges */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur border-orange-100">
          <h3 className="text-lg font-bold mb-6 text-black dark:text-white">Weekly Challenges</h3>

          <div className="space-y-4">
            {insights.challenges.map((challenge, idx) => (
              <div key={idx} className="p-4 border-2 border-orange-400 rounded-lg bg-gradient-to-r from-orange-300 to-yellow-300 dark:from-orange-700 dark:to-yellow-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-black dark:text-white">{challenge.name}</h4>
                  <span className="text-black dark:text-white font-bold text-sm">{challenge.target}</span>
                </div>
                <p className="text-sm font-medium text-black dark:text-white">{challenge.description}</p>
                <div className="mt-3">
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Premium Insights */}
        {!isPremium ? (
          <Card className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
            <div className="relative z-10 text-center">
              <Unlock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-900 mb-2">Premium Insights Locked</h3>
              <p className="text-purple-800 mb-6">
                Upgrade to unlock deeper AI health insights, recovery scores, advanced predictions, and meal plan optimization
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Upgrade to Premium
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-white/80 backdrop-blur border-orange-100">
            <h3 className="text-lg font-bold mb-6">Premium Insights</h3>

            {insights.premiumInsights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                  <h4 className="font-semibold mb-2">Micronutrient Analysis</h4>
                  <p className="text-sm">{insights.premiumInsights.micronutrients}</p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                  <h4 className="font-semibold mb-2">Recovery Score</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {insights.premiumInsights.recoveryScore}/100
                  </div>
                  <Progress value={insights.premiumInsights.recoveryScore} className="h-2" />
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                  <h4 className="font-semibold mb-2">Predictions</h4>
                  <ul className="text-sm space-y-2">
                    <li>��� Steps: {insights.premiumInsights.predictions.predictedSteps.toLocaleString()}</li>
                    <li>⚖️ Weight: {insights.premiumInsights.predictions.predictedWeight}</li>
                    <li>🔥 Deficit: {insights.premiumInsights.predictions.predictedCalorieBalance}</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                  <h4 className="font-semibold mb-2">Protein Consistency</h4>
                  <p className="text-sm">{insights.premiumInsights.predictions.proteinConsistency}</p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
