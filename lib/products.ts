import { withColorImages } from "@/lib/product-media";

export type Gender = "homme" | "femme" | "unisexe";

export type Product = {
  id: string;
  name: string;
  brand: string;
  /** Prix à payer : déjà remisé quand une promo est active. */
  price: number;
  /** Prix avant promotion, affiché barré. */
  oldPrice?: number | null;
  discount?: number;
  cost?: number;
  description: string;
  gender: Gender;
  category: string;
  isNew: boolean;
  featured?: boolean;
  colors: { name: string; hex: string; image?: string }[];
  sizes: number[];
  images: string[];
  /** Vidéo 3D Cloudinary (fiche produit). */
  video?: string;
  /** Afficher cette vidéo aussi sur l’accueil. */
  showVideoOnHome?: boolean;
};

export type ShopCategory = { slug: string; label: string; image: string };

const shot = (file: string) => `/chaussures/${file}`;

const fallbackCatalog: Product[] = [
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
      { name: "Noir", hex: "#141210", image: shot("oxford-noir.jpg") },
      { name: "Cognac sculpté", hex: "#B5763A", image: shot("oxford-cognac.jpg") },
      { name: "Chocolat", hex: "#4A3325", image: shot("derby-chocolat.jpg") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("oxford-noir.jpg"), shot("oxford-cognac.jpg"), shot("derby-chocolat.jpg")],
    video: shot("oxford-noir-3d.mp4"),
    showVideoOnHome: true,
  },
  {
    id: "derby-cognac",
    name: "Derby Cognac",
    brand: "ELVARO",
    price: 459,
    description:
      "Derby à lacets ouverts en cuir cognac. Un classique ville, souple dès les premiers pas.",
    gender: "homme",
    category: "ville",
    isNew: true,
    featured: true,
    colors: [
      { name: "Cognac", hex: "#8B5A2B", image: shot("derby-cognac.jpg") },
      { name: "Tabac", hex: "#6B4A2B", image: shot("derby-tabac.jpg") },
      { name: "Bordeaux", hex: "#5C2B2E", image: shot("derby-bordeaux.jpg") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("derby-cognac.jpg"), shot("derby-tabac.jpg"), shot("derby-bordeaux.jpg")],
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
      { name: "Cognac", hex: "#9C5A28", image: shot("mocassin-cognac.jpg") },
      { name: "Or", hex: "#D4AF37", image: shot("mocassin-or.jpg") },
      { name: "Crème brodé", hex: "#E8E2D2", image: shot("mocassin-creme.jpg") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      shot("mocassin-cognac.jpg"),
      shot("mocassin-or.jpg"),
      shot("mocassin-creme.jpg"),
      shot("mocassin-navy.jpg"),
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
      { name: "Cognac", hex: "#A9682F", image: shot("brogue-cognac.jpg") },
      { name: "Whisky", hex: "#C0662A", image: shot("brogue-whisky.jpg") },
      { name: "Caramel", hex: "#C98A44", image: shot("brogue-caramel.jpg") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("brogue-cognac.jpg"), shot("brogue-whisky.jpg"), shot("brogue-caramel.jpg")],
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
      { name: "Navy patiné", hex: "#1B2430", image: shot("derby-navy.jpg") },
      { name: "Noir", hex: "#141210", image: shot("oxford-noir.jpg") },
      { name: "Bordeaux", hex: "#5C2B2E", image: shot("derby-bordeaux.jpg") },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("derby-navy.jpg"), shot("oxford-noir.jpg"), shot("derby-bordeaux.jpg")],
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
      { name: "Camel daim", hex: "#B98A50", image: shot("driver-camel.jpg") },
      { name: "Cognac", hex: "#8B5A2B", image: shot("driver-cognac.jpg") },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    images: [shot("driver-camel.jpg"), shot("driver-cognac.jpg"), shot("mocassin-navy.jpg")],
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
      { name: "Cognac", hex: "#8B5A2B", image: shot("bottine-cognac.jpg") },
      { name: "Noir", hex: "#1A1612", image: shot("bottine-noire.jpg") },
      { name: "Daim tabac", hex: "#A96B36", image: shot("bottine-daim.jpg") },
      { name: "Fauve", hex: "#C08A4A", image: shot("bottine-tabac.jpg") },
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    images: [
      shot("bottine-cognac.jpg"),
      shot("bottine-noire.jpg"),
      shot("bottine-daim.jpg"),
      shot("bottine-tabac.jpg"),
      shot("bottine-studio.jpg"),
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
      { name: "Or", hex: "#D4AF37", image: shot("sandale-or.jpg") },
      { name: "Noir", hex: "#1A1612", image: shot("sandale-noire.jpg") },
      { name: "Ivoire", hex: "#EFE6D6", image: shot("sandale-ivoire.jpg") },
      { name: "Nude", hex: "#E4D0B8", image: shot("escarpin-nude.jpg") },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    images: [
      shot("sandale-or.jpg"),
      shot("sandale-noire.jpg"),
      shot("sandale-ivoire.jpg"),
      shot("escarpin-nude.jpg"),
    ],
    video: shot("sandale-or-3d.mp4"),
    showVideoOnHome: true,
  },
];

export const fallbackProducts: Product[] = fallbackCatalog.map(withColorImages);

export const categories: ShopCategory[] = [
  { slug: "ville", label: "Ville", image: shot("derby-cognac.jpg") },
  { slug: "ceremonie", label: "Cérémonie", image: shot("oxford-cognac.jpg") },
  { slug: "mocassins", label: "Mocassins", image: shot("mocassin-cognac.jpg") },
  { slug: "bottes", label: "Bottes", image: shot("bottine-cognac.jpg") },
  { slug: "femme", label: "Femme", image: shot("sandale-or.jpg") },
];

export function relatedProducts(list: Product[], id: string, limit = 4) {
  const current = list.find((p) => p.id === id);
  if (!current) return list.slice(0, limit);
  return list
    .filter((p) => p.id !== id)
    .sort((a, b) => {
      const score = (p: Product) =>
        (p.category === current.category ? 2 : 0) + (p.brand === current.brand ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export const allSizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

export function brandsOf(list: Product[]) {
  return [...new Set(list.map((p) => p.brand))];
}
