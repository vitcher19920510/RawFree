"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const too_many_requests_exception_1 = require("../common/exceptions/too-many-requests.exception");
function normalizeTags(v) {
    if (Array.isArray(v))
        return v;
    if (typeof v === 'string' && v.length > 0) {
        return v.replace(/^\{|\}$/g, '').split(',').filter(Boolean);
    }
    return [];
}
let FeedService = class FeedService {
    constructor(prisma, redis, subscriptionService) {
        this.prisma = prisma;
        this.redis = redis;
        this.subscriptionService = subscriptionService;
    }
    async getFeed(userId, page, limit) {
        const offset = (page - 1) * limit;
        const rawResults = await this.prisma.$queryRaw `
      SELECT
        u.id AS "userId",
        p.name AS "name",
        p.age AS "age",
        p.city AS "city",
        ph.url AS "mainPhotoUrl",
        COALESCE(cnt.common_tags, ARRAY[]::text[]) AS "commonTags"
      FROM users u
      JOIN profiles p ON p.user_id = u.id
      JOIN photos ph ON ph.user_id = u.id AND ph.is_main = true
      LEFT JOIN (
        SELECT i.user_id, ARRAY_AGG(DISTINCT i.tag) AS common_tags
        FROM interests i
        JOIN interests my ON my.tag = i.tag AND my.user_id = ${userId}
        GROUP BY i.user_id
      ) cnt ON cnt.user_id = u.id
      WHERE u.id != ${userId}
        AND u.deleted_at IS NULL
        AND p.hidden_from_feed = false
        AND NOT EXISTS (SELECT 1 FROM likes WHERE from_user = ${userId} AND to_user = u.id)
        AND NOT EXISTS (SELECT 1 FROM skips WHERE from_user = ${userId} AND to_user = u.id)
        AND NOT EXISTS (SELECT 1 FROM blocked WHERE (user_id = ${userId} AND blocked_user_id = u.id) OR (user_id = u.id AND blocked_user_id = ${userId}))
      ORDER BY COALESCE(CARDINALITY(cnt.common_tags), 0) DESC, u.created_at DESC
      OFFSET ${offset} LIMIT ${limit}
    `;
        return rawResults.map((r) => ({
            userId: r.userId,
            name: r.name,
            age: Number(r.age),
            city: r.city,
            photos: [{ url: r.mainPhotoUrl, isMain: true }],
            commonInterests: normalizeTags(r.commonTags),
        }));
    }
    async checkBlocked(userId, targetUserId) {
        const block = await this.prisma.blocked.findFirst({
            where: {
                OR: [
                    { userId, blockedUserId: targetUserId },
                    { userId: targetUserId, blockedUserId: userId },
                ],
            },
        });
        if (block) {
            throw new common_1.ForbiddenException('BLOCKED');
        }
    }
    normalizeUserPair(userA, userB) {
        return userA < userB ? [userA, userB] : [userB, userA];
    }
    async createMatchAndChat(tx, userId, targetUserId) {
        const [normA, normB] = this.normalizeUserPair(userId, targetUserId);
        const match = await tx.match.upsert({
            where: { userA_userB: { userA: normA, userB: normB } },
            create: { userA: normA, userB: normB },
            update: {},
        });
        await tx.chat.upsert({
            where: { matchId: match.id },
            create: { matchId: match.id },
            update: {},
        });
        return { matchId: match.id };
    }
    async like(userId, dto) {
        if (userId === dto.targetUserId) {
            throw new common_1.BadRequestException('Нельзя поставить лайк самому себе');
        }
        const targetUser = await this.prisma.user.findUnique({ where: { id: dto.targetUserId } });
        if (!targetUser || targetUser.deletedAt !== null) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        await this.checkBlocked(userId, dto.targetUserId);
        const existingLike = await this.prisma.like.findUnique({
            where: { fromUser_toUser: { fromUser: userId, toUser: dto.targetUserId } },
        });
        if (existingLike) {
            const [normA, normB] = this.normalizeUserPair(userId, dto.targetUserId);
            const match = await this.prisma.match.findUnique({
                where: { userA_userB: { userA: normA, userB: normB } },
            });
            return { isMatch: match !== null, matchId: match?.id };
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.like.upsert({
                where: { fromUser_toUser: { fromUser: userId, toUser: dto.targetUserId } },
                create: {
                    fromUser: userId,
                    toUser: dto.targetUserId,
                    isSuper: false,
                },
                update: {},
            });
            const reverseLike = await tx.like.findUnique({
                where: { fromUser_toUser: { fromUser: dto.targetUserId, toUser: userId } },
            });
            if (reverseLike) {
                const { matchId } = await this.createMatchAndChat(tx, userId, dto.targetUserId);
                return { isMatch: true, matchId };
            }
            return { isMatch: false };
        });
    }
    async skip(userId, dto) {
        if (userId === dto.targetUserId) {
            throw new common_1.BadRequestException('Нельзя пропустить самого себя');
        }
        const targetUser = await this.prisma.user.findUnique({ where: { id: dto.targetUserId } });
        if (!targetUser || targetUser.deletedAt !== null) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        await this.checkBlocked(userId, dto.targetUserId);
        await this.prisma.skip.upsert({
            where: { fromUser_toUser: { fromUser: userId, toUser: dto.targetUserId } },
            create: {
                fromUser: userId,
                toUser: dto.targetUserId,
            },
            update: {},
        });
        return { success: true };
    }
    async superlike(userId, dto) {
        if (userId === dto.targetUserId) {
            throw new common_1.BadRequestException('Нельзя поставить суперлайк самому себе');
        }
        const targetUser = await this.prisma.user.findUnique({ where: { id: dto.targetUserId } });
        if (!targetUser || targetUser.deletedAt !== null) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        await this.checkBlocked(userId, dto.targetUserId);
        const hasActiveSub = await this.subscriptionService.hasActive(userId);
        if (!hasActiveSub) {
            throw new common_1.HttpException('Суперлайк доступен только по премиум-подписке', common_1.HttpStatus.PAYMENT_REQUIRED);
        }
        const rateKey = `rate:superlike:${userId}`;
        const count = await this.redis.incr(rateKey);
        if (count === 1)
            await this.redis.expire(rateKey, 86400);
        if (count > 5) {
            throw new too_many_requests_exception_1.TooManyRequestsException('Превышен суточный лимит суперлайков (максимум 5 в день)');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.like.upsert({
                where: { fromUser_toUser: { fromUser: userId, toUser: dto.targetUserId } },
                create: {
                    fromUser: userId,
                    toUser: dto.targetUserId,
                    isSuper: true,
                },
                update: {
                    isSuper: true,
                },
            });
            const reverseLike = await tx.like.findUnique({
                where: { fromUser_toUser: { fromUser: dto.targetUserId, toUser: userId } },
            });
            if (reverseLike) {
                const { matchId } = await this.createMatchAndChat(tx, userId, dto.targetUserId);
                return { isMatch: true, matchId };
            }
            return { isMatch: false };
        });
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        subscriptions_service_1.SubscriptionsService])
], FeedService);
//# sourceMappingURL=feed.service.js.map