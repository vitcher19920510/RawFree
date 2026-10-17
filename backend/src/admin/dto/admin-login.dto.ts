import { IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  otpCode?: string; // TOTP код (если включен 2FA)
}
