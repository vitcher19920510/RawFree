import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUIRE_SUBSCRIPTION_KEY } from '../decorators/require-subscription.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireSub = this.reflector.getAllAndOverride<boolean>(REQUIRE_SUBSCRIPTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Если декоратор не поставлен — пропускаем (значит подписка не нужна)
    if (isNil(requireSub)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new BadRequestException('Пользователь не авторизован');
    }

    // Проверяем активную подписку
    const sub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      select: { id: true, status: true, expiresAt: true },
    });

    if (!sub) {
      // Нет активной подписки — возвращаем 402
      throw new BadRequestException({
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Для доступа к этому разделу нужна активная подписка',
        paywallData: {
          priceCents: 39900,
          periodDays: 7,
          plans: [
            { id: 'premium_7', priceCents: 39900, periodDays: 7 },
            { id: 'premium_30', priceCents: 136800, periodDays: 30, savingsPercent: 20 },
            { id: 'premium_365', priceCents: 1664400, periodDays: 365, savingsPercent: 20 },
          ],
        },
      });
    }

    return true;
  }
}
