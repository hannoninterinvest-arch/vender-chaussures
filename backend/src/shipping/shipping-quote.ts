export function roundMoney(amount: number): number {
  return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
}

export type QuoteRate = {
  isLocal: boolean;
  basePriceTND: number;
  weightIncludedKg: number;
  pricePerExtraKgTND: number;
};

/** Local = forfait indépendant du poids. International = base + kg supplémentaires. */
export function quoteShippingPrice(rate: QuoteRate, weightKg: number): number {
  const base = Number(rate.basePriceTND) || 0;
  if (rate.isLocal) return roundMoney(base);
  const included = Number(rate.weightIncludedKg) || 0;
  const extraKg = Math.max(0, Number(weightKg) - included);
  const perKg = Number(rate.pricePerExtraKgTND) || 0;
  return roundMoney(base + extraKg * perKg);
}
