import { apiUrl } from "./api";

const STORAGE = "kicks-seller-key";

export function getSellerKey() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE) || "";
}

export function setSellerKey(key: string) {
  sessionStorage.setItem(STORAGE, key);
}

export function clearSellerKey() {
  sessionStorage.removeItem(STORAGE);
}

export type SellerOrder = {
  id: string;
  createdAt: string;
  status: "en_attente" | "en_livraison" | "livree" | "annulee" | string;
  subtotal: number;
  delivery: number;
  total: number;
  payment: string;
  paymentPhone?: string;
  customer: {
    name: string;
    phone: string;
    gouvernorat: string;
    city: string;
    address: string;
    notes: string;
  };
  items: {
    productId: string;
    name: string;
    image: string;
    size: number;
    color: string;
    qty: number;
    price: number;
  }[];
};

export type SellerStats = {
  orders: number;
  pending: number;
  delivered: number;
  cancelled: number;
  revenue: number;
  cost: number;
  profit: number;
  bestProduct: {
    productId: string;
    name: string;
    image: string;
    qty: number;
    revenue: number;
    profit: number;
  } | null;
  topProducts: {
    productId: string;
    name: string;
    image: string;
    qty: number;
    revenue: number;
    profit: number;
  }[];
};

export type SellerProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  cost: number;
  description: string;
  gender: "homme" | "femme" | "unisexe";
  category: string;
  isNew: boolean;
  colors: { name: string; hex: string }[];
  sizes: number[];
  images: string[];
};

export type SellerCategory = { id: string; label: string; image: string };

async function parseError(res: Response) {
  const err = await res.json().catch(() => ({}));
  const message = Array.isArray(err.message)
    ? err.message.join(", ")
    : err.message || "Requête vendeur refusée";
  throw new Error(message);
}

export async function sellerRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-seller-key": getSellerKey(),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function sellerLogin(key: string) {
  const res = await fetch(apiUrl("/seller/session"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) await parseError(res);
  setSellerKey(key);
  return res.json();
}

export async function sellerUploadImage(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(apiUrl("/seller/uploads"), {
    method: "POST",
    headers: { "x-seller-key": getSellerKey() },
    body,
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<{ url: string }>;
}
