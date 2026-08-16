"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatTnd } from "@/lib/format";
import {
  deliveryFee,
  gouvernorats,
  paymentMethods,
  type Gouvernorat,
  type PaymentMethod,
} from "@/lib/tunisia";
import { createOrder, fetchPaymentsConfig } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { brand } from "@/lib/brand";
import { CheckoutSteps } from "@/components/Experience";

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { lines, subtotal, clear } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [onlineReady, setOnlineReady] = useState(false);
  const [gouvernorat, setGouvernorat] = useState<Gouvernorat>("Tunis");
  const [busy, setBusy] = useState(false);
  const fee = useMemo(() => deliveryFee(gouvernorat), [gouvernorat]);
  const total = subtotal + fee;

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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0 || busy) return;
    const data = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const order = await createOrder({
        customerName: String(data.get("name")),
        phone: String(data.get("phone")),
        gouvernorat,
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
        <p className="font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] uppercase">
          Ton panier est vide.
        </p>
        <Link href="/shop" className="gold-btn mt-6 inline-flex rounded-sm px-6 py-3 text-xs uppercase">
          Continuer les achats
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
      <CheckoutSteps step={2} />
      <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#C5A059]">Paiement</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.12em] uppercase">
        Checkout invité
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Pas de mot de passe. On te contacte au {brand.phone} pour confirmer.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="gold-frame space-y-6 rounded-[4px] bg-[var(--panel)] p-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg tracking-[0.14em] uppercase">
            Livraison
          </h2>
          <Field name="name" label="Nom complet" required autoComplete="name" />
          <Field
            name="phone"
            label="Téléphone (WhatsApp de préférence)"
            type="tel"
            required
            placeholder="ex. 20 123 456"
            autoComplete="tel"
          />
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
          <Field name="city" label="Ville / délégation" required autoComplete="address-level2" />
          <Field name="address" label="Adresse" required placeholder="Rue, immeuble, étage…" autoComplete="street-address" />
          <Field name="notes" label="Note pour le livreur (optionnel)" />

          <h2 className="pt-2 font-[family-name:var(--font-display)] text-lg tracking-[0.14em] uppercase">
            Paiement
          </h2>
          <div className="space-y-2">
            {paymentMethods.map((m) => {
              const disabled = m.id === "online" && !onlineReady;
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
                      : m.hint}
                  </span>
                </span>
              </label>
              );
            })}
          </div>
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
                <span className="text-[#C5A059]">{formatTnd(Number(l.price) * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="gold-line my-4" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-[var(--muted)]">
              <span>Sous-total</span>
              <span>{formatTnd(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--muted)]">
              <span>Livraison ({gouvernorat})</span>
              <span>{formatTnd(fee)}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span>Total</span>
              <span className="text-[#C5A059]">{formatTnd(total)}</span>
            </div>
          </div>
          <button type="submit" disabled={busy} className="gold-btn mt-6 h-12 w-full rounded-sm text-xs uppercase disabled:opacity-60">
            {busy ? "Envoi…" : payment === "online" ? "Payer en ligne" : "Confirmer la commande"}
          </button>
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
