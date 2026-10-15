import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyPurchaseDto } from './dto/verify-purchase.dto';

const PLAN_CATALOG: Record<string, { days: number; priceCents: number }> = {
  premium_7: { days: 7, priceCents: 39900 },
  premium_30: { days: 30, priceCents: 99900 },
  premium_365: { days: 365, priceCents: 499900 },
};

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async hasActive(userId: string): Promise<boolean> {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    return sub !== null;
  }

  async verifyPurchase(userId: string, dto: VerifyPurchaseDto): Promise<{ status: string; expiresAt: Date }> {
    const plan = PLAN_CATALOG[dto.plan];
    if (!plan) {
      throw new BadRequestException('Неизвестный тариф подписки');
    }

    const existingSub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        purchaseToken: dto.purchaseToken,
        status: 'ACTIVE',
      },
      select: { status: true, expiresAt: true },
    });
    if (existingSub) {
      return { status: existingSub.status, expiresAt: existingSub.expiresAt };
    }

    // TODO: серверная валидация RuStore API v4 перед созданием подписки

    return this.prisma.$transaction(async (tx) => {
      await tx.subscription.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      });

      const expiresAt = new Date(Date.now() + plan.days * 86400000);

      const newSub = await tx.subscription.create({
        data: {
          userId,
          plan: dto.plan,
          priceCents: plan.priceCents,
          currency: 'RUB',
          platform: dto.platform || 'RUSTORE',
          purchaseToken: dto.purchaseToken,
          status: 'ACTIVE',
          autoRenew: true,
          expiresAt,
        },
        select: { status: true, expiresAt: true },
      });

      return newSub;
    });
  }

  async getStatus(userId: string): Promise<{ isActive: boolean; plan?: string; expiresAt?: Date }> {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      select: { plan: true, expiresAt: true },
    });

    if (!sub) {
      return { isActive: false };
    }

    return {
      isActive: true,
      plan: sub.plan,
      expiresAt: sub.expiresAt,
    };
  }

  async cancelSubscription(userId: string, reason?: string): Promise<{ success: boolean; accessUntil: Date }> {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
    });

    if (!sub) {
      throw new NotFoundException('Активная подписка не найдена');
    }

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { autoRenew: false },
    });

    return { success: true, accessUntil: sub.expiresAt };
  }
}
