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
  const res = await fetch(apiUrl("/products"), { cache: "no-store" });
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

export async function fetchOrder(id: string) {
  const res = await fetch(apiUrl(`/orders/${id}`), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Impossible de charger la commande");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(apiUrl("/categories"), { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de charger les catégories");
  return res.json();
}
