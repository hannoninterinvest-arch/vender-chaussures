export const gouvernorats = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kébili",
] as const;

export type Gouvernorat = (typeof gouvernorats)[number];

const GRAND_TUNIS: Gouvernorat[] = ["Tunis", "Ariana", "Ben Arous", "Manouba"];
const SAHEL: Gouvernorat[] = ["Sousse", "Monastir", "Mahdia", "Nabeul"];

export function deliveryFee(gouvernorat: Gouvernorat) {
  if (GRAND_TUNIS.includes(gouvernorat)) return 8;
  if (SAHEL.includes(gouvernorat) || gouvernorat === "Sfax") return 12;
  return 15;
}

export type PaymentMethod = "cod" | "online";

export const paymentMethods: {
  id: PaymentMethod;
  label: string;
  hint: string;
}[] = [
  {
    id: "online",
    label: "Paiement en ligne",
    hint: "Carte bancaire, e-DINAR / D17, wallet Konnect ou Flouci — tu es redirigé vers Konnect pour payer tout de suite.",
  },
  {
    id: "cod",
    label: "Paiement à la livraison",
    hint: "Espèces au livreur, partout en Tunisie. On confirme par téléphone avant l’envoi.",
  },
];

export function paymentLabel(id: string) {
  if (id === "flouci") return "Flouci";
  if (id === "d17") return "D17 (La Poste)";
  return paymentMethods.find((m) => m.id === id)?.label ?? id;
}

export function paymentStatusLabel(status: string, payment: string) {
  if (payment === "cod" || status === "cod") return "À encaisser à la livraison";
  if (status === "paid") return "Payé en ligne";
  if (status === "failed") return "Paiement échoué";
  if (status === "pending") return "En attente de paiement";
  return status || "—";
}
