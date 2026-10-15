import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, ValidateIf } from 'class-validator';
import { ExactlyOneChannel } from '../validators/exactly-one-channel.validator';

@ExactlyOneChannel()
export class LoginDto {
  @ValidateIf((o) => typeof o.phone === 'string' && o.phone.trim() !== '')
  @IsPhoneNumber('RU', { message: 'Неверный формат номера телефона' })
  phone?: string;

  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim() !== '')
  @IsEmail({}, { message: 'Неверный формат email' })
  email?: string;

  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim() !== '')
  @IsString()
  @IsNotEmpty({ message: 'Укажите пароль при входе по email' })
  password?: string;
}
