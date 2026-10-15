import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { FeedActionDto } from './dto/feed-action.dto';
import { FeedCard } from './types/feed.types';
export declare class FeedService {
    private readonly prisma;
    private readonly redis;
    private readonly subscriptionService;
    constructor(prisma: PrismaService, redis: RedisService, subscriptionService: SubscriptionsService);
    getFeed(userId: string, page: number, limit: number): Promise<FeedCard[]>;
    private checkBlocked;
    private normalizeUserPair;
    private createMatchAndChat;
    like(userId: string, dto: FeedActionDto): Promise<{
        isMatch: boolean;
        matchId?: string;
    }>;
    skip(userId: string, dto: FeedActionDto): Promise<{
        success: boolean;
    }>;
    superlike(userId: string, dto: FeedActionDto): Promise<{
        isMatch: boolean;
        matchId?: string;
    }>;
}
