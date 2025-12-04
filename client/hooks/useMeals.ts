import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MealEntry {
  id?: string;
  user_id?: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "snacks" | "dinner";
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at?: string;
}

export interface DailyMealSummary {
  breakfast: MealEntry[];
  lunch: MealEntry[];
  snacks: MealEntry[];
  dinner: MealEntry[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export const useMeals = () => {
  const queryClient = useQueryClient();

  // Fetch meals for a specific date
  const useDailyMeals = (date: string, userId?: string) => {
    return useQuery({
      queryKey: ["meals", date, userId],
      queryFn: async () => {
        if (!userId) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          userId = user?.id;
        }

        const { data, error } = await supabase
          .from("meals_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("date", date)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Organize by meal type and calculate totals
        const organized: DailyMealSummary = {
          breakfast: [],
          lunch: [],
          snacks: [],
          dinner: [],
          totals: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
          },
        };

        data.forEach((meal) => {
          organized[meal.meal_type as keyof typeof organized].push(meal);
          organized.totals.calories += meal.calories;
          organized.totals.protein += meal.protein;
          organized.totals.carbs += meal.carbs;
          organized.totals.fats += meal.fats;
        });

        return organized;
      },
    });
  };

  // Fetch meals for a week
  const useWeeklyMeals = (startDate: string, userId?: string) => {
    return useQuery({
      queryKey: ["weekly-meals", startDate, userId],
      queryFn: async () => {
        if (!userId) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          userId = user?.id;
        }

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const { data, error } = await supabase
          .from("meals_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", startDate)
          .lte("date", endDate.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (error) throw error;

        // Organize by date
        const weeklyData: Record<string, DailyMealSummary> = {};

        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split("T")[0];
          weeklyData[dateStr] = {
            breakfast: [],
            lunch: [],
            snacks: [],
            dinner: [],
            totals: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fats: 0,
            },
          };
        }

        data.forEach((meal) => {
          const dateData = weeklyData[meal.date];
          if (dateData) {
            dateData[meal.meal_type as keyof typeof dateData].push(meal);
            dateData.totals.calories += meal.calories;
            dateData.totals.protein += meal.protein;
            dateData.totals.carbs += meal.carbs;
            dateData.totals.fats += meal.fats;
          }
        });

        return weeklyData;
      },
    });
  };

  // Add meal entry
  const useAddMeal = () => {
    return useMutation({
      mutationFn: async (meal: MealEntry) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from("meals_logs")
          .insert([
            {
              user_id: user?.id,
              date: meal.date,
              meal_type: meal.meal_type,
              food_name: meal.food_name,
              quantity: meal.quantity,
              unit: meal.unit,
              calories: Math.round(meal.calories * 10) / 10,
              protein: Math.round(meal.protein * 10) / 10,
              carbs: Math.round(meal.carbs * 10) / 10,
              fats: Math.round(meal.fats * 10) / 10,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["meals", data.date],
        });
        queryClient.invalidateQueries({
          queryKey: ["weekly-meals"],
        });
      },
    });
  };

  // Delete meal entry
  const useDeleteMeal = () => {
    return useMutation({
      mutationFn: async (mealId: string) => {
        const { error } = await supabase
          .from("meals_logs")
          .delete()
          .eq("id", mealId);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["meals"] });
        queryClient.invalidateQueries({ queryKey: ["weekly-meals"] });
      },
    });
  };

  return {
    useDailyMeals,
    useWeeklyMeals,
    useAddMeal,
    useDeleteMeal,
  };
};
