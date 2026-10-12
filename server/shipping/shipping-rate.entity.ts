export class ShippingRate {
  id!: string;

  carrier!: string;

  zone!: string;

  isLocal!: boolean;

  basePriceTND!: number;

  weightIncludedKg!: number;

  pricePerExtraKgTND!: number;

  updatedAt!: Date;
}
