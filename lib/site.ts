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
    "/chaussures/elvaro-mocassins-noirs.webp",
    "/chaussures/elvaro-bottines-chelsea-noires.webp",
    "/chaussures/elvaro-ballerines-marron.webp",
    "/chaussures/elvaro-bottes-hautes-noires.webp",
    "/chaussures/elvaro-bottines-marron-femme.webp",
    "/chaussures/elvaro-baskets-marron-homme.webp",
  ],
};
