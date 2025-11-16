import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface DietPreferences {
  goal: "Lose Fat" | "Build Muscle" | "Maintain";
  dietTypes: string[]; // Veg, Non-Veg, Vegan, High-Protein, Keto, Custom
  preferredFoods: string[];
  dislikedFoods: string[];
  mustIncludeFoods: string[];
  culturalPreference?: string;
  allergens: string[];
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  fiberTarget?: number;
  budgetTier: "Low" | "Medium" | "High";
}

export interface MealPlan {
  breakfast: any;
  snack1: any;
  lunch: any;
  snack2: any;
  dinner: any;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

const MEAL_TYPES = {
  breakfast: "Breakfast",
  snack1: "Snack",
  lunch: "Lunch",
  snack2: "Snack",
  dinner: "Dinner",
};

export const useDietPlanGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMealPlan = useCallback(
    async (preferences: DietPreferences): Promise<MealPlan | null> => {
      setLoading(true);
      setError(null);

      try {
        // Calculate macro adjustments based on goal
        let calorieAdjustment = 1;
        let proteinAdjustment = 1;

        if (preferences.goal === "Lose Fat") {
          calorieAdjustment = 0.9; // 10% reduction
        } else if (preferences.goal === "Build Muscle") {
          calorieAdjustment = 1.1; // 10% increase
          proteinAdjustment = 1.25; // 25% increase
        }

        const adjustedCalories = preferences.dailyCalorieTarget * calorieAdjustment;
        const adjustedProtein = preferences.proteinTarget * proteinAdjustment;

        // Build query filters
        let query = supabase.from("meal_database").select("*");

        // Filter by allergens
        if (preferences.allergens.length > 0) {
          for (const allergen of preferences.allergens) {
            query = query.not("allergens", "cs", `{${allergen}}`);
          }
        }

        // Filter by disliked foods
        let meals = await query;

        if (meals.error) {
          throw new Error(meals.error.message);
        }

        let mealData = meals.data || [];

        // Additional filtering based on preferences
        mealData = mealData.filter((meal: any) => {
          // Check disliked foods in ingredients
          const mealIngredients = (meal.ingredients || []).join(" ").toLowerCase();
          const dislikedMatch = preferences.dislikedFoods.some((food) =>
            mealIngredients.includes(food.toLowerCase())
          );
          if (dislikedMatch) return false;

          // Check diet type compatibility
          if (preferences.dietTypes.length > 0) {
            const mealDietTypes = meal.diet_types || [];
            const isCompatible = preferences.dietTypes.some((dt: string) =>
              mealDietTypes.includes(dt)
            );

            if (!isCompatible) {
              // For Vegan + Non-Veg combination, allow non-veg as fallback
              if (
                preferences.dietTypes.includes("Vegan") &&
                preferences.dietTypes.includes("Non-Veg")
              ) {
                return true;
              }
              return false;
            }
          }

          // Check budget tier
          if (meal.budget_tier !== preferences.budgetTier) {
            return false;
          }

          return true;
        });

        // Select meals for each meal type
        const mealPlan: MealPlan = {
          breakfast: selectMealForType(
            mealData,
            "Breakfast",
            adjustedCalories * 0.25
          ),
          snack1: selectMealForType(mealData, "Snack", adjustedCalories * 0.1),
          lunch: selectMealForType(
            mealData,
            "Lunch",
            adjustedCalories * 0.35
          ),
          snack2: selectMealForType(mealData, "Snack", adjustedCalories * 0.1),
          dinner: selectMealForType(
            mealData,
            "Dinner",
            adjustedCalories * 0.2
          ),
          totals: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0,
          },
        };

        // Calculate totals
        Object.keys(mealPlan).forEach((key) => {
          if (key !== "totals" && mealPlan[key as keyof MealPlan]) {
            const meal = mealPlan[key as keyof MealPlan] as any;
            mealPlan.totals.calories += meal.calories || 0;
            mealPlan.totals.protein += meal.protein_g || 0;
            mealPlan.totals.carbs += meal.carbs_g || 0;
            mealPlan.totals.fats += meal.fats_g || 0;
            mealPlan.totals.fiber += meal.fiber_g || 0;
          }
        });

        return mealPlan;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate meal plan";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateWeeklyPlan = useCallback(
    async (preferences: DietPreferences): Promise<MealPlan[] | null> => {
      const weeklyPlan: MealPlan[] = [];

      for (let i = 0; i < 7; i++) {
        const plan = await generateMealPlan(preferences);
        if (plan) {
          weeklyPlan.push(plan);
        }
      }

      return weeklyPlan.length === 7 ? weeklyPlan : null;
    },
    [generateMealPlan]
  );

  return {
    generateMealPlan,
    generateWeeklyPlan,
    loading,
    error,
  };
};

function selectMealForType(meals: any[], mealType: string, targetCalories: number): any {
  const typedMeals = meals.filter((meal) => meal.meal_type === mealType);

  if (typedMeals.length === 0) {
    return meals[0]; // Fallback to first meal
  }

  // Find meal closest to target calories
  let bestMeal = typedMeals[0];
  let closestDiff = Math.abs((bestMeal.calories || 0) - targetCalories);

  for (const meal of typedMeals) {
    const diff = Math.abs((meal.calories || 0) - targetCalories);
    if (diff < closestDiff) {
      closestDiff = diff;
      bestMeal = meal;
    }
  }

  return bestMeal;
}
