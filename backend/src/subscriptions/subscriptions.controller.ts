import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { VerifyPurchaseDto } from './dto/verify-purchase.dto';

@Controller('api/v1/subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * POST /api/v1/subscriptions/verify
   * Успех: 200 OK — валидация чека и покупка подписки через RuStore Pay SDK
   * Ошибки: 400 Bad Request, 401 Unauthorized, 500 Internal Error
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPurchase(@Request() req: any, @Body() dto: VerifyPurchaseDto) {
    return this.subscriptionsService.verifyPurchase(req.user.sub, dto);
  }

  /**
   * GET /api/v1/subscriptions/status
   * Успех: 200 OK — текущий статус подписки пользователя
   * Ошибки: 401 Unauthorized, 500 Internal Error
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(@Request() req: any) {
    return this.subscriptionsService.getStatus(req.user.sub);
  }

  /**
   * POST /api/v1/subscriptions/cancel
   * Успех: 200 OK — отмена автопродления подписки
   * Ошибки: 401 Unauthorized, 500 Internal Error
   */
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(@Request() req: any, @Body('reason') reason?: string) {
    return this.subscriptionsService.cancelSubscription(req.user.sub, reason);
  }

  /**
   * GET /api/v1/subscriptions/plans
   * Успех: 200 OK — каталог тарифов с ценами и выгодой
   * Ошибки: 401 Unauthorized, 500 Internal Error
   */
  @Get('plans')
  @HttpCode(HttpStatus.OK)
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }
}
