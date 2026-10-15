import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /health
   * ПУБЛИЧНЫЙ ЭНДПОИНТ (БЕЗ JwtAuthGuard)
   * Успех: 200 OK — все сервисы (Postgres, Redis) доступны
   * Ошибки: 503 Service Unavailable — сбой подключения к БД или Redis
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    const health = await this.healthService.checkHealth();
    if (health.status !== 'ok') {
      throw new ServiceUnavailableException(health);
    }
    return health;
  }
}
