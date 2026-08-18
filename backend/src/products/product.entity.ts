import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column('text')
  description: string;

  @Column()
  gender: string;

  @Column()
  category: string;

  @Column({ default: false })
  isNew: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'jsonb' })
  colors: { name: string; hex: string; image?: string }[];

  @Column({ type: 'jsonb' })
  sizes: number[];

  @Column({ type: 'jsonb' })
  images: string[];
}
