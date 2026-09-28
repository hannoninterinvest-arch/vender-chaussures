export type CsvProduct = {
  name: string;
  brand: string;
  price: number;
  promoPrice: number;
  cost: number;
  description: string;
  gender: "homme" | "femme" | "unisexe";
  category: string;
  isNew: boolean;
  colors: { name: string; hex: string; image?: string; images?: string[] }[];
  sizes: number[];
  images: string[];
};

export type CsvParseError = { line: number; message: string };

const HEADERS: Record<string, string> = {
  nom: "name",
  name: "name",
  marque: "brand",
  brand: "brand",
  prix: "price",
  price: "price",
  achat: "cost",
  cost: "cost",
  promo: "promoPrice",
  promotion: "promoPrice",
  "prix promo": "promoPrice",
  solde: "promoPrice",
  "prix dachat": "cost",
  "prix achat": "cost",
  description: "description",
  desc: "description",
  genre: "gender",
  gender: "gender",
  sexe: "gender",
  categorie: "category",
  category: "category",
  nouveau: "isNew",
  new: "isNew",
  couleurs: "colors",
  colors: "colors",
  pointures: "sizes",
  sizes: "sizes",
  images: "images",
  photos: "images",
  photo: "images",
  liens: "images",
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function splitCsvLine(line: string, delimiter: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function detectDelimiter(headerLine: string) {
  const semi = (headerLine.match(/;/g) || []).length;
  const comma = (headerLine.match(/,/g) || []).length;
  return semi > comma ? ";" : ",";
}

function splitList(value: string) {
  return value
    .split(/[|/]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBool(value: string) {
  const v = value.trim().toLowerCase();
  if (!v) return true;
  return ["oui", "yes", "true", "1", "nouveau", "new"].includes(v);
}

function parseGender(value: string): CsvProduct["gender"] {
  const v = value.trim().toLowerCase();
  if (["homme", "men", "man", "male", "h"].includes(v)) return "homme";
  if (["femme", "women", "woman", "female", "f"].includes(v)) return "femme";
  return "unisexe";
}

function parseColorPhotos(value: string) {
  return value
    .split("+")
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url) || url.startsWith("/"))
    .slice(0, 5);
}

function parseColors(value: string) {
  const parts = (value.includes("|") ? value.split("|") : value.split(","))
    .map((part) => part.trim())
    .filter(Boolean);
  const colors = parts.map((part) => {
    const at = part.indexOf("@");
    const photos = at >= 0 ? parseColorPhotos(part.slice(at + 1)) : [];
    const head = at >= 0 ? part.slice(0, at) : part;
    const colon = head.indexOf(":");
    const name = (colon >= 0 ? head.slice(0, colon) : head).trim() || "Noir";
    const hex = colon >= 0 ? head.slice(colon + 1).trim() : "";
    return {
      name,
      hex: hex.startsWith("#") ? hex : "#171717",
      image: photos[0],
      images: photos.slice(1),
    };
  });
  return colors.length ? colors : [{ name: "Noir", hex: "#171717", image: undefined, images: [] }];
}

function parseSizes(value: string) {
  const raw = splitList(value).length
    ? splitList(value)
    : value
        .split(/[, ]+/)
        .map((p) => p.trim())
        .filter(Boolean);
  const sizes = raw.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
  return sizes.length ? sizes : [40, 41, 42, 43, 44];
}

function parseImages(value: string) {
  const raw = splitList(value).length
    ? splitList(value)
    : value
        .split(/[, ]+/)
        .map((p) => p.trim())
        .filter(Boolean);
  return raw.filter((url) => /^https?:\/\//i.test(url) || url.startsWith("/")).slice(0, 16);
}

export function parseProductCsv(text: string): { products: CsvProduct[]; errors: CsvParseError[] } {
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const lines = src.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    return {
      products: [],
      errors: [{ line: 1, message: "Le fichier doit avoir une ligne d’en-tête et au moins un produit" }],
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map((h) => HEADERS[normalizeHeader(h)] || "");
  if (!headers.includes("name") || !headers.includes("images")) {
    return {
      products: [],
      errors: [{ line: 1, message: "Colonnes obligatoires : nom, images (liens photos). Télécharge le modèle CSV." }],
    };
  }

  const products: CsvProduct[] = [];
  const errors: CsvParseError[] = [];

  lines.slice(1).forEach((line, i) => {
    const row = splitCsvLine(line, delimiter);
    const get = (key: string) => {
      const idx = headers.indexOf(key);
      return idx >= 0 ? (row[idx] || "").trim() : "";
    };
    const lineNo = i + 2;
    try {
      const name = get("name");
      const images = parseImages(get("images"));
      if (!name) throw new Error("Nom manquant");
      const parsedColors = parseColors(get("colors")).map((color, index) => {
        const own = [color.image, ...(color.images || [])].filter((src): src is string => Boolean(src));
        const photos = own.length ? own : [images[index] || images[0]].filter((src): src is string => Boolean(src));
        return {
          ...color,
          image: photos[0],
          images: photos.slice(1, 5),
        };
      });
      const used = new Set(parsedColors.flatMap((color) => [color.image, ...(color.images || [])].filter(Boolean)));
      const loose = images.filter((src) => !used.has(src));
      if (parsedColors[0] && loose.length) {
        const photos = [...new Set([parsedColors[0].image, ...(parsedColors[0].images || []), ...loose])].filter(
          (src): src is string => Boolean(src),
        );
        parsedColors[0] = {
          ...parsedColors[0],
          image: photos[0],
          images: photos.slice(1, 5),
        };
      }
      const gallery = images.length
        ? images
        : [...new Set(parsedColors.flatMap((color) => [color.image, ...(color.images || [])].filter(Boolean)))];
      if (!gallery.length) throw new Error("Ajoute au moins un lien photo (https://…)");
      const price = Number(get("price").replace(",", "."));
      if (!Number.isFinite(price) || price < 0) throw new Error("Prix invalide");
      const costRaw = get("cost").replace(",", ".");
      const promoRaw = Number(get("promoPrice").replace(",", "."));
      const promoPrice = Number.isFinite(promoRaw) && promoRaw > 0 && promoRaw < price ? promoRaw : 0;
      products.push({
        name,
        brand: get("brand") || "ELVARO",
        price,
        promoPrice,
        cost: Number.isFinite(Number(costRaw)) ? Number(costRaw) : 0,
        description: get("description") || name,
        gender: parseGender(get("gender")),
        category: get("category") || "ville",
        isNew: parseBool(get("isNew")),
        colors: parsedColors,
        sizes: parseSizes(get("sizes")),
        images: gallery,
      });
    } catch (err) {
      errors.push({
        line: lineNo,
        message: err instanceof Error ? err.message : "Ligne invalide",
      });
    }
  });

  return { products, errors };
}

export const CSV_TEMPLATE = `nom;marque;prix;promo;achat;description;genre;categorie;nouveau;couleurs;pointures;images
Oxford Noir;ELVARO;489;399;280;Richelieu cuir lustré;homme;ceremonie;oui;Noir:#141210@/chaussures/oxford-noir.jpg+/chaussures/oxford-noir-2.jpg+/chaussures/oxford-noir-3.jpg+/chaussures/oxford-noir-4.jpg|Cognac:#B5763A@/chaussures/oxford-cognac.jpg;40|41|42|43|44;/chaussures/oxford-noir.jpg|/chaussures/oxford-cognac.jpg
Derby Cognac;ELVARO;459;;260;Derby ville en cuir;homme;ville;oui;Cognac:#8B5A2B@/chaussures/derby-cognac.jpg;40|41|42|43;/chaussures/derby-cognac.jpg|/chaussures/derby-tabac.jpg
`;
