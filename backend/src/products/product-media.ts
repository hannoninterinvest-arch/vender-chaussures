import { BadRequestException } from '@nestjs/common';

export type ColorMedia = {
  name: string;
  hex: string;
  image?: string;
  images?: string[];
  model?: string;
};

function uniq(urls: (string | undefined)[]) {
  return [...new Set(urls.map((src) => (src || '').trim()).filter(Boolean))];
}

/** True when every photo is one of the bundled catalog files rather than a
 *  Cloudinary upload made from the dashboard. */
export function isSeedMedia(images: string[] = []) {
  return (
    images.length > 0 &&
    images.every((src) => src.startsWith('/chaussures/') || src.startsWith('/accessoires/'))
  );
}

export function hydrateColors(colors: ColorMedia[] = [], images: string[] = []): ColorMedia[] {
  return colors.map((color, index) => {
    const extras = uniq(color.images || []);
    const image = String(color.image || extras[0] || images[index] || images[0] || '').trim();
    return {
      name: String(color.name || '').trim() || 'Noir',
      hex: String(color.hex || '#1A1612'),
      image,
      images: extras.filter((src) => src !== image),
      model: String(color.model || '').trim(),
    };
  });
}

export function mergeGallery(colors: ColorMedia[], images: string[] = []) {
  return uniq([
    ...colors.flatMap((color) => [color.image, ...(color.images || [])]),
    ...images,
  ]);
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
