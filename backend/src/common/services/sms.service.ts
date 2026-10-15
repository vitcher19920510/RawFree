import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async send(phone: string, code: string): Promise<boolean> {
    this.logger.log(`[SMS STUB] Sending verification code ${code} to ${phone}`);
    return true;
  }
}
