import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes, randomInt } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../common/services/sms.service';
import { MailService } from '../common/services/mail.service';
import { TooManyRequestsException } from '../common/exceptions/too-many-requests.exception';
import { AUTH_CONSTANTS } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifySmsDto } from './dto/verify.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { RecoverAccessDto } from './dto/recover.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthVerifyResult {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService
  ) {}

  private assertExactlyOne(phone?: string, email?: string): 'phone' | 'email' {
    const hasPhone = typeof phone === 'string' && phone.trim().length > 0;
    const hasEmail = typeof email === 'string' && email.trim().length > 0;
    if (hasPhone === hasEmail) {
      throw new BadRequestException('Необходимо указать ровно один канал: либо телефон, либо email');
    }
    return hasPhone ? 'phone' : 'email';
  }

  private async issueTokens(userId: string, familyId?: string): Promise<TokenPair> {
    const family = familyId || uuidv4();
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const accessSecret = process.env.JWT_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;

    const accessToken = this.jwtService.sign(
      { sub: userId, jti: accessJti },
      { secret: accessSecret, expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_TTL_SEC }
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, jti: refreshJti, family },
      { secret: refreshSecret, expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_TTL_SEC }
    );

    return { accessToken, refreshToken };
  }

  private generateCode(): string {
    return randomInt(100000, 1000000).toString();
  }

  async register(dto: RegisterDto): Promise<{ status: 'SMS_SENT' | 'EMAIL_SENT' }> {
    const channel = this.assertExactlyOne(dto.phone, dto.email);

    if (channel === 'phone') {
      const phone = dto.phone!.trim();
      const rateKey = `rate:sms:${phone}`;
      const count = await this.redis.incr(rateKey);
      if (count === 1) await this.redis.expire(rateKey, 3600);
      if (count > AUTH_CONSTANTS.MAX_SMS_PER_HOUR) {
        throw new TooManyRequestsException('Превышен лимит отправки SMS в час');
      }

      const existingUser = await this.prisma.user.findUnique({ where: { phone } });
      if (existingUser && existingUser.is18) {
        throw new ConflictException('Пользователь с таким номером уже зарегистрирован');
      }

      if (!existingUser) {
        await this.prisma.user.create({
          data: { phone, is18: dto.is18Accepted }
        });
      }

      const code = this.generateCode();
      const redisKey = `sms:code:${phone}`;
      await this.redis.set(redisKey, JSON.stringify({ code, attempts: 0 }), AUTH_CONSTANTS.SMS_CODE_TTL_SEC);

      await this.smsService.send(phone, code);
      return { status: 'SMS_SENT' };
    } else {
      const email = dto.email!.trim().toLowerCase();
      const rateKey = `rate:email:${email}`;
      const count = await this.redis.incr(rateKey);
      if (count === 1) await this.redis.expire(rateKey, 3600);
      if (count > AUTH_CONSTANTS.MAX_EMAIL_PER_HOUR) {
        throw new TooManyRequestsException('Превышен лимит отправки писем в час');
      }

      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.emailVerifiedAt !== null) {
        throw new ConflictException('Пользователь с таким email уже зарегистрирован');
      }

      const passwordHash = await argon2.hash(dto.password!, AUTH_CONSTANTS.ARGON2_OPTIONS);

      if (!existingUser) {
        await this.prisma.user.create({
          data: { email, passwordHash, is18: dto.is18Accepted }
        });
      } else {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash }
        });
      }

      const code = this.generateCode();
      const redisKey = `email:code:${email}`;
      await this.redis.set(redisKey, JSON.stringify({ code, attempts: 0 }), AUTH_CONSTANTS.EMAIL_CODE_TTL_SEC);

      await this.mailService.sendVerify(email, code);
      return { status: 'EMAIL_SENT' };
    }
  }

  async login(dto: LoginDto): Promise<{ channel: 'phone' | 'email'; status?: 'SMS_SENT'; accessToken?: string; refreshToken?: string }> {
    const channel = this.assertExactlyOne(dto.phone, dto.email);

    if (channel === 'phone') {
      const phone = dto.phone!.trim();
      const user = await this.prisma.user.findUnique({ where: { phone } });
      if (user) {
        const code = this.generateCode();
        await this.redis.set(`sms:code:${phone}`, JSON.stringify({ code, attempts: 0 }), AUTH_CONSTANTS.SMS_CODE_TTL_SEC);
        await this.smsService.send(phone, code);
      }
      return { channel: 'phone', status: 'SMS_SENT' };
    } else {
      const email = dto.email!.trim().toLowerCase();
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user || !user.passwordHash) {
        throw new UnauthorizedException('Неверный email или пароль');
      }

      if (!user.emailVerifiedAt) {
        throw new ForbiddenException('EMAIL_NOT_VERIFIED');
      }

      const isPasswordValid = await argon2.verify(user.passwordHash, dto.password!);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Неверный email или пароль');
      }

      const tokens = await this.issueTokens(user.id);
      return { channel: 'email', accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    }
  }

  async verifySms(dto: VerifySmsDto): Promise<AuthVerifyResult> {
    const phone = dto.phone.trim();
    const redisKey = `sms:code:${phone}`;
    const rawData = await this.redis.get(redisKey);

    if (!rawData) {
      throw new BadRequestException('Код просрочен или не существует');
    }

    const codeData = JSON.parse(rawData);
    if (codeData.attempts >= AUTH_CONSTANTS.MAX_VERIFY_ATTEMPTS) {
      await this.redis.del(redisKey);
      throw new TooManyRequestsException('Превышено количество попыток ввода кода');
    }

    if (codeData.code !== dto.code.trim()) {
      codeData.attempts += 1;
      await this.redis.set(redisKey, JSON.stringify(codeData), AUTH_CONSTANTS.SMS_CODE_TTL_SEC);
      throw new BadRequestException('Неверный код подтверждения');
    }

    await this.redis.del(redisKey);

    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new BadRequestException('Пользователь не найден. Пройдите регистрацию повторно');
    }

    const profile = await this.prisma.profile.findUnique({ where: { userId: user.id } });
    const isNewUser = profile === null;

    const tokens = await this.issueTokens(user.id);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isNewUser };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<AuthVerifyResult> {
    const email = dto.email.trim().toLowerCase();
    const redisKey = `email:code:${email}`;
    const rawData = await this.redis.get(redisKey);

    if (!rawData) {
      throw new BadRequestException('Код просрочен или не существует');
    }

    const codeData = JSON.parse(rawData);
    if (codeData.attempts >= AUTH_CONSTANTS.MAX_VERIFY_ATTEMPTS) {
      await this.redis.del(redisKey);
      throw new TooManyRequestsException('Превышено количество попыток ввода кода');
    }

    if (codeData.code !== dto.code.trim()) {
      codeData.attempts += 1;
      await this.redis.set(redisKey, JSON.stringify(codeData), AUTH_CONSTANTS.EMAIL_CODE_TTL_SEC);
      throw new BadRequestException('Неверный код подтверждения');
    }

    await this.redis.del(redisKey);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    const isNewUser = user.emailVerifiedAt === null;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() }
    });

    const tokens = await this.issueTokens(user.id);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isNewUser };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<TokenPair> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;
    let payload: any;

    try {
      payload = this.jwtService.verify(dto.refreshToken, { secret: refreshSecret });
    } catch (_) {
      throw new UnauthorizedException('Невалидный или просроченный refresh токен');
    }

    const { sub: userId, jti, family, exp } = payload;

    const isFamilyBlocked = await this.redis.get(`blacklist:family:${family}`);
    if (isFamilyBlocked) {
      throw new UnauthorizedException('Сессия аннулирована в связи с компрометацией токенов');
    }

    const isTokenBlocked = await this.redis.get(`blacklist:${jti}`);
    if (isTokenBlocked) {
      await this.redis.set(`blacklist:family:${family}`, 'revoked', 30 * 24 * 3600);
      throw new UnauthorizedException('Попытка повторного использования токена. Вся сессия заблокирована');
    }

    const remainingTtlSec = Math.max(1, exp - Math.floor(Date.now() / 1000));
    await this.redis.set(`blacklist:${jti}`, 'revoked', remainingTtlSec);

    return this.issueTokens(userId, family);
  }

  async recoverAccess(dto: RecoverAccessDto): Promise<{ status: string; message: string }> {
    const channel = this.assertExactlyOne(dto.phone, dto.email);

    if (channel === 'phone') {
      const phone = dto.phone!.trim();
      const user = await this.prisma.user.findUnique({ where: { phone } });
      if (user) {
        const code = this.generateCode();
        await this.redis.set(`sms:code:${phone}`, JSON.stringify({ code, attempts: 0 }), AUTH_CONSTANTS.SMS_CODE_TTL_SEC);
        await this.smsService.send(phone, code);
      }
      return { status: 'RECOVERY_SENT', message: 'SMS-код отправлен' };
    } else {
      const email = dto.email!.trim().toLowerCase();
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        const resetToken = randomBytes(32).toString('hex');
        await this.redis.set(`reset:${resetToken}`, user.id, AUTH_CONSTANTS.RECOVERY_TOKEN_TTL_SEC);
        const link = `https://rawfree.ru/reset-password?token=${resetToken}`;
        await this.mailService.sendReset(email, link);
      }
      return { status: 'RECOVERY_SENT', message: 'Инструкция отправлена на email' };
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ status: string; message: string }> {
    const redisKey = `reset:${dto.token}`;
    const userId = await this.redis.get(redisKey);

    if (!userId) {
      throw new BadRequestException('Токен сброса пароля недействителен или просрочен');
    }

    const passwordHash = await argon2.hash(dto.newPassword, AUTH_CONSTANTS.ARGON2_OPTIONS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    await this.redis.del(redisKey);

    // После сброса пароля необходимо отозвать все refresh-семейства пользователя (требует индекс user:families:{userId})
    return { status: 'PASSWORD_RESET', message: 'Пароль успешно изменен' };
  }
}

