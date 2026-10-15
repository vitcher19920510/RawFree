import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifySmsDto } from './dto/verify.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { RecoverAccessDto } from './dto/recover.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        status: "SMS_SENT" | "EMAIL_SENT";
    }>;
    login(dto: LoginDto): Promise<{
        channel: "phone" | "email";
        status?: "SMS_SENT";
        accessToken?: string;
        refreshToken?: string;
    }>;
    verifySms(dto: VerifySmsDto): Promise<import("./auth.service").AuthVerifyResult>;
    verifyEmail(dto: VerifyEmailDto): Promise<import("./auth.service").AuthVerifyResult>;
    refreshToken(dto: RefreshTokenDto): Promise<import("./auth.service").TokenPair>;
    recoverAccess(dto: RecoverAccessDto): Promise<{
        status: string;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        status: string;
        message: string;
    }>;
}
