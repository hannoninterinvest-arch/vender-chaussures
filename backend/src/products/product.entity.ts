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

  @Column('text')
  description: string;

  @Column()
  gender: string;

  @Column()
  category: string;

  @Column({ default: false })
  isNew: boolean;

  @Column({ type: 'jsonb' })
  colors: { name: string; hex: string }[];

  @Column({ type: 'jsonb' })
  sizes: number[];

  @Column({ type: 'jsonb' })
  images: string[];
}
