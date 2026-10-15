import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifySmsDto {
  @IsPhoneNumber('RU')
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 6)
  code: string;
}
