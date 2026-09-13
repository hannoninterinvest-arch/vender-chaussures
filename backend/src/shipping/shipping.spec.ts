import { currencyForCountry, quoteShipping } from './shipping';

describe('quoteShipping', () => {
  it('applique 7 DT fixes en Tunisie, quel que soit le poids', () => {
    expect(quoteShipping('TN', 200).deliveryDt).toBe(7);
    expect(quoteShipping('tn', 4000).deliveryDt).toBe(7);
    expect(quoteShipping('TN', 4000).carrier).toBe('poste');
    expect(quoteShipping('TN', 4000).currency).toBe('TND');
  });

  it('utilise Aramex pour l’Europe / Maghreb', () => {
    const fr = quoteShipping('FR', 400);
    expect(fr.carrier).toBe('aramex');
    expect(fr.deliveryDt).toBe(45);
    expect(fr.currency).toBe('EUR');

    const dz = quoteShipping('DZ', 800);
    expect(dz.carrier).toBe('aramex');
    expect(dz.deliveryDt).toBe(62);
  });

  it('utilise DHL hors Europe / Maghreb', () => {
    const us = quoteShipping('US', 400);
    expect(us.carrier).toBe('dhl');
    expect(us.deliveryDt).toBe(110);
    expect(us.currency).toBe('USD');

    const jp = quoteShipping('JP', 1500);
    expect(jp.carrier).toBe('dhl');
    expect(jp.deliveryDt).toBe(195);
  });

  it('demande un devis au-delà de 5 kg', () => {
    const quote = quoteShipping('FR', 5001);
    expect(quote.needsQuote).toBe(true);
    expect(quote.carrier).toBe('quote');
    expect(quote.deliveryDt).toBe(0);
  });

  it('signale un poids invalide', () => {
    const quote = quoteShipping('FR', 0);
    expect(quote.invalidWeight).toBe(true);
    expect(quote.deliveryDt).toBe(0);
  });

  it('traite un pays inconnu comme DHL', () => {
    const quote = quoteShipping('ZZ', 200);
    expect(quote.carrier).toBe('dhl');
    expect(quote.knownCountry).toBe(false);
    expect(quote.deliveryDt).toBe(110);
  });

  it('mappe les devises ciblées', () => {
    expect(currencyForCountry('FR')).toBe('EUR');
    expect(currencyForCountry('US')).toBe('USD');
    expect(currencyForCountry('CA')).toBe('USD');
    expect(currencyForCountry('GB')).toBe('GBP');
    expect(currencyForCountry('TN')).toBe('TND');
  });

  it('prend la borne 500 g dans le premier palier', () => {
    expect(quoteShipping('FR', 500).deliveryDt).toBe(45);
    expect(quoteShipping('FR', 501).deliveryDt).toBe(62);
  });
});
