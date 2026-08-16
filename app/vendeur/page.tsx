"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTnd } from "@/lib/format";
import { sellerRequest, type SellerStats } from "@/lib/seller";

export default function SellerHomePage() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    sellerRequest<SellerStats>("/seller/stats")
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-sm text-[#666]">Chargement du tableau…</p>;

  const cards = [
    { label: "Bénéfice (livré)", value: formatTnd(stats.profit), hint: "Ventes − prix d’achat" },
    { label: "Chiffre d’affaires", value: formatTnd(stats.revenue), hint: "Commandes livrées" },
    { label: "À livrer", value: String(stats.pending), hint: "En attente + en route" },
    { label: "Livrées", value: String(stats.delivered), hint: `${stats.orders} commandes au total` },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">Tableau de bord</h1>
      <p className="mt-1 text-sm text-[#666]">
        Vue d’ensemble des ventes livrées. Marque une commande « livrée » pour qu’elle
        compte dans les bénéfices. Les photos de la page de garde se choisissent dans{" "}
        <Link href="/vendeur/vitrine" className="font-bold text-[#C5A059]">
          Page d’accueil
        </Link>
        .
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[4px] border border-[#C5A059]/35 bg-white p-5">
            <p className="text-sm text-[#666]">{c.label}</p>
            <p className="mt-2 text-3xl font-black text-[#C5A059]">{c.value}</p>
            <p className="mt-1 text-xs text-[#888]">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
          <h2 className="text-lg font-bold">Meilleur produit</h2>
          {stats.bestProduct ? (
            <div className="mt-4 flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stats.bestProduct.image}
                alt=""
                className="h-24 w-24 rounded-2xl object-cover bg-[#EEE]"
              />
              <div>
                <p className="text-xl font-black">{stats.bestProduct.name}</p>
                <p className="mt-1 text-sm text-[#666]">
                  {stats.bestProduct.qty} paires vendues (livrées)
                </p>
                <p className="mt-2 font-bold text-[#C5A059]">
                  {formatTnd(stats.bestProduct.profit)} de bénéfice
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#666]">
              Aucune vente livrée pour le moment. Dès qu’une commande est marquée livrée,
              le top produit apparaît ici.
            </p>
          )}
        </div>

        <div className="rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
          <h2 className="text-lg font-bold">Top ventes</h2>
          <ul className="mt-4 space-y-3">
            {stats.topProducts.map((p, i) => (
              <li key={p.productId} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F5F5F5] text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-medium">{p.name}</span>
                </span>
                <span className="text-sm text-[#666]">{p.qty} u. · {formatTnd(p.revenue)}</span>
              </li>
            ))}
            {stats.topProducts.length === 0 && (
              <li className="text-sm text-[#666]">Pas encore de classement.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/vendeur/produits" className="gold-btn rounded-sm px-4 py-3 text-xs uppercase">
          Ajouter un produit
        </Link>
        <Link href="/vendeur/commandes" className="rounded-sm border border-[#C5A059]/50 bg-white px-4 py-3 text-sm font-bold">
          Voir les commandes
        </Link>
      </div>
    </div>
  );
}
