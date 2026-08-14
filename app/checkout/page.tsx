"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { getProduct } from "@/lib/products";
import { formatTnd } from "@/lib/format";
import {
  deliveryFee,
  gouvernorats,
  paymentMethods,
  type Gouvernorat,
  type PaymentMethod,
} from "@/lib/tunisia";
import { createOrderId, saveOrder } from "@/lib/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [gouvernorat, setGouvernorat] = useState<Gouvernorat>("Tunis");
  const fee = useMemo(() => deliveryFee(gouvernorat), [gouvernorat]);
  const total = subtotal + fee;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    const data = new FormData(e.currentTarget);
    const id = createOrderId();
    saveOrder({
      id,
      createdAt: new Date().toISOString(),
      items: lines.map((l) => {
        const p = getProduct(l.productId)!;
        return {
          productId: l.productId,
          name: p.name,
          image: p.images[0],
          size: l.size,
          color: l.color,
          qty: l.qty,
          price: p.price,
        };
      }),
      subtotal,
      delivery: fee,
      total,
      payment,
      customer: {
        name: String(data.get("name")),
        phone: String(data.get("phone")),
        gouvernorat,
        city: String(data.get("city")),
        address: String(data.get("address")),
        notes: String(data.get("notes") || ""),
      },
    });
    clear();
    router.push(`/commande/${id}`);
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-xl font-bold">Ton panier est vide.</p>
        <a href="/shop" className="mt-4 inline-block text-[#5B6AF6] underline">
          Continuer les achats
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
      <h1 className="text-3xl font-black">Checkout invité</h1>
      <p className="mt-1 text-sm text-[#666]">
        Pas de mot de passe. On te contacte au téléphone pour confirmer.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 rounded-2xl bg-white p-6">
          <h2 className="text-lg font-bold">Livraison</h2>
          <Field name="name" label="Nom complet" required />
          <Field
            name="phone"
            label="Téléphone (WhatsApp de préférence)"
            type="tel"
            required
            placeholder="ex. 20 123 456"
          />
          <div>
            <label className="text-sm font-medium">Gouvernorat</label>
            <select
              value={gouvernorat}
              onChange={(e) => setGouvernorat(e.target.value as Gouvernorat)}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-3 outline-none focus:border-[#5B6AF6]"
            >
              {gouvernorats.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <Field name="city" label="Ville / délégation" required />
          <Field name="address" label="Adresse" required placeholder="Rue, immeuble, étage…" />
          <Field name="notes" label="Note pour le livreur (optionnel)" />

          <h2 className="pt-2 text-lg font-bold">Paiement</h2>
          <div className="space-y-2">
            {paymentMethods.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                  payment === m.id ? "border-[#5B6AF6] bg-[#5B6AF6]/5" : "border-[#EEE]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={payment === m.id}
                  onChange={() => setPayment(m.id)}
                />
                <span>
                  <span className="block font-semibold">{m.label}</span>
                  <span className="text-sm text-[#666]">{m.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl bg-white p-6">
          <h2 className="text-lg font-bold">Ta commande</h2>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => {
              const p = getProduct(l.productId);
              if (!p) return null;
              return (
                <li key={`${l.productId}-${l.size}-${l.color}`} className="flex gap-3 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-[#666]">
                      {l.color} · {l.size} · x{l.qty}
                    </p>
                  </div>
                  <span>{formatTnd(p.price * l.qty)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-1 border-t border-[#EEE] pt-4 text-sm">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatTnd(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison ({gouvernorat})</span>
              <span>{formatTnd(fee)}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatTnd(total)}</span>
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 h-12 w-full rounded-lg bg-[#5B6AF6] text-sm font-semibold text-white"
          >
            CONFIRMER LA COMMANDE
          </button>
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
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-3 outline-none focus:border-[#5B6AF6]"
      />
    </label>
  );
}
