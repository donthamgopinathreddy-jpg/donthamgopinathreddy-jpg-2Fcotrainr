import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Flame, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useMeals } from "@/hooks/useMeals";

export default function MobileMeals() {
  const navigate = useNavigate();
  const { meals, loading, addMeal, deleteMeal, fetchTodayMeals } = useMeals();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    meal_type: "breakfast" as "breakfast" | "lunch" | "dinner" | "snack",
    food_name: "",
    weight_g: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
  });

  useEffect(() => {
    fetchTodayMeals();
  }, []);

  const handleFetchMeals = async () => {
    await fetchTodayMeals();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.food_name || !formData.calories) {
      toast.error("Please enter food name and calories");
      return;
    }

    try {
      await addMeal({
        food_name: formData.food_name,
        weight_g: parseInt(formData.weight_g) || 100,
        calories: parseInt(formData.calories),
        protein_g: parseInt(formData.protein_g) || 0,
        carbs_g: parseInt(formData.carbs_g) || 0,
        fat_g: parseInt(formData.fat_g) || 0,
        meal_type: formData.meal_type,
      });
      toast.success("Meal logged successfully");
      setFormData({
        meal_type: "breakfast",
        food_name: "",
        weight_g: "",
        calories: "",
        protein_g: "",
        carbs_g: "",
        fat_g: "",
      });
      setShowForm(false);
      await handleFetchMeals();
    } catch (error: any) {
      toast.error(error.message || "Failed to log meal");
    }
  };

  const totalCalories = meals.reduce(
    (sum, meal) => sum + (meal.calories || 0),
    0,
  );
  const calorieGoal = 2000;

  const mealTypes = ["breakfast", "lunch", "snack", "dinner"];

  if (loading && meals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-semibold mb-4 text-green-100"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold mb-4">Meal Tracker</h1>

        {/* Calorie Summary */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Calories</p>
              <h2 className="text-3xl font-bold">{totalCalories}</h2>
              <p className="text-green-100 text-xs mt-1">
                Goal: {calorieGoal} cal
              </p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-lg font-bold">
                {Math.round((totalCalories / calorieGoal) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="px-4 py-4 bg-white border-b border-gray-200 flex items-center gap-2">
        <Calendar size={20} className="text-gray-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Meals by Type */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
        </div>
      ) : meals.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-gray-600 text-lg">No meals logged today</p>
          <p className="text-gray-500 text-sm mt-2">
            Add your first meal to get started
          </p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          {mealTypes.map((type) => {
            const typeMeals = meals.filter((m) => m.meal_type === type);
            if (typeMeals.length === 0) return null;

            return (
              <div key={type}>
                <h3 className="font-bold text-foreground capitalize mb-2">
                  {type}
                </h3>
                <div className="space-y-2">
                  {typeMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-card rounded-xl p-3 flex justify-between items-center border border-border"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {meal.notes || "Meal"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(meal.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame size={18} className="text-orange-500" />
                        <span className="font-bold text-foreground">
                          {meal.calories}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Meal Button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={28} />
        </button>
      ) : (
        <div className="fixed bottom-24 left-4 right-4 bg-card rounded-2xl p-4 shadow-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Meal Type
              </label>
              <select
                value={formData.meal_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meal_type: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                {mealTypes.map((type) => (
                  <option key={type} value={type} className="capitalize">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calories
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, calories: e.target.value }))
                }
                placeholder="500"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="e.g., Chicken rice"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    meal_type: "breakfast",
                    calories: "",
                    notes: "",
                  });
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
              >
                Log Meal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
