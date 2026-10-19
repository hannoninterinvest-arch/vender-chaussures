export const brand = {
  name: "ELVARO",
  byline: "par STE SCAROSSO",
  legalName: "STE SCAROSSO",
  // Compléter selon l'extrait RNE, sans inventer de références.
  legalForm: "À compléter selon l'extrait RNE",
  registrationNumber: "À compléter selon le RNE / matricule fiscal",
  slogan: "Cuir premium, fabrication tunisienne",
  activity: "Vente de chaussures",
  email: "scarossoscarosso@gmail.com",
  phone: "+216 25 627 268",
  phoneHref: "tel:+21625627268",
  whatsapp: "https://wa.me/21625627268",
  // Adresse communiquée par l'exploitant ; vérifier qu'elle correspond au siège légal.
  address: "12, rue Boujaâfar, Cité El Mansoura, Ariana Nord, Ariana, Tunisie",
  web: "https://elvaroco.com",
};

export function whatsappHref(message?: string) {
  const text = message ?? `Bonjour ${brand.name}, je souhaite des informations.`;
  return `${brand.whatsapp}?text=${encodeURIComponent(text)}`;
}
