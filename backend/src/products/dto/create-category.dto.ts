import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(2)
  label: string;

  @IsOptional()
  @IsString()
  image?: string;
}
