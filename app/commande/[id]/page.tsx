"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { fetchOrder } from "@/lib/api";
import { formatTnd } from "@/lib/format";
import { paymentMethods } from "@/lib/tunisia";
import { brand, whatsappHref } from "@/lib/brand";
import { CheckoutSteps } from "@/components/Experience";

type OrderView = {
  id: string;
  total: number;
  payment: string;
  paymentPhone?: string;
  customer: {
    name: string;
    phone: string;
    gouvernorat: string;
    city: string;
    address: string;
  };
  items: {
    productId: string;
    name: string;
    size: number;
    color: string;
    qty: number;
    price: number;
  }[];
};

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderView | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchOrder(id)
      .then((row) => {
        if (!cancelled) setOrder(row);
      })
      .catch(() => {
        if (!cancelled) setOrder(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!ready) {
    return <p className="px-6 py-20 text-center text-sm text-[var(--muted)]">Chargement…</p>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] uppercase">
          Commande introuvable
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Vérifie le numéro ou contacte-nous au {brand.phone}.
        </p>
        <Link href="/shop" className="gold-btn mt-6 inline-flex rounded-sm px-6 py-3 text-xs uppercase">
          Retour boutique
        </Link>
      </div>
    );
  }

  const pay = paymentMethods.find((p) => p.id === order.payment)?.label;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <CheckoutSteps step={3} />
      <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#C5A059]">
        Commande confirmée
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">
        {order.id}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        On t’appelle au {order.customer.phone} pour confirmer avant expédition.
      </p>

      <div className="gold-frame mt-8 rounded-[4px] bg-[var(--panel)] p-6">
        <h2 className="font-[family-name:var(--font-display)] tracking-[0.14em] uppercase">Livraison</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--fg)]">
          {order.customer.name}
          <br />
          {order.customer.address}, {order.customer.city}
          <br />
          {order.customer.gouvernorat}
        </p>
        <p className="mt-4 text-sm">
          Paiement : <strong className="text-[#C5A059]">{pay}</strong>
          {order.paymentPhone ? ` · ${order.paymentPhone}` : ""}
        </p>
        <ul className="mt-6 space-y-3 border-t border-[#C5A059]/25 pt-4">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
              <span>
                {item.name} · {item.color} · {item.size} × {item.qty}
              </span>
              <span className="text-[#C5A059]">{formatTnd(Number(item.price) * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-[#C5A059]">{formatTnd(Number(order.total))}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="gold-btn inline-flex rounded-sm px-6 py-3 text-xs uppercase">
          Continuer les achats
        </Link>
        <a
          href={whatsappHref(`Bonjour ELVARO, ma commande ${order.id}.`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-sm border border-[#C5A059] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#C5A059]"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
