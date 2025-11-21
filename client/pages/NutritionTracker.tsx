import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";

interface Meal {
  id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function NutritionTracker() {
  const { userProfile } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    food_name: "",
    quantity: 1,
    unit: "g",
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    meal_type: "breakfast" as const,
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchMeals();
    }
  }, [userProfile?.id]);

  const fetchMeals = async () => {
    if (!userProfile?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("meals_log")
        .select("*")
        .eq("user_id", userProfile.id)
        .eq("meal_date", today)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching meals:", error);
        return;
      }

      setMeals(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.id || !formData.food_name) {
      toast.error("Please enter food name");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("meals_log")
        .insert({
          user_id: userProfile.id,
          meal_date: today,
          food_name: formData.food_name,
          quantity: formData.quantity,
          unit: formData.unit,
          calories: formData.calories,
          protein_g: formData.protein_g,
          carbs_g: formData.carbs_g,
          fat_g: formData.fat_g,
          meal_type: formData.meal_type,
        })
        .select();

      if (error) throw error;

      if (data) {
        setMeals([...meals, data[0]]);
        setFormData({
          food_name: "",
          quantity: 1,
          unit: "g",
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          meal_type: "breakfast",
        });
        setShowForm(false);
        toast.success("Meal added!");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to add meal");
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meals_log")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMeals(meals.filter((m) => m.id !== id));
      toast.success("Meal deleted!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to delete meal");
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein_g, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs_g, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat_g, 0);

  const mealsByType = MEAL_TYPES.map((type) => ({
    type,
    meals: meals.filter((m) => m.meal_type === type),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nutrition Tracker</h1>
          <p className="text-gray-600">Track your meals and nutrition intake</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-600 text-sm">Calories</p>
            <p className="text-2xl font-bold text-orange-600">{totalCalories}</p>
            <p className="text-xs text-gray-500">kcal</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-600 text-sm">Protein</p>
            <p className="text-2xl font-bold text-red-600">{totalProtein.toFixed(1)}</p>
            <p className="text-xs text-gray-500">g</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-600 text-sm">Carbs</p>
            <p className="text-2xl font-bold text-blue-600">{totalCarbs.toFixed(1)}</p>
            <p className="text-xs text-gray-500">g</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-600 text-sm">Fat</p>
            <p className="text-2xl font-bold text-yellow-600">{totalFat.toFixed(1)}</p>
            <p className="text-xs text-gray-500">g</p>
          </div>
        </div>

        {/* Add Meal Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl mb-6 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Add Meal
        </button>

        {/* Add Meal Form */}
        {showForm && (
          <form
            onSubmit={handleAddMeal}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6 space-y-4"
          >
            {/* Meal Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Meal Type
              </label>
              <select
                value={formData.meal_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meal_type: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {MEAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Food Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Food Name
              </label>
              <input
                type="text"
                value={formData.food_name}
                onChange={(e) =>
                  setFormData({ ...formData, food_name: e.target.value })
                }
                placeholder="e.g., Chicken Breast"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseFloat(e.target.value),
                    })
                  }
                  placeholder="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="g, ml, etc"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Calories */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) =>
                  setFormData({ ...formData, calories: parseInt(e.target.value) })
                }
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={formData.protein_g}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      protein_g: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={formData.carbs_g}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      carbs_g: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={formData.fat_g}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fat_g: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
            >
              Save Meal
            </button>
          </form>
        )}

        {/* Meals by Type */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : meals.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No meals logged today</p>
            <p className="text-gray-500 text-sm">Add a meal to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {mealsByType.map(({ type, meals: typeMeals }) =>
              typeMeals.length > 0 ? (
                <div key={type} className="bg-white rounded-2xl p-6 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                    {type}
                  </h3>
                  <div className="space-y-3">
                    {typeMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {meal.food_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {meal.quantity}{meal.unit} • {meal.calories} kcal
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            P: {meal.protein_g}g • C: {meal.carbs_g}g • F: {meal.fat_g}
                            g
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-red-600 hover:text-red-700 ml-4"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
