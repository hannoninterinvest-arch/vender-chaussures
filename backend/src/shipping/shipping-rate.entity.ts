import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shipping_rates')
@Unique(['carrier', 'zone'])
export class ShippingRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  carrier: string;

  @Column()
  zone: string;

  @Column({ default: false })
  isLocal: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  basePriceTND: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  weightIncludedKg: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  pricePerExtraKgTND: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
