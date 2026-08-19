"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { brand, whatsappHref } from "@/lib/brand";
import { useCatalog } from "@/lib/catalog";
import { formatTnd } from "@/lib/format";
import { gouvernorats } from "@/lib/tunisia";
import {
  createWholesaleRequest,
  WHOLESALE_MIN_QTY,
  type WholesaleRequest,
} from "@/lib/wholesale";

export default function GrossistePage() {
  const toast = useToast();
  const { products, ready } = useCatalog();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<WholesaleRequest | null>(null);

  const lines = useMemo(
    () =>
      products
        .filter((p) => (qty[p.id] || 0) > 0)
        .map((p) => ({ product: p, qty: qty[p.id] })),
    [products, qty],
  );
  const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
  const retailTotal = lines.reduce(
    (sum, line) => sum + Number(line.product.price) * line.qty,
    0,
  );

  function bump(id: string, delta: number) {
    setQty((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (totalQty < WHOLESALE_MIN_QTY) {
      toast(`Sélectionne au moins ${WHOLESALE_MIN_QTY} paires au total.`);
      return;
    }
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const request = await createWholesaleRequest({
        company: String(data.get("company") || ""),
        contactName: String(data.get("contactName") || ""),
        phone: String(data.get("phone") || ""),
        email: String(data.get("email") || ""),
        gouvernorat: String(data.get("gouvernorat") || ""),
        city: String(data.get("city") || ""),
        message: String(data.get("message") || ""),
        items: lines.map((line) => ({ productId: line.product.id, qty: line.qty })),
      });
      setSent(request);
      setQty({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Demande impossible");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
        <BrandMark size="md" className="mx-auto" />
        <p className="mt-8 text-[11px] font-semibold tracking-[0.28em] uppercase text-[var(--gold)]">
          Demande enregistrée
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase md:text-4xl">
          On vous rappelle
        </h1>
        <p className="mt-4 text-[var(--muted)]">
          Référence <span className="font-semibold text-[var(--fg)]">{sent.id}</span> ·{" "}
          {sent.totalQty} paires. Notre équipe appelle le{" "}
          <span className="font-semibold text-[var(--fg)]">{sent.phone}</span> pour convenir du
          prix de gros et du délai de fabrication.
        </p>
        <div className="gold-frame mt-8 rounded-[4px] bg-[var(--panel)] p-6 text-left">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--gold)]">
            Votre sélection
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted)]">
            {sent.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4">
                <span>
                  {item.qty}× {item.name}
                </span>
                <span>{formatTnd(item.retailPrice * item.qty)} au détail</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Montant indiqué au tarif boutique — le prix de gros est négocié par téléphone.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappHref(`Bonjour ${brand.name}, ma demande de gros ${sent.id}.`)}
            target="_blank"
            rel="noreferrer"
            className="gold-btn rounded-sm px-6 py-3 text-xs uppercase"
          >
            Écrire sur WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setSent(null)}
            className="gold-btn-ghost rounded-sm px-6 py-3 text-xs uppercase"
          >
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="shop-hero">
        <div className="relative mx-auto max-w-[1280px] px-4 py-12 md:px-6 md:py-16">
          <div className="pointer-events-none absolute right-4 top-4 sm:right-6 sm:top-6">
            <BrandMark size="md" />
          </div>
          <div className="shop-hero-ornament">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-[0.36em] uppercase text-[var(--gold)]">
            Espace grossistes
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.14em] uppercase text-[var(--fg)] md:text-6xl">
            Acheter en gros
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Revendeurs, boutiques et sociétés : composez votre commande, laissez votre numéro,
            nous vous appelons pour fixer le prix de gros. Fabrication dans notre atelier de Sidi
            Thabet, à partir de {WHOLESALE_MIN_QTY} paires.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
            <span className="rounded-sm border border-[var(--gold)]/50 bg-[var(--gold)]/12 px-3 py-1.5 text-[var(--gold)]">
              Prix négociable
            </span>
            <span className="rounded-sm border border-[var(--gold)]/50 bg-[var(--gold)]/12 px-3 py-1.5 text-[var(--gold)]">
              Dès {WHOLESALE_MIN_QTY} paires
            </span>
            <span className="rounded-sm border border-[var(--gold)]/50 bg-[var(--gold)]/12 px-3 py-1.5 text-[var(--gold)]">
              On vous rappelle
            </span>
          </div>
        </div>
      </section>

      <form onSubmit={onSubmit} className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.12em] uppercase">
              1 · Choisissez les modèles
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Indiquez le nombre de paires par modèle. L’assortiment des pointures se décide
              ensemble au téléphone.
            </p>
            {!ready && (
              <p className="mt-6 text-sm text-[var(--muted)]">Chargement du catalogue…</p>
            )}
            <ul className="mt-6 space-y-3">
              {products.map((product) => {
                const count = qty[product.id] || 0;
                return (
                  <li
                    key={product.id}
                    className={`gold-frame flex flex-wrap items-center gap-4 rounded-[4px] bg-[var(--panel)] p-3 ${
                      count > 0 ? "ring-1 ring-[var(--gold)]" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-sm object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-sm font-semibold tracking-[0.1em] uppercase hover:text-[var(--gold)]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {product.colors.length} coloris · détail {formatTnd(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-sm border border-[var(--gold)]/40">
                        <button
                          type="button"
                          className="px-3 py-2"
                          aria-label={`Retirer une paire de ${product.name}`}
                          onClick={() => bump(product.id, -1)}
                        >
                          −
                        </button>
                        <input
                          value={count}
                          onChange={(e) => {
                            const next = Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
                            setQty((prev) => ({ ...prev, [product.id]: Math.min(5000, next) }));
                          }}
                          inputMode="numeric"
                          aria-label={`Paires de ${product.name}`}
                          className="w-14 bg-transparent text-center text-sm outline-none"
                        />
                        <button
                          type="button"
                          className="px-3 py-2"
                          aria-label={`Ajouter une paire de ${product.name}`}
                          onClick={() => bump(product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        title={`Mettre 12 paires de ${product.name}`}
                        className="rounded-sm border border-[var(--gold)]/40 px-2 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--gold)] hover:bg-[var(--gold)]/12"
                        onClick={() => setQty((prev) => ({ ...prev, [product.id]: 12 }))}
                      >
                        ×12
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="gold-frame rounded-[4px] bg-[var(--panel)] p-6 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.12em] uppercase">
              2 · Vos coordonnées
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Le téléphone est obligatoire : c’est nous qui appelons pour négocier.
            </p>

            <div className="mt-5 space-y-4">
              <Field name="company" label="Société / boutique" required />
              <Field name="contactName" label="Nom du responsable" required />
              <Field
                name="phone"
                label="Téléphone (on vous rappelle)"
                type="tel"
                placeholder="ex. 28 135 503"
                required
              />
              <Field name="email" label="E-mail (optionnel)" type="email" />
              <label className="block">
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--gold)]">
                  Gouvernorat
                </span>
                <select name="gouvernorat" defaultValue="Tunis" className="field mt-2">
                  {gouvernorats.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <Field name="city" label="Ville" />
              <label className="block">
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--gold)]">
                  Message (pointures, délai, budget)
                </span>
                <textarea name="message" rows={4} className="field mt-2" />
              </label>
            </div>

            <div className="mt-6 border-t border-[var(--line)] pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Paires demandées</span>
                <span className="font-semibold">{totalQty}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-[var(--muted)]">Total au tarif boutique</span>
                <span className="font-semibold">{formatTnd(retailTotal)}</span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Simple repère : le tarif grossiste est fixé par téléphone selon le volume.
              </p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="gold-btn mt-5 w-full rounded-sm px-6 py-3.5 text-xs uppercase disabled:opacity-60"
            >
              {busy ? "Envoi…" : "Envoyer la demande"}
            </button>
            {totalQty > 0 && totalQty < WHOLESALE_MIN_QTY && (
              <p className="mt-3 text-center text-xs text-[var(--promo)]">
                Encore {WHOLESALE_MIN_QTY - totalQty} paire
                {WHOLESALE_MIN_QTY - totalQty > 1 ? "s" : ""} pour atteindre le minimum de gros.
              </p>
            )}
            <p className="mt-4 text-center text-xs text-[var(--muted)]">
              Ou appelez directement le{" "}
              <a href={brand.phoneHref} className="text-[var(--gold)]">
                {brand.phone}
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--gold)]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="field mt-2"
      />
    </label>
  );
}
