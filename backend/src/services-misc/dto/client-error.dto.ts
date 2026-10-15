import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientErrorDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Название экрана обязательно' })
  screen: string;

  @IsString()
  @IsNotEmpty({ message: 'Описание ошибки обязательно' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Версия приложения обязательна' })
  appVersion: string;

  @IsString()
  @IsNotEmpty({ message: 'Модель устройства обязательна' })
  device: string;

  @IsString()
  @IsNotEmpty({ message: 'Версия ОС обязательна' })
  osVersion: string;

  @IsInt()
  @IsOptional()
  repeats?: number;
}
