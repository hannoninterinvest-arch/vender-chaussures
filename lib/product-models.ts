export const DEFAULT_SHOE_GLB = "/models/elvaro-shoe.glb";

export function isGlbUrl(src?: string | null) {
  if (!src) return false;
  return /\.glb(\?|#|$)/i.test(src) || src.startsWith("/models/");
}

/** Maps boutique colors onto the Khronos shoe material variants. */
export function variantForColor(colorName?: string | null) {
  const n = (colorName || "").toLowerCase();
  if (/noir|navy|chocolat|tabac|bordeaux/.test(n)) return "Midnight";
  if (/or|cr[eè]me|ivoire|nude|camel|fauve|daim|blanc/.test(n)) return "Beach";
  return "Street";
}
