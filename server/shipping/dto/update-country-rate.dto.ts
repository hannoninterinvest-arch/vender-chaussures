import { IsBoolean, IsNumber, Min, Max } from "class-validator";
export class UpdateCountryRateDto {
  @IsBoolean() enabled!: boolean;
  @IsNumber() @Min(0) @Max(10000) basePriceTND!: number;
  @IsNumber() @Min(0) @Max(80) weightIncludedKg!: number;
  @IsNumber() @Min(0) @Max(10000) pricePerExtraKgTND!: number;
  @IsNumber() @Min(0) @Max(10) weightStepKg!: number;
  @IsNumber() @Min(1.5) @Max(80) maxWeightKg!: number;
  @IsBoolean() estimated!: boolean;
}
