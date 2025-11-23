import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post('daily')
  async logDailyStats(@Req() req: any, @Body() statsData: any) {
    return this.statsService.logDailyStats(req.user.userId, statsData);
  }

  @Get('daily')
  async getDailyStats(
    @Req() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.statsService.getDailyStats(req.user.userId, startDate, endDate);
  }
}
