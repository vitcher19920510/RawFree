import { IsNotEmpty, IsString } from 'class-validator';

export class BlockUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Идентификатор блокируемого пользователя обязателен' })
  blockedUserId: string;
}
