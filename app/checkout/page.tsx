"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCatalog } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import {
  convertFromTnd,
  countryName,
  quoteShipping,
  SHIPPING_COUNTRIES,
  type ShippingQuote,
} from "@/lib/shipping";
import {
  gouvernorats,
  paymentMethods,
  type Gouvernorat,
  type PaymentMethod,
} from "@/lib/tunisia";
import { createOrder, fetchFxRates, fetchGeoCountry, fetchPaymentsConfig } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { brand } from "@/lib/brand";
import { CheckoutSteps } from "@/components/Experience";
import { BrandMark } from "@/components/Logo";

function PriceLine({
  amountDt,
  quote,
  rates,
  fxAvailable,
}: {
  amountDt: number;
  quote: ShippingQuote;
  rates: Record<string, number> | null;
  fxAvailable: boolean;
}) {
  const converted = convertFromTnd(amountDt, quote.currency, rates);
  const showFx = quote.currency !== "TND" && fxAvailable && converted.converted;
  return (
    <span className="text-right">
      <span className="block">{formatMoney(showFx ? converted.amount : amountDt, showFx ? quote.currency : "TND")}</span>
      {showFx && (
        <span className="block text-[11px] font-normal text-[var(--muted)]">≈ {formatMoney(amountDt, "TND")}</span>
      )}
    </span>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { lines, subtotal, clear } = useCart();
  const { products } = useCatalog();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [onlineReady, setOnlineReady] = useState(false);
  const [gouvernorat, setGouvernorat] = useState<Gouvernorat>("Tunis");
  const [country, setCountry] = useState("TN");
  const [geoReady, setGeoReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fxAvailable, setFxAvailable] = useState(true);
  const [rates, setRates] = useState<Record<string, number> | null>({ TND: 1 });

  const weightsByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      const grams = Number(product.weightGrams);
      if (grams > 0) map.set(product.id, grams);
    }
    return map;
  }, [products]);

  const totalWeight = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const grams =
          weightsByProduct.get(line.productId) ||
          Number(line.weightGrams) ||
          0;
        return sum + grams * line.qty;
      }, 0),
    [lines, weightsByProduct],
  );

  const missingWeight = useMemo(
    () =>
      lines.some((line) => {
        const grams = weightsByProduct.get(line.productId) || Number(line.weightGrams) || 0;
        return grams < 1;
      }),
    [lines, weightsByProduct],
  );

  const quote = useMemo(() => quoteShipping(country, totalWeight), [country, totalWeight]);
  const total = subtotal + quote.deliveryDt;
  const tunisia = quote.country === "TN";
  const fxMissing = quote.currency !== "TND" && (!fxAvailable || !rates?.[quote.currency]);

  useEffect(() => {
    let cancelled = false;
    fetchPaymentsConfig()
      .then((cfg) => {
        if (cancelled) return;
        setOnlineReady(Boolean(cfg.online));
        if (cfg.online) setPayment("online");
      })
      .catch(() => {
        if (!cancelled) setOnlineReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchGeoCountry()
      .then((geo) => {
        if (cancelled) return;
        const next = (geo.country || "TN").toUpperCase();
        setCountry(/^[A-Z]{2}$/.test(next) ? next : "TN");
      })
      .catch(() => {
        if (!cancelled) setCountry("TN");
      })
      .finally(() => {
        if (!cancelled) setGeoReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchFxRates()
      .then((fx) => {
        if (cancelled) return;
        setFxAvailable(Boolean(fx.available));
        setRates(fx.rates || { TND: 1 });
      })
      .catch(() => {
        if (!cancelled) {
          setFxAvailable(false);
          setRates({ TND: 1 });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0 || busy) return;
    if (missingWeight || quote.invalidWeight) {
      toast("Poids manquant sur un article. Impossible de valider la commande.");
      return;
    }
    if (quote.needsQuote) {
      toast("Livraison sur devis — contacte-nous avec ton panier.");
      return;
    }
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const order = await createOrder({
        customerName: String(data.get("name")),
        phone: String(data.get("phone")),
        shippingCountry: country,
        gouvernorat: tunisia ? gouvernorat : "",
        city: String(data.get("city")),
        address: String(data.get("address")),
        notes: String(data.get("notes") || ""),
        payment,
        items: lines.map((l) => ({
          productId: l.productId,
          size: l.size,
          color: l.color,
          qty: l.qty,
        })),
      });
      clear();
      if (order.payUrl) {
        window.location.href = order.payUrl;
        return;
      }
      router.push(`/commande/${order.id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Commande impossible");
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <BrandMark size="md" className="mx-auto" />
        <p className="mt-6 font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] uppercase">
          Ton panier est vide.
        </p>
        <Link href="/shop" className="gold-btn mt-6 inline-flex rounded-sm px-6 py-3 text-xs uppercase">
          Continuer les achats
        </Link>
      </div>
    );
  }

  const canPayOnline = onlineReady && !quote.needsQuote;
  const canSubmit = !busy && !quote.needsQuote && !missingWeight && !quote.invalidWeight;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
      <CheckoutSteps step={2} />
      <div className="mb-6 flex items-center gap-4">
        <BrandMark size="sm" />
        <div>
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#C5A059]">Paiement</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.12em] uppercase">
            Checkout invité
          </h1>
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Pas de mot de passe. On te contacte au {brand.phone} pour confirmer.
        {!geoReady ? " Détection du pays…" : ` Pays détecté : ${countryName(country)}.`}
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="gold-frame space-y-6 rounded-[4px] bg-[var(--panel)] p-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg tracking-[0.14em] uppercase">
            Livraison
          </h2>
          <div>
            <label className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">
              Pays
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="field mt-1.5"
            >
              {SHIPPING_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
              {!SHIPPING_COUNTRIES.some((c) => c.code === country) && (
                <option value={country}>🌐 {country}</option>
              )}
            </select>
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Pré-rempli selon ton IP. Tu peux le changer : frais, transporteur et devise se mettent à jour tout de suite.
            </p>
          </div>
          <Field name="name" label="Nom complet" required autoComplete="name" />
          <Field
            name="phone"
            label="Téléphone (WhatsApp de préférence)"
            type="tel"
            required
            placeholder="ex. 20 123 456"
            autoComplete="tel"
          />
          {tunisia && (
            <div>
              <label className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">
                Gouvernorat
              </label>
              <select
                value={gouvernorat}
                onChange={(e) => setGouvernorat(e.target.value as Gouvernorat)}
                className="field mt-1.5"
              >
                {gouvernorats.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          )}
          <Field name="city" label={tunisia ? "Ville / délégation" : "Ville"} required autoComplete="address-level2" />
          <Field name="address" label="Adresse" required placeholder="Rue, immeuble, étage…" autoComplete="street-address" />
          <Field name="notes" label="Note pour le livreur (optionnel)" />

          <h2 className="pt-2 font-[family-name:var(--font-display)] text-lg tracking-[0.14em] uppercase">
            Paiement
          </h2>
          {quote.needsQuote ? (
            <p className="rounded-sm border border-[#C5A059]/40 bg-[#C5A059]/10 p-4 text-sm">
              Panier de plus de 5 kg : livraison sur devis. Le paiement en ligne est bloqué.
              Envoie-nous le panier, on te confirme le tarif.
            </p>
          ) : (
            <div className="space-y-2">
              {paymentMethods.map((m) => {
                const disabled = m.id === "online" && !canPayOnline;
                const hint =
                  m.id === "cod" && !tunisia
                    ? "On confirme par téléphone avant l’expédition internationale."
                    : m.id === "online" && !tunisia
                      ? "Paiement Konnect en dinars (DT). Le total affiché dans ta devise est indicatif."
                      : m.hint;
                return (
                  <label
                    key={m.id}
                    className={`flex items-start gap-3 rounded-sm border p-4 ${
                      disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"
                    } ${
                      payment === m.id
                        ? "border-[#C5A059] bg-[#C5A059]/10"
                        : "border-[#C5A059]/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === m.id}
                      disabled={disabled}
                      onChange={() => setPayment(m.id)}
                      className="mt-1 accent-[#C5A059]"
                    />
                    <span>
                      <span className="block font-semibold">{m.label}</span>
                      <span className="text-sm text-[var(--muted)]">
                        {disabled
                          ? "Konnect n’est pas encore configuré (clés dans backend/.env). Tu peux payer à la livraison."
                          : hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <aside className="gold-frame h-fit rounded-[4px] bg-[var(--panel)] p-6 lg:sticky lg:top-28">
          <h2 className="font-[family-name:var(--font-display)] text-lg tracking-[0.14em] uppercase">
            Ta commande
          </h2>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li key={`${l.productId}-${l.size}-${l.color}`} className="flex gap-3 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt="" className="h-14 w-14 rounded-sm object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{l.name}</p>
                  <p className="text-[var(--muted)]">
                    {l.color} · {l.size} · x{l.qty}
                  </p>
                </div>
                <PriceLine amountDt={Number(l.price) * l.qty} quote={quote} rates={rates} fxAvailable={!fxMissing} />
              </li>
            ))}
          </ul>
          <div className="gold-line my-4" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-[var(--muted)]">
              <span>Sous-total</span>
              <PriceLine amountDt={subtotal} quote={quote} rates={rates} fxAvailable={!fxMissing} />
            </div>
            <div className="flex justify-between text-[var(--muted)]">
              <span>
                {quote.needsQuote
                  ? "Livraison (sur devis)"
                  : `Frais de livraison (${quote.carrierLabel})`}
              </span>
              <span>
                {quote.needsQuote ? "—" : (
                  <PriceLine amountDt={quote.deliveryDt} quote={quote} rates={rates} fxAvailable={!fxMissing} />
                )}
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Poids estimé : {missingWeight || quote.invalidWeight ? "incomplet" : `${totalWeight} g`}
            </p>
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span>Total</span>
              <span className="text-[#C5A059]">
                {quote.needsQuote ? (
                  "Sur devis"
                ) : (
                  <PriceLine amountDt={total} quote={quote} rates={rates} fxAvailable={!fxMissing} />
                )}
              </span>
            </div>
          </div>
          {fxMissing && !quote.needsQuote && (
            <p className="mt-3 rounded-sm bg-[#C5A059]/10 px-3 py-2 text-xs text-[var(--muted)]">
              Conversion temporairement indisponible, prix en DT.
            </p>
          )}
          {missingWeight && (
            <p className="mt-3 rounded-sm bg-red-50 px-3 py-2 text-xs text-red-800">
              Un article n’a pas de poids renseigné. Impossible de valider — contacte la boutique.
            </p>
          )}
          {quote.needsQuote ? (
            <Link
              href={`/contact?devis=1&pays=${quote.country}`}
              className="gold-btn mt-6 flex h-12 w-full items-center justify-center rounded-sm text-xs uppercase"
            >
              Demander un devis
            </Link>
          ) : (
            <button type="submit" disabled={!canSubmit} className="gold-btn mt-6 h-12 w-full rounded-sm text-xs uppercase disabled:opacity-60">
              {busy ? "Envoi…" : payment === "online" ? "Payer en ligne" : "Confirmer la commande"}
            </button>
          )}
          <p className="mt-3 text-center text-[11px] tracking-[0.14em] uppercase text-[var(--muted)]">
            {brand.slogan}
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  required,
  type = "text",
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="field mt-1.5"
      />
    </label>
  );
}
