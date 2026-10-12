export class Product {
  id!: string;

  name!: string;

  brand!: string;

  price!: number;

  /** Prix promotionnel. 0 (ou >= price) signifie aucune promotion en cours. */
  promoPrice!: number;

  cost!: number;

  description!: string;

  gender!: string;

  category!: string;

  isNew!: boolean;

  featured!: boolean;

  colors!: {
    name: string;
    hex: string;
    image?: string;
    images?: string[];
    model?: string;
  }[];

  sizes!: number[];

  images!: string[];

  /** Chemin public ou URL HTTPS d’un fichier .glb de repli. */
  model!: string;
}
