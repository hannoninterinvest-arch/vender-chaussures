import { IsBoolean, IsIn, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import type { StaffRole } from '../user.entity';

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsIn(['admin', 'vendeur'])
  role?: StaffRole;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password?: string;
}
