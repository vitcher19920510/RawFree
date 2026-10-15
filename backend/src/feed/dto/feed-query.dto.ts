import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class FeedQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
