import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../common/services/sms.service';
import { MailService } from '../common/services/mail.service';
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
export declare class AuthService {
    private readonly prisma;
    private readonly redis;
    private readonly jwtService;
    private readonly smsService;
    private readonly mailService;
    constructor(prisma: PrismaService, redis: RedisService, jwtService: JwtService, smsService: SmsService, mailService: MailService);
    private assertExactlyOne;
    private issueTokens;
    private generateCode;
    register(dto: RegisterDto): Promise<{
        status: 'SMS_SENT' | 'EMAIL_SENT';
    }>;
    login(dto: LoginDto): Promise<{
        channel: 'phone' | 'email';
        status?: 'SMS_SENT';
        accessToken?: string;
        refreshToken?: string;
    }>;
    verifySms(dto: VerifySmsDto): Promise<AuthVerifyResult>;
    verifyEmail(dto: VerifyEmailDto): Promise<AuthVerifyResult>;
    refreshToken(dto: RefreshTokenDto): Promise<TokenPair>;
    recoverAccess(dto: RecoverAccessDto): Promise<{
        status: string;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        status: string;
        message: string;
    }>;
}
