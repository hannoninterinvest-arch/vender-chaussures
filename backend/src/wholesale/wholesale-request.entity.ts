import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type WholesaleItem = {
  productId: string;
  name: string;
  image: string;
  qty: number;
  /** Prix boutique au moment de la demande, simple repère pour la négociation. */
  retailPrice: number;
};

@Entity('wholesale_requests')
export class WholesaleRequest {
  @PrimaryColumn()
  id: string;

  @Column()
  company: string;

  @Column()
  contactName: string;

  @Column()
  phone: string;

  @Column({ type: 'text', default: '' })
  email: string;

  @Column({ type: 'text', default: '' })
  gouvernorat: string;

  @Column({ type: 'text', default: '' })
  city: string;

  @Column({ type: 'text', default: '' })
  message: string;

  @Column({ type: 'jsonb' })
  items: WholesaleItem[];

  @Column({ type: 'int', default: 0 })
  totalQty: number;

  /** Repère de négociation : total aux prix boutique. */
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  retailTotal: number;

  @Column({ default: 'nouveau' })
  status: string;

  @Column({ type: 'text', default: '' })
  staffNote: string;

  @CreateDateColumn()
  createdAt: Date;
}
