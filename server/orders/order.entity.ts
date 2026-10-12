import { OrderItem } from "./order-item.entity";

export class Order {
  id!: string;

  customerName!: string;

  phone!: string;

  gouvernorat!: string;

  country!: string;

  carrier!: string;

  shippingZone!: string;

  city!: string;

  address!: string;

  notes!: string;

  payment!: string;

  paymentPhone!: string;

  paymentRef!: string;

  paymentStatus!: string;

  payUrl!: string;

  subtotal!: number;

  delivery!: number;

  total!: number;

  status!: string;

  items!: OrderItem[];

  createdAt!: Date;
}
