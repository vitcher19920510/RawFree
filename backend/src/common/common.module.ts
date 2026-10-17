import { Module, Global } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MailService, SendGridMailService, SmtpMailService, StubMailService } from './services/mail.service';
import { SmsService, TextTalkSmsService, TwilioSmsService, StubSmsService } from './services/sms.service';
import { StorageService, YandexStorageService, LocalStorageService } from './services/storage.service';
import { SubscriptionGuard } from './guards/subscription.guard';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({
  providers: [
    // SMS
    StubSmsService,
    TextTalkSmsService,
    TwilioSmsService,
    SmsService,
    // Email
    StubMailService,
    SendGridMailService,
    SmtpMailService,
    MailService,
    // Storage
    YandexStorageService,
    LocalStorageService,
    StorageService,
    // Guards
    SubscriptionGuard,
    PrismaService,
    Reflector,
  ],
  exports: [SmsService, MailService, StorageService, SubscriptionGuard],
})
export class CommonModule {}
