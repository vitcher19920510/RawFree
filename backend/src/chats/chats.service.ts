import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatResponse, MessageResponse } from './types/chats.types';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async verifyChatAccess(userId: string, chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { match: true },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    if (chat.match.userA !== userId && chat.match.userB !== userId) {
      throw new ForbiddenException('Нет доступа к этому чату');
    }

    return chat;
  }

  async getChats(userId: string): Promise<ChatResponse[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ userA: userId }, { userB: userId }],
      },
      include: {
        chat: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const validMatchesWithChat = matches.filter((m) => {
      if (!m.chat) {
        this.logger.warn(`Match без чата: ${m.id}`);
        return false;
      }
      return true;
    });

    const peerIds = validMatchesWithChat.map((m) => (m.userA === userId ? m.userB : m.userA));
    const chatIds = validMatchesWithChat.map((m) => m.chat!.id);

    const [users, unreadGroup] = await Promise.all([
      this.prisma.user.findMany({
        where: { id: { in: peerIds } },
        include: {
          profile: true,
          photos: { where: { isMain: true }, take: 1 },
        },
      }),
      this.prisma.message.groupBy({
        by: ['chatId'],
        where: {
          chatId: { in: chatIds },
          sender: { not: userId },
          readAt: null,
        },
        _count: { _all: true },
      }),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const unreadMap = new Map(unreadGroup.map((g) => [g.chatId, g._count._all]));

    const chatResponses: ChatResponse[] = validMatchesWithChat.map((m) => {
      const peerId = m.userA === userId ? m.userB : m.userA;
      const peerUser = userMap.get(peerId);
      const lastMsg = m.chat!.messages[0];
      const unreadCount = unreadMap.get(m.chat!.id) || 0;
      const updatedAt = m.chat!.lastMessageAt || m.chat!.createdAt;

      return {
        chatId: m.chat!.id,
        matchId: m.id,
        peerUser: {
          userId: peerId,
          name: peerUser?.profile?.name || 'Пользователь',
          photoUrl: peerUser?.photos[0]?.url || null,
        },
        lastMessage: lastMsg
          ? {
              text: lastMsg.text,
              mediaType: lastMsg.mediaType,
              createdAt: lastMsg.createdAt,
            }
          : null,
        unreadCount,
        updatedAt,
      };
    });

    chatResponses.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return chatResponses;
  }

  async getMessages(userId: string, chatId: string, limit: number, before?: string): Promise<MessageResponse[]> {
    await this.verifyChatAccess(userId, chatId);

    const messages = await this.prisma.message.findMany({
      where: {
        chatId,
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      include: {
        senderRel: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.map((m) => ({
      id: m.id,
      chatId: m.chatId,
      senderId: m.sender,
      text: m.text,
      mediaType: m.mediaType,
      mediaUrl: m.mediaUrl,
      posterUrl: m.posterUrl,
      durationMs: m.durationMs,
      width: m.width,
      height: m.height,
      sizeBytes: m.sizeBytes,
      status: m.status,
      createdAt: m.createdAt,
      readAt: m.readAt,
      sender: {
        userId: m.senderRel.id,
        name: m.senderRel.profile?.name || 'Пользователь',
        photoUrl: m.senderRel.photos[0]?.url || null,
      },
    }));
  }

  async sendMessage(userId: string, chatId: string, dto: SendMessageDto): Promise<MessageResponse> {
    if (!dto.text?.trim() && !dto.mediaUrl) {
      throw new BadRequestException('Сообщение не может быть пустым');
    }

    await this.verifyChatAccess(userId, chatId);

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          chatId,
          sender: userId,
          text: dto.text?.trim() || null,
          mediaType: dto.mediaType || 'text',
          mediaUrl: dto.mediaUrl || null,
          posterUrl: dto.posterUrl || null,
          durationMs: dto.durationMs || null,
          width: dto.width || null,
          height: dto.height || null,
          sizeBytes: dto.sizeBytes || null,
          status: 'sent',
        },
        include: {
          senderRel: {
            include: {
              profile: true,
              photos: { where: { isMain: true }, take: 1 },
            },
          },
        },
      });

      await tx.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: message.createdAt },
      });

      return {
        id: message.id,
        chatId: message.chatId,
        senderId: message.sender,
        text: message.text,
        mediaType: message.mediaType,
        mediaUrl: message.mediaUrl,
        posterUrl: message.posterUrl,
        durationMs: message.durationMs,
        width: message.width,
        height: message.height,
        sizeBytes: message.sizeBytes,
        status: message.status,
        createdAt: message.createdAt,
        readAt: message.readAt,
        sender: {
          userId: message.senderRel.id,
          name: message.senderRel.profile?.name || 'Пользователь',
          photoUrl: message.senderRel.photos[0]?.url || null,
        },
      };
    });
  }

  async markAsRead(userId: string, chatId: string): Promise<{ updatedCount: number }> {
    await this.verifyChatAccess(userId, chatId);

    const result = await this.prisma.message.updateMany({
      where: {
        chatId,
        sender: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { updatedCount: result.count };
  }
}
