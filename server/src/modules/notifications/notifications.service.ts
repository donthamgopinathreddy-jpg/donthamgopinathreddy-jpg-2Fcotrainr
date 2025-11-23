import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createNotification(userId: string, notificationData: any) {
    return this.supabaseService.createNotification({
      user_id: userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      related_meeting_id: notificationData.related_meeting_id || null,
    });
  }

  async getUserNotifications(userId: string) {
    return this.supabaseService.getUserNotifications(userId);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.supabaseService.markNotificationAsRead(notificationId);
  }
}
