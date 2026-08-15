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

export type PaymentMethod = "cod" | "flouci" | "d17";

export const paymentMethods: {
  id: PaymentMethod;
  label: string;
  hint: string;
  needsWallet?: boolean;
  walletLabel?: string;
}[] = [
  {
    id: "cod",
    label: "Paiement à la livraison",
    hint: "Espèces au livreur, partout en Tunisie. On confirme par téléphone avant l’envoi.",
  },
  {
    id: "flouci",
    label: "Flouci",
    hint: "Portefeuille mobile tunisien. Après confirmation, on t’envoie la demande de paiement Flouci.",
    needsWallet: true,
    walletLabel: "Numéro Flouci",
  },
  {
    id: "d17",
    label: "D17 (La Poste)",
    hint: "Paiement via l’application D17 de La Poste Tunisienne. On t’envoie la demande après confirmation.",
    needsWallet: true,
    walletLabel: "Numéro D17",
  },
];

export function paymentLabel(id: string) {
  return paymentMethods.find((m) => m.id === id)?.label ?? id;
}
