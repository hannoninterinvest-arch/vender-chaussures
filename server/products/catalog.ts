export type Gender = "homme" | "femme" | "unisexe";
export type Category = "ville" | "ceremonie" | "mocassins" | "bottes" | "femme";

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  gender: Gender;
  category: Category;
  isNew: boolean;
  featured?: boolean;
  colors: { name: string; hex: string; image?: string; images?: string[] }[];
  sizes: number[];
  images: string[];
};

const shot = (file: string) => `/chaussures/${file}`;

export const legacyHomepageCovers = [
  shot("hero-oxford.jpg"),
  shot("hero-navy.jpg"),
  shot("hero-mocassin.jpg"),
  shot("hero-bottine.jpg"),
  shot("hero-sandale.jpg"),
];

export const homepageCovers = [
  shot("elvaro-mocassins-noirs.webp"),
  shot("elvaro-bottines-chelsea-noires.webp"),
  shot("elvaro-ballerines-marron.webp"),
  shot("elvaro-bottes-hautes-noires.webp"),
  shot("elvaro-bottines-marron-femme.webp"),
  shot("elvaro-baskets-marron-homme.webp"),
];

const catalogSeed: CatalogProduct[] = [
  {
    id: "oxford-noir",
    name: "Oxford Noir Cap-Toe",
    brand: "ELVARO",
    price: 489,
    description:
      "Richelieu cap-toe en cuir noir lustré. Semelle Goodyear, finitions atelier — la paire de cérémonie et de bureau.",
    gender: "homme",
    category: "ceremonie",
    isNew: true,
    featured: true,
    colors: [
      { name: "Noir", hex: "#141210", image: shot("elvaro-mocassins-noirs.webp") },
      {
        name: "Cognac sculpté",
        hex: "#B5763A",
        image: shot("elvaro-baskets-marron-homme.webp"),
      },
      { name: "Chocolat", hex: "#4A3325", image: shot("elvaro-baskets-marron-homme.webp") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      shot("elvaro-mocassins-noirs.webp"),
      shot("elvaro-baskets-marron-homme.webp"),
      shot("elvaro-baskets-marron-homme.webp"),
    ],
  },
  {
    id: "derby-cognac",
    name: "Derby Cognac",
    brand: "ELVARO",
    price: 459,
    description:
      "Derby à lacets ouverts en cuir cognac. Un classique ville, souple dès le premier jour.",
    gender: "homme",
    category: "ville",
    isNew: true,
    featured: true,
    colors: [
      { name: "Cognac", hex: "#8B5A2B", image: shot("elvaro-baskets-marron-homme.webp") },
      { name: "Tabac", hex: "#6B4A2B", image: shot("elvaro-baskets-marron-homme.webp") },
      { name: "Bordeaux", hex: "#5C2B2E", image: shot("elvaro-mocassins-noirs.webp") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      shot("elvaro-baskets-marron-homme.webp"),
      shot("elvaro-baskets-marron-homme.webp"),
      shot("elvaro-mocassins-noirs.webp"),
    ],
  },
  {
    id: "mocassin-bit",
    name: "Mocassin Bit Or",
    brand: "ELVARO",
    price: 429,
    description:
      "Mocassin horsebit en cuir brûlé, mors doré. L’élégance sans lacet, du bureau au dîner.",
    gender: "homme",
    category: "mocassins",
    isNew: true,
    featured: true,
    colors: [
      { name: "Cognac", hex: "#9C5A28", image: shot("elvaro-mocassins-noirs.webp") },
      { name: "Or", hex: "#D4AF37", image: shot("elvaro-mocassins-noirs.webp") },
      {
        name: "Crème brodé",
        hex: "#E8E2D2",
        image: shot("elvaro-mocassins-noirs.webp"),
      },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      shot("elvaro-mocassins-noirs.webp"),
      shot("elvaro-mocassins-noirs.webp"),
      shot("elvaro-mocassins-noirs.webp"),
      shot("elvaro-mocassins-noirs.webp"),
    ],
  },
  {
    id: "richelieu-brogue",
    name: "Richelieu Brogue",
    brand: "ELVARO",
    price: 479,
    description:
      "Wingtip perforé, cuir cognac patiné. Détail brogue pour un look cérémonie plus vivant.",
    gender: "homme",
    category: "ceremonie",
    isNew: true,
    featured: true,
    colors: [
      { name: "Cognac", hex: "#A9682F", image: shot("elvaro-baskets-marron-homme.webp") },
      { name: "Whisky", hex: "#C0662A", image: shot("elvaro-baskets-marron-homme.webp") },
      { name: "Caramel", hex: "#C98A44", image: shot("elvaro-baskets-marron-homme.webp") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      shot("elvaro-baskets-marron-homme.webp"),
      shot("elvaro-baskets-marron-homme.webp"),
      shot("elvaro-baskets-marron-homme.webp"),
    ],
  },
  {
    id: "derby-navy",
    name: "Derby Navy",
    brand: "ELVARO",
    price: 449,
    description:
      "Derby patiné bleu nuit, reflets profonds et bijou de revers. Une alternative contemporaine au noir strict.",
    gender: "homme",
    category: "ville",
    isNew: false,
    featured: false,
    colors: [
      { name: "Navy patiné", hex: "#1B2430", image: shot("elvaro-mocassins-noirs.webp") },
      { name: "Noir", hex: "#141210", image: shot("elvaro-mocassins-noirs.webp") },
      { name: "Bordeaux", hex: "#5C2B2E", image: shot("elvaro-mocassins-noirs.webp") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      shot("elvaro-mocassins-noirs.webp"),
      shot("elvaro-mocassins-noirs.webp"),
      shot("elvaro-mocassins-noirs.webp"),
    ],
  },
  {
    id: "mocassin-driver",
    name: "Mocassin Driver",
    brand: "ELVARO",
    price: 399,
    description:
      "Mocassin driving souple, mors métal et semelle picots. Confort de conduite pour la ville et le week-end.",
    gender: "unisexe",
    category: "mocassins",
    isNew: true,
    featured: false,
    colors: [
      { name: "Camel daim", hex: "#B98A50", image: shot("elvaro-baskets-marron-homme.webp") },
      { name: "Cognac", hex: "#8B5A2B", image: shot("elvaro-baskets-marron-homme.webp") },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    images: [
      shot("elvaro-baskets-marron-homme.webp"),
      shot("elvaro-baskets-marron-homme.webp"),
      shot("elvaro-mocassins-noirs.webp"),
    ],
  },
  {
    id: "bottine-cognac",
    name: "Bottine Chelsea Cognac",
    brand: "ELVARO",
    price: 519,
    description:
      "Bottine chelsea en cuir cognac lustré, élastiques latéraux. Silhouette nette pour la ville et la mi-saison.",
    gender: "homme",
    category: "bottes",
    isNew: false,
    featured: true,
    colors: [
      {
        name: "Cognac",
        hex: "#8B5A2B",
        image: shot("elvaro-bottines-marron-femme.webp"),
        images: [shot("elvaro-bottines-chelsea-noires.webp")],
      },
      { name: "Noir", hex: "#1A1612", image: shot("elvaro-bottines-chelsea-noires.webp") },
      { name: "Daim tabac", hex: "#A96B36", image: shot("elvaro-bottines-marron-femme.webp") },
      { name: "Fauve", hex: "#C08A4A", image: shot("elvaro-bottines-marron-femme.webp") },
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    images: [
      shot("elvaro-bottines-marron-femme.webp"),
      shot("elvaro-bottines-chelsea-noires.webp"),
      shot("elvaro-bottines-marron-femme.webp"),
      shot("elvaro-bottines-marron-femme.webp"),
      shot("elvaro-bottines-chelsea-noires.webp"),
    ],
  },
  {
    id: "sandale-soir",
    name: "Sandale Soir",
    brand: "ELVARO",
    price: 369,
    description:
      "Sandale à talon fin, brides croisées et boucle bijou. Pour les soirées, les mariages et les cérémonies.",
    gender: "femme",
    category: "femme",
    isNew: true,
    featured: true,
    colors: [
      { name: "Or", hex: "#D4AF37", image: shot("elvaro-ballerines-marron.webp") },
      { name: "Noir", hex: "#1A1612", image: shot("elvaro-ballerines-marron.webp") },
      { name: "Ivoire", hex: "#EFE6D6", image: shot("elvaro-ballerines-marron.webp") },
      { name: "Nude", hex: "#E4D0B8", image: shot("elvaro-ballerines-marron.webp") },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    images: [
      shot("elvaro-ballerines-marron.webp"),
      shot("elvaro-ballerines-marron.webp"),
      shot("elvaro-ballerines-marron.webp"),
      shot("elvaro-ballerines-marron.webp"),
    ],
  },
];

function withColorPhotos(product: CatalogProduct): CatalogProduct {
  return {
    ...product,
    colors: product.colors.map((color, index) => ({
      ...color,
      image: color.image || product.images[index] || product.images[0],
    })),
  };
}

export const catalog = catalogSeed.map(withColorPhotos);

export const categorySeed: { id: string; label: string; image: string }[] = [
  { id: "ville", label: "Ville", image: shot("elvaro-baskets-marron-homme.webp") },
  { id: "ceremonie", label: "Cérémonie", image: shot("elvaro-baskets-marron-homme.webp") },
  { id: "mocassins", label: "Mocassins", image: shot("elvaro-mocassins-noirs.webp") },
  { id: "bottes", label: "Bottes", image: shot("elvaro-bottines-chelsea-noires.webp") },
  { id: "femme", label: "Femme", image: shot("elvaro-ballerines-marron.webp") },
];

export const legacyProductIds = [
  "air-max-pulse",
  "jordan-1-mid",
  "dunk-low-panda",
  "pegasus-41",
  "af1-07",
  "ultraboost-5",
  "samba-og",
  "new-balance-550",
  "hoka-clifton-9",
  "converse-chuck-70",
  "salomon-xt6",
  "on-cloudmonster",
];

export const legacyCategoryIds = [
  "lifestyle",
  "running",
  "basket",
  "outdoor",
  "sneakers",
];
