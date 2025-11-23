import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrainersService } from './trainers.service';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Get()
  async getTrainers(
    @Query('category') category?: string,
    @Query('lat') latitude?: number,
    @Query('lng') longitude?: number,
    @Query('radius') radius?: number,
  ) {
    return this.trainersService.getTrainers({
      category,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      radius: radius ? Number(radius) : undefined,
    });
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async createTrainerProfile(@Req() req: any, @Body() trainerData: any) {
    return this.trainersService.createTrainerProfile(req.user.userId, trainerData);
  }
}
