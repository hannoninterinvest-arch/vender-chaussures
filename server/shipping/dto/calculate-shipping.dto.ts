import { Type } from "class-transformer";
import {
  IsIn,
  IsNumber,
  IsString,
  IsOptional,
  MaxLength,
  Max,
  Min,
  MinLength,
} from "class-validator";
import {
  SHIPPING_CARRIERS,
  type ShippingCarrier,
} from "../shipping-rates.config";

export class CalculateShippingDto {
  @IsString()
  @MinLength(2)
  country!: string;

  @IsIn(SHIPPING_CARRIERS)
  carrier!: ShippingCarrier;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(80)
  weightKg!: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  stateProvinceCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}
