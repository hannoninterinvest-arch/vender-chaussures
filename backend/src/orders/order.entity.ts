import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn()
  id: string;

  @Column()
  customerName: string;

  @Column()
  phone: string;

  @Column()
  gouvernorat: string;

  @Column()
  city: string;

  @Column()
  address: string;

  @Column({ type: 'text', default: '' })
  notes: string;

  @Column()
  payment: string;

  @Column({ type: 'text', default: '' })
  paymentPhone: string;

  @Column({ type: 'text', default: '' })
  paymentRef: string;

  @Column({ type: 'text', default: '' })
  paymentStatus: string;

  @Column({ type: 'text', default: '' })
  payUrl: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  delivery: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'en_attente' })
  status: string;

  @Column({ name: 'shipping_country', type: 'varchar', default: 'TN' })
  shippingCountry: string;

  @Column({ name: 'shipping_carrier', type: 'varchar', default: 'poste' })
  shippingCarrier: string;

  @Column({ name: 'total_weight_grams', type: 'int', default: 0 })
  totalWeightGrams: number;

  @Column({ type: 'varchar', default: 'TND' })
  currency: string;

  @Column('decimal', { precision: 12, scale: 6, default: 1 })
  exchangeRate: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}
