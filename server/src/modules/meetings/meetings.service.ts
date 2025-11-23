import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createMeeting(trainerId: string, meetingData: any) {
    const meeting = await this.supabaseService.createMeeting({
      trainer_id: trainerId,
      client_id: meetingData.client_id,
      starts_at: meetingData.starts_at,
      ends_at: meetingData.ends_at,
      meeting_link: meetingData.meeting_link,
    });

    // Create notification for client
    const startDate = new Date(meetingData.starts_at).toLocaleDateString();
    const startTime = new Date(meetingData.starts_at).toLocaleTimeString();
    
    await this.notificationsService.createNotification(meetingData.client_id, {
      type: 'meeting_scheduled',
      title: 'New Training Session',
      message: `Your trainer scheduled a session on ${startDate} at ${startTime}`,
      related_meeting_id: meeting.id,
    });

    return meeting;
  }

  async getUserMeetings(userId: string) {
    return this.supabaseService.getUserMeetings(userId);
  }
}
