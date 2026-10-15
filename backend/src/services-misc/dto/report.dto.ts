import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendReportDto {
  @IsString()
  @IsNotEmpty({ message: 'Идентификатор целевого пользователя обязателен' })
  toUser: string;

  @IsString()
  @IsNotEmpty({ message: 'Причина жалобы обязательна' })
  reason: string;

  // Комментарий опционален — пользователь может отправить жалобу, выбрав только причину из списка
  @IsString()
  @IsOptional()
  comment?: string;
}
