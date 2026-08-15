"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTnd } from "@/lib/format";
import { sellerRequest, type SellerOrder } from "@/lib/seller";
import { useToast } from "@/components/Toast";

const LABELS: Record<string, string> = {
  en_attente: "En attente",
  en_livraison: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
};

const FILTERS = [
  { id: "all", label: "Toutes" },
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
      <h1 className="text-3xl font-black">Commandes</h1>
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
              filter === f.id ? "bg-[#1A1A1A] text-white" : "bg-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {visible.map((o) => (
          <li key={o.id} className="rounded-[20px] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black">{o.id}</p>
                <p className="text-sm text-[#666]">
                  {new Date(o.createdAt).toLocaleString("fr-TN")} · {o.customer.name} · {o.customer.phone}
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
              {o.status !== "en_livraison" && o.status !== "livree" && o.status !== "annulee" && (
                <button
                  type="button"
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-medium"
                  onClick={() => setStatus(o.id, "en_livraison")}
                >
                  En livraison
                </button>
              )}
              {o.status !== "livree" && o.status !== "annulee" && (
                <button
                  type="button"
                  className="rounded-lg bg-[#5B6AF6] px-3 py-2 text-sm font-bold text-white"
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
          <li className="rounded-[20px] bg-white p-10 text-center text-sm text-[#666]">
            Aucune commande dans ce filtre.
          </li>
        )}
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
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
