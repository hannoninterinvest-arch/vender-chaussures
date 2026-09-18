import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('site_settings')
export class SiteSettings {
  @PrimaryColumn()
  id: string;

  @Column({ default: '' })
  heroKicker: string;

  @Column({ default: '' })
  heroTitle: string;

  @Column({ default: '' })
  heroSubtitle: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  coverImages: string[];

  /** Vidéos de garde (Cloudinary), affichées avec les photos sur l’accueil. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  coverVideos: string[];
}
