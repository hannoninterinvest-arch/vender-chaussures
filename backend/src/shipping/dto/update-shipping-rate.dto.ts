import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import {
  SHIPPING_CARRIERS,
  SHIPPING_ZONES,
  type ShippingCarrier,
  type ShippingZone,
} from '../shipping-rates.config';

export class UpdateShippingRateDto {
  @IsOptional()
  @IsIn(SHIPPING_CARRIERS)
  carrier?: ShippingCarrier;

  @IsOptional()
  @IsIn(SHIPPING_ZONES)
  zone?: ShippingZone;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isLocal?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePriceTND?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightIncludedKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerExtraKgTND?: number;
}
