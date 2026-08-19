import { apiUrl } from "./api";

export const WHOLESALE_MIN_QTY = 10;

export type WholesaleItem = {
  productId: string;
  name: string;
  image: string;
  qty: number;
  retailPrice: number;
};

export type WholesaleStatus =
  | "nouveau"
  | "rappele"
  | "negociation"
  | "conclu"
  | "annule";

export type WholesaleRequest = {
  id: string;
  createdAt: string;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  gouvernorat: string;
  city: string;
  message: string;
  items: WholesaleItem[];
  totalQty: number;
  retailTotal: number;
  status: WholesaleStatus | string;
  staffNote: string;
};

export const wholesaleStatusLabels: Record<string, string> = {
  nouveau: "À rappeler",
  rappele: "Rappelé",
  negociation: "En négociation",
  conclu: "Conclu",
  annule: "Annulé",
};

export type WholesaleRequestBody = {
  company: string;
  contactName: string;
  phone: string;
  email?: string;
  gouvernorat?: string;
  city?: string;
  message?: string;
  items: { productId: string; qty: number }[];
};

export async function createWholesaleRequest(body: WholesaleRequestBody) {
  const res = await fetch(apiUrl("/wholesale/requests"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || "Demande refusée";
    throw new Error(message);
  }
  return res.json() as Promise<WholesaleRequest>;
}

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function whatsappForPhone(phone: string, message: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  const international = digits.startsWith("216") ? digits : `216${digits}`;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}
