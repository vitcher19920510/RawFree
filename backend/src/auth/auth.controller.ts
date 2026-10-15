import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifySmsDto } from './dto/verify.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { RecoverAccessDto } from './dto/recover.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifySms(@Body() dto: VerifySmsDto) {
    return this.authService.verifySms(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('recover')
  @HttpCode(HttpStatus.OK)
  async recoverAccess(@Body() dto: RecoverAccessDto) {
    return this.authService.recoverAccess(dto);
  }

  /**
   * POST /api/v1/auth/reset-password
   * Успех: 200 OK — { status: "PASSWORD_RESET", message: "Пароль успешно изменен" }
   * Ошибки: 400 Bad Request (недействительный или просроченный токен сброса)
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
