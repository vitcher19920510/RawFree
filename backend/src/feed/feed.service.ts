import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { TooManyRequestsException } from '../common/exceptions/too-many-requests.exception';
import { FeedActionDto } from './dto/feed-action.dto';
import { FeedCard } from './types/feed.types';

interface FeedRow {
  userId: string;
  name: string;
  age: number;
  city: string | null;
  mainPhotoUrl: string;
  commonTags: string[] | string;
}

function normalizeTags(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === 'string' && v.length > 0) {
    return v.replace(/^\{|\}$/g, '').split(',').filter(Boolean);
  }
  return [];
}

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly subscriptionService: SubscriptionsService
  ) {}

  async getFeed(userId: string, page: number, limit: number): Promise<FeedCard[]> {
    const offset = (page - 1) * limit;

    const rawResults = await this.prisma.$queryRaw<FeedRow[]>`
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

  private async checkBlocked(userId: string, targetUserId: string): Promise<void> {
    const block = await this.prisma.blocked.findFirst({
      where: {
        OR: [
          { userId, blockedUserId: targetUserId },
          { userId: targetUserId, blockedUserId: userId },
        ],
      },
    });
    if (block) {
      throw new ForbiddenException('BLOCKED');
    }
  }

  private normalizeUserPair(userA: string, userB: string): [string, string] {
    return userA < userB ? [userA, userB] : [userB, userA];
  }

  private async createMatchAndChat(
    tx: Prisma.TransactionClient,
    userId: string,
    targetUserId: string
  ): Promise<{ matchId: string }> {
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

  async like(userId: string, dto: FeedActionDto): Promise<{ isMatch: boolean; matchId?: string }> {
    if (userId === dto.targetUserId) {
      throw new BadRequestException('Нельзя поставить лайк самому себе');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: dto.targetUserId } });
    if (!targetUser || targetUser.deletedAt !== null) {
      throw new NotFoundException('Пользователь не найден');
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

  async skip(userId: string, dto: FeedActionDto): Promise<{ success: boolean }> {
    if (userId === dto.targetUserId) {
      throw new BadRequestException('Нельзя пропустить самого себя');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: dto.targetUserId } });
    if (!targetUser || targetUser.deletedAt !== null) {
      throw new NotFoundException('Пользователь не найден');
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

  async superlike(userId: string, dto: FeedActionDto): Promise<{ isMatch: boolean; matchId?: string }> {
    if (userId === dto.targetUserId) {
      throw new BadRequestException('Нельзя поставить суперлайк самому себе');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: dto.targetUserId } });
    if (!targetUser || targetUser.deletedAt !== null) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.checkBlocked(userId, dto.targetUserId);

    const hasActiveSub = await this.subscriptionService.hasActive(userId);
    if (!hasActiveSub) {
      throw new HttpException('Суперлайк доступен только по премиум-подписке', HttpStatus.PAYMENT_REQUIRED);
    }

    const rateKey = `rate:superlike:${userId}`;
    const count = await this.redis.incr(rateKey);
    if (count === 1) await this.redis.expire(rateKey, 86400);
    if (count > 5) {
      throw new TooManyRequestsException('Превышен суточный лимит суперлайков (максимум 5 в день)');
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
}
