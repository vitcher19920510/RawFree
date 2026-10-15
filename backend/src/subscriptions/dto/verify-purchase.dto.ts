import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyPurchaseDto {
  @IsString()
  @IsNotEmpty({ message: 'Тариф обязателен' })
  plan: string;

  @IsString()
  @IsNotEmpty({ message: 'Токен покупки обязателен' })
  purchaseToken: string;

  @IsIn(['RUSTORE', 'GOOGLE', 'APPSTORE'], { message: 'Недопустимая платформа' })
  @IsOptional()
  platform?: string;
}
