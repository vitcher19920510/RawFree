import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendVerify(email: string, code: string): Promise<boolean> {
    this.logger.log(`[MAIL STUB] Sending verification email code ${code} to ${email}`);
    return true;
  }

  async sendReset(email: string, link: string): Promise<boolean> {
    this.logger.log(`[MAIL STUB] Sending password reset link ${link} to ${email}`);
    return true;
  }
}
