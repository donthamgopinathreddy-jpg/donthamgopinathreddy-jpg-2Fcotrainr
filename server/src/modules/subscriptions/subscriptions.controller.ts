import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('create-session')
  async createSession(@Req() req: any, @Body() body: any) {
    return this.subscriptionsService.createRazorpaySession(req.user.userId, body.plan);
  }

  @Get('status')
  async getSubscriptionStatus(@Req() req: any) {
    return this.subscriptionsService.getSubscriptionStatus(req.user.userId);
  }

  @Post('webhook')
  async handleRazorpayWebhook(@Body() payload: any) {
    return this.subscriptionsService.handleWebhook(payload);
  }
}
