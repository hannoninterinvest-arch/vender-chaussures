import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayMaxSize,
  IsArray,
  Max,
  MaxLength,
  MinLength,
  Matches,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

const PAYMENTS = ['cod', 'online', 'flouci'] as const;

export class CreateOrderItemDto {
  @IsString()
  @MaxLength(120)
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(36)
  size!: number;

  @IsString()
  @MaxLength(80)
  color!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  qty!: number;
}

const CARRIERS = ['ARAMEX', 'LA_POSTE'] as const;

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  customerName!: string;

  @IsString()
  @Matches(/^[0-9+\s().-]{8,25}$/, { message: 'Numéro de téléphone invalide' })
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  gouvernorat?: string;

  /** Code ISO-2 (TN, FR, …) ou nom de pays. Défaut Tunisie. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsIn(CARRIERS)
  carrier?: (typeof CARRIERS)[number];

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  stateProvinceCode?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(500)
  address!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedTotal?: number;

  @IsIn(PAYMENTS)
  payment!: (typeof PAYMENTS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(30)
  paymentPhone?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(40)
  items!: CreateOrderItemDto[];
}
