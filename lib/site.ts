export type SiteHome = {
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  coverImages: string[];
};

export const defaultSite: SiteHome = {
  heroKicker: "Collection",
  heroTitle: "CUIR PREMIUM",
  heroSubtitle: "L'élégance du cuir, pensée pour la ville et la cérémonie.",
  coverImages: [
    "/chaussures/hero-oxford.jpg",
    "/chaussures/hero-navy.jpg",
    "/chaussures/hero-mocassin.jpg",
    "/chaussures/hero-bottine.jpg",
    "/chaussures/hero-sandale.jpg",
  ],
};
