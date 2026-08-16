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
    "/chaussures/oxford-noir.jpg",
    "/chaussures/mocassin-cuir.jpg",
    "/chaussures/pexels-marron.jpg",
    "/chaussures/richelieu-carreaux.jpg",
    "/chaussures/oxford-noir-pair.jpg",
  ],
};
