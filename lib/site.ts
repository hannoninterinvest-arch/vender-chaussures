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
    "/chaussures/oxford-noir-hq.jpg",
    "/chaussures/loafer-or-hq.jpg",
    "/chaussures/derby-cognac-hq.jpg",
    "/chaussures/brogue-hq.jpg",
    "/chaussures/sandale-hq.jpg",
  ],
};
