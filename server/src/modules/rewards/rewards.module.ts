import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
