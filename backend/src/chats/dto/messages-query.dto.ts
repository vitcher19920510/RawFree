import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';

export class MessagesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'before должен быть корректной строкой ISO-8601 с датой и временем' })
  before?: string;
}
