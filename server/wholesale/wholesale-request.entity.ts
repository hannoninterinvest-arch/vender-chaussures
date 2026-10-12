export type WholesaleItem = {
  productId: string;
  name: string;
  image: string;
  qty: number;
  /** Prix boutique au moment de la demande, simple repère pour la négociation. */
  retailPrice: number;
};

export class WholesaleRequest {
  id!: string;

  company!: string;

  contactName!: string;

  phone!: string;

  email!: string;

  gouvernorat!: string;

  city!: string;

  message!: string;

  items!: WholesaleItem[];

  totalQty!: number;

  /** Repère de négociation : total aux prix boutique. */
  retailTotal!: number;

  status!: string;

  staffNote!: string;

  createdAt!: Date;
}
