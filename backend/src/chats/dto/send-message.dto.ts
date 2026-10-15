import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ExactlyOneMessagePayload } from '../validators/exactly-one-message-payload.validator';

@ExactlyOneMessagePayload()
export class SendMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  text?: string;

  @IsOptional()
  @IsIn(['photo', 'videonote'])
  mediaType?: 'photo' | 'videonote';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationMs?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  height?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sizeBytes?: number;
}
