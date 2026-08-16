export const brand = {
  name: "ELVARO",
  byline: "by AIR GO SHOES",
  slogan: "L'excellence à chaque pas",
  activity: "Fabrication et vente de chaussures haut de gamme",
  email: "airgoshoes@gmail.com",
  phone: "+216 28 135 503",
  phoneHref: "tel:+21628135503",
  whatsapp: "https://wa.me/21628135503",
  address: "Z.I El Jaouda Sidi Thabet — 2020 Ariana, Tunisie",
  web: "www.airgoshoes.tn",
};

export function whatsappHref(message?: string) {
  const text = message ?? `Bonjour ${brand.name}, je souhaite des informations.`;
  return `${brand.whatsapp}?text=${encodeURIComponent(text)}`;
}
