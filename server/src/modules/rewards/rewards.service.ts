import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class RewardsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async earnReward(userId: string, type: string, coins: number, reason: string) {
    return this.supabaseService.createRewardEvent(userId, type, coins, { reason });
  }

  async getUserRewards(userId: string) {
    return this.supabaseService.getUserRewards(userId);
  }

  async getUserAchievements(userId: string) {
    return this.supabaseService.getUserAchievements(userId);
  }

  async unlockAchievement(userId: string, achievementId: string) {
    return this.supabaseService.unlockAchievement(userId, achievementId);
  }
}
