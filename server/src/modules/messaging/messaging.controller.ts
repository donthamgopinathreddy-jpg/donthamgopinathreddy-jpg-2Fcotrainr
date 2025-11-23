import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MessagingService } from './messaging.service';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  async getConversations(@Req() req: any) {
    return this.messagingService.getConversations(req.user.userId);
  }

  @Post()
  async createConversation(@Req() req: any, @Body() body: any) {
    return this.messagingService.createConversation(req.user.userId, body.participant_id);
  }

  @Post(':id/messages')
  async sendMessage(@Req() req: any, @Param('id') conversationId: string, @Body() body: any) {
    return this.messagingService.sendMessage(conversationId, req.user.userId, body.text);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.messagingService.getMessages(conversationId);
  }
}
