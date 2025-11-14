import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Share2, Download } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useDietPlans } from "@/hooks/useDietPlans";

interface Meal {
  id: string;
  diet_plan_id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  food_name: string;
  time: string;
  quantity_g?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  notes?: string;
  created_at: string;
}

export default function DietPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { dietPlans } = useDietPlans();

  const [plan, setPlan] = useState<any>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [mealForm, setMealForm] = useState({
    meal_type: "breakfast" as const,
    food_name: "",
    time: "08:00",
    quantity_g: 100,
    calories: 300,
    protein_g: 20,
    carbs_g: 40,
    fat_g: 10,
    notes: "",
  });

  useEffect(() => {
    const loadPlanAndMeals = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch diet plan
        const planData = dietPlans.find((p) => p.id === id);
        if (planData) {
          setPlan(planData);
        }

        // Fetch meals
        const { data: mealsData, error } = await supabase
          .from("diet_plan_meals")
          .select("*")
          .eq("diet_plan_id", id)
          .order("time", { ascending: true });

        if (!error && mealsData) {
          setMeals(mealsData as Meal[]);
        }
      } catch (err) {
        console.debug("Load plan error:", err instanceof Error ? err.code : "unknown");
        toast.error("Failed to load diet plan");
      } finally {
        setLoading(false);
      }
    };

    loadPlanAndMeals();
  }, [id, dietPlans]);

  const handleAddMeal = async () => {
    if (!mealForm.food_name || !id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("diet_plan_meals")
        .insert([
          {
            diet_plan_id: id,
            ...mealForm,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.debug("Add meal error:", error?.code);
        toast.error("Failed to add meal");
        return;
      }

      setMeals((prev) => [...prev, data as Meal]);
      toast.success("Meal added!");
      setMealForm({
        meal_type: "breakfast",
        food_name: "",
        time: "08:00",
        quantity_g: 100,
        calories: 300,
        protein_g: 20,
        carbs_g: 40,
        fat_g: 10,
        notes: "",
      });
      setShowMealForm(false);
    } catch (err) {
      console.debug("Add meal catch error:", err instanceof Error ? err.code : "unknown");
      toast.error("Failed to add meal");
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm("Delete this meal?")) return;

    try {
      const { error } = await supabase
        .from("diet_plan_meals")
        .delete()
        .eq("id", mealId);

      if (error) {
        console.debug("Delete meal error:", error?.code);
        toast.error("Failed to delete meal");
        return;
      }

      setMeals((prev) => prev.filter((m) => m.id !== mealId));
      toast.success("Meal deleted");
    } catch (err) {
      console.debug("Delete meal catch error:", err instanceof Error ? err.code : "unknown");
      toast.error("Failed to delete meal");
    }
  };

  const generateMealPlanText = () => {
    if (!plan || meals.length === 0) return "";

    let text = `DIET PLAN: ${plan.name}\n`;
    text += `Duration: ${plan.duration_days} days\n`;
    text += `Target Calories: ${plan.target_calories} cal/day\n`;
    text += `Meals per Day: ${plan.meals_per_day}\n\n`;

    text += `MACROS TARGET:\n`;
    text += `Protein: ${plan.macros_protein_g}g\n`;
    text += `Carbs: ${plan.macros_carbs_g}g\n`;
    text += `Fat: ${plan.macros_fat_g}g\n\n`;

    text += `DAILY MEAL SCHEDULE:\n`;
    text += `${"=".repeat(50)}\n\n`;

    const mealsByTime = [...meals].sort(
      (a, b) => a.time.localeCompare(b.time)
    );

    mealsByTime.forEach((meal) => {
      text += `${meal.time} - ${meal.meal_type.toUpperCase()}\n`;
      text += `Food: ${meal.food_name}\n`;
      if (meal.quantity_g) text += `Quantity: ${meal.quantity_g}g\n`;
      if (meal.calories) text += `Calories: ${meal.calories} cal\n`;
      if (meal.protein_g) text += `Protein: ${meal.protein_g}g\n`;
      if (meal.carbs_g) text += `Carbs: ${meal.carbs_g}g\n`;
      if (meal.fat_g) text += `Fat: ${meal.fat_g}g\n`;
      if (meal.notes) text += `Notes: ${meal.notes}\n`;
      text += `\n`;
    });

    if (plan.notes) {
      text += `\nADDITIONAL NOTES:\n`;
      text += `${plan.notes}\n`;
    }

    return text;
  };

  const handleDownloadText = () => {
    const text = generateMealPlanText();
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute(
      "download",
      `${plan?.name || "diet-plan"}.txt`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Diet plan downloaded!");
  };

  const handleCopyText = async () => {
    const text = generateMealPlanText();
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Diet plan copied to clipboard!");
    } catch (err) {
      console.debug("Copy text error:", err instanceof Error ? err.code : "unknown");
      toast.error("Failed to copy");
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Loading diet plan...
          </p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div
        className={`min-h-screen pb-20 ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Diet plan not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-20 ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-br from-white to-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
          theme === "dark"
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/80 border-gray-200"
        } backdrop-blur-sm`}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {plan.name}
            </h1>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Plan Info */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div
          className={`rounded-lg border mb-6 ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-white border-gray-200"
          } p-6`}
        >
          <h2 className={`font-bold text-lg mb-3 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Plan Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={theme === "dark" ? "text-gray-400 text-sm" : "text-gray-600 text-sm"}>
                Duration
              </p>
              <p className="font-semibold text-orange-500">{plan.duration_days} days</p>
            </div>
            <div>
              <p className={theme === "dark" ? "text-gray-400 text-sm" : "text-gray-600 text-sm"}>
                Target Calories
              </p>
              <p className="font-semibold text-orange-500">{plan.target_calories} cal</p>
            </div>
            <div>
              <p className={theme === "dark" ? "text-gray-400 text-sm" : "text-gray-600 text-sm"}>
                Protein
              </p>
              <p className="font-semibold text-orange-500">{plan.macros_protein_g}g</p>
            </div>
            <div>
              <p className={theme === "dark" ? "text-gray-400 text-sm" : "text-gray-600 text-sm"}>
                Carbs
              </p>
              <p className="font-semibold text-orange-500">{plan.macros_carbs_g}g</p>
            </div>
          </div>
        </div>

        {/* Meals Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🍽️ Meals
            </h2>
            <button
              onClick={() => setShowMealForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Meal
            </button>
          </div>

          {meals.length === 0 ? (
            <div
              className={`rounded-lg border-2 border-dashed ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-300 bg-gray-50"
              } p-8 text-center`}
            >
              <p
                className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                No meals added yet
              </p>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                Add meals with times to create the daily schedule
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className={`rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800/50 border-gray-700/50"
                      : "bg-white border-gray-200"
                  } p-4`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-orange-500">{meal.time}</p>
                      <h3
                        className={`font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {meal.food_name}
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {meal.meal_type.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {(meal.calories || meal.protein_g || meal.carbs_g || meal.fat_g) && (
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {meal.calories && (
                        <div>
                          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                            Calories
                          </p>
                          <p className="font-semibold">{meal.calories}</p>
                        </div>
                      )}
                      {meal.protein_g && (
                        <div>
                          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                            Protein
                          </p>
                          <p className="font-semibold">{meal.protein_g}g</p>
                        </div>
                      )}
                      {meal.carbs_g && (
                        <div>
                          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                            Carbs
                          </p>
                          <p className="font-semibold">{meal.carbs_g}g</p>
                        </div>
                      )}
                      {meal.fat_g && (
                        <div>
                          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                            Fat
                          </p>
                          <p className="font-semibold">{meal.fat_g}g</p>
                        </div>
                      )}
                    </div>
                  )}

                  {meal.notes && (
                    <p
                      className={`text-sm mt-2 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {meal.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Meal Form Modal */}
      {showMealForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Add Meal
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  Time
                </label>
                <input
                  type="time"
                  value={mealForm.time}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, time: e.target.value })
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  Meal Type
                </label>
                <select
                  value={mealForm.meal_type}
                  onChange={(e) =>
                    setMealForm({
                      ...mealForm,
                      meal_type: e.target.value as any,
                    })
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  Food Name *
                </label>
                <input
                  type="text"
                  value={mealForm.food_name}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, food_name: e.target.value })
                  }
                  placeholder="e.g., Grilled Chicken with Rice"
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Calories
                  </label>
                  <input
                    type="number"
                    value={mealForm.calories}
                    onChange={(e) =>
                      setMealForm({
                        ...mealForm,
                        calories: Number(e.target.value),
                      })
                    }
                    className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Quantity (g)
                  </label>
                  <input
                    type="number"
                    value={mealForm.quantity_g}
                    onChange={(e) =>
                      setMealForm({
                        ...mealForm,
                        quantity_g: Number(e.target.value),
                      })
                    }
                    className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={mealForm.protein_g}
                    onChange={(e) =>
                      setMealForm({
                        ...mealForm,
                        protein_g: Number(e.target.value),
                      })
                    }
                    className={`w-full rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={mealForm.carbs_g}
                    onChange={(e) =>
                      setMealForm({
                        ...mealForm,
                        carbs_g: Number(e.target.value),
                      })
                    }
                    className={`w-full rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={mealForm.fat_g}
                    onChange={(e) =>
                      setMealForm({
                        ...mealForm,
                        fat_g: Number(e.target.value),
                      })
                    }
                    className={`w-full rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  Notes
                </label>
                <textarea
                  value={mealForm.notes}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows={2}
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMealForm(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMeal}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Meal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Share Diet Plan
            </h2>

            <p
              className={`text-sm mb-4 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Share this diet plan as a text file with your client
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCopyText}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Copy to Clipboard
              </button>
              <button
                onClick={handleDownloadText}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download as Text
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className={`w-full mt-4 px-4 py-2 rounded-lg font-semibold transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
