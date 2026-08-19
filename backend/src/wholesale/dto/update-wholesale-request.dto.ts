import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const WHOLESALE_STATUSES = [
  'nouveau',
  'rappele',
  'negociation',
  'conclu',
  'annule',
] as const;

export type WholesaleStatus = (typeof WHOLESALE_STATUSES)[number];

export class UpdateWholesaleRequestDto {
  @IsOptional()
  @IsIn(WHOLESALE_STATUSES)
  status?: WholesaleStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  staffNote?: string;
}
