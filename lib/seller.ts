import { apiUrl } from "./api";

const TOKEN = "kicks-staff-token";
const USER = "kicks-staff-user";

export type StaffRole = "admin" | "vendeur";

export type StaffUser = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  active?: boolean;
  createdAt?: string;
};

export function getSellerToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(TOKEN) || "";
}

export function getSellerUser(): StaffUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as StaffUser) : null;
  } catch {
    return null;
  }
}

export function isAdmin() {
  return getSellerUser()?.role === "admin";
}

function setSession(token: string, user: StaffUser) {
  sessionStorage.setItem(TOKEN, token);
  sessionStorage.setItem(USER, JSON.stringify(user));
}

export function clearSellerSession() {
  sessionStorage.removeItem(TOKEN);
  sessionStorage.removeItem(USER);
}

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getSellerToken()}` };
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
  paymentStatus?: string;
  payUrl?: string;
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
  featured: boolean;
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
  const sameOrigin = path === "/seller/site" || path.startsWith("/seller/site?");
  const res = await fetch(sameOrigin ? `/api${path}` : apiUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchSetupNeeded() {
  const res = await fetch(apiUrl("/auth/setup"), { cache: "no-store" });
  if (!res.ok) return { needed: false };
  return res.json() as Promise<{ needed: boolean }>;
}

export async function createFirstAdmin(name: string, email: string, password: string) {
  const res = await fetch(apiUrl("/auth/setup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) await parseError(res);
  const data = (await res.json()) as { token: string; user: StaffUser };
  setSession(data.token, data.user);
  return data.user;
}

export async function importProductsCsv(products: unknown[]) {
  return sellerRequest<{
    created: number;
    products: SellerProduct[];
    errors: { index: number; name: string; message: string }[];
  }>("/seller/products/import", {
    method: "POST",
    body: JSON.stringify({ products }),
  });
}

export async function sellerLogin(email: string, password: string) {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) await parseError(res);
  const data = (await res.json()) as { token: string; user: StaffUser };
  setSession(data.token, data.user);
  return data.user;
}

export async function fetchStaffMe() {
  const res = await fetch(apiUrl("/auth/me"), {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) await parseError(res);
  const user = (await res.json()) as StaffUser;
  sessionStorage.setItem(USER, JSON.stringify(user));
  return user;
}

export async function sellerUploadImage(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(apiUrl("/seller/uploads"), {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<{ url: string }>;
}
