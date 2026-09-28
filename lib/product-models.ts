import type { ColorOption } from "@/lib/product-media";
import { findColor } from "@/lib/product-media";

const PLACEHOLDER_GLB = "/models/elvaro-shoe.glb";

export function isGlbUrl(src?: string | null) {
  if (!src) return false;
  return /\.glb(\?|#|$)/i.test(src) || src.startsWith("/models/");
}

function isPlaceholderGlb(url: string) {
  return url.split(/[?#]/)[0] === PLACEHOLDER_GLB;
}

export function colorSlug(name?: string | null) {
  const slug = (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "couleur";
}

type GlbProduct = {
  id: string;
  model?: string | null;
  colors?: ColorOption[];
};

export function glbCandidates(product?: GlbProduct | null, colorName?: string | null) {
  if (!product) return [];
  const color = findColor({ images: [], colors: product.colors || [] }, colorName);
  const urls: string[] = [];
  const push = (raw?: string | null) => {
    const url = raw?.trim() || "";
    if (!url || !isGlbUrl(url) || isPlaceholderGlb(url) || urls.includes(url)) return;
    urls.push(url);
  };
  push(color?.model);
  if (color?.name) push(`/models/${product.id}-${colorSlug(color.name)}.glb`);
  push(product.model);
  push(`/models/${product.id}.glb`);
  return urls;
}

const existsCache = new Map<string, boolean>();
const pending = new Map<string, Promise<boolean>>();

export async function glbFileExists(url: string): Promise<boolean> {
  const cached = existsCache.get(url);
  if (cached !== undefined) return cached;
  const inflight = pending.get(url);
  if (inflight) return inflight;

  const check = (async () => {
    try {
      const head = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (head.ok) return true;
      if (head.status === 405 || head.status === 501) {
        const ranged = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: { Range: "bytes=0-16" },
        });
        return ranged.ok;
      }
      return false;
    } catch {
      return false;
    }
  })();

  pending.set(url, check);
  const ok = await check;
  pending.delete(url);
  existsCache.set(url, ok);
  return ok;
}

export async function resolveExistingGlb(product?: GlbProduct | null, colorName?: string | null) {
  for (const url of glbCandidates(product, colorName)) {
    if (await glbFileExists(url)) return url;
  }
  return "";
}

/** Maps boutique colors onto glTF material variants when one file serves every color. */
export function variantForColor(colorName?: string | null) {
  const n = (colorName || "").toLowerCase();
  if (/noir|navy|chocolat|tabac|bordeaux/.test(n)) return "Midnight";
  if (/or|cr[eè]me|ivoire|nude|camel|fauve|daim|blanc/.test(n)) return "Beach";
  return "Street";
}
