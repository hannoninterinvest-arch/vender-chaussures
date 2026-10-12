import {
  IsIn,
  IsOptional,
  IsBoolean,
  IsString,
  MaxLength,
} from "class-validator";
import { ORDER_STATUSES } from "@/lib/order-workflow";
export { ORDER_STATUSES } from "@/lib/order-workflow";
export type { OrderStatus } from "@/lib/order-workflow";
export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  status!: (typeof ORDER_STATUSES)[number];
  @IsOptional()
  @IsBoolean()
  callConfirmed?: boolean;
  @IsOptional()
  @IsBoolean()
  cashReceived?: boolean;
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
