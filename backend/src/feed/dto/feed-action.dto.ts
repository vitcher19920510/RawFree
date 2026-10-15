import { IsNotEmpty, IsString } from 'class-validator';

export class FeedActionDto {
  @IsString()
  @IsNotEmpty({ message: 'Идентификатор целевого пользователя обязателен' })
  targetUserId: string;
}
