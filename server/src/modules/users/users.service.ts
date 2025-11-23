import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserProfile(userId: string) {
    return this.supabaseService.getUserById(userId);
  }

  async updateUserProfile(userId: string, updateData: any) {
    const allowedFields = ['height_cm', 'weight_kg', 'bio', 'username'];
    const filtered = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    return this.supabaseService.updateUser(userId, filtered);
  }
}
