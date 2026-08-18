export type ColorOption = { name: string; hex: string; image?: string };

type MediaProduct = {
  images: string[];
  colors: ColorOption[];
};

export function colorImage(
  product: MediaProduct,
  colorName?: string | null,
): string {
  const fallback = product.images[0] ?? "";
  if (!colorName) return fallback;
  const index = product.colors.findIndex(
    (c) => c.name.toLowerCase() === colorName.toLowerCase(),
  );
  if (index < 0) return fallback;
  const match = product.colors[index];
  return match.image || product.images[index] || fallback;
}

export function galleryForColor(
  product: MediaProduct,
  colorName?: string | null,
): string[] {
  const primary = colorImage(product, colorName);
  const rest = product.images.filter((src) => src !== primary);
  return primary ? [primary, ...rest] : rest;
}

export function withColorImages<T extends MediaProduct>(product: T): T {
  const colors = product.colors.map((color, index) => ({
    ...color,
    image: color.image || product.images[index] || product.images[0],
  }));
  const extra = colors.map((c) => c.image).filter((src): src is string => Boolean(src));
  const images = [...new Set([...extra, ...product.images])];
  return { ...product, colors, images };
}
