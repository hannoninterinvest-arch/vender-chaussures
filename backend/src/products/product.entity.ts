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

  /** Prix promotionnel. 0 (ou >= price) signifie aucune promotion en cours. */
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  promoPrice: number;

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

  /** Vidéo 3D / 360° du produit (URL Cloudinary). */
  @Column({ default: '' })
  video: string;

  /** Afficher cette vidéo aussi sur la page d’accueil. */
  @Column({ default: false })
  showVideoOnHome: boolean;
}
