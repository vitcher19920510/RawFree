import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifySmsDto } from './dto/verify.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { RecoverAccessDto } from './dto/recover.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация (phone или email)' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход (phone → SMS или email+password)' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Подтверждение SMS кода' })
  @HttpCode(HttpStatus.OK)
  async verifySms(@Body() dto: VerifySmsDto) {
    return this.authService.verifySms(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Подтверждение email кода' })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление JWT токена' })
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('recover')
  @ApiOperation({ summary: 'Восстановление доступа' })
  @HttpCode(HttpStatus.OK)
  async recoverAccess(@Body() dto: RecoverAccessDto) {
    return this.authService.recoverAccess(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Сброс пароля' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
