import { Order } from "./order.entity";
import { Product } from "../products/product.entity";

export class OrderItem {
  id!: number;

  order!: Order;

  product!: Product | null;

  name!: string;

  image!: string;

  color!: string;

  size!: number;

  qty!: number;

  price!: number;

  cost!: number;
}
