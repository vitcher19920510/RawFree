import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface RuStorePurchaseResponse {
  purchaseToken: string;
  packageName: string;
  productId: string;
  purchaseTime: number;
  purchaseState: number; // 0 = purchased, 1 = cancelled, 2 = pending
  consumptionState: number; // 0 = not consumed, 1 = consumed
  developerPayload: string;
  orderId: string;
}

@Injectable()
export class RuStoreValidationService {
  private readonly logger = new Logger(RuStoreValidationService.name);
  private readonly RUSTORE_API_URL = 'https://api.rustore.ru/pub';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Валидация purchase token через RuStore API v4
   * @param appId — ID приложения в RuStore
   * @param developerToken — developer token из RuStore Developer Console
   * @param purchaseToken — token, полученный от RuStore Pay SDK
   */
  async validatePurchase(
    appId: string,
    developerToken: string,
    purchaseToken: string,
  ): Promise<RuStorePurchaseResponse> {
    try {
      const url = `${this.RUSTORE_API_URL}/applications/${appId}/purchases/${purchaseToken}?token=${developerToken}`;
      
      const response = await firstValueFrom(
        this.httpService.get<RuStorePurchaseResponse>(url),
      );

      const data = response.data;

      // purchaseState: 0 = purchased, 1 = cancelled, 2 = pending
      if (data.purchaseState !== 0) {
        throw new BadRequestException(
          `Покупка не подтверждена. State: ${data.purchaseState}`,
        );
      }

      // consumptionState: 0 = not consumed
      if (data.consumptionState !== 0) {
        throw new BadRequestException('Покупка уже использована');
      }

      return data;
    } catch (error) {
      this.logger.error(
        `Ошибка валидации RuStore: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Не удалось подтвердить покупку в RuStore',
      );
    }
  }
}
