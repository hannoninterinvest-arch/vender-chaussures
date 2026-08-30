const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)(\?|#|$)/i;

export type CoverSlide = {
  type: "image" | "video";
  url: string;
};

export function isVideoUrl(url: string | null | undefined) {
  if (!url) return false;
  if (VIDEO_EXT.test(url)) return true;
  if (/\/video\/upload\//i.test(url)) return true;
  return false;
}

export function isImageUrl(url: string | null | undefined) {
  if (!url) return false;
  if (isVideoUrl(url)) return false;
  if (IMAGE_EXT.test(url)) return true;
  if (/\/image\/upload\//i.test(url)) return true;
  return Boolean(url.trim());
}

export function mediaType(url: string): CoverSlide["type"] {
  return isVideoUrl(url) ? "video" : "image";
}

export function toCoverSlides(urls: string[] = []): CoverSlide[] {
  return urls.filter(Boolean).map((url) => ({ type: mediaType(url), url }));
}

/** Cloudinary poster frame for a product 3D video. */
export function videoPoster(url: string, fallback = "") {
  if (!url) return fallback;
  if (/\/video\/upload\//i.test(url)) {
    return url
      .replace("/video/upload/", "/video/upload/so_0/")
      .replace(/\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i, ".jpg$2");
  }
  return fallback;
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/x-m4v";
export const MEDIA_ACCEPT = `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`;
