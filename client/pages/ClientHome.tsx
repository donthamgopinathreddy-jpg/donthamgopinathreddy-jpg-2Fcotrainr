import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Activity, Droplet, Flame, Utensils } from "lucide-react";
import { toast } from "sonner";

interface FitnessData {
  steps: number;
  calories_burned: number;
  water_liters: number;
}

export default function ClientHome() {
  const { userProfile } = useAuth();
  const [fitnessData, setFitnessData] = useState<FitnessData>({
    steps: 0,
    calories_burned: 0,
    water_liters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.id) return;
    fetchTodaysFitness();
  }, [userProfile?.id]);

  const fetchTodaysFitness = async () => {
    if (!userProfile?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("fitness_tracking")
        .select("*")
        .eq("user_id", userProfile.id)
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching fitness data:", error);
        return;
      }

      if (data) {
        setFitnessData(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (!userProfile?.height_cm || !userProfile?.weight_kg) return null;
    const heightM = userProfile.height_cm / 100;
    return Math.round((userProfile.weight_kg / (heightM * heightM)) * 10) / 10;
  };

  const handleAddSteps = async (amount: number) => {
    if (!userProfile?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const newSteps = fitnessData.steps + amount;
      const newCalories = newSteps * 0.05;

      const { error } = await supabase.from("fitness_tracking").upsert({
        user_id: userProfile.id,
        date: today,
        steps: newSteps,
        calories_burned: newCalories,
        water_liters: fitnessData.water_liters,
      });

      if (error) throw error;

      setFitnessData((prev) => ({
        ...prev,
        steps: newSteps,
        calories_burned: newCalories,
      }));
      toast.success("Steps added!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to add steps");
    }
  };

  const handleAddWater = async (amount: number) => {
    if (!userProfile?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const newWater = fitnessData.water_liters + amount;

      const { error } = await supabase.from("fitness_tracking").upsert({
        user_id: userProfile.id,
        date: today,
        steps: fitnessData.steps,
        calories_burned: fitnessData.calories_burned,
        water_liters: newWater,
      });

      if (error) throw error;

      setFitnessData((prev) => ({
        ...prev,
        water_liters: newWater,
      }));
      toast.success("Water logged!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to log water");
    }
  };

  const bmi = calculateBMI();
  const waterGoal = userProfile?.weight_kg
    ? (userProfile.weight_kg * 30) / 1000
    : 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6 pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {userProfile?.full_name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-gray-600">Today's activity overview</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* BMI Card */}
            {bmi && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Your BMI
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-bold text-orange-600">{bmi}</p>
                    <p className="text-gray-600 mt-1">
                      {bmi < 18.5
                        ? "Underweight"
                        : bmi < 25
                          ? "Normal"
                          : bmi < 30
                            ? "Overweight"
                            : "Obese"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>Height: {userProfile?.height_cm}cm</p>
                    <p>Weight: {userProfile?.weight_kg}kg</p>
                  </div>
                </div>
              </div>
            )}

            {/* Steps Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Steps</h2>
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-orange-600">
                  {fitnessData.steps.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">Goal: 10,000 steps</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-orange-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min((fitnessData.steps / 10000) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddSteps(100)}
                  className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-2 rounded-lg transition"
                >
                  +100
                </button>
                <button
                  onClick={() => handleAddSteps(500)}
                  className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-2 rounded-lg transition"
                >
                  +500
                </button>
              </div>
            </div>

            {/* Calories Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Calories Burned
                </h2>
              </div>
              <p className="text-4xl font-bold text-red-600">
                {Math.round(fitnessData.calories_burned)}
              </p>
              <p className="text-gray-600 text-sm">
                From {fitnessData.steps} steps
              </p>
            </div>

            {/* Water Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Droplet className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Water Intake
                </h2>
              </div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-blue-600">
                  {fitnessData.water_liters}L
                </p>
                <p className="text-gray-600 text-sm">
                  Goal: {waterGoal.toFixed(1)}L
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min((fitnessData.water_liters / waterGoal) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddWater(0.25)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 rounded-lg transition"
                >
                  +250ml
                </button>
                <button
                  onClick={() => handleAddWater(0.5)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 rounded-lg transition"
                >
                  +500ml
                </button>
              </div>
            </div>

            {/* Nutrition Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Utensils className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Nutrition Tracker
                  </h2>
                </div>
                <button className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
                  View Details →
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Track your meals and nutrition intake
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
