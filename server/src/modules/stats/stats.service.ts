import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { RewardsService } from '../rewards/rewards.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly rewardsService: RewardsService,
  ) {}

  async logDailyStats(userId: string, statsData: any) {
    const today = new Date().toISOString().split('T')[0];
    const stat = await this.supabaseService.upsertDailyStat(userId, today, statsData);

    // Check for achievements
    if (statsData.steps && statsData.steps >= 10000) {
      await this.rewardsService.earnReward(
        userId,
        'steps_10k',
        100,
        'Reached 10,000 steps',
      );
    }

    if (statsData.water_intake_ml && statsData.water_intake_ml >= 2000) {
      await this.rewardsService.earnReward(
        userId,
        'water_goal',
        50,
        'Reached water goal',
      );
    }

    return stat;
  }

  async getDailyStats(userId: string, startDate: string, endDate: string) {
    return this.supabaseService.getDailyStats(userId, startDate, endDate);
  }
}
