import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class MealsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async logMeal(userId: string, mealData: any) {
    const mealLog = {
      user_id: userId,
      date: mealData.date || new Date().toISOString().split('T')[0],
      meal_type: mealData.meal_type,
      calories: mealData.calories,
      notes: mealData.notes || null,
    };

    return this.supabaseService.logMeal(mealLog);
  }

  async getMeals(userId: string, date: string) {
    return this.supabaseService.getMeals(userId, date);
  }
}
