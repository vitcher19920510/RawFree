import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
export interface HealthCheckResult {
    status: 'ok' | 'degraded';
    db: 'up' | 'down';
    redis: 'up' | 'down';
}
export declare class HealthService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    checkHealth(): Promise<HealthCheckResult>;
}
