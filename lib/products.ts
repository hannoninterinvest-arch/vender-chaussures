export type Gender = "homme" | "femme" | "unisexe";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  cost?: number;
  description: string;
  gender: Gender;
  category: string;
  isNew: boolean;
  featured?: boolean;
  colors: { name: string; hex: string }[];
  sizes: number[];
  images: string[];
};

export type ShopCategory = { slug: string; label: string; image: string };

const shot = (file: string) => `/chaussures/${file}`;

export const fallbackProducts: Product[] = [
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
      { name: "Noir", hex: "#1A1612" },
      { name: "Bordeaux", hex: "#6B1D2A" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("oxford-noir.jpg"), shot("oxford-noir-pair.jpg"), shot("pexels-noires.jpg")],
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
      { name: "Cognac", hex: "#8B5A2B" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Tabac", hex: "#6B4A2B" },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("derby-laces.jpg"), shot("derby-cuir.jpg"), shot("pexels-marron.jpg")],
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
      { name: "Cognac", hex: "#8B5A2B" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("mocassin-cuir.jpg"), shot("mocassin-or.jpg"), shot("mocassin-pair.jpg")],
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
      { name: "Cognac", hex: "#8B5A2B" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Crème", hex: "#F3EDE2" },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("richelieu-carreaux.jpg"), shot("pexels-marron.jpg"), shot("oxford-noir-pair.jpg")],
  },
  {
    id: "derby-navy",
    name: "Derby Navy",
    brand: "ELVARO",
    price: 449,
    description:
      "Derby texturé bleu nuit, lacets fins. Une alternative contemporaine au noir strict.",
    gender: "homme",
    category: "ville",
    isNew: false,
    colors: [
      { name: "Navy", hex: "#1B2430" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Bordeaux", hex: "#6B1D2A" },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot("pexels-noires.jpg"), shot("oxford-noir.jpg")],
  },
  {
    id: "mocassin-driver",
    name: "Mocassin Driver",
    brand: "ELVARO",
    price: 399,
    description:
      "Mocassin driving, texture croco, boucle argent. Confort souple pour la ville et le week-end.",
    gender: "unisexe",
    category: "mocassins",
    isNew: true,
    colors: [
      { name: "Marine", hex: "#2C3E6B" },
      { name: "Terracotta", hex: "#C45C26" },
      { name: "Gris", hex: "#8A8680" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    images: [shot("pexels-classe.jpg"), shot("pexels-luxe.jpg"), shot("mocassin-pair.jpg")],
  },
  {
    id: "bottine-cognac",
    name: "Bottine Cognac",
    brand: "ELVARO",
    price: 519,
    description:
      "Bottine derby en cuir cognac lustré. Silhouette nette, semelle cuir — ville et mi-saison.",
    gender: "homme",
    category: "bottes",
    isNew: false,
    colors: [
      { name: "Cognac", hex: "#8B5A2B" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Tabac", hex: "#6B4A2B" },
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    images: [shot("derby-cuir.jpg"), shot("derby-laces.jpg")],
  },
  {
    id: "sandale-soir",
    name: "Sandale Soir",
    brand: "ELVARO",
    price: 369,
    description:
      "Sandale à talon aiguille, brides croisées et boucles dorées. Pour les soirées et cérémonies.",
    gender: "femme",
    category: "femme",
    isNew: true,
    featured: true,
    colors: [
      { name: "Noir", hex: "#1A1612" },
      { name: "Nude", hex: "#E4D0B8" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    images: [shot("femme-talon.jpg"), shot("mocassin-or.jpg")],
  },
];

export const categories: ShopCategory[] = [
  { slug: "ville", label: "Ville", image: shot("derby-laces.jpg") },
  { slug: "ceremonie", label: "Cérémonie", image: shot("oxford-noir.jpg") },
  { slug: "mocassins", label: "Mocassins", image: shot("mocassin-cuir.jpg") },
  { slug: "bottes", label: "Bottes", image: shot("derby-cuir.jpg") },
  { slug: "femme", label: "Femme", image: shot("femme-talon.jpg") },
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
