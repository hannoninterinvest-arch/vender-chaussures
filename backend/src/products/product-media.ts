import { BadRequestException } from '@nestjs/common';

export const PHOTOS_PER_COLOR = 5;

export type ColorMedia = {
  name: string;
  hex: string;
  image?: string;
  images?: string[];
};

function uniq(urls: string[]) {
  return [...new Set(urls.map((src) => src.trim()).filter(Boolean))];
}

export function colorPhotoList(color: ColorMedia, fallback = ''): string[] {
  const listed = uniq([color.image || '', ...(color.images || [])]);
  if (!listed.length && fallback) listed.push(fallback);
  return listed.slice(0, PHOTOS_PER_COLOR);
}

/** True when every photo is one of the bundled catalog files rather than a
 *  Cloudinary upload made from the dashboard. */
export function isSeedMedia(images: string[] = []) {
  return images.length > 0 && images.every((src) => src.startsWith('/chaussures/'));
}

export function hydrateColors(colors: ColorMedia[] = [], images: string[] = []): ColorMedia[] {
  return colors.map((color, index) => {
    const photos = colorPhotoList(color, images[index] || images[0] || '');
    return {
      name: String(color.name || '').trim() || 'Noir',
      hex: String(color.hex || '#1A1612'),
      image: photos[0] || '',
      images: photos.slice(1),
    };
  });
}

export function mergeGallery(colors: ColorMedia[], images: string[] = []) {
  return uniq([...colors.flatMap((color) => colorPhotoList(color)), ...images]);
}

export function attachProductMedia(colors: ColorMedia[] = [], images: string[] = []) {
  for (const color of colors) {
    const count = uniq([color.image || '', ...(color.images || [])]).length;
    if (count > PHOTOS_PER_COLOR) {
      throw new BadRequestException('Maximum 5 photos par couleur');
    }
  }
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
