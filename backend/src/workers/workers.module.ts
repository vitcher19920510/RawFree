import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionCleanupService } from './subscription-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PrismaService, SubscriptionCleanupService],
  exports: [SubscriptionCleanupService],
})
export class WorkersModule {}
