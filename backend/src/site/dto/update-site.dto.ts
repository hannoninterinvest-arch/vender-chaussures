import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  heroKicker?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  heroTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  heroSubtitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  @Type(() => String)
  coverImages?: string[];
}
