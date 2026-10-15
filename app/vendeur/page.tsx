"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTnd } from "@/lib/format";
import { sellerRequest, type SellerStats } from "@/lib/seller";

type WholesaleStats = {
  total: number;
  nouveau: number;
  enCours: number;
  conclu: number;
};

export default function SellerHomePage() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [wholesale, setWholesale] = useState<WholesaleStats | null>(null);
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
    sellerRequest<WholesaleStats>("/seller/wholesale/stats")
      .then((data) => {
        if (!cancelled) setWholesale(data);
      })
      .catch(() => {
        /* l'API n'a pas encore le module gros */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats)
    return <p className="text-sm text-[#6f675a]">Chargement du tableau…</p>;

  const cards = [
    {
      label: "Bénéfice (livré)",
      value: formatTnd(stats.profit),
      hint: "Ventes − prix d’achat",
    },
    {
      label: "Chiffre d’affaires",
      value: formatTnd(stats.revenue),
      hint: "Commandes livrées",
    },
    {
      label: "À livrer",
      value: String(stats.pending),
      hint: "En attente + en route",
    },
    {
      label: "Livrées",
      value: String(stats.delivered),
      hint: `${stats.orders} commandes au total`,
    },
    {
      label: "Confirmées",
      value: String(stats.confirmed || 0),
      hint: "Prêtes pour l’expédition",
    },
    {
      label: "À appeler",
      value: String(stats.awaitingCall || 0),
      hint: "Paiement à la livraison",
    },
    {
      label: "Paiements en attente",
      value: String(stats.awaitingPayment || 0),
      hint: "Commandes en ligne non payées",
    },
    {
      label: "Retournées",
      value: String(stats.returned || 0),
      hint: "Exclues des bénéfices",
    },
  ];

  return (
    <div>
      <header className="bo-pagehead">
        <div>
          <p className="bo-eyebrow">Vue d’ensemble</p>
          <h1 className="bo-title">Tableau de bord</h1>
          <p className="bo-sub">
            Seules les commandes livrées et réellement payées comptent dans les bénéfices. Les photos de la page de garde se
            choisissent dans{" "}
            <Link href="/vendeur/vitrine" className="font-semibold text-[#b48a2f] underline-offset-2 hover:underline">
              Page d’accueil
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/vendeur/produits" className="bo-btn bo-btn-primary">
            Ajouter un produit
          </Link>
          <Link href="/vendeur/commandes" className="bo-btn">
            Voir les commandes
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, index) => (
          <div key={c.label} className={`bo-card bo-kpi ${index < 2 ? "is-hero" : ""}`}>
            <p className="bo-kpi-label">{c.label}</p>
            <p className="bo-kpi-value">{c.value}</p>
            <p className="bo-kpi-hint">{c.hint}</p>
          </div>
        ))}
      </div>

      {wholesale && wholesale.total > 0 && (
        <div className="bo-card bo-card-pad mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2>Demandes de grossistes</h2>
              <p className="mt-1 text-sm text-[#6f675a]">
                {wholesale.nouveau > 0
                  ? `${wholesale.nouveau} grossiste${wholesale.nouveau > 1 ? "s" : ""} à rappeler`
                  : "Aucun rappel en attente"}
                {wholesale.enCours > 0 ? ` · ${wholesale.enCours} en négociation` : ""}
                {wholesale.conclu > 0 ? ` · ${wholesale.conclu} conclu(es)` : ""}
              </p>
            </div>
            <Link href="/vendeur/grossistes" className="bo-btn bo-btn-primary">
              Voir les {wholesale.total} demande{wholesale.total > 1 ? "s" : ""}
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="bo-card bo-card-pad">
          <h2>Meilleur produit</h2>
          {stats.bestProduct ? (
            <div className="mt-4 flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stats.bestProduct.image} alt="" className="h-24 w-24 rounded-xl bg-[#eee] object-cover" />
              <div>
                <p className="text-xl font-bold">{stats.bestProduct.name}</p>
                <p className="mt-1 text-sm text-[#6f675a]">{stats.bestProduct.qty} paires vendues (livrées)</p>
                <p className="mt-2 font-semibold text-[#b48a2f]">{formatTnd(stats.bestProduct.profit)} de bénéfice</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-[#6f675a]">
              Aucune vente livrée pour le moment. Dès qu’une commande est marquée livrée, le top produit apparaît ici.
            </p>
          )}
        </div>

        <div className="bo-card bo-card-pad">
          <h2>Top ventes</h2>
          <ul className="mt-4 space-y-3">
            {stats.topProducts.map((p, i) => (
              <li key={p.productId} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f3e8c8] text-xs font-bold text-[#7a5a14]">{i + 1}</span>
                  <span className="font-medium">{p.name}</span>
                </span>
                <span className="text-sm text-[#6f675a]">
                  {p.qty} u. · {formatTnd(p.revenue)}
                </span>
              </li>
            ))}
            {stats.topProducts.length === 0 && <li className="text-sm text-[#6f675a]">Pas encore de classement.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
