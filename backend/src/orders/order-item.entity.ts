import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { eager: true, nullable: true })
  product: Product | null;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  color: string;

  @Column()
  size: number;

  @Column()
  qty: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
