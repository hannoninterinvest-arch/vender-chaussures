"use client";

import type { PaymentMethod } from "@/lib/tunisia";

type Props = {
  value: PaymentMethod;
  onChange: (id: PaymentMethod) => void;
  onlineReady: boolean;
  isLocal: boolean;
};

export function PaymentPicker({ value, onChange, onlineReady, isLocal }: Props) {
  const onlineBlocked = !onlineReady;
  const codBlocked = !isLocal;

  return (
    <div className="pay-grid">
      <button
        type="button"
        className={`pay-card ${value === "online" ? "is-on" : ""} ${onlineBlocked ? "is-off" : ""}`}
        disabled={onlineBlocked}
        onClick={() => onChange("online")}
        aria-pressed={value === "online"}
      >
        <span className="pay-check" aria-hidden>
          {value === "online" ? "✓" : ""}
        </span>
        <span className="pay-kicker">Recommandé</span>
        <span className="pay-title">Payer avec Flouci</span>
        <span className="pay-hint">
          {onlineBlocked
            ? "Ajoute FLOUCI_PUBLIC_KEY et FLOUCI_PRIVATE_KEY dans backend/.env pour activer."
            : "Wallet Flouci, cartes tunisiennes et Visa / Mastercard internationales. Redirection sécurisée."}
        </span>
        <span className="pay-brands" aria-hidden>
          <BrandFlouci />
          <BrandVisa />
          <BrandMastercard />
        </span>
      </button>

      <button
        type="button"
        className={`pay-card ${value === "cod" ? "is-on" : ""} ${codBlocked ? "is-off" : ""}`}
        disabled={codBlocked}
        onClick={() => onChange("cod")}
        aria-pressed={value === "cod"}
      >
        <span className="pay-check" aria-hidden>
          {value === "cod" ? "✓" : ""}
        </span>
        <span className="pay-kicker">Tunisie uniquement</span>
        <span className="pay-title">Payer à la livraison</span>
        <span className="pay-hint">
          {codBlocked
            ? "Disponible uniquement pour une livraison en Tunisie. Choisis Flouci pour l’étranger."
            : "Espèces au livreur. On confirme par téléphone avant l’envoi."}
        </span>
        <span className="pay-brands pay-brands-cod" aria-hidden>
          <span className="pay-chip">Espèces</span>
          <span className="pay-chip">Tunisie</span>
        </span>
      </button>
    </div>
  );
}

function BrandFlouci() {
  return (
    <span className="pay-brand pay-brand-flouci">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 12.5h8M12 8.5v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      Flouci
    </span>
  );
}

function BrandVisa() {
  return <span className="pay-brand pay-brand-visa">VISA</span>;
}

function BrandMastercard() {
  return (
    <span className="pay-brand pay-brand-mc">
      <span className="pay-mc" aria-hidden />
      Mastercard
    </span>
  );
}
