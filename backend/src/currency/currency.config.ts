/**
 * Mapping pays → devise d’affichage. Les prix catalogue restent en TND.
 *
 * TODO: si tu as une clé exchangerate-api.com, définis EXCHANGE_RATE_API_KEY
 * dans backend/.env. Sinon on utilise open.er-api.com (gratuit, sans clé)
 * puis cette table de repli.
 */

export const COUNTRY_CURRENCY: Record<string, string> = {
  TN: 'TND',
  FR: 'EUR',
  BE: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  PT: 'EUR',
  NL: 'EUR',
  LU: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  CY: 'EUR',
  MT: 'EUR',
  MC: 'EUR',
  AD: 'EUR',
  SM: 'EUR',
  US: 'USD',
  CA: 'CAD',
  GB: 'GBP',
  CH: 'CHF',
  MA: 'MAD',
  AE: 'AED',
  SA: 'SAR',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR',
  JP: 'JPY',
  AU: 'AUD',
  NZ: 'NZD',
};

/** Combien d’unités de devise pour 1 TND — repli si l’API FX est indisponible. */
export const FALLBACK_RATES_FROM_TND: Record<string, number> = {
  TND: 1,
  EUR: 0.3,
  USD: 0.32,
  CAD: 0.44,
  GBP: 0.26,
  CHF: 0.28,
  MAD: 3.2,
  AED: 1.18,
  SAR: 1.2,
  QAR: 1.17,
  KWD: 0.098,
  BHD: 0.12,
  OMR: 0.123,
  JPY: 48,
  AUD: 0.49,
  NZD: 0.54,
};

export function currencyForCountry(countryCode: string): string {
  const code = (countryCode || 'TN').toUpperCase();
  return COUNTRY_CURRENCY[code] || 'USD';
}
