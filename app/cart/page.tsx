"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatTnd } from "@/lib/format";

export default function CartPage() {
  const { lines, setQty, remove, subtotal, count } = useCart();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
      <div className="gold-frame mb-8 rounded-[4px] bg-[#141414] px-5 py-4">
        <p className="font-bold tracking-wide">Commande sans compte</p>
        <p className="text-sm text-[#EDE8DE]/65">
          Pas d’inscription. Nom, téléphone et adresse suffisent — paiement à la
          livraison partout en Tunisie.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">Ton sac</h1>
          <p className="mt-1 text-sm text-[#EDE8DE]/65">
            {count} article{count > 1 ? "s" : ""} — les articles ne sont pas
            réservés tant que tu n’as pas validé.
          </p>

          <ul className="mt-6 space-y-4">
            {lines.length === 0 && (
              <li className="gold-frame rounded-[4px] bg-[#141414] p-10 text-center">
                <p className="font-medium">Ton panier est vide.</p>
                <Link
                  href="/shop"
                  className="gold-btn mt-4 inline-flex rounded-sm px-5 py-2.5 text-xs uppercase"
                >
                  Voir les paires
                </Link>
              </li>
            )}
            {lines.map((line) => {
              return (
                <li
                  key={`${line.productId}-${line.size}-${line.color}`}
                  className="gold-frame flex gap-4 rounded-[4px] bg-[#141414] p-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.image}
                    alt={line.name}
                    className="h-28 w-28 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-bold">{line.name}</p>
                        <p className="text-sm text-[#EDE8DE]/65">
                          {line.color} · EU {line.size}
                        </p>
                      </div>
                      <p className="font-bold text-[#C5A059]">
                        {formatTnd(Number(line.price) * line.qty)}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-sm border border-[#C5A059]/30">
                        <button
                          type="button"
                          className="px-3 py-1.5"
                          onClick={() =>
                            setQty(line, line.qty - 1)
                          }
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm">{line.qty}</span>
                        <button
                          type="button"
                          className="px-3 py-1.5"
                          onClick={() => setQty(line, line.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-[#EDE8DE]/60 underline"
                        onClick={() => remove(line)}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="gold-frame h-fit rounded-[4px] bg-[#141414] p-6">
          <h2 className="text-xl font-bold">Récapitulatif</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Sous-total" value={formatTnd(subtotal)} />
            <Row label="Livraison" value="Calculée à l’étape suivante" />
          </div>
          <div className="mt-4 flex justify-between border-t border-[#C5A059]/30 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatTnd(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className={`gold-btn mt-6 flex h-12 items-center justify-center rounded-sm text-xs uppercase ${
              lines.length === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            COMMANDER
          </Link>
          <p className="mt-3 text-center text-xs text-[#EDE8DE]/50">
            Aucun login requis
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[#EDE8DE]/70">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
