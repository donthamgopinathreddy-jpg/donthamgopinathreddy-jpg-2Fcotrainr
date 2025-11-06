import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface Meal {
  id: string;
  user_id: string;
  food_name: string;
  weight_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  logged_at: string;
}

export const useMeals = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch meals for today
  const fetchTodayMeals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", `${today}T00:00:00`)
        .lte("logged_at", `${today}T23:59:59`)
        .order("logged_at", { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new meal
  const addMeal = async (mealData: Omit<Meal, "id" | "user_id" | "logged_at">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          ...mealData,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setMeals((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error adding meal:", error);
      throw error;
    }
  };

  // Delete a meal
  const deleteMeal = async (mealId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("meals")
        .delete()
        .eq("id", mealId)
        .eq("user_id", user.id);

      if (error) throw error;
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
    } catch (error) {
      console.error("Error deleting meal:", error);
      throw error;
    }
  };

  // Calculate daily totals
  const calculateTotals = () => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein_g: acc.protein_g + meal.protein_g,
        carbs_g: acc.carbs_g + meal.carbs_g,
        fat_g: acc.fat_g + meal.fat_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
  };

  useEffect(() => {
    fetchTodayMeals();
  }, [user]);

  return {
    meals,
    loading,
    addMeal,
    deleteMeal,
    fetchTodayMeals,
    calculateTotals,
  };
};
