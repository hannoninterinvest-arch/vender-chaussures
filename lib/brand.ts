import { BRAND, BRAND_SIGNATURE } from "@/constants/branding";

export const brand = {
  name: BRAND.name,
  byline: BRAND.subtitle,
  slogan: BRAND.tagline,
  activity: "Fabrication et vente de chaussures haut de gamme",
  email: "airgoshoes@gmail.com",
  phone: "+216 28 135 503",
  phoneHref: "tel:+21628135503",
  whatsapp: "https://wa.me/21628135503",
  address: "Z.I El Jaouda Sidi Thabet — 2020 Ariana, Tunisie",
  web: "www.airgoshoes.tn",
  fullDisplay: BRAND.fullDisplay,
  tagline: BRAND.tagline,
  signature: BRAND_SIGNATURE,
};

export function whatsappHref(message?: string) {
  const text = message ?? `Bonjour ${BRAND.name}, je souhaite des informations.`;
  return `${brand.whatsapp}?text=${encodeURIComponent(text)}`;
}
