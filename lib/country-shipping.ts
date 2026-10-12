import { COUNTRY_LIST } from "./country-list";
import { LOCAL_DELIVERY_TND } from "./shipping-config";
export const SHIPPING_CARRIERS = ["LA_POSTE", "ARAMEX"] as const;
export type ShippingCarrier = (typeof SHIPPING_CARRIERS)[number];
export type CountryRate = {
  id: string;
  countryCode: string;
  countryName: string;
  carrier: ShippingCarrier;
  enabled: boolean;
  basePriceTND: number;
  weightIncludedKg: number;
  pricePerExtraKgTND: number;
  weightStepKg: number;
  maxWeightKg: number;
  estimated: boolean;
  updatedAt?: string;
};
const MAGHREB = ["MA", "DZ", "LY", "MR"];
const EUROPE = [
  "AL",
  "AD",
  "AT",
  "BY",
  "BE",
  "BA",
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
  "IS",
  "IE",
  "IT",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "MD",
  "MC",
  "ME",
  "NL",
  "MK",
  "NO",
  "PL",
  "PT",
  "RO",
  "RU",
  "SM",
  "RS",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "UA",
  "GB",
  "VA",
  "AX",
  "FO",
  "GI",
  "GG",
  "IM",
  "JE",
];
const ARAB = [
  "AE",
  "SA",
  "QA",
  "KW",
  "BH",
  "OM",
  "JO",
  "LB",
  "IQ",
  "EG",
  "PS",
  "YE",
  "SY",
  "SD",
  "SO",
  "DJ",
  "KM",
];
const NORTH_AMERICA = ["US", "CA", "MX"];
export function estimatedCountryRate(
  countryCode: string,
  carrier: ShippingCarrier,
): CountryRate {
  const country = COUNTRY_LIST.find((c) => c.code === countryCode);
  if (!country) throw new Error("Pays inconnu");
  // Starter estimates, NOT carrier quotations. Admin can override every country separately.
  let base = 40,
    included = 2,
    extra = 10,
    step = 1;
  if (carrier === "LA_POSTE") {
    if (MAGHREB.includes(countryCode)) {
      base = 19;
      extra = 4;
    } else if (EUROPE.includes(countryCode) || ARAB.includes(countryCode)) {
      base = 29;
      extra = 4;
    }
  } else {
    included = 0.5;
    step = 0.5;
    if (MAGHREB.includes(countryCode)) {
      base = 40;
      extra = 12;
    } else if (EUROPE.includes(countryCode)) {
      base = 90;
      extra = 20;
    } else if (ARAB.includes(countryCode) || countryCode === "TR") {
      base = 65;
      extra = 18;
    } else if (NORTH_AMERICA.includes(countryCode)) {
      base = 100;
      extra = 28;
    } else {
      base = 120;
      extra = 32;
    }
  }
  if (countryCode === "TN") {
    base = LOCAL_DELIVERY_TND;
    included = 0;
    extra = 0;
    step = 0;
  }
  return {
    id: `${carrier}:${countryCode}`,
    countryCode,
    countryName: country.name,
    carrier,
    enabled: true,
    basePriceTND: base,
    weightIncludedKg: included,
    pricePerExtraKgTND: extra,
    weightStepKg: step,
    maxWeightKg: 30,
    estimated: countryCode !== "TN",
  };
}
export function allEstimatedRates() {
  return COUNTRY_LIST.flatMap((c) =>
    SHIPPING_CARRIERS.map((carrier) => estimatedCountryRate(c.code, carrier)),
  );
}
