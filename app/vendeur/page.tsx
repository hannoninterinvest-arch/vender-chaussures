"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatTnd } from "@/lib/format";
import { sellerRequest, type MonthStat, type SellerStats } from "@/lib/seller";

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

  return <Dashboard stats={stats} />;
}

function Dashboard({ stats }: { stats: SellerStats }) {
  const months = stats.months ?? [];
  const thisMonth = stats.thisMonth ?? {
    key: "",
    label: "Ce mois",
    orders: 0,
    pairs: 0,
    revenue: 0,
    profit: 0,
  };
  const lastMonth = stats.lastMonth ?? { ...thisMonth, orders: 0, pairs: 0, revenue: 0, profit: 0 };
  const paid = stats.paid ?? stats.delivered;
  const unpaid = stats.unpaid ?? stats.pending;
  const pairs = stats.pairs ?? 0;
  const maxOrders = Math.max(1, ...months.map((m) => m.orders));
  const delta = lastMonth.orders
    ? Math.round(((thisMonth.orders - lastMonth.orders) / lastMonth.orders) * 100)
    : thisMonth.orders > 0
      ? 100
      : 0;

  const cards = [
    {
      label: "Bénéfice",
      value: formatTnd(stats.profit),
      hint: `CA ${formatTnd(stats.revenue)} − achat ${formatTnd(stats.cost)}`,
    },
    {
      label: "Ventes payées",
      value: String(paid),
      hint: `${pairs} paires · panier moy. ${formatTnd(stats.averageOrder || 0)}`,
    },
    {
      label: "Ce mois",
      value: String(thisMonth.orders),
      hint: `${delta >= 0 ? "+" : ""}${delta}% vs mois dernier · ${formatTnd(thisMonth.profit)}`,
    },
    {
      label: "À encaisser",
      value: String(unpaid),
      hint: `${stats.pending} en cours · ${stats.cancelled} annulées`,
    },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">
        Tableau de bord
      </h1>
      <p className="mt-1 text-sm text-[#666]">
        Statistiques des ventes <strong>déjà payées</strong> : Konnect encaissé, ou espèces à la
        livraison. Les commandes non payées n’entrent pas dans le bénéfice.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[4px] border border-[#C5A059]/35 bg-white p-5">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#888]">{c.label}</p>
            <p className="mt-2 text-3xl font-black text-[#C5A059]">{c.value}</p>
            <p className="mt-1 text-xs text-[#888]">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MiniStat label="Livrées" value={String(stats.delivered)} />
        <MiniStat label="Payé en ligne" value={String(stats.paidOnline ?? 0)} />
        <MiniStat label="Payé à la livraison" value={String(stats.paidCod ?? 0)} />
      </div>

      <section className="mt-8 rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase">
              Achats par mois
            </h2>
            <p className="mt-1 text-sm text-[#666]">Nombre de commandes payées sur 12 mois.</p>
          </div>
          <p className="text-sm text-[#666]">
            {thisMonth.label} : <strong>{thisMonth.orders}</strong> achats · {thisMonth.pairs} paires
          </p>
        </div>
        <MonthChart months={months} maxOrders={maxOrders} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase">
            Produits les plus achetés
          </h2>
          <p className="mt-1 text-sm text-[#666]">Classement des paires vendues et payées.</p>
          <ul className="mt-5 space-y-3">
            {stats.topProducts.map((p, i) => {
              const maxQty = stats.topProducts[0]?.qty || 1;
              return (
                <li key={p.productId} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1A1A1B] text-[11px] font-bold text-[#C5A059]">
                    {i + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="h-12 w-12 rounded-sm object-cover bg-[#EEE]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F3EDE2]">
                      <div
                        className="h-full rounded-full bg-[#C5A059]"
                        style={{ width: `${Math.max(8, (p.qty / maxQty) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-black">{p.qty} paires</p>
                    <p className="text-[#C5A059]">{formatTnd(p.profit)}</p>
                  </div>
                </li>
              );
            })}
            {stats.topProducts.length === 0 && (
              <li className="text-sm text-[#666]">
                Aucune vente payée pour le moment. Dès qu’un paiement Konnect est confirmé ou qu’une
                commande à la livraison est marquée livrée, le classement apparaît ici.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase">
            Meilleur produit
          </h2>
          {stats.bestProduct ? (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stats.bestProduct.image}
                alt=""
                className="h-40 w-full rounded-[4px] object-cover bg-[#EEE]"
              />
              <p className="mt-4 text-xl font-black">{stats.bestProduct.name}</p>
              <p className="mt-1 text-sm text-[#666]">{stats.bestProduct.qty} paires vendues</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <MiniStat label="Chiffre d’affaires" value={formatTnd(stats.bestProduct.revenue)} />
                <MiniStat label="Bénéfice" value={formatTnd(stats.bestProduct.profit)} />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#666]">Pas encore de produit payé.</p>
          )}

          <div className="mt-6 border-t border-[#C5A059]/20 pt-4 text-sm text-[#666]">
            <p>
              Frais de livraison encaissés :{" "}
              <strong className="text-[#1A1A1B]">{formatTnd(stats.deliveryFees || 0)}</strong>
            </p>
            <p className="mt-1">
              Commandes au total : <strong className="text-[#1A1A1B]">{stats.orders}</strong>
            </p>
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/vendeur/commandes" className="gold-btn rounded-sm px-4 py-3 text-xs uppercase">
          Voir les commandes
        </Link>
        <Link
          href="/vendeur/produits"
          className="rounded-sm border border-[#C5A059]/50 bg-white px-4 py-3 text-sm font-bold"
        >
          Gérer les produits
        </Link>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[4px] border border-[#C5A059]/20 bg-[#FBF8F1] p-4">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#888]">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function MonthChart({ months, maxOrders }: { months: MonthStat[]; maxOrders: number }) {
  return (
    <div className="mt-6 flex h-48 items-end gap-2">
      {months.map((m) => {
        const h = Math.max(m.orders ? 12 : 4, Math.round((m.orders / maxOrders) * 160));
        return (
          <div key={m.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-[#1A1A1B]">{m.orders || ""}</span>
            <div
              className="w-full max-w-8 rounded-t-sm bg-[#C5A059] transition-all"
              style={{ height: h }}
              title={`${m.label} : ${m.orders} achats · ${m.pairs} paires · ${formatTnd(m.revenue)}`}
            />
            <span className="w-full truncate text-center text-[10px] uppercase tracking-wide text-[#888]">
              {m.label.replace(/ /g, "\n").split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
