import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  async createPost(@Req() req: any, @Body() postData: any) {
    return this.feedService.createPost(req.user.userId, postData);
  }

  @Get('feed')
  async getFeed(@Req() req: any) {
    return this.feedService.getFeed(req.user.userId);
  }

  @Post(':id/like')
  async likePost(@Req() req: any, @Param('id') postId: string) {
    return this.feedService.likePost(postId, req.user.userId);
  }

  @Post(':id/comment')
  async commentOnPost(@Req() req: any, @Param('id') postId: string, @Body() body: any) {
    return this.feedService.commentOnPost(postId, req.user.userId, body.text);
  }

  @Post('follow/:userId')
  async followUser(@Req() req: any, @Param('userId') userId: string) {
    return this.feedService.followUser(req.user.userId, userId);
  }

  @Post('unfollow/:userId')
  async unfollowUser(@Req() req: any, @Param('userId') userId: string) {
    return this.feedService.unfollowUser(req.user.userId, userId);
  }
}
