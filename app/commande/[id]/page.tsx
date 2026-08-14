"use client";

import { use, useSyncExternalStore } from "react";
import Link from "next/link";
import { getOrder, subscribeOrders } from "@/lib/orders";
import { formatTnd } from "@/lib/format";
import { paymentMethods } from "@/lib/tunisia";

function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ready = useClientReady();
  const order = useSyncExternalStore(
    subscribeOrders,
    () => getOrder(id) ?? null,
    () => null,
  );

  if (!ready) {
    return (
      <p className="px-6 py-20 text-center text-sm text-[#666]">Chargement…</p>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-xl font-bold">Commande introuvable</p>
        <p className="mt-2 text-sm text-[#666]">
          Elle est enregistrée uniquement sur cet appareil.
        </p>
        <Link href="/shop" className="mt-4 inline-block text-[#5B6AF6] underline">
          Retour boutique
        </Link>
      </div>
    );
  }

  const pay = paymentMethods.find((p) => p.id === order.payment)?.label;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-semibold text-[#5B6AF6]">Commande confirmée</p>
      <h1 className="mt-2 text-3xl font-black">{order.id}</h1>
      <p className="mt-2 text-sm text-[#666]">
        On t’appelle au {order.customer.phone} pour confirmer avant expédition.
      </p>

      <div className="mt-8 rounded-2xl bg-white p-6">
        <h2 className="font-bold">Livraison</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#444]">
          {order.customer.name}
          <br />
          {order.customer.address}, {order.customer.city}
          <br />
          {order.customer.gouvernorat}
        </p>
        <p className="mt-4 text-sm">
          Paiement : <strong>{pay}</strong>
        </p>
        <ul className="mt-6 space-y-3 border-t border-[#EEE] pt-4">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
              <span>
                {item.name} · {item.color} · {item.size} × {item.qty}
              </span>
              <span>{formatTnd(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatTnd(order.total)}</span>
        </div>
      </div>

      <Link
        href="/shop"
        className="mt-8 inline-flex rounded-lg bg-[#1A1A1A] px-5 py-3 text-sm font-semibold text-white"
      >
        Continuer les achats
      </Link>
    </div>
  );
}
