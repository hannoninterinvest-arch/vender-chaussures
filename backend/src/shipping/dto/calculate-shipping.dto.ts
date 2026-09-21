import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsString, Max, Min, MinLength } from 'class-validator';
import { SHIPPING_CARRIERS, type ShippingCarrier } from '../shipping-rates.config';

export class CalculateShippingDto {
  @IsString()
  @MinLength(2)
  country: string;

  @IsIn(SHIPPING_CARRIERS)
  carrier: ShippingCarrier;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(80)
  weightKg: number;
}
