import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import type { StaffRole } from '../user.entity';

export class CreateStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(['admin', 'vendeur'])
  role: StaffRole;
}
