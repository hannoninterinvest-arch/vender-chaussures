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

function setSession(user: StaffUser) {
  sessionStorage.removeItem(TOKEN);
  sessionStorage.setItem(USER, JSON.stringify(user));
}

export async function clearSellerSession() {
  const res = await fetch(apiUrl("/auth/logout"), { method: "POST" });
  if (!res.ok) throw new Error("Déconnexion impossible");
  sessionStorage.removeItem(TOKEN);
  sessionStorage.removeItem(USER);
}


export type SellerOrder = {
  id: string;
  createdAt: string;
  status: "en_attente" | "en_livraison" | "livree" | "annulee" | string;
  subtotal: number;
  delivery: number;
  total: number;
  accessUrl?: string;
  payment: string;
  paymentPhone?: string;
  paymentStatus?: string;
  allowedStatuses?: import("./order-workflow").OrderStatus[];
  refundRequired?: boolean;
  payUrl?: string;
  carrier?: string;
  shippingZone?: string;
  customer: {
    name: string;
    phone: string;
    gouvernorat: string;
    country?: string;
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
  returned?: number;
  confirmed?: number;
  awaitingCall?: number;
  awaitingPayment?: number;
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
  promoPrice: number;
  oldPrice?: number | null;
  discount?: number;
  cost: number;
  description: string;
  gender: "homme" | "femme" | "unisexe";
  category: string;
  isNew: boolean;
  featured: boolean;
  colors: {
    name: string;
    hex: string;
    image?: string;
    images?: string[];
    model?: string;
  }[];
  sizes: number[];
  images: string[];
  model?: string;
};

export type SellerCategory = { id: string; label: string; image: string };

export const SESSION_EXPIRED_EVENT = "staff-session-expired";

export class StaffApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function parseError(res: Response): Promise<never> {
  const err = await res.json().catch(() => ({}));
  const message = Array.isArray(err.message)
    ? err.message.join(", ")
    : err.message || "Requête vendeur refusée";
  throw new StaffApiError(message, res.status);
}

export async function sellerRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status === 401 && typeof window !== "undefined") {
    sessionStorage.removeItem(USER);
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  if (!res.ok) await parseError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
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
  const data = (await res.json()) as { user: StaffUser };
  setSession(data.user);
  return data.user;
}

export async function fetchStaffMe() {
  const res = await fetch(apiUrl("/auth/me"), {
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  const user = (await res.json()) as StaffUser;
  setSession(user);
  return user;
}

async function uploadDirect(
  file: File,
  kind: "image" | "model",
): Promise<{ url: string }> {
  const maxBytes = (kind === "model" ? 20 : 6) * 1024 * 1024;
  if (!file.size || file.size > maxBytes)
    throw new Error(
      kind === "model"
        ? "Modèle trop lourd (max 20 Mo)"
        : "Image trop lourde (max 6 Mo)",
    );
  const signed = await sellerRequest<{
    cloudName: string;
    apiKey: string;
    resourceType: string;
    params: { timestamp: number; upload_preset: string; public_id: string };
    signature: string;
  }>("/seller/uploads/sign", {
    method: "POST",
    body: JSON.stringify({
      kind,
      size: file.size,
      name: file.name,
      mime: file.type,
    }),
  });
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signed.apiKey);
  body.append("signature", signed.signature);
  for (const [key, value] of Object.entries(signed.params))
    body.append(key, String(value));
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/${signed.resourceType}/upload`,
    { method: "POST", body },
  );
  const data = await res.json();
  if (!res.ok || !data.secure_url)
    throw new Error(data.error?.message || "Envoi Cloudinary impossible");
  return { url: data.secure_url };
}

export function sellerUploadGlb(file: File) {
  return uploadDirect(file, "model");
}
export function sellerUploadImage(file: File) {
  return uploadDirect(file, "image");
}
