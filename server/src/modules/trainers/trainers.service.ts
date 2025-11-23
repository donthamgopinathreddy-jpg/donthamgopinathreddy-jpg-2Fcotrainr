import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class TrainersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getTrainers(filters?: any) {
    return this.supabaseService.getTrainers(filters);
  }

  async createTrainerProfile(userId: string, trainerData: any) {
    const profile = {
      user_id: userId,
      bio: trainerData.bio,
      years_experience: trainerData.years_experience,
      categories: trainerData.categories || [],
      location_lat: trainerData.latitude,
      location_lng: trainerData.longitude,
    };

    return this.supabaseService.createTrainerProfile(profile);
  }
}
