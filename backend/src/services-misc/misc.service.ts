import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendReportDto } from './dto/report.dto';
import { BlockUserDto } from './dto/blocked.dto';
import { UpdateInterestsDto } from './dto/interests.dto';
import { CreateClientErrorDto } from './dto/client-error.dto';
import { BlockedUserCard } from './types/misc.types';

@Injectable()
export class MiscService {
  constructor(private readonly prisma: PrismaService) {}

  async enableIncognito(userId: string): Promise<{ enabled: boolean }> {
    const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.incognito.upsert({
      where: { userId },
      create: {
        userId,
        until,
        mode: 'FULL',
      },
      update: {
        until,
        mode: 'FULL',
      },
    });

    return { enabled: true };
  }

  async disableIncognito(userId: string): Promise<{ enabled: boolean }> {
    await this.prisma.incognito.deleteMany({
      where: { userId },
    });

    return { enabled: false };
  }

  async getBlockedUsers(userId: string): Promise<BlockedUserCard[]> {
    const blockedRecords = await this.prisma.blocked.findMany({
      where: { userId },
      include: {
        blockedUser: {
          include: {
            profile: true,
            photos: { where: { isMain: true }, take: 1 },
          },
        },
      },
    });

    return blockedRecords.map((r) => ({
      userId: r.blockedUserId,
      name: r.blockedUser.profile?.name ?? 'Пользователь',
      age: r.blockedUser.profile?.age ?? null,
      photoUrl: r.blockedUser.photos[0]?.url ?? null,
    }));
  }

  async blockUser(userId: string, dto: BlockUserDto): Promise<{ success: boolean }> {
    if (dto.blockedUserId === userId) {
      throw new BadRequestException('Нельзя заблокировать самого себя');
    }

    await this.prisma.blocked.upsert({
      where: {
        userId_blockedUserId: {
          userId,
          blockedUserId: dto.blockedUserId,
        },
      },
      create: {
        userId,
        blockedUserId: dto.blockedUserId,
      },
      update: {},
    });

    return { success: true };
  }

  async unblockUser(userId: string, targetId: string): Promise<{ success: boolean }> {
    await this.prisma.blocked.deleteMany({
      where: {
        userId,
        blockedUserId: targetId,
      },
    });

    return { success: true };
  }

  async sendReport(userId: string, dto: SendReportDto): Promise<{ success: boolean }> {
    if (dto.toUser === userId) {
      throw new BadRequestException('Нельзя пожаловаться на самого себя');
    }

    await this.prisma.report.create({
      data: {
        fromUser: userId,
        toUser: dto.toUser,
        reason: dto.reason,
        comment: dto.comment ?? '',
      },
    });

    return { success: true };
  }

  async getInterests(userId: string): Promise<string[]> {
    const interests = await this.prisma.interest.findMany({
      where: { userId },
      select: { tag: true },
    });
    return interests.map((i) => i.tag);
  }

  async updateInterests(userId: string, dto: UpdateInterestsDto): Promise<{ success: boolean }> {
    await this.prisma.$transaction(async (tx) => {
      await tx.interest.deleteMany({ where: { userId } });

      if (dto.tags && dto.tags.length > 0) {
        await tx.interest.createMany({
          data: dto.tags.map((tag) => ({
            userId,
            tag,
            type: 'MANUAL',
          })),
        });
      }
    });

    return { success: true };
  }

  async getLegalDoc(code: string): Promise<{ code: string; title: string; body: string; version: string }> {
    const doc = await this.prisma.legalDoc.findUnique({ where: { code } });
    if (!doc) {
      throw new NotFoundException('Документ не найден');
    }

    return {
      code: doc.code,
      title: doc.title,
      body: doc.body,
      version: doc.version,
    };
  }

  async logClientError(dto: CreateClientErrorDto): Promise<{ logged: boolean }> {
    await this.prisma.clientError.create({
      data: {
        userId: dto.userId ?? null,
        screen: dto.screen,
        description: dto.description,
        appVersion: dto.appVersion,
        device: dto.device,
        osVersion: dto.osVersion,
        repeats: dto.repeats ?? 1,
      },
    });

    return { logged: true };
  }
}
