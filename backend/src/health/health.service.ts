import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

export interface HealthCheckResult {
  status: 'ok' | 'degraded';
  db: 'up' | 'down';
  redis: 'up' | 'down';
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    let dbStatus: 'up' | 'down' = 'down';
    let redisStatus: 'up' | 'down' = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch (_) {
      dbStatus = 'down';
    }

    try {
      const pingResult = await this.redis.ping();
      if (pingResult) {
        redisStatus = 'up';
      }
    } catch (_) {
      redisStatus = 'down';
    }

    const overallStatus: 'ok' | 'degraded' = (dbStatus === 'up' && redisStatus === 'up') ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      db: dbStatus,
      redis: redisStatus
    };
  }
}

