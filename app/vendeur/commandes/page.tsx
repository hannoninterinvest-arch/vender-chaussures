"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTnd } from "@/lib/format";
import { paymentLabel, paymentStatusLabel } from "@/lib/tunisia";
import { sellerRequest, type SellerOrder } from "@/lib/seller";
import { useToast } from "@/components/Toast";

const LABELS: Record<string, string> = {
  paiement_en_cours: "Paiement en cours",
  en_attente: "En attente",
  en_livraison: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
};

const FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "paiement_en_cours", label: "Paiement" },
  { id: "en_attente", label: "En attente" },
  { id: "en_livraison", label: "En livraison" },
  { id: "livree", label: "Livrées" },
  { id: "annulee", label: "Annulées" },
];

export default function SellerOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    sellerRequest<SellerOrder[]>("/seller/orders")
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const visible = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  async function setStatus(id: string, status: string) {
    try {
      const updated = await sellerRequest<SellerOrder>(`/seller/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((rows) => rows.map((o) => (o.id === id ? updated : o)));
      toast(status === "livree" ? "Marquée livrée — bénéfice mis à jour" : "Statut mis à jour");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Mise à jour impossible");
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">Commandes</h1>
      <p className="mt-1 text-sm text-[#666]">
        Passe une commande en « Livrée » quand le client a reçu ses chaussures. Seules les
        livrées comptent dans les bénéfices.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              filter === f.id ? "bg-[#C5A059] text-[#1A1A1B]" : "bg-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {visible.map((o) => (
          <li key={o.id} className="rounded-[4px] border border-[#C5A059]/30 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black">{o.id}</p>
                <p className="text-sm text-[#666]">
                  {new Date(o.createdAt).toLocaleString("fr-TN")} · {o.customer.name} · {o.customer.phone}
                </p>
                <p className="text-sm text-[#666]">
                  {paymentLabel(o.payment)}
                  {o.paymentPhone ? ` · ${o.paymentPhone}` : ""}
                  {" · "}
                  {paymentStatusLabel(o.paymentStatus || "", o.payment)}
                </p>
                <p className="text-sm text-[#666]">
                  {o.customer.address}, {o.customer.city} ({o.customer.gouvernorat})
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black">{formatTnd(o.total)}</p>
                <StatusBadge status={o.status} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {o.payment === "online" && o.paymentStatus !== "paid" && o.status !== "annulee" && (
                <p className="w-full text-sm text-amber-800">
                  Paiement Konnect non confirmé — pas d’expédition tant que ce n’est pas payé.
                </p>
              )}
              {o.status !== "en_livraison" &&
                o.status !== "livree" &&
                o.status !== "annulee" &&
                o.status !== "paiement_en_cours" &&
                !(o.payment === "online" && o.paymentStatus !== "paid") && (
                <button
                  type="button"
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-medium"
                  onClick={() => setStatus(o.id, "en_livraison")}
                >
                  En livraison
                </button>
              )}
              {o.status !== "livree" &&
                o.status !== "annulee" &&
                !(o.payment === "online" && o.paymentStatus !== "paid") && (
                <button
                  type="button"
                  className="gold-btn rounded-sm px-3 py-2 text-xs uppercase"
                  onClick={() => setStatus(o.id, "livree")}
                >
                  Marquer livrée
                </button>
              )}
              {o.status !== "annulee" && o.status !== "livree" && (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600"
                  onClick={() => setStatus(o.id, "annulee")}
                >
                  Annuler
                </button>
              )}
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm text-[#666]"
                onClick={() => setOpen(open === o.id ? null : o.id)}
              >
                {open === o.id ? "Masquer" : "Détail"}
              </button>
            </div>
            {open === o.id && (
              <ul className="mt-4 space-y-2 border-t border-[#EEE] pt-4 text-sm">
                {o.items.map((item, i) => (
                  <li key={`${item.productId}-${i}`} className="flex justify-between">
                    <span>
                      {item.qty}× {item.name} · {item.color} · {item.size}
                    </span>
                    <span>{formatTnd(item.price * item.qty)}</span>
                  </li>
                ))}
                {o.customer.notes && (
                  <li className="text-[#666]">Note : {o.customer.notes}</li>
                )}
              </ul>
            )}
          </li>
        ))}
        {visible.length === 0 && (
          <li className="rounded-[4px] border border-[#C5A059]/30 bg-white p-10 text-center text-sm text-[#666]">
            Aucune commande dans ce filtre.
          </li>
        )}
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paiement_en_cours: "bg-violet-100 text-violet-800",
    en_attente: "bg-amber-100 text-amber-800",
    en_livraison: "bg-blue-100 text-blue-800",
    livree: "bg-emerald-100 text-emerald-800",
    annulee: "bg-red-100 text-red-800",
  };
  return (
    <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] || "bg-[#EEE]"}`}>
      {LABELS[status] || status}
    </span>
  );
}
