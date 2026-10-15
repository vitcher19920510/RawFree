"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const sms_service_1 = require("../common/services/sms.service");
const mail_service_1 = require("../common/services/mail.service");
const too_many_requests_exception_1 = require("../common/exceptions/too-many-requests.exception");
const auth_constants_1 = require("./auth.constants");
let AuthService = class AuthService {
    constructor(prisma, redis, jwtService, smsService, mailService) {
        this.prisma = prisma;
        this.redis = redis;
        this.jwtService = jwtService;
        this.smsService = smsService;
        this.mailService = mailService;
    }
    assertExactlyOne(phone, email) {
        const hasPhone = typeof phone === 'string' && phone.trim().length > 0;
        const hasEmail = typeof email === 'string' && email.trim().length > 0;
        if (hasPhone === hasEmail) {
            throw new common_1.BadRequestException('Необходимо указать ровно один канал: либо телефон, либо email');
        }
        return hasPhone ? 'phone' : 'email';
    }
    async issueTokens(userId, familyId) {
        const family = familyId || (0, uuid_1.v4)();
        const accessJti = (0, uuid_1.v4)();
        const refreshJti = (0, uuid_1.v4)();
        const accessSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        const accessToken = this.jwtService.sign({ sub: userId, jti: accessJti }, { secret: accessSecret, expiresIn: auth_constants_1.AUTH_CONSTANTS.ACCESS_TOKEN_TTL_SEC });
        const refreshToken = this.jwtService.sign({ sub: userId, jti: refreshJti, family }, { secret: refreshSecret, expiresIn: auth_constants_1.AUTH_CONSTANTS.REFRESH_TOKEN_TTL_SEC });
        return { accessToken, refreshToken };
    }
    generateCode() {
        return (0, crypto_1.randomInt)(100000, 1000000).toString();
    }
    async register(dto) {
        const channel = this.assertExactlyOne(dto.phone, dto.email);
        if (channel === 'phone') {
            const phone = dto.phone.trim();
            const rateKey = `rate:sms:${phone}`;
            const count = await this.redis.incr(rateKey);
            if (count === 1)
                await this.redis.expire(rateKey, 3600);
            if (count > auth_constants_1.AUTH_CONSTANTS.MAX_SMS_PER_HOUR) {
                throw new too_many_requests_exception_1.TooManyRequestsException('Превышен лимит отправки SMS в час');
            }
            const existingUser = await this.prisma.user.findUnique({ where: { phone } });
            if (existingUser && existingUser.is18) {
                throw new common_1.ConflictException('Пользователь с таким номером уже зарегистрирован');
            }
            if (!existingUser) {
                await this.prisma.user.create({
                    data: { phone, is18: dto.is18Accepted }
                });
            }
            const code = this.generateCode();
            const redisKey = `sms:code:${phone}`;
            await this.redis.set(redisKey, JSON.stringify({ code, attempts: 0 }), auth_constants_1.AUTH_CONSTANTS.SMS_CODE_TTL_SEC);
            await this.smsService.send(phone, code);
            return { status: 'SMS_SENT' };
        }
        else {
            const email = dto.email.trim().toLowerCase();
            const rateKey = `rate:email:${email}`;
            const count = await this.redis.incr(rateKey);
            if (count === 1)
                await this.redis.expire(rateKey, 3600);
            if (count > auth_constants_1.AUTH_CONSTANTS.MAX_EMAIL_PER_HOUR) {
                throw new too_many_requests_exception_1.TooManyRequestsException('Превышен лимит отправки писем в час');
            }
            const existingUser = await this.prisma.user.findUnique({ where: { email } });
            if (existingUser && existingUser.emailVerifiedAt !== null) {
                throw new common_1.ConflictException('Пользователь с таким email уже зарегистрирован');
            }
            const passwordHash = await argon2.hash(dto.password, auth_constants_1.AUTH_CONSTANTS.ARGON2_OPTIONS);
            if (!existingUser) {
                await this.prisma.user.create({
                    data: { email, passwordHash, is18: dto.is18Accepted }
                });
            }
            else {
                await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { passwordHash }
                });
            }
            const code = this.generateCode();
            const redisKey = `email:code:${email}`;
            await this.redis.set(redisKey, JSON.stringify({ code, attempts: 0 }), auth_constants_1.AUTH_CONSTANTS.EMAIL_CODE_TTL_SEC);
            await this.mailService.sendVerify(email, code);
            return { status: 'EMAIL_SENT' };
        }
    }
    async login(dto) {
        const channel = this.assertExactlyOne(dto.phone, dto.email);
        if (channel === 'phone') {
            const phone = dto.phone.trim();
            const user = await this.prisma.user.findUnique({ where: { phone } });
            if (user) {
                const code = this.generateCode();
                await this.redis.set(`sms:code:${phone}`, JSON.stringify({ code, attempts: 0 }), auth_constants_1.AUTH_CONSTANTS.SMS_CODE_TTL_SEC);
                await this.smsService.send(phone, code);
            }
            return { channel: 'phone', status: 'SMS_SENT' };
        }
        else {
            const email = dto.email.trim().toLowerCase();
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user || !user.passwordHash) {
                throw new common_1.UnauthorizedException('Неверный email или пароль');
            }
            if (!user.emailVerifiedAt) {
                throw new common_1.ForbiddenException('EMAIL_NOT_VERIFIED');
            }
            const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Неверный email или пароль');
            }
            const tokens = await this.issueTokens(user.id);
            return { channel: 'email', accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
        }
    }
    async verifySms(dto) {
        const phone = dto.phone.trim();
        const redisKey = `sms:code:${phone}`;
        const rawData = await this.redis.get(redisKey);
        if (!rawData) {
            throw new common_1.BadRequestException('Код просрочен или не существует');
        }
        const codeData = JSON.parse(rawData);
        if (codeData.attempts >= auth_constants_1.AUTH_CONSTANTS.MAX_VERIFY_ATTEMPTS) {
            await this.redis.del(redisKey);
            throw new too_many_requests_exception_1.TooManyRequestsException('Превышено количество попыток ввода кода');
        }
        if (codeData.code !== dto.code.trim()) {
            codeData.attempts += 1;
            await this.redis.set(redisKey, JSON.stringify(codeData), auth_constants_1.AUTH_CONSTANTS.SMS_CODE_TTL_SEC);
            throw new common_1.BadRequestException('Неверный код подтверждения');
        }
        await this.redis.del(redisKey);
        const user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) {
            throw new common_1.BadRequestException('Пользователь не найден. Пройдите регистрацию повторно');
        }
        const profile = await this.prisma.profile.findUnique({ where: { userId: user.id } });
        const isNewUser = profile === null;
        const tokens = await this.issueTokens(user.id);
        return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isNewUser };
    }
    async verifyEmail(dto) {
        const email = dto.email.trim().toLowerCase();
        const redisKey = `email:code:${email}`;
        const rawData = await this.redis.get(redisKey);
        if (!rawData) {
            throw new common_1.BadRequestException('Код просрочен или не существует');
        }
        const codeData = JSON.parse(rawData);
        if (codeData.attempts >= auth_constants_1.AUTH_CONSTANTS.MAX_VERIFY_ATTEMPTS) {
            await this.redis.del(redisKey);
            throw new too_many_requests_exception_1.TooManyRequestsException('Превышено количество попыток ввода кода');
        }
        if (codeData.code !== dto.code.trim()) {
            codeData.attempts += 1;
            await this.redis.set(redisKey, JSON.stringify(codeData), auth_constants_1.AUTH_CONSTANTS.EMAIL_CODE_TTL_SEC);
            throw new common_1.BadRequestException('Неверный код подтверждения');
        }
        await this.redis.del(redisKey);
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('Пользователь не найден');
        }
        const isNewUser = user.emailVerifiedAt === null;
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerifiedAt: new Date() }
        });
        const tokens = await this.issueTokens(user.id);
        return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, isNewUser };
    }
    async refreshToken(dto) {
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        let payload;
        try {
            payload = this.jwtService.verify(dto.refreshToken, { secret: refreshSecret });
        }
        catch (_) {
            throw new common_1.UnauthorizedException('Невалидный или просроченный refresh токен');
        }
        const { sub: userId, jti, family, exp } = payload;
        const isFamilyBlocked = await this.redis.get(`blacklist:family:${family}`);
        if (isFamilyBlocked) {
            throw new common_1.UnauthorizedException('Сессия аннулирована в связи с компрометацией токенов');
        }
        const isTokenBlocked = await this.redis.get(`blacklist:${jti}`);
        if (isTokenBlocked) {
            await this.redis.set(`blacklist:family:${family}`, 'revoked', 30 * 24 * 3600);
            throw new common_1.UnauthorizedException('Попытка повторного использования токена. Вся сессия заблокирована');
        }
        const remainingTtlSec = Math.max(1, exp - Math.floor(Date.now() / 1000));
        await this.redis.set(`blacklist:${jti}`, 'revoked', remainingTtlSec);
        return this.issueTokens(userId, family);
    }
    async recoverAccess(dto) {
        const channel = this.assertExactlyOne(dto.phone, dto.email);
        if (channel === 'phone') {
            const phone = dto.phone.trim();
            const user = await this.prisma.user.findUnique({ where: { phone } });
            if (user) {
                const code = this.generateCode();
                await this.redis.set(`sms:code:${phone}`, JSON.stringify({ code, attempts: 0 }), auth_constants_1.AUTH_CONSTANTS.SMS_CODE_TTL_SEC);
                await this.smsService.send(phone, code);
            }
            return { status: 'RECOVERY_SENT', message: 'SMS-код отправлен' };
        }
        else {
            const email = dto.email.trim().toLowerCase();
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (user) {
                const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
                await this.redis.set(`reset:${resetToken}`, user.id, auth_constants_1.AUTH_CONSTANTS.RECOVERY_TOKEN_TTL_SEC);
                const link = `https://rawfree.ru/reset-password?token=${resetToken}`;
                await this.mailService.sendReset(email, link);
            }
            return { status: 'RECOVERY_SENT', message: 'Инструкция отправлена на email' };
        }
    }
    async resetPassword(dto) {
        const redisKey = `reset:${dto.token}`;
        const userId = await this.redis.get(redisKey);
        if (!userId) {
            throw new common_1.BadRequestException('Токен сброса пароля недействителен или просрочен');
        }
        const passwordHash = await argon2.hash(dto.newPassword, auth_constants_1.AUTH_CONSTANTS.ARGON2_OPTIONS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
        await this.redis.del(redisKey);
        return { status: 'PASSWORD_RESET', message: 'Пароль успешно изменен' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        jwt_1.JwtService,
        sms_service_1.SmsService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map