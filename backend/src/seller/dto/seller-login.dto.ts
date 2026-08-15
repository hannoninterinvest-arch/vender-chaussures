import { IsString, MinLength } from 'class-validator';

export class SellerLoginDto {
  @IsString()
  @MinLength(1)
  key: string;
}
