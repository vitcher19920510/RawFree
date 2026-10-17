import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyPurchaseDto } from './dto/verify-purchase.dto';
import { RuStoreValidationService } from '../subservices/rustore-validation.service';

const PLAN_CATALOG: Record<string, { days: number; priceCents: number; savingsPercent: number; savingsLabel: string }> = {
  premium_7: { days: 7, priceCents: 39900, savingsPercent: 0, savingsLabel: '' },
  premium_30: { days: 30, priceCents: 136800, savingsPercent: 20, savingsLabel: 'Выгода 20%' },
  premium_365: { days: 365, priceCents: 1664400, savingsPercent: 20, savingsLabel: 'Выгода 20%' },
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rustoreValidation: RuStoreValidationService,
  ) {}

  getPlans() {
    return Object.entries(PLAN_CATALOG).map(([id, plan]) => ({
      id,
      title: id === 'premium_7' ? 'Премиум — 7 дней' : id === 'premium_30' ? 'Премиум — 30 дней' : 'Премиум — 1 год',
      priceCents: plan.priceCents,
      periodDays: plan.days,
      savingsPercent: plan.savingsPercent,
      savingsLabel: plan.savingsLabel,
    }));
  }

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

    // Валидация через RuStore API v4
    if (dto.platform === 'RUSTORE') {
      const appId = process.env.RUSTORE_APP_ID;
      const developerToken = process.env.RUSTORE_DEVELOPER_TOKEN;

      if (!appId || !developerToken) {
        this.logger.warn('RUSTORE_APP_ID или RUSTORE_DEVELOPER_TOKEN не настроены — пропускаю валидацию');
      } else {
        try {
          const ruStoreData = await this.rustoreValidation.validatePurchase(appId, developerToken, dto.purchaseToken);
          this.logger.log(`RuStore покупка подтверждена: orderId=${ruStoreData.orderId}, productId=${ruStoreData.productId}`);
        } catch (error) {
          throw new BadRequestException('Не удалось подтвердить покупку в RuStore');
        }
      }
    }

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
