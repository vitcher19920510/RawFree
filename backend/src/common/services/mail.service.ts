import { Injectable, Logger, Optional } from '@nestjs/common';
import axios from 'axios';

export interface MailProvider {
  sendVerify(email: string, code: string): Promise<boolean>;
  sendReset(email: string, link: string): Promise<boolean>;
}

// ==================== SendGrid Provider ====================
@Injectable()
export class SendGridMailService implements MailProvider {
  private readonly logger = new Logger(SendGridMailService.name);
  readonly API_URL = 'https://api.sendgrid.com/v3/mail/send';

  async sendVerify(email: string, code: string): Promise<boolean> {
    return this.sendMail(
      email,
      'Ваш код подтверждения RawFree',
      `Ваш код: ${code}. Действителен 10 минут.`,
    );
  }

  async sendReset(email: string, link: string): Promise<boolean> {
    return this.sendMail(
      email,
      'Восстановление пароля RawFree',
      `Нажмите для сброса: ${link}. Действует 30 минут.`,
    );
  }

  private async sendMail(to: string, subject: string, text: string): Promise<boolean> {
    try {
      const apiKey = process.env.MAIL_SENDGRID_API_KEY;
      const fromEmail = process.env.MAIL_FROM || 'noreply@rawfree.ru';

      if (!apiKey) {
        this.logger.warn('MAIL_SENDGRID_API_KEY не настроен — пропускаю email');
        return true;
      }

      const response = await axios.post(
        this.API_URL,
        {
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: 'RawFree' },
          subject,
          content: [{ type: 'text/plain', value: text }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.status === 202;
    } catch (error) {
      this.logger.error(`SendGrid error: ${error.message}`);
      return false;
    }
  }
}

// ==================== SMTP Provider (Nodemailer) ====================
@Injectable()
export class SmtpMailService implements MailProvider {
  private readonly logger = new Logger(SmtpMailService.name);

  async sendVerify(email: string, code: string): Promise<boolean> {
    return this.sendMail(email, 'Ваш код подтверждения RawFree', `Ваш код: ${code}. Действителен 10 минут.`);
  }

  async sendReset(email: string, link: string): Promise<boolean> {
    return this.sendMail(email, 'Восстановление пароля RawFree', `Ссылка для сброса: ${link}. Действует 30 минут.`);
  }

  private async sendMail(to: string, subject: string, text: string): Promise<boolean> {
    try {
      const host = process.env.MAIL_SMTP_HOST || 'smtp.yandex.ru';
      const port = parseInt(process.env.MAIL_SMTP_PORT || '465');
      const user = process.env.MAIL_SMTP_USER;
      const pass = process.env.MAIL_SMTP_PASS;
      const from = process.env.MAIL_FROM || 'noreply@rawfree.ru';

      if (!user || !pass) {
        this.logger.warn('SMTP credentials не настроены — пропускаю email');
        return true;
      }

      // TODO: реализовать через nodemailer
      this.logger.log(`SMTP email to ${to}: ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`SMTP error: ${error.message}`);
      return false;
    }
  }
}

// ==================== Stub Provider ====================
@Injectable()
export class StubMailService implements MailProvider {
  private readonly logger = new Logger(StubMailService.name);

  async sendVerify(email: string, code: string): Promise<boolean> {
    this.logger.log(`[MAIL STUB] Код для ${email}: ${code}`);
    return true;
  }

  async sendReset(email: string, link: string): Promise<boolean> {
    this.logger.log(`[MAIL STUB] Ссылка для ${email}: ${link}`);
    return true;
  }
}

// ==================== Factory ====================
@Injectable()
export class MailService {
  private readonly provider: MailProvider;

  constructor(
    @Optional() private readonly sendgrid?: SendGridMailService,
    @Optional() private readonly smtp?: SmtpMailService,
    @Optional() private readonly stub?: StubMailService,
  ) {
    const provider = process.env.MAIL_PROVIDER || 'stub';

    switch (provider) {
      case 'sendgrid':
        this.provider = this.sendgrid || this.stub!;
        break;
      case 'smtp':
        this.provider = this.smtp || this.stub!;
        break;
      default:
        this.provider = this.stub!;
    }
  }

  async sendVerify(email: string, code: string): Promise<boolean> {
    return this.provider.sendVerify(email, code);
  }

  async sendReset(email: string, link: string): Promise<boolean> {
    return this.provider.sendReset(email, link);
  }
}
