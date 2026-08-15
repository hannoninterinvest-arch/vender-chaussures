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

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  delivery: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'en_attente' })
  status: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}
