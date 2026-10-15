import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchCard } from './types/matches.types';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatches(userId: string): Promise<MatchCard[]> {
    const userBlocks = await this.prisma.blocked.findMany({
      where: { OR: [{ userId }, { blockedUserId: userId }] },
      select: { userId: true, blockedUserId: true },
    });

    const blockedIds = userBlocks
      .map((b) => (b.userId === userId ? b.blockedUserId : b.userId))
      .filter((id) => id !== userId);

    const matches = await this.prisma.match.findMany({
      where: {
        AND: [
          { OR: [{ userA: userId }, { userB: userId }] },
          ...(blockedIds.length > 0
            ? [
                {
                  NOT: {
                    OR: [
                      { userA: { in: blockedIds } },
                      { userB: { in: blockedIds } },
                    ],
                  },
                },
              ]
            : []),
          {
            OR: [
              { chat: { is: null } },
              { chat: { messages: { none: {} } } },
            ],
          },
        ],
      },
      include: {
        chat: true,
      },
    });

    const peerUserIds = matches.map((m) => (m.userA === userId ? m.userB : m.userA));

    const users = await this.prisma.user.findMany({
      where: { id: { in: peerUserIds } },
      include: {
        profile: true,
        photos: { where: { isMain: true }, take: 1 },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const resultCards: MatchCard[] = matches.map((m) => {
      const peerId = m.userA === userId ? m.userB : m.userA;
      const peerUser = userMap.get(peerId);
      const updatedAt = m.chat?.lastMessageAt || m.chat?.createdAt || m.createdAt;

      return {
        matchId: m.id,
        chatId: m.chat?.id || null,
        user: {
          userId: peerId,
          name: peerUser?.profile?.name || 'Пользователь',
          age: peerUser?.profile?.age ?? null,
          photoUrl: peerUser?.photos[0]?.url || null,
        },
        lastMessage: null,
        unreadCount: 0,
        createdAt: m.createdAt,
        updatedAt,
      };
    });

    resultCards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return resultCards;
  }
}
