import { quoteShippingPrice } from './shipping-quote';

describe('quoteShippingPrice', () => {
  it('applique un forfait local indépendant du poids', () => {
    expect(
      quoteShippingPrice(
        { isLocal: true, basePriceTND: 7.5, weightIncludedKg: 0, pricePerExtraKgTND: 6 },
        4,
      ),
    ).toBe(7.5);
  });

  it('facture les kg au-delà du poids inclus à l’international', () => {
    expect(
      quoteShippingPrice(
        { isLocal: false, basePriceTND: 90, weightIncludedKg: 0.5, pricePerExtraKgTND: 20 },
        1.5,
      ),
    ).toBe(110);
  });

  it('ne descend pas sous le prix de base', () => {
    expect(
      quoteShippingPrice(
        { isLocal: false, basePriceTND: 45, weightIncludedKg: 1, pricePerExtraKgTND: 10 },
        0.4,
      ),
    ).toBe(45);
  });
});
