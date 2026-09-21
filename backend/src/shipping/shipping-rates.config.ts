/**
 * Tarifs de départ — ESTIMATIONS à valider auprès d’Aramex / La Poste.
 * Les valeurs réellement utilisées au runtime viennent de la table `shipping_rates`.
 * Ce fichier ne sert qu’au seed initial et à la cartographie pays → zone.
 */

export const SHIPPING_CARRIERS = ['ARAMEX', 'LA_POSTE'] as const;
export type ShippingCarrier = (typeof SHIPPING_CARRIERS)[number];

export const SHIPPING_ZONES = [
  'TUNISIE',
  'MAGHREB',
  'EUROPE',
  'MOYEN_ORIENT',
  'AMERIQUE_NORD',
  'RESTE_MONDE',
] as const;
export type ShippingZone = (typeof SHIPPING_ZONES)[number];

/** Poids moyen estimé d’une paire (boîte comprise). À ajuster si le catalogue a un vrai poids. */
export const PAIR_WEIGHT_KG = 0.8;

export type InternationalRate = {
  basePriceTND: number;
  weightIncludedKg: number;
  pricePerExtraKgTND: number;
};

export const DEFAULT_SHIPPING_RATES = {
  LOCAL: {
    ARAMEX: { flatPriceTND: 10 }, // estimation moyenne 8-12 DT
    LA_POSTE: { flatPriceTND: 7.5 }, // estimation moyenne 6-9 DT
  },
  INTERNATIONAL: {
    ARAMEX: {
      MAGHREB: { basePriceTND: 40, weightIncludedKg: 0.5, pricePerExtraKgTND: 12 },
      EUROPE: { basePriceTND: 90, weightIncludedKg: 0.5, pricePerExtraKgTND: 20 },
      MOYEN_ORIENT: { basePriceTND: 65, weightIncludedKg: 0.5, pricePerExtraKgTND: 18 },
      AMERIQUE_NORD: { basePriceTND: 100, weightIncludedKg: 0.5, pricePerExtraKgTND: 28 },
      RESTE_MONDE: { basePriceTND: 120, weightIncludedKg: 0.5, pricePerExtraKgTND: 32 },
    },
    LA_POSTE: {
      MAGHREB: { basePriceTND: 30, weightIncludedKg: 1, pricePerExtraKgTND: 6 },
      EUROPE: { basePriceTND: 45, weightIncludedKg: 1, pricePerExtraKgTND: 10 },
      MOYEN_ORIENT: { basePriceTND: 45, weightIncludedKg: 1, pricePerExtraKgTND: 10 },
      AMERIQUE_NORD: { basePriceTND: 60, weightIncludedKg: 1, pricePerExtraKgTND: 14 },
      RESTE_MONDE: { basePriceTND: 70, weightIncludedKg: 1, pricePerExtraKgTND: 16 },
    },
  },
} as const;

const MAGHREB = ['MA', 'DZ', 'LY', 'MR'];
const EUROPE = [
  'FR', 'BE', 'DE', 'IT', 'ES', 'PT', 'NL', 'LU', 'AT', 'IE', 'FI', 'GR',
  'SE', 'DK', 'NO', 'CH', 'GB', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR',
  'SI', 'EE', 'LV', 'LT', 'CY', 'MT', 'IS', 'LI', 'MC', 'AD', 'SM', 'VA',
];
const MOYEN_ORIENT = [
  'AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IQ', 'EG', 'IL', 'PS', 'TR', 'YE', 'SY',
];
const AMERIQUE_NORD = ['US', 'CA', 'MX'];

const COUNTRY_ALIASES: Record<string, string> = {
  tunisie: 'TN',
  tunisia: 'TN',
  tunis: 'TN',
  france: 'FR',
  belgique: 'BE',
  belgium: 'BE',
  allemagne: 'DE',
  germany: 'DE',
  italie: 'IT',
  italy: 'IT',
  espagne: 'ES',
  spain: 'ES',
  'etats-unis': 'US',
  'états-unis': 'US',
  usa: 'US',
  'united states': 'US',
  canada: 'CA',
  maroc: 'MA',
  morocco: 'MA',
  algerie: 'DZ',
  algérie: 'DZ',
  algeria: 'DZ',
  libye: 'LY',
  'emirats arabes unis': 'AE',
  uae: 'AE',
  'royaume-uni': 'GB',
  'united kingdom': 'GB',
  uk: 'GB',
};

export function normalizeCountryCode(country: string): string {
  const raw = (country ?? '').trim();
  if (!raw) return 'TN';
  if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase();
  const key = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (COUNTRY_ALIASES[key]) return COUNTRY_ALIASES[key];
  if (/^[a-z]{3}$/i.test(raw) && raw.toUpperCase() === 'TUN') return 'TN';
  return raw.toUpperCase().slice(0, 2);
}

export function isTunisia(country: string): boolean {
  return normalizeCountryCode(country) === 'TN';
}

export function zoneForCountry(country: string): ShippingZone {
  const code = normalizeCountryCode(country);
  if (code === 'TN') return 'TUNISIE';
  if (MAGHREB.includes(code)) return 'MAGHREB';
  if (EUROPE.includes(code)) return 'EUROPE';
  if (MOYEN_ORIENT.includes(code)) return 'MOYEN_ORIENT';
  if (AMERIQUE_NORD.includes(code)) return 'AMERIQUE_NORD';
  return 'RESTE_MONDE';
}

export type ShippingRateSeed = {
  carrier: ShippingCarrier;
  zone: ShippingZone;
  isLocal: boolean;
  basePriceTND: number;
  weightIncludedKg: number;
  pricePerExtraKgTND: number;
};

export function defaultShippingRateSeeds(): ShippingRateSeed[] {
  const rows: ShippingRateSeed[] = [
    {
      carrier: 'ARAMEX',
      zone: 'TUNISIE',
      isLocal: true,
      basePriceTND: DEFAULT_SHIPPING_RATES.LOCAL.ARAMEX.flatPriceTND,
      weightIncludedKg: 0,
      pricePerExtraKgTND: 0,
    },
    {
      carrier: 'LA_POSTE',
      zone: 'TUNISIE',
      isLocal: true,
      basePriceTND: DEFAULT_SHIPPING_RATES.LOCAL.LA_POSTE.flatPriceTND,
      weightIncludedKg: 0,
      pricePerExtraKgTND: 0,
    },
  ];

  for (const carrier of SHIPPING_CARRIERS) {
    const table = DEFAULT_SHIPPING_RATES.INTERNATIONAL[carrier];
    for (const zone of Object.keys(table) as Array<keyof typeof table>) {
      const rate = table[zone];
      rows.push({
        carrier,
        zone: zone as ShippingZone,
        isLocal: false,
        basePriceTND: rate.basePriceTND,
        weightIncludedKg: rate.weightIncludedKg,
        pricePerExtraKgTND: rate.pricePerExtraKgTND,
      });
    }
  }
  return rows;
}
