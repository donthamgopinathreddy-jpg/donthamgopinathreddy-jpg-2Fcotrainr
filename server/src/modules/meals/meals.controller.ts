import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MealsService } from './meals.service';

@Controller('meals')
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post('log')
  async logMeal(@Req() req: any, @Body() mealData: any) {
    return this.mealsService.logMeal(req.user.userId, mealData);
  }

  @Get('logs')
  async getMeals(@Req() req: any, @Query('date') date: string) {
    return this.mealsService.getMeals(req.user.userId, date);
  }
}
