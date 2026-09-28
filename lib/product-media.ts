export const PHOTOS_PER_COLOR = 5;

export type ColorOption = {
  name: string;
  hex: string;
  image?: string;
  images?: string[];
  model?: string;
};

type MediaProduct = {
  images: string[];
  colors: ColorOption[];
};

export function uniqPhotos(urls: (string | undefined | null)[]) {
  return [...new Set(urls.map((src) => (src || "").trim()).filter(Boolean))];
}

export function colorPhotos(color: ColorOption): string[] {
  return uniqPhotos([color.image, ...(color.images || [])]).slice(0, PHOTOS_PER_COLOR);
}

export function findColor(product: MediaProduct, colorName?: string | null) {
  if (!colorName) return product.colors[0];
  const key = colorName.toLowerCase();
  return product.colors.find((c) => c.name.toLowerCase() === key) ?? product.colors[0];
}

export function colorImage(
  product: MediaProduct,
  colorName?: string | null,
): string {
  const fallback = product.images[0] ?? "";
  const match = findColor(product, colorName);
  if (!match) return fallback;
  return colorPhotos(match)[0] || fallback;
}

/** Photos de la couleur choisie seulement — 4 ou 5 vues, pas celles des autres teintes. */
export function galleryForColor(
  product: MediaProduct,
  colorName?: string | null,
): string[] {
  const match = findColor(product, colorName);
  const own = match ? colorPhotos(match) : [];
  if (own.length) return own;
  const primary = colorImage(product, colorName);
  return primary ? [primary] : [];
}

export function withColorImages<T extends MediaProduct>(product: T): T {
  const colors = product.colors.map((color, index) => {
    const listed = colorPhotos(color);
    const photos = listed.length
      ? listed
      : uniqPhotos([product.images[index] || product.images[0]]).slice(0, PHOTOS_PER_COLOR);
    return {
      ...color,
      image: photos[0],
      images: photos.slice(1),
    };
  });
  const images = uniqPhotos([
    ...colors.flatMap((color) => colorPhotos(color)),
    ...product.images,
  ]);
  return { ...product, colors, images };
}
