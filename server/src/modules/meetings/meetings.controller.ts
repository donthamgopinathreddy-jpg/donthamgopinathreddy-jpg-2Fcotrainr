import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  async createMeeting(@Req() req: any, @Body() meetingData: any) {
    return this.meetingsService.createMeeting(req.user.userId, meetingData);
  }

  @Get('my')
  async getMyMeetings(@Req() req: any) {
    return this.meetingsService.getUserMeetings(req.user.userId);
  }
}
