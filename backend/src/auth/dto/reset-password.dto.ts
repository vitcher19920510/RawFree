import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Токен сброса пароля обязателен' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'Новый пароль обязателен' })
  @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
  newPassword: string;
}
