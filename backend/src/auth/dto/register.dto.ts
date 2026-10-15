import { Equals, IsBoolean, IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength, ValidateIf } from 'class-validator';
import { ExactlyOneChannel } from '../validators/exactly-one-channel.validator';

@ExactlyOneChannel()
export class RegisterDto {
  @ValidateIf((o) => typeof o.phone === 'string' && o.phone.trim() !== '')
  @IsPhoneNumber('RU', { message: 'Неверный формат номера телефона' })
  phone?: string;

  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim() !== '')
  @IsEmail({}, { message: 'Неверный формат email' })
  email?: string;

  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim() !== '')
  @IsString()
  @IsNotEmpty({ message: 'При регистрации по email пароль обязателен' })
  @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
  password?: string;

  @IsBoolean()
  @Equals(true, { message: 'Вам должно быть 18+ для регистрации' })
  is18Accepted: boolean;
}
