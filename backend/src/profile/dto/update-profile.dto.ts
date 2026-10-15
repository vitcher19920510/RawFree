import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @ValidateIf((o) => typeof o.name === 'string' && o.name.trim() !== '')
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ValidateIf((o) => o.age !== undefined && o.age !== null)
  @Type(() => Number)
  @IsInt()
  @Min(18, { message: 'Вам должно быть не менее 18 лет' })
  @Max(100)
  age?: number;

  @ValidateIf((o) => typeof o.gender === 'string' && o.gender.trim() !== '')
  @IsString()
  gender?: string;

  @ValidateIf((o) => typeof o.lookingFor === 'string' && o.lookingFor.trim() !== '')
  @IsString()
  lookingFor?: string;

  @ValidateIf((o) => typeof o.city === 'string' && o.city.trim() !== '')
  @IsString()
  city?: string;

  @ValidateIf((o) => typeof o.bio === 'string')
  @IsString()
  bio?: string;
}
