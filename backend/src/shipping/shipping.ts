/** Source of truth for checkout shipping + currency. Keep in sync with lib/shipping.ts */

export const TUNISIA_FLAT_DT = 7;
export const MAX_AUTO_WEIGHT_G = 5000;
export const DEFAULT_PRODUCT_WEIGHT_G = 900;

/** Europe + Maghreb → Aramex. Any other ISO code → DHL (logged as fallback). */
export const EUROPE_MAGHREB = [
  // Maghreb
  'DZ',
  'EH',
  'LY',
  'MA',
  'MR',
  // EU
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  // EEA / CH / UK
  'IS',
  'LI',
  'NO',
  'CH',
  'GB',
  // Micro-États
  'AD',
  'MC',
  'SM',
  'VA',
  // Balkans
  'AL',
  'BA',
  'ME',
  'MK',
  'RS',
  'XK',
] as const;

const EUROPE_MAGHREB_SET = new Set<string>(EUROPE_MAGHREB);

/** Zone euro + micro-États qui utilisent l’euro. */
const EUR_COUNTRIES = new Set([
  'AD',
  'AT',
  'BE',
  'CY',
  'DE',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MC',
  'ME',
  'MT',
  'NL',
  'PT',
  'SI',
  'SK',
  'SM',
  'VA',
]);

const COUNTRY_CURRENCY: Record<string, string> = {
  TN: 'TND',
  US: 'USD',
  CA: 'USD',
  PR: 'USD',
  GB: 'GBP',
  CH: 'CHF',
  DZ: 'DZD',
  MA: 'MAD',
  LY: 'LYD',
  MR: 'MRU',
  AE: 'AED',
  SA: 'SAR',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR',
  EG: 'EGP',
  TR: 'TRY',
  JP: 'JPY',
  CN: 'CNY',
  AU: 'AUD',
  NZ: 'NZD',
  BR: 'BRL',
  MX: 'MXN',
  IN: 'INR',
  ZA: 'ZAR',
  NG: 'NGN',
  SN: 'XOF',
  CI: 'XOF',
  CM: 'XAF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  BG: 'BGN',
  IL: 'ILS',
  KR: 'KRW',
  SG: 'SGD',
  HK: 'HKD',
  TH: 'THB',
  ID: 'IDR',
  MY: 'MYR',
  PH: 'PHP',
  VN: 'VND',
  AR: 'ARS',
  CL: 'CLP',
  CO: 'COP',
  PE: 'PEN',
  RU: 'RUB',
  UA: 'UAH',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  TND: 'DT',
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  CAD: 'CA$',
  AED: 'AED',
  SAR: 'SAR',
  MAD: 'MAD',
  DZD: 'DA',
  LYD: 'LD',
  MRU: 'UM',
  EGP: 'E£',
  TRY: '₺',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  NZD: 'NZ$',
  BRL: 'R$',
  MXN: 'MX$',
  INR: '₹',
  ZAR: 'R',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  ILS: '₪',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  QAR: 'QR',
  KWD: 'KD',
  BHD: 'BD',
  OMR: 'OMR',
  XOF: 'CFA',
  XAF: 'FCFA',
};

const ARAMEX_DT = [
  { max: 500, fee: 45 },
  { max: 1000, fee: 62 },
  { max: 2000, fee: 85 },
  { max: 5000, fee: 145 },
];

const DHL_DT = [
  { max: 500, fee: 110 },
  { max: 1000, fee: 145 },
  { max: 2000, fee: 195 },
  { max: 5000, fee: 305 },
];

export type ShippingCarrier = 'poste' | 'aramex' | 'dhl' | 'quote';

export type ShippingQuote = {
  country: string;
  knownCountry: boolean;
  currency: string;
  carrier: ShippingCarrier;
  carrierLabel: string;
  totalWeightGrams: number;
  deliveryDt: number;
  needsQuote: boolean;
  invalidWeight: boolean;
};

export function normalizeCountry(code?: string | null) {
  const value = (code || '').trim().toUpperCase();
  if (value.length !== 2 || !/^[A-Z]{2}$/.test(value)) return 'TN';
  return value;
}

export function currencyForCountry(country: string) {
  const code = normalizeCountry(country);
  if (code === 'TN') return 'TND';
  if (EUR_COUNTRIES.has(code)) return 'EUR';
  return COUNTRY_CURRENCY[code] || 'USD';
}

export function isEuropeMaghreb(country: string) {
  return EUROPE_MAGHREB_SET.has(normalizeCountry(country));
}

function bandFee(weight: number, table: { max: number; fee: number }[]) {
  for (const row of table) {
    if (weight <= row.max) return row.fee;
  }
  return null;
}

export function quoteShipping(
  country: string,
  totalWeightGrams: number,
): ShippingQuote {
  const iso = normalizeCountry(country);
  const knownCountry = iso === 'TN' || iso in COUNTRY_CURRENCY || EUR_COUNTRIES.has(iso) || EUROPE_MAGHREB_SET.has(iso);
  const weight = Number(totalWeightGrams) || 0;
  const invalidWeight = weight < 1;
  const currency = currencyForCountry(iso);

  if (iso === 'TN') {
    return {
      country: iso,
      knownCountry: true,
      currency: 'TND',
      carrier: 'poste',
      carrierLabel: 'Poste tunisienne',
      totalWeightGrams: weight,
      deliveryDt: invalidWeight ? 0 : TUNISIA_FLAT_DT,
      needsQuote: false,
      invalidWeight,
    };
  }

  const aramex = isEuropeMaghreb(iso);
  const carrier: ShippingCarrier = aramex ? 'aramex' : 'dhl';
  const carrierLabel = aramex ? 'Aramex' : 'DHL';
  const needsQuote = !invalidWeight && weight > MAX_AUTO_WEIGHT_G;
  const fee = needsQuote || invalidWeight ? 0 : bandFee(weight, aramex ? ARAMEX_DT : DHL_DT) || 0;

  return {
    country: iso,
    knownCountry,
    currency,
    carrier: needsQuote ? 'quote' : carrier,
    carrierLabel: needsQuote ? 'Livraison sur devis' : carrierLabel,
    totalWeightGrams: weight,
    deliveryDt: fee,
    needsQuote,
    invalidWeight,
  };
}

export function convertFromTnd(
  amountDt: number,
  currency: string,
  rates: Record<string, number> | null | undefined,
) {
  if (!currency || currency === 'TND') {
    return { amount: amountDt, converted: false };
  }
  const rate = rates?.[currency];
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    return { amount: amountDt, converted: false };
  }
  return { amount: amountDt * rate, converted: true };
}

export function formatMoney(amount: number, currency: string) {
  const code = currency || 'TND';
  if (code === 'TND') return `${Math.round(amount)} DT`;
  const symbol = CURRENCY_SYMBOLS[code] || code;
  const rounded =
    code === 'JPY' || code === 'KRW' || code === 'XOF' || code === 'XAF'
      ? Math.round(amount)
      : Math.round(amount * 100) / 100;
  const formatted =
    Number.isInteger(rounded) && (code === 'JPY' || code === 'KRW' || code === 'XOF' || code === 'XAF')
      ? String(rounded)
      : rounded.toFixed(2);
  if (symbol === '€') return `${formatted} €`;
  if (symbol === '$' || symbol === '£') return `${symbol}${formatted}`;
  return `${formatted} ${symbol}`;
}

export function displayPrice(
  amountDt: number,
  currency: string,
  rates: Record<string, number> | null | undefined,
) {
  const code = currency || 'TND';
  const converted = convertFromTnd(amountDt, code, rates);
  const showFx = code !== 'TND' && converted.converted;
  return {
    primary: formatMoney(showFx ? converted.amount : amountDt, showFx ? code : 'TND'),
    approxDt: showFx ? formatMoney(amountDt, 'TND') : null,
    converted: showFx,
    currency: showFx ? code : 'TND',
  };
}
