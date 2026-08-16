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
  colors: { name: string; hex: string }[];
  sizes: number[];
  images: string[];
};

export type ShopCategory = { slug: string; label: string; image: string };

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const fallbackProducts: Product[] = [
  {
    id: "air-max-pulse",
    name: "Nike Air Max Pulse",
    brand: "Nike",
    price: 389,
    description:
      "Amorti Air visible, mesh respirant et silhouette urbaine. Conçue pour le confort toute la journée — en ville comme en déplacement.",
    gender: "unisexe",
    category: "lifestyle",
    isNew: true,
    colors: [
      { name: "Rouge", hex: "#C41E3A" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Or", hex: "#D4AF37" },
      { name: "Crème", hex: "#F3EDE2" },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    images: [
      img("photo-1542291026-7eec264c27ff"),
      img("photo-1514989940723-e8e51635b782"),
      img("photo-1600185365483-26d7a4cc7519"),
    ],
  },
  {
    id: "jordan-1-mid",
    name: "Air Jordan 1 Mid",
    brand: "Jordan",
    price: 429,
    description:
      "L’icône basket revisitée. Cuir premium, swoosh contrasté et confort héritage pour un look street immédiat.",
    gender: "unisexe",
    category: "basket",
    isNew: true,
    colors: [
      { name: "Blanc", hex: "#F5F0E6" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Bordeaux", hex: "#6B1D2A" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    images: [
      img("photo-1595950653106-6c9ebd614d3a"),
      img("photo-1552346154-21d32810aba3"),
      img("photo-1579338559194-a27873e0a8b3"),
    ],
  },
  {
    id: "dunk-low-panda",
    name: "Nike Dunk Low",
    brand: "Nike",
    price: 349,
    description:
      "Profil bas, semelle cupsole et cuir lisse. Un classique skate devenu incontournable du daily wear.",
    gender: "unisexe",
    category: "sneakers",
    isNew: true,
    colors: [
      { name: "Noir/Blanc", hex: "#1A1612" },
      { name: "Marine", hex: "#1E3A5F" },
      { name: "Beige", hex: "#D8C4A8" },
      { name: "Or", hex: "#C9A45C" },
    ],
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    images: [
      img("photo-1605348532760-6753d2c43329"),
      img("photo-1600185365926-3a2ce3cdb9eb"),
      img("photo-1608231387042-66d1773070a5"),
    ],
  },
  {
    id: "pegasus-41",
    name: "Nike Pegasus 41",
    brand: "Nike",
    price: 319,
    description:
      "ReactX et Zoom Air pour des sorties quotidiennes. Légère, stable, faite pour enchaîner les kilomètres.",
    gender: "homme",
    category: "running",
    isNew: false,
    colors: [
      { name: "Vert", hex: "#3D6B4F" },
      { name: "Gris", hex: "#8A8478" },
      { name: "Bleu", hex: "#3D5A73" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    images: [
      img("photo-1606107557195-0e29a4b5b4aa"),
      img("photo-1460353581641-37baddab0fa2"),
      img("photo-1542291026-7eec264c27ff"),
    ],
  },
  {
    id: "af1-07",
    name: "Nike Air Force 1 '07",
    brand: "Nike",
    price: 299,
    description:
      "Le original depuis 1982. Cuir blanc impeccable, Air encapsulé et présence indémodable.",
    gender: "unisexe",
    category: "lifestyle",
    isNew: false,
    colors: [
      { name: "Blanc", hex: "#F7F2E8" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Cognac", hex: "#8B5A2B" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    images: [
      img("photo-1579338559194-a27873e0a8b3"),
      img("photo-1600185365483-26d7a4cc7519"),
      img("photo-1549298916-b41d501d3772"),
    ],
  },
  {
    id: "ultraboost-5",
    name: "Adidas Ultraboost 5",
    brand: "Adidas",
    price: 459,
    description:
      "BOOST énergie et tige Primeknit. Un rolling confortable pour la ville et le running léger.",
    gender: "homme",
    category: "running",
    isNew: true,
    colors: [
      { name: "Noir", hex: "#1A1612" },
      { name: "Blanc", hex: "#F7F2E8" },
      { name: "Carbon", hex: "#4A453C" },
      { name: "Or", hex: "#C9A45C" },
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    images: [
      img("photo-1514989940723-e8e51635b782"),
      img("photo-1608231387042-66d1773070a5"),
      img("photo-1606107557195-0e29a4b5b4aa"),
    ],
  },
  {
    id: "samba-og",
    name: "Adidas Samba OG",
    brand: "Adidas",
    price: 279,
    description:
      "Cuir, 3 bandes et semelle gum. La Samba passe du terrain au bitume sans effort.",
    gender: "unisexe",
    category: "sneakers",
    isNew: false,
    colors: [
      { name: "Blanc", hex: "#F7F2E8" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Gum", hex: "#C4A574" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    images: [
      img("photo-1549298916-b41d501d3772"),
      img("photo-1460353581641-37baddab0fa2"),
      img("photo-1600185365483-26d7a4cc7519"),
    ],
  },
  {
    id: "new-balance-550",
    name: "New Balance 550",
    brand: "New Balance",
    price: 339,
    description:
      "Silhouette basket 80s, cuir cassé et semelle large. Un rétro clean qui se porte partout.",
    gender: "unisexe",
    category: "basket",
    isNew: false,
    colors: [
      { name: "Ivoire", hex: "#F5F0E8" },
      { name: "Vert", hex: "#4A5C3A" },
      { name: "Marine", hex: "#2C3E50" },
      { name: "Or", hex: "#C9A45C" },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    images: [
      img("photo-1551107696-a4b0c5a0d9a2"),
      img("photo-1600185365483-26d7a4cc7519"),
      img("photo-1595950653106-6c9ebd614d3a"),
    ],
  },
  {
    id: "hoka-clifton-9",
    name: "Hoka Clifton 9",
    brand: "Hoka",
    price: 399,
    description:
      "Mousse généreuse, drop confortable et rocker signature. Idéale pour les longues sorties.",
    gender: "femme",
    category: "running",
    isNew: true,
    colors: [
      { name: "Lilas", hex: "#B8A4C4" },
      { name: "Blanc", hex: "#F7F2E8" },
      { name: "Champagne", hex: "#E8D5A3" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [36, 37, 38, 39, 40, 41, 42],
    images: [
      img("photo-1608231387042-66d1773070a5"),
      img("photo-1460353581641-37baddab0fa2"),
      img("photo-1606107557195-0e29a4b5b4aa"),
    ],
  },
  {
    id: "converse-chuck-70",
    name: "Converse Chuck 70",
    brand: "Converse",
    price: 229,
    description:
      "Canvas vintage, semelle plus épaisse et col rembourré. L’essentiel intemporel.",
    gender: "unisexe",
    category: "lifestyle",
    isNew: false,
    colors: [
      { name: "Noir", hex: "#1A1612" },
      { name: "Blanc", hex: "#F7F2E8" },
      { name: "Bordeaux", hex: "#6B1D2A" },
      { name: "Or", hex: "#C9A45C" },
    ],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    images: [
      img("photo-1463100099107-aa0980c362e6"),
      img("photo-1514989940723-e8e51635b782"),
      img("photo-1549298916-b41d501d3772"),
    ],
  },
  {
    id: "salomon-xt6",
    name: "Salomon XT-6",
    brand: "Salomon",
    price: 449,
    description:
      "Trail technique devenu pièce fashion. Grip agressif, chassis stable, look archive.",
    gender: "unisexe",
    category: "outdoor",
    isNew: true,
    colors: [
      { name: "Argent", hex: "#B8B0A4" },
      { name: "Noir", hex: "#1A1612" },
      { name: "Kaki", hex: "#6B5E45" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      img("photo-1520256862855-398228c41684"),
      img("photo-1606107557195-0e29a4b5b4aa"),
      img("photo-1514989940723-e8e51635b782"),
    ],
  },
  {
    id: "on-cloudmonster",
    name: "On Cloudmonster",
    brand: "On",
    price: 419,
    description:
      "Nuage de CloudTec XXL. Rebond maxi pour les footings et les journées chargées.",
    gender: "femme",
    category: "running",
    isNew: false,
    colors: [
      { name: "Rose", hex: "#C9A08A" },
      { name: "Blanc", hex: "#F7F2E8" },
      { name: "Nude", hex: "#E4D0B8" },
      { name: "Or", hex: "#D4AF37" },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    images: [
      img("photo-1595341888016-a392ef81b7de"),
      img("photo-1608231387042-66d1773070a5"),
      img("photo-1460353581641-37baddab0fa2"),
    ],
  },
];

export const categories: ShopCategory[] = [
  {
    slug: "lifestyle",
    label: "Lifestyle",
    image: img("photo-1549298916-b41d501d3772"),
  },
  {
    slug: "running",
    label: "Running",
    image: img("photo-1460353581641-37baddab0fa2"),
  },
  {
    slug: "basket",
    label: "Basket",
    image: img("photo-1595950653106-6c9ebd614d3a"),
  },
  {
    slug: "outdoor",
    label: "Outdoor",
    image: img("photo-1520256862855-398228c41684"),
  },
];

export function relatedProducts(list: Product[], id: string, limit = 4) {
  const current = list.find((p) => p.id === id);
  if (!current) return list.slice(0, limit);
  return list
    .filter((p) => p.id !== id)
    .sort((a, b) => {
      const score = (p: Product) =>
        (p.category === current.category ? 2 : 0) +
        (p.brand === current.brand ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export const allSizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

export function brandsOf(list: Product[]) {
  return [...new Set(list.map((p) => p.brand))];
}
