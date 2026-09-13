function normalizeApiBase(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

const API = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_URL ?? "https://vender-chaussures.onrender.com/api",
);

export function apiUrl(path: string) {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${API}${suffix}`;
}

export async function fetchProducts() {
  const res = await fetch(apiUrl("/products"), { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error("Impossible de charger les produits");
  return res.json();
}

export async function fetchProduct(id: string) {
  const res = await fetch(apiUrl(`/products/${id}`), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Impossible de charger le produit");
  return res.json();
}

export async function createOrder(body: unknown) {
  const res = await fetch(apiUrl("/orders"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || "Commande refusée";
    throw new Error(message);
  }
  return res.json();
}

export async function retryOrderPayment(id: string) {
  const res = await fetch(apiUrl(`/orders/${id}/pay`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || "Paiement impossible";
    throw new Error(message);
  }
  return res.json() as Promise<{ payUrl?: string; id: string }>;
}

export async function fetchSite() {
  const res = await fetch("/api/site", { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de charger la vitrine");
  return res.json() as Promise<{
    heroKicker: string;
    heroTitle: string;
    heroSubtitle: string;
    coverImages: string[];
  }>;
}

export async function fetchPaymentsConfig() {
  const res = await fetch(apiUrl("/payments/config"), { cache: "no-store" });
  if (!res.ok) return { online: false };
  return res.json() as Promise<{ online: boolean }>;
}

export async function fetchGeoCountry() {
  const res = await fetch(apiUrl("/geo"), { cache: "no-store", signal: AbortSignal.timeout(4000) });
  if (!res.ok) return { country: "TN" as const, source: "default" };
  return res.json() as Promise<{ country?: string; source?: string }>;
}

export async function fetchFxRates() {
  const res = await fetch(apiUrl("/fx"), { cache: "no-store", signal: AbortSignal.timeout(4000) });
  if (!res.ok) {
    return { available: false, base: "TND" as const, rates: { TND: 1 }, fetchedAt: null };
  }
  return res.json() as Promise<{
    available: boolean;
    base: "TND";
    rates: Record<string, number>;
    fetchedAt: string | null;
  }>;
}

export async function fetchOrder(id: string) {
  const res = await fetch(apiUrl(`/orders/${id}`), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Impossible de charger la commande");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(apiUrl("/categories"), { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error("Impossible de charger les catégories");
  return res.json();
}
