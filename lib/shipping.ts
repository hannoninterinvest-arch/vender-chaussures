import { apiUrl } from "./api";

export const PAIR_WEIGHT_KG = 0.8;

export type ShippingCarrier = "ARAMEX" | "LA_POSTE";

export const SHIPPING_CARRIERS: { id: ShippingCarrier; label: string; hint: string }[] = [
  { id: "LA_POSTE", label: "La Poste", hint: "Souvent le plus économique à l’international." },
  { id: "ARAMEX", label: "Aramex", hint: "Délais plus courts, tarif un peu plus élevé." },
];

export type ShippingQuote = {
  price: number;
  currency: "TND";
  country: string;
  carrier: ShippingCarrier;
  zone: string;
  isLocal: boolean;
  weightKg: number;
};

export async function calculateShipping(body: {
  country: string;
  carrier: ShippingCarrier;
  weightKg: number;
}): Promise<ShippingQuote> {
  const res = await fetch(apiUrl("/shipping/calculate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || "Calcul de livraison impossible";
    throw new Error(message);
  }
  return res.json() as Promise<ShippingQuote>;
}

export function cartWeightKg(qty: number) {
  return Math.round(PAIR_WEIGHT_KG * qty * 100) / 100;
}
