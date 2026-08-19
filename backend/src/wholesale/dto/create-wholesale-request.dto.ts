import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class WholesaleItemDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5000)
  qty: number;
}

export class CreateWholesaleRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  company: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  contactName: string;

  /** Le grossiste laisse son numéro : c'est nous qui rappelons. */
  @IsString()
  @Matches(/^[0-9+\s().-]{8,20}$/, {
    message: 'Numéro de téléphone invalide',
  })
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  gouvernorat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  message?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WholesaleItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(40)
  items: WholesaleItemDto[];
}
