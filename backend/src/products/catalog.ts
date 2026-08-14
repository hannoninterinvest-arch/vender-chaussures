export type Gender = 'homme' | 'femme' | 'unisexe';
export type Category =
  | 'sneakers'
  | 'running'
  | 'basket'
  | 'outdoor'
  | 'lifestyle';

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  gender: Gender;
  category: Category;
  isNew: boolean;
  colors: { name: string; hex: string }[];
  sizes: number[];
  images: string[];
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const catalog: CatalogProduct[] = [
  {
    id: 'air-max-pulse',
    name: 'Nike Air Max Pulse',
    brand: 'Nike',
    price: 389,
    description:
      "Amorti Air visible, mesh respirant et silhouette urbaine. Conçue pour le confort toute la journée — en ville comme en déplacement.",
    gender: 'unisexe',
    category: 'lifestyle',
    isNew: true,
    colors: [
      { name: 'Rouge', hex: '#E11D48' },
      { name: 'Noir', hex: '#171717' },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    images: [
      img('photo-1542291026-7eec264c27ff'),
      img('photo-1514989940723-e8e51635b782'),
      img('photo-1600185365483-26d7a4cc7519'),
    ],
  },
  {
    id: 'jordan-1-mid',
    name: 'Air Jordan 1 Mid',
    brand: 'Jordan',
    price: 429,
    description:
      "L’icône basket revisitée. Cuir premium, swoosh contrasté et confort héritage pour un look street immédiat.",
    gender: 'unisexe',
    category: 'basket',
    isNew: true,
    colors: [
      { name: 'Blanc', hex: '#F5F5F5' },
      { name: 'Noir', hex: '#171717' },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    images: [
      img('photo-1595950653106-6c9ebd614d3a'),
      img('photo-1552346154-21d32810aba3'),
      img('photo-1579338559194-a27873e0a8b3'),
    ],
  },
  {
    id: 'dunk-low-panda',
    name: 'Nike Dunk Low',
    brand: 'Nike',
    price: 349,
    description:
      'Profil bas, semelle cupsole et cuir lisse. Un classique skate devenu incontournable du daily wear.',
    gender: 'unisexe',
    category: 'sneakers',
    isNew: true,
    colors: [
      { name: 'Noir/Blanc', hex: '#111111' },
      { name: 'Marine', hex: '#1E3A5F' },
    ],
    sizes: [37, 38, 39, 40, 41, 42, 43, 44, 45],
    images: [
      img('photo-1605348532760-6753d2c43329'),
      img('photo-1600185365926-3a2ce3cdb9eb'),
      img('photo-1608231387042-66d1773070a5'),
    ],
  },
  {
    id: 'pegasus-41',
    name: 'Nike Pegasus 41',
    brand: 'Nike',
    price: 319,
    description:
      'ReactX et Zoom Air pour des sorties quotidiennes. Légère, stable, faite pour enchaîner les kilomètres.',
    gender: 'homme',
    category: 'running',
    isNew: false,
    colors: [
      { name: 'Vert', hex: '#16A34A' },
      { name: 'Gris', hex: '#737373' },
    ],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    images: [
      img('photo-1606107557195-0e29a4b5b4aa'),
      img('photo-1460353581641-37baddab0fa2'),
      img('photo-1542291026-7eec264c27ff'),
    ],
  },
  {
    id: 'af1-07',
    name: "Nike Air Force 1 '07",
    brand: 'Nike',
    price: 299,
    description:
      'Le original depuis 1982. Cuir blanc impeccable, Air encapsulé et présence indémodable.',
    gender: 'unisexe',
    category: 'lifestyle',
    isNew: false,
    colors: [
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Noir', hex: '#171717' },
    ],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    images: [
      img('photo-1579338559194-a27873e0a8b3'),
      img('photo-1600185365483-26d7a4cc7519'),
      img('photo-1549298916-b41d501d3772'),
    ],
  },
  {
    id: 'ultraboost-5',
    name: 'Adidas Ultraboost 5',
    brand: 'Adidas',
    price: 459,
    description:
      'BOOST énergie et tige Primeknit. Un rolling confortable pour la ville et le running léger.',
    gender: 'homme',
    category: 'running',
    isNew: true,
    colors: [
      { name: 'Noir', hex: '#0A0A0A' },
      { name: 'Blanc', hex: '#FAFAFA' },
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    images: [
      img('photo-1514989940723-e8e51635b782'),
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1606107557195-0e29a4b5b4aa'),
    ],
  },
  {
    id: 'samba-og',
    name: 'Adidas Samba OG',
    brand: 'Adidas',
    price: 279,
    description:
      'Cuir, 3 bandes et semelle gum. La Samba passe du terrain au bitume sans effort.',
    gender: 'unisexe',
    category: 'sneakers',
    isNew: false,
    colors: [
      { name: 'Blanc', hex: '#F8F8F8' },
      { name: 'Noir', hex: '#171717' },
    ],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    images: [
      img('photo-1549298916-b41d501d3772'),
      img('photo-1460353581641-37baddab0fa2'),
      img('photo-1600185365483-26d7a4cc7519'),
    ],
  },
  {
    id: 'new-balance-550',
    name: 'New Balance 550',
    brand: 'New Balance',
    price: 339,
    description:
      'Silhouette basket 80s, cuir cassé et semelle large. Un rétro clean qui se porte partout.',
    gender: 'unisexe',
    category: 'basket',
    isNew: false,
    colors: [
      { name: 'Ivoire', hex: '#F5F0E8' },
      { name: 'Vert', hex: '#3F6212' },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    images: [
      img('photo-1551107696-a4b0c5a0d9a2'),
      img('photo-1600185365483-26d7a4cc7519'),
      img('photo-1595950653106-6c9ebd614d3a'),
    ],
  },
  {
    id: 'hoka-clifton-9',
    name: 'Hoka Clifton 9',
    brand: 'Hoka',
    price: 399,
    description:
      'Mousse généreuse, drop confortable et rocker signature. Idéale pour les longues sorties.',
    gender: 'femme',
    category: 'running',
    isNew: true,
    colors: [
      { name: 'Lilas', hex: '#C4B5FD' },
      { name: 'Blanc', hex: '#FFFFFF' },
    ],
    sizes: [36, 37, 38, 39, 40, 41, 42],
    images: [
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1460353581641-37baddab0fa2'),
      img('photo-1606107557195-0e29a4b5b4aa'),
    ],
  },
  {
    id: 'converse-chuck-70',
    name: 'Converse Chuck 70',
    brand: 'Converse',
    price: 229,
    description:
      'Canvas vintage, semelle plus épaisse et col rembourré. L’essentiel intemporel.',
    gender: 'unisexe',
    category: 'lifestyle',
    isNew: false,
    colors: [
      { name: 'Noir', hex: '#111111' },
      { name: 'Blanc', hex: '#FAFAFA' },
    ],
    sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    images: [
      img('photo-1463100099107-aa0980c362e6'),
      img('photo-1514989940723-e8e51635b782'),
      img('photo-1549298916-b41d501d3772'),
    ],
  },
  {
    id: 'salomon-xt6',
    name: 'Salomon XT-6',
    brand: 'Salomon',
    price: 449,
    description:
      'Trail technique devenu pièce fashion. Grip agressif, chassis stable, look archive.',
    gender: 'unisexe',
    category: 'outdoor',
    isNew: true,
    colors: [
      { name: 'Argent', hex: '#A3A3A3' },
      { name: 'Noir', hex: '#171717' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      img('photo-1520256862855-398228c41684'),
      img('photo-1606107557195-0e29a4b5b4aa'),
      img('photo-1514989940723-e8e51635b782'),
    ],
  },
  {
    id: 'on-cloudmonster',
    name: 'On Cloudmonster',
    brand: 'On',
    price: 419,
    description:
      'Nuage de CloudTec XXL. Rebond maxi pour les footings et les journées chargées.',
    gender: 'femme',
    category: 'running',
    isNew: false,
    colors: [
      { name: 'Rose', hex: '#FB7185' },
      { name: 'Blanc', hex: '#FFFFFF' },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    images: [
      img('photo-1595341888016-a392ef81b7de'),
      img('photo-1608231387042-66d1773070a5'),
      img('photo-1460353581641-37baddab0fa2'),
    ],
  },
];
