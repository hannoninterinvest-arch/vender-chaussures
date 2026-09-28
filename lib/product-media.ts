import type { ColorOption } from "@/lib/products";

type MediaProduct = {
  images: string[];
  colors: ColorOption[];
};

function uniq(urls: (string | undefined)[]) {
  return [...new Set(urls.map((src) => (src || "").trim()).filter(Boolean))];
}

export function findColor(product: MediaProduct, colorName?: string | null) {
  if (!colorName) return product.colors[0];
  const key = colorName.toLowerCase();
  return product.colors.find((c) => c.name.toLowerCase() === key) ?? product.colors[0];
}

export function colorImage(product: MediaProduct, colorName?: string | null): string {
  const fallback = product.images[0] ?? "";
  const match = findColor(product, colorName);
  if (!match) return fallback;
  return match.image || match.images?.[0] || fallback;
}

/** Photos de la couleur choisie seulement — pas celles des autres teintes. */
export function galleryForColor(product: MediaProduct, colorName?: string | null): string[] {
  const match = findColor(product, colorName);
  const own = match ? uniq([match.image, ...(match.images || [])]) : [];
  if (own.length) return own;
  const covers = new Set(
    product.colors.flatMap((c) => uniq([c.image, ...(c.images || [])])),
  );
  const shared = product.images.filter((src) => !covers.has(src));
  const primary = colorImage(product, colorName);
  return uniq([primary, ...shared]);
}

export function withColorImages<T extends MediaProduct>(product: T): T {
  const colors = product.colors.map((color, index) => {
    const extras = uniq(color.images || []);
    const image = color.image || extras[0] || product.images[index] || product.images[0];
    return {
      ...color,
      image,
      images: extras.filter((src) => src !== image),
      model: color.model?.trim() || "",
    };
  });
  const extra = colors.flatMap((c) => uniq([c.image, ...(c.images || [])]));
  const images = uniq([...extra, ...product.images]);
  return { ...product, colors, images };
}
