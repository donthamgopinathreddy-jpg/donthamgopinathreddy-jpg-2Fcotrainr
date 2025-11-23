import { Module, forwardRef } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [SupabaseModule, forwardRef(() => RewardsModule)],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
