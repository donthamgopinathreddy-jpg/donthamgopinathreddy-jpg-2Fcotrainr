import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.usersService.getUserProfile(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    return this.usersService.updateUserProfile(req.user.userId, updateData);
  }
}
