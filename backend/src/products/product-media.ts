import { BadRequestException } from '@nestjs/common';

export type ColorMedia = { name: string; hex: string; image?: string };

/** True when every photo is one of the bundled catalog files rather than a
 *  Cloudinary upload made from the dashboard. */
export function isSeedMedia(images: string[] = []) {
  return images.length > 0 && images.every((src) => src.startsWith('/chaussures/'));
}

export function hydrateColors(colors: ColorMedia[] = [], images: string[] = []): ColorMedia[] {
  return colors.map((color, index) => ({
    name: String(color.name || '').trim() || 'Noir',
    hex: String(color.hex || '#1A1612'),
    image: String(color.image || images[index] || images[0] || '').trim(),
  }));
}

export function mergeGallery(colors: ColorMedia[], images: string[] = []) {
  return [
    ...new Set(
      [...colors.map((color) => color.image || ''), ...images]
        .map((src) => src.trim())
        .filter(Boolean),
    ),
  ];
}

export function attachProductMedia(colors: ColorMedia[] = [], images: string[] = []) {
  const nextColors = hydrateColors(colors, images);
  const gallery = mergeGallery(nextColors, images);
  if (nextColors.some((color) => !color.image)) {
    throw new BadRequestException('Chaque couleur doit avoir une photo');
  }
  if (!gallery.length) {
    throw new BadRequestException('Ajoute au moins une photo');
  }
  return { colors: nextColors, images: gallery };
}
