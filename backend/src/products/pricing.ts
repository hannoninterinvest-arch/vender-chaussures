type Priced = { price: number; promoPrice?: number | null };

/** Une promo n'est active que si elle est strictement inférieure au prix normal. */
export function promoActive(product: Priced) {
  const promo = Number(product.promoPrice) || 0;
  return promo > 0 && promo < Number(product.price);
}

/** Prix réellement encaissé : promo si elle est active, sinon prix normal. */
export function sellingPrice(product: Priced) {
  return promoActive(product) ? Number(product.promoPrice) : Number(product.price);
}

export function discountPercent(product: Priced) {
  if (!promoActive(product)) return 0;
  const full = Number(product.price);
  return Math.round(((full - Number(product.promoPrice)) / full) * 100);
}
