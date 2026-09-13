/** Keep quote tables in sync with backend/src/shipping/shipping.ts */

export const TUNISIA_FLAT_DT = 7;
export const MAX_AUTO_WEIGHT_G = 5000;
export const DEFAULT_PRODUCT_WEIGHT_G = 900;

export const EUROPE_MAGHREB = [
  "DZ",
  "EH",
  "LY",
  "MA",
  "MR",
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
  "CH",
  "GB",
  "AD",
  "MC",
  "SM",
  "VA",
  "AL",
  "BA",
  "ME",
  "MK",
  "RS",
  "XK",
] as const;

const EUROPE_MAGHREB_SET = new Set<string>(EUROPE_MAGHREB);

const EUR_COUNTRIES = new Set([
  "AD",
  "AT",
  "BE",
  "CY",
  "DE",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MC",
  "ME",
  "MT",
  "NL",
  "PT",
  "SI",
  "SK",
  "SM",
  "VA",
]);

const COUNTRY_CURRENCY: Record<string, string> = {
  TN: "TND",
  US: "USD",
  CA: "USD",
  PR: "USD",
  GB: "GBP",
  CH: "CHF",
  DZ: "DZD",
  MA: "MAD",
  LY: "LYD",
  MR: "MRU",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
  EG: "EGP",
  TR: "TRY",
  JP: "JPY",
  CN: "CNY",
  AU: "AUD",
  NZ: "NZD",
  BR: "BRL",
  MX: "MXN",
  IN: "INR",
  ZA: "ZAR",
  NG: "NGN",
  SN: "XOF",
  CI: "XOF",
  CM: "XAF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  RO: "RON",
  BG: "BGN",
  IL: "ILS",
  KR: "KRW",
  SG: "SGD",
  HK: "HKD",
  TH: "THB",
  ID: "IDR",
  MY: "MYR",
  PH: "PHP",
  VN: "VND",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",
  RU: "RUB",
  UA: "UAH",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  TND: "DT",
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
  AED: "AED",
  SAR: "SAR",
  MAD: "MAD",
  DZD: "DA",
  LYD: "LD",
  MRU: "UM",
  EGP: "E£",
  TRY: "₺",
  JPY: "¥",
  CNY: "¥",
  AUD: "A$",
  NZD: "NZ$",
  BRL: "R$",
  MXN: "MX$",
  INR: "₹",
  ZAR: "R",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  CZK: "Kč",
  HUF: "Ft",
  RON: "lei",
  BGN: "лв",
  ILS: "₪",
  KRW: "₩",
  SGD: "S$",
  HKD: "HK$",
  QAR: "QR",
  KWD: "KD",
  BHD: "BD",
  OMR: "OMR",
  XOF: "CFA",
  XAF: "FCFA",
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

export type ShippingCarrier = "poste" | "aramex" | "dhl" | "quote";

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

export type ShippingCountry = {
  code: string;
  name: string;
  flag: string;
};

export const SHIPPING_COUNTRIES: ShippingCountry[] = [
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "LY", name: "Libye", flag: "🇱🇾" },
  { code: "MR", name: "Mauritanie", flag: "🇲🇷" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", flag: "🇨🇭" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪" },
  { code: "IT", name: "Italie", flag: "🇮🇹" },
  { code: "ES", name: "Espagne", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "NL", name: "Pays-Bas", flag: "🇳🇱" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "IE", name: "Irlande", flag: "🇮🇪" },
  { code: "AT", name: "Autriche", flag: "🇦🇹" },
  { code: "SE", name: "Suède", flag: "🇸🇪" },
  { code: "NO", name: "Norvège", flag: "🇳🇴" },
  { code: "DK", name: "Danemark", flag: "🇩🇰" },
  { code: "FI", name: "Finlande", flag: "🇫🇮" },
  { code: "PL", name: "Pologne", flag: "🇵🇱" },
  { code: "CZ", name: "Tchéquie", flag: "🇨🇿" },
  { code: "GR", name: "Grèce", flag: "🇬🇷" },
  { code: "RO", name: "Roumanie", flag: "🇷🇴" },
  { code: "HU", name: "Hongrie", flag: "🇭🇺" },
  { code: "BG", name: "Bulgarie", flag: "🇧🇬" },
  { code: "HR", name: "Croatie", flag: "🇭🇷" },
  { code: "SK", name: "Slovaquie", flag: "🇸🇰" },
  { code: "SI", name: "Slovénie", flag: "🇸🇮" },
  { code: "LT", name: "Lituanie", flag: "🇱🇹" },
  { code: "LV", name: "Lettonie", flag: "🇱🇻" },
  { code: "EE", name: "Estonie", flag: "🇪🇪" },
  { code: "MT", name: "Malte", flag: "🇲🇹" },
  { code: "CY", name: "Chypre", flag: "🇨🇾" },
  { code: "IS", name: "Islande", flag: "🇮🇸" },
  { code: "AD", name: "Andorre", flag: "🇦🇩" },
  { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "AL", name: "Albanie", flag: "🇦🇱" },
  { code: "RS", name: "Serbie", flag: "🇷🇸" },
  { code: "BA", name: "Bosnie-Herzégovine", flag: "🇧🇦" },
  { code: "MK", name: "Macédoine du Nord", flag: "🇲🇰" },
  { code: "ME", name: "Monténégro", flag: "🇲🇪" },
  { code: "US", name: "États-Unis", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "MX", name: "Mexique", flag: "🇲🇽" },
  { code: "BR", name: "Brésil", flag: "🇧🇷" },
  { code: "AR", name: "Argentine", flag: "🇦🇷" },
  { code: "CL", name: "Chili", flag: "🇨🇱" },
  { code: "CO", name: "Colombie", flag: "🇨🇴" },
  { code: "AE", name: "Émirats arabes unis", flag: "🇦🇪" },
  { code: "SA", name: "Arabie saoudite", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", name: "Koweït", flag: "🇰🇼" },
  { code: "BH", name: "Bahreïn", flag: "🇧🇭" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "EG", name: "Égypte", flag: "🇪🇬" },
  { code: "TR", name: "Turquie", flag: "🇹🇷" },
  { code: "IL", name: "Israël", flag: "🇮🇱" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d’Ivoire", flag: "🇨🇮" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦" },
  { code: "AU", name: "Australie", flag: "🇦🇺" },
  { code: "NZ", name: "Nouvelle-Zélande", flag: "🇳🇿" },
  { code: "JP", name: "Japon", flag: "🇯🇵" },
  { code: "KR", name: "Corée du Sud", flag: "🇰🇷" },
  { code: "CN", name: "Chine", flag: "🇨🇳" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "SG", name: "Singapour", flag: "🇸🇬" },
  { code: "IN", name: "Inde", flag: "🇮🇳" },
  { code: "TH", name: "Thaïlande", flag: "🇹🇭" },
  { code: "MY", name: "Malaisie", flag: "🇲🇾" },
  { code: "ID", name: "Indonésie", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Viêt Nam", flag: "🇻🇳" },
  { code: "RU", name: "Russie", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
];

export function countryName(code: string) {
  return SHIPPING_COUNTRIES.find((c) => c.code === normalizeCountry(code))?.name || normalizeCountry(code);
}

export function normalizeCountry(code?: string | null) {
  const value = (code || "").trim().toUpperCase();
  if (value.length !== 2 || !/^[A-Z]{2}$/.test(value)) return "TN";
  return value;
}

export function currencyForCountry(country: string) {
  const code = normalizeCountry(country);
  if (code === "TN") return "TND";
  if (EUR_COUNTRIES.has(code)) return "EUR";
  return COUNTRY_CURRENCY[code] || "USD";
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

export function quoteShipping(country: string, totalWeightGrams: number): ShippingQuote {
  const iso = normalizeCountry(country);
  const listed = SHIPPING_COUNTRIES.some((c) => c.code === iso);
  const knownCountry =
    listed || iso === "TN" || iso in COUNTRY_CURRENCY || EUR_COUNTRIES.has(iso) || EUROPE_MAGHREB_SET.has(iso);
  const weight = Number(totalWeightGrams) || 0;
  const invalidWeight = weight < 1;
  const currency = currencyForCountry(iso);

  if (iso === "TN") {
    return {
      country: iso,
      knownCountry: true,
      currency: "TND",
      carrier: "poste",
      carrierLabel: "Poste tunisienne",
      totalWeightGrams: weight,
      deliveryDt: invalidWeight ? 0 : TUNISIA_FLAT_DT,
      needsQuote: false,
      invalidWeight,
    };
  }

  const aramex = isEuropeMaghreb(iso);
  const carrier: ShippingCarrier = aramex ? "aramex" : "dhl";
  const carrierLabel = aramex ? "Aramex" : "DHL";
  const needsQuote = !invalidWeight && weight > MAX_AUTO_WEIGHT_G;
  const fee = needsQuote || invalidWeight ? 0 : bandFee(weight, aramex ? ARAMEX_DT : DHL_DT) || 0;

  return {
    country: iso,
    knownCountry,
    currency,
    carrier: needsQuote ? "quote" : carrier,
    carrierLabel: needsQuote ? "Livraison sur devis" : carrierLabel,
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
  if (!currency || currency === "TND") {
    return { amount: amountDt, converted: false };
  }
  const rate = rates?.[currency];
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    return { amount: amountDt, converted: false };
  }
  return { amount: amountDt * rate, converted: true };
}

export function formatMoney(amount: number, currency: string) {
  const code = currency || "TND";
  if (code === "TND") return `${Math.round(amount)} DT`;
  const symbol = CURRENCY_SYMBOLS[code] || code;
  const rounded =
    code === "JPY" || code === "KRW" || code === "XOF" || code === "XAF"
      ? Math.round(amount)
      : Math.round(amount * 100) / 100;
  const formatted =
    Number.isInteger(rounded) && (code === "JPY" || code === "KRW" || code === "XOF" || code === "XAF")
      ? String(rounded)
      : rounded.toFixed(2);
  if (symbol === "€") return `${formatted} €`;
  if (symbol === "$" || symbol === "£") return `${symbol}${formatted}`;
  return `${formatted} ${symbol}`;
}

export function displayPrice(
  amountDt: number,
  currency: string,
  rates: Record<string, number> | null | undefined,
) {
  const code = currency || "TND";
  const converted = convertFromTnd(amountDt, code, rates);
  const showFx = code !== "TND" && converted.converted;
  return {
    primary: formatMoney(showFx ? converted.amount : amountDt, showFx ? code : "TND"),
    approxDt: showFx ? formatMoney(amountDt, "TND") : null,
    converted: showFx,
    currency: showFx ? code : "TND",
  };
}
