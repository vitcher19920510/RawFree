import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { SmsService } from './services/sms.service';
import { StorageService } from './services/storage.service';

@Module({
  providers: [SmsService, MailService, StorageService],
  exports: [SmsService, MailService, StorageService],
})
export class CommonModule {}
