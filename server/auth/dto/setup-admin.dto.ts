import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SetupAdminDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;
}
