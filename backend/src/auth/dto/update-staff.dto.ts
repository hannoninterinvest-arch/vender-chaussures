import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
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
  @MinLength(8)
  password?: string;
}
