"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCatalog } from "@/lib/catalog";
import { formatTnd } from "@/lib/format";
import { brand, whatsappHref } from "@/lib/brand";
import { countryName, quoteShipping } from "@/lib/shipping";

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-20 text-center text-sm text-[var(--muted)]">Chargement…</p>
      }
    >
      <ContactForm />
    </Suspense>
  );
}

function ContactForm() {
  const params = useSearchParams();
  const quoteMode = params.get("devis") === "1";
  const pays = (params.get("pays") || "TN").toUpperCase();
  const { lines, subtotal } = useCart();
  const { products } = useCatalog();
  const [sent, setSent] = useState(false);

  const totalWeight = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products.find((p) => p.id === line.productId);
        const grams = Number(product?.weightGrams) || Number(line.weightGrams) || 0;
        return sum + grams * line.qty;
      }, 0),
    [lines, products],
  );
  const quote = quoteShipping(pays, totalWeight);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const phone = String(data.get("phone") || "");
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    const items = lines
      .map((l) => `- ${l.qty}× ${l.name} (${l.color}, ${l.size})`)
      .join("\n");
    const body = [
      `Bonjour ELVARO,`,
      quoteMode
        ? `Je souhaite un devis livraison (${countryName(pays)}, ${totalWeight} g).`
        : "",
      name && `Nom : ${name}`,
      phone && `Tél : ${phone}`,
      email && `E-mail : ${email}`,
      items && `Panier :\n${items}`,
      quoteMode ? `Sous-total : ${formatTnd(subtotal)}` : "",
      message ? `Message : ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    setSent(true);
    window.open(whatsappHref(body), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#C5A059]">Contact</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.12em] uppercase">
        {quoteMode ? "Livraison sur devis" : "Écris-nous"}
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        {quoteMode
          ? "Au-delà de 5 kg, on calcule le port à la main (Aramex / DHL). Ton panier est déjà joint."
          : `Réponse au ${brand.phone} ou par WhatsApp.`}
      </p>

      {quoteMode && (
        <div className="gold-frame mt-6 rounded-[4px] bg-[var(--panel)] p-5 text-sm">
          <p>
            Pays : <strong>{countryName(pays)}</strong> · Poids : <strong>{totalWeight} g</strong>
          </p>
          <p className="mt-1 text-[var(--muted)]">{quote.carrierLabel}</p>
          {lines.length === 0 ? (
            <p className="mt-3 text-[var(--muted)]">Panier vide — ajoute tes paires avant le devis.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {lines.map((l) => (
                <li key={`${l.productId}-${l.size}-${l.color}`}>
                  {l.qty}× {l.name} · {l.color} · {l.size} — {formatTnd(Number(l.price) * l.qty)}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 font-semibold">Sous-total produits : {formatTnd(subtotal)}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="gold-frame mt-8 space-y-4 rounded-[4px] bg-[var(--panel)] p-6">
        <label className="block">
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">Nom</span>
          <input name="name" required className="field mt-1.5" autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">Téléphone</span>
          <input name="phone" type="tel" required className="field mt-1.5" autoComplete="tel" />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">E-mail</span>
          <input name="email" type="email" className="field mt-1.5" autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">
            {quoteMode ? "Précision (optionnel)" : "Message"}
          </span>
          <textarea name="message" required={!quoteMode} className="field mt-1.5 min-h-28" />
        </label>
        <button type="submit" className="gold-btn h-12 w-full rounded-sm text-xs uppercase">
          {sent ? "WhatsApp ouvert" : "Envoyer via WhatsApp"}
        </button>
        <p className="text-center text-xs text-[var(--muted)]">
          Ou {brand.email} · {brand.phone}
        </p>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/checkout" className="text-[#C5A059] hover:underline">
          Retour au checkout
        </Link>
      </p>
    </div>
  );
}
