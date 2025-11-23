import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { SupabaseModule } from './common/supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StatsModule } from './modules/stats/stats.module';
import { MealsModule } from './modules/meals/meals.module';
import { TrainersModule } from './modules/trainers/trainers.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FeedModule } from './modules/feed/feed.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    StatsModule,
    MealsModule,
    TrainersModule,
    MeetingsModule,
    NotificationsModule,
    FeedModule,
    RewardsModule,
    MessagingModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
