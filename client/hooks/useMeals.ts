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

  // Check if user is in demo mode
  const isDemoMode = () => {
    return user?.id?.startsWith("demo-user") || user?.id?.includes("demo");
  };

  // Fetch meals for today
  const fetchTodayMeals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const isDemo = isDemoMode();

      if (isDemo) {
        // Load from localStorage in demo mode
        const demoMeals = localStorage.getItem(`meals_demo_${user.id}`);
        setMeals(demoMeals ? JSON.parse(demoMeals) : []);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", `${today}T00:00:00`)
        .lte("logged_at", `${today}T23:59:59`)
        .order("logged_at", { ascending: false });

      if (error) {
        console.error("Supabase error fetching meals:", error?.message || JSON.stringify(error));
        setMeals([]);
      } else {
        setMeals(data || []);
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.code || String(error) || 'Failed to fetch meals';
      console.error("Error fetching meals:", errorMsg);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Add a new meal
  const addMeal = async (mealData: Omit<Meal, "id" | "user_id" | "logged_at">) => {
    if (!user) return;

    try {
      const isDemo = isDemoMode();
      const loggedAt = new Date().toISOString();

      if (isDemo) {
        // Add to localStorage in demo mode
        const newMeal: Meal = {
          id: `local-${Date.now()}`,
          user_id: user.id,
          ...mealData,
          logged_at: loggedAt,
        };

        const demoMeals = localStorage.getItem(`meals_demo_${user.id}`);
        const existingMeals = demoMeals ? JSON.parse(demoMeals) : [];
        const updatedMeals = [newMeal, ...existingMeals];

        localStorage.setItem(`meals_demo_${user.id}`, JSON.stringify(updatedMeals));
        setMeals((prev) => [newMeal, ...prev]);
        return newMeal;
      }

      const { data, error } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          ...mealData,
          logged_at: loggedAt,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding meal:", error);
        throw error;
      }
      setMeals((prev) => [data, ...prev]);
      return data;
    } catch (error: any) {
      const errorMsg = error?.message || error?.code || String(error) || "Failed to add meal";
      console.error("Error adding meal:", errorMsg);
      throw new Error(errorMsg);
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
