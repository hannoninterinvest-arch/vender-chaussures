import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProductColorDto {
  @IsString()
  name: string;

  @IsString()
  hex: string;
}

export class CreateProductDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(1)
  brand: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsString()
  description: string;

  @IsIn(['homme', 'femme', 'unisexe'])
  gender: 'homme' | 'femme' | 'unisexe';

  @IsString()
  category: string;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductColorDto)
  @ArrayMinSize(1)
  colors: ProductColorDto[];

  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @ArrayMinSize(1)
  sizes: number[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  images: string[];
}
