import { Injectable, Logger, Optional } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

export interface SmsProvider {
  send(phone: string, code: string): Promise<boolean>;
}

// ==================== TextTalk Provider (РФ) ====================
@Injectable()
export class TextTalkSmsService implements SmsProvider {
  private readonly logger = new Logger(TextTalkSmsService.name);
  private readonly baseUrl = 'https://api.texttalk.ru/api/send';

  constructor(
    @Optional() private readonly httpService?: HttpService,
  ) {}

  async send(phone: string, code: string): Promise<boolean> {
    try {
      const apiKey = process.env.SMS_TEXTTALK_API_KEY;
      const sender = process.env.SMS_TEXTTALK_SENDER || 'RawFree';

      if (!apiKey) {
        this.logger.warn('SMS_TEXTTALK_API_KEY не настроен — пропускаю отправку SMS');
        return true; // заглушка
      }

      // Форматируем номер в международный формат
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('8')) {
        formattedPhone = '7' + formattedPhone.slice(1);
      }
      if (!formattedPhone.startsWith('7')) {
        formattedPhone = '7' + formattedPhone;
      }

      const response = await axios.post(this.baseUrl, null, {
        params: {
          api_key: apiKey,
          to: formattedPhone,
          text: `Ваш код подтверждения RawFree: ${code}`,
          from: sender,
        },
      });

      const data = response.data as any;
      if (data.status === 'sent' || data.sent) {
        this.logger.log(`SMS отправлен на ${phone}`);
        return true;
      }

      this.logger.error(`Ошибка SMS TextTalk: ${JSON.stringify(response.data)}`);
      return false;
    } catch (error) {
      this.logger.error(`Ошибка отправки SMS: ${error.message}`, error.stack);
      return false;
    }
  }
}

// ==================== Twilio Provider (международный) ====================
@Injectable()
export class TwilioSmsService implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsService.name);

  async send(phone: string, code: string): Promise<boolean> {
    try {
      const accountSid = process.env.SMS_TWILIO_ACCOUNT_SID;
      const authToken = process.env.SMS_TWILIO_AUTH_TOKEN;
      const fromPhone = process.env.SMS_TWILIO_PHONE;

      if (!accountSid || !authToken || !fromPhone) {
        this.logger.warn('Twilio credentials не настроены — пропускаю SMS');
        return true;
      }

      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('8')) {
        formattedPhone = '+7' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      // TODO: реализовать через twilio npm package
      this.logger.log(`Twilio SMS to ${phone}: code ${code}`);
      return true;
    } catch (error) {
      this.logger.error(`Ошибка Twilio SMS: ${error.message}`);
      return false;
    }
  }
}

// ==================== Stub Provider (по умолчанию) ====================
@Injectable()
export class StubSmsService implements SmsProvider {
  private readonly logger = new Logger(StubSmsService.name);

  async send(phone: string, code: string): Promise<boolean> {
    this.logger.log(`[SMS STUB] Код подтверждения для ${phone}: ${code}`);
    return true;
  }
}

// ==================== Factory ====================
@Injectable()
export class SmsService {
  private readonly provider: SmsProvider;

  constructor(
    @Optional() private readonly texttalk?: TextTalkSmsService,
    @Optional() private readonly twilio?: TwilioSmsService,
    @Optional() private readonly stub?: StubSmsService,
  ) {
    const provider = process.env.SMS_PROVIDER || 'stub';

    switch (provider) {
      case 'texttalk':
        this.provider = this.texttalk || this.stub!;
        break;
      case 'twilio':
        this.provider = this.twilio || this.stub!;
        break;
      default:
        this.provider = this.stub!;
    }
  }

  async send(phone: string, code: string): Promise<boolean> {
    return this.provider.send(phone, code);
  }
}
