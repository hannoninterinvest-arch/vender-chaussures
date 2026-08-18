export type Gender = 'homme' | 'femme' | 'unisexe';
export type Category = 'ville' | 'ceremonie' | 'mocassins' | 'bottes' | 'femme';

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
  colors: { name: string; hex: string; image?: string }[];
  sizes: number[];
  images: string[];
};

const shot = (file: string) => `/chaussures/${file}`;

export const homepageCovers = [
  shot('oxford-noir-hq.jpg'),
  shot('loafer-or-hq.jpg'),
  shot('derby-cognac-hq.jpg'),
  shot('brogue-hq.jpg'),
  shot('sandale-hq.jpg'),
];

const catalogSeed: CatalogProduct[] = [
  {
    id: 'oxford-noir',
    name: 'Oxford Noir Cap-Toe',
    brand: 'ELVARO',
    price: 489,
    description:
      'Richelieu cap-toe en cuir noir lustré. Semelle Goodyear, finitions atelier — la paire de cérémonie et de bureau.',
    gender: 'homme',
    category: 'ceremonie',
    isNew: true,
    featured: true,
    colors: [
      { name: 'Noir', hex: '#1A1612' },
      { name: 'Bordeaux', hex: '#6B1D2A' },
      { name: 'Or', hex: '#D4AF37' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot('oxford-noir-hq.jpg'), shot('oxford-noir.jpg'), shot('oxford-noir-pair.jpg')],
  },
  {
    id: 'derby-cognac',
    name: 'Derby Cognac',
    brand: 'ELVARO',
    price: 459,
    description:
      'Derby à lacets ouverts en cuir cognac. Un classique ville, souple dès les premiers pas.',
    gender: 'homme',
    category: 'ville',
    isNew: true,
    featured: true,
    colors: [
      { name: 'Cognac', hex: '#8B5A2B' },
      { name: 'Noir', hex: '#1A1612' },
      { name: 'Tabac', hex: '#6B4A2B' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot('derby-cognac-hq.jpg'), shot('derby-laces.jpg'), shot('derby-cuir.jpg')],
  },
  {
    id: 'mocassin-bit',
    name: 'Mocassin Bit Or',
    brand: 'ELVARO',
    price: 429,
    description:
      'Mocassin horsebit en cuir brûlé, mors doré. L’élégance sans lacet, du bureau au dîner.',
    gender: 'homme',
    category: 'mocassins',
    isNew: true,
    featured: true,
    colors: [
      { name: 'Cognac', hex: '#8B5A2B' },
      { name: 'Noir', hex: '#1A1612' },
      { name: 'Or', hex: '#D4AF37' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot('loafer-or-hq.jpg'), shot('mocassin-cuir.jpg'), shot('mocassin-or.jpg')],
  },
  {
    id: 'richelieu-brogue',
    name: 'Richelieu Brogue',
    brand: 'ELVARO',
    price: 479,
    description:
      'Wingtip perforé, cuir cognac patiné. Détail brogue pour un look cérémonie plus vivant.',
    gender: 'homme',
    category: 'ceremonie',
    isNew: true,
    featured: true,
    colors: [
      { name: 'Cognac', hex: '#8B5A2B' },
      { name: 'Noir', hex: '#1A1612' },
      { name: 'Crème', hex: '#F3EDE2' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot('brogue-hq.jpg'), shot('oxford-studio.jpg'), shot('richelieu-carreaux.jpg')],
  },
  {
    id: 'derby-navy',
    name: 'Derby Navy',
    brand: 'ELVARO',
    price: 449,
    description:
      'Derby texturé bleu nuit, lacets fins. Une alternative contemporaine au noir strict.',
    gender: 'homme',
    category: 'ville',
    isNew: false,
    featured: false,
    colors: [
      { name: 'Navy', hex: '#1B2430' },
      { name: 'Noir', hex: '#1A1612' },
      { name: 'Bordeaux', hex: '#6B1D2A' },
    ],
    sizes: [39, 40, 41, 42, 43, 44, 45],
    images: [shot('derby-navy-hq.jpg'), shot('pexels-noires.jpg'), shot('oxford-noir.jpg')],
  },
  {
    id: 'mocassin-driver',
    name: 'Mocassin Driver',
    brand: 'ELVARO',
    price: 399,
    description:
      'Mocassin driving, texture croco, boucle argent. Confort souple pour la ville et le week-end.',
    gender: 'unisexe',
    category: 'mocassins',
    isNew: true,
    featured: false,
    colors: [
      { name: 'Marine', hex: '#2C3E6B' },
      { name: 'Terracotta', hex: '#C45C26' },
      { name: 'Gris', hex: '#8A8680' },
      { name: 'Or', hex: '#D4AF37' },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    images: [shot('driver-hq.jpg'), shot('pexels-classe.jpg'), shot('mocassin-pair.jpg')],
  },
  {
    id: 'bottine-cognac',
    name: 'Bottine Cognac',
    brand: 'ELVARO',
    price: 519,
    description:
      'Bottine derby en cuir cognac lustré. Silhouette nette, semelle cuir — ville et mi-saison.',
    gender: 'homme',
    category: 'bottes',
    isNew: false,
    featured: false,
    colors: [
      { name: 'Cognac', hex: '#8B5A2B' },
      { name: 'Noir', hex: '#1A1612' },
      { name: 'Tabac', hex: '#6B4A2B' },
    ],
    sizes: [40, 41, 42, 43, 44, 45],
    images: [shot('bottine-hq.jpg'), shot('derby-cognac-hq.jpg'), shot('derby-cuir.jpg')],
  },
  {
    id: 'sandale-soir',
    name: 'Sandale Soir',
    brand: 'ELVARO',
    price: 369,
    description:
      'Sandale à talon aiguille, brides croisées et boucles dorées. Pour les soirées et cérémonies.',
    gender: 'femme',
    category: 'femme',
    isNew: true,
    featured: true,
    colors: [
      { name: 'Noir', hex: '#1A1612' },
      { name: 'Nude', hex: '#E4D0B8' },
      { name: 'Or', hex: '#D4AF37' },
    ],
    sizes: [36, 37, 38, 39, 40, 41],
    images: [shot('sandale-hq.jpg'), shot('femme-talon.jpg')],
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
  { id: 'ville', label: 'Ville', image: shot('derby-cognac-hq.jpg') },
  { id: 'ceremonie', label: 'Cérémonie', image: shot('oxford-noir-hq.jpg') },
  { id: 'mocassins', label: 'Mocassins', image: shot('loafer-or-hq.jpg') },
  { id: 'bottes', label: 'Bottes', image: shot('bottine-hq.jpg') },
  { id: 'femme', label: 'Femme', image: shot('sandale-hq.jpg') },
];

export const legacyProductIds = [
  'air-max-pulse',
  'jordan-1-mid',
  'dunk-low-panda',
  'pegasus-41',
  'af1-07',
  'ultraboost-5',
  'samba-og',
  'new-balance-550',
  'hoka-clifton-9',
  'converse-chuck-70',
  'salomon-xt6',
  'on-cloudmonster',
];

export const legacyCategoryIds = ['lifestyle', 'running', 'basket', 'outdoor', 'sneakers'];
