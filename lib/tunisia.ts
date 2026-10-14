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

export type PaymentMethod = "cod" | "flouci";

export const paymentMethods: {
  id: PaymentMethod;
  label: string;
  hint: string;
}[] = [
  {
    id: "flouci",
    label: "Flouci",
    hint: "Paiement sécurisé par Flouci : wallet ou carte bancaire.",
  },
  {
    id: "cod",
    label: "Paiement à la livraison",
    hint: "Espèces au livreur — uniquement si la destination est la Tunisie. On confirme par téléphone avant l’envoi.",
  },
];

export function paymentLabel(id: string) {
  if (id === "flouci") return "Flouci";
  if (id === "online") return "Paiement en ligne (ancien)";
  if (id === "d17") return "D17 (La Poste)";
  return paymentMethods.find((m) => m.id === id)?.label ?? id;
}

export function paymentStatusLabel(status: string, payment: string) {
  if (status === "paid")
    return payment === "cod" ? "Payé à la livraison" : "Payé en ligne";
  if (payment === "cod" || status === "cod")
    return "À encaisser à la livraison";
  if (status === "failed") return "Paiement échoué";
  if (status === "pending") return "En attente de paiement";
  return status || "—";
}
