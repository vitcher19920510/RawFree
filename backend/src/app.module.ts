import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CommonModule } from './common/common.module';
import { JwtGlobalModule } from './common/jwt-global.module';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { FeedModule } from './feed/feed.module';
import { HealthModule } from './health/health.module';
import { MatchesModule } from './matches/matches.module';
import { ProfileModule } from './profile/profile.module';
import { MiscModule } from './services-misc/misc.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    CommonModule,
    JwtGlobalModule,
    AuthModule,
    ChatsModule,
    FeedModule,
    HealthModule,
    MatchesModule,
    ProfileModule,
    MiscModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
