import { IsEmail, IsIn, IsString, MinLength, MaxLength } from 'class-validator';
import type { StaffRole } from '../user.entity';

export class CreateStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;

  @IsIn(['admin', 'vendeur'])
  role!: StaffRole;
}
