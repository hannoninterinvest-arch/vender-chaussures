const PLACEHOLDER_GLB = "/models/elvaro-shoe.glb";

export function isGlbUrl(src?: string | null) {
  if (!src) return false;
  return /\.glb(\?|#|$)/i.test(src) || src.startsWith("/models/");
}

function isPlaceholderGlb(url: string) {
  return url.split(/[?#]/)[0] === PLACEHOLDER_GLB;
}

export function glbCandidates(product?: { id: string; model?: string | null } | null) {
  if (!product) return [];
  const listed = product.model?.trim() || "";
  const byId = `/models/${product.id}.glb`;
  const urls: string[] = [];
  if (listed && isGlbUrl(listed) && !isPlaceholderGlb(listed)) urls.push(listed);
  if (!urls.includes(byId)) urls.push(byId);
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

export async function resolveExistingGlb(
  product?: { id: string; model?: string | null } | null,
) {
  for (const url of glbCandidates(product)) {
    if (await glbFileExists(url)) return url;
  }
  return "";
}

/** Maps boutique colors onto glTF material variants when the file has them. */
export function variantForColor(colorName?: string | null) {
  const n = (colorName || "").toLowerCase();
  if (/noir|navy|chocolat|tabac|bordeaux/.test(n)) return "Midnight";
  if (/or|cr[eè]me|ivoire|nude|camel|fauve|daim|blanc/.test(n)) return "Beach";
  return "Street";
}
