import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Неверный формат email' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Код подтверждения не может быть пустым' })
  @Length(4, 8, { message: 'Код должен содержать от 4 до 8 символов' })
  code: string;
}
