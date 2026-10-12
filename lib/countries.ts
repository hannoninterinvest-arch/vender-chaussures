import { COUNTRY_LIST } from "./country-list";
export type CountryOption = {
  code: string;
  name: string;
};

export const COUNTRIES: CountryOption[] = [...COUNTRY_LIST];

const COUNTRY_CURRENCY: Record<string, string> = {
  TN: "TND",
  FR: "EUR",
  BE: "EUR",
  DE: "EUR",
  IT: "EUR",
  ES: "EUR",
  PT: "EUR",
  NL: "EUR",
  LU: "EUR",
  AT: "EUR",
  IE: "EUR",
  FI: "EUR",
  GR: "EUR",
  CH: "CHF",
  GB: "GBP",
  US: "USD",
  CA: "CAD",
  MA: "MAD",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
  AU: "AUD",
  JP: "JPY",
};

/** Repli si l’API de change est indisponible — 1 TND → devise. */
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
};

export function currencyForCountry(country: string): string {
  const code = (country || "TN").toUpperCase();
  return COUNTRY_CURRENCY[code] || "USD";
}

export function isTunisia(country: string): boolean {
  const raw = (country || "").trim().toUpperCase();
  return raw === "TN" || raw === "TUNISIE" || raw === "TUNISIA";
}

export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

export function formatConvertedPrice(
  amountInTnd: number,
  currency: string,
  rateFromTnd: number,
) {
  const amount = Number(amountInTnd) * (Number(rateFromTnd) || 1);
  if (currency === "TND") {
    return `${amount.toLocaleString("fr-TN", { maximumFractionDigits: 2 })} DT`;
  }
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
