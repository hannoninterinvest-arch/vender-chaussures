"use client";
import { useEffect, useMemo, useState } from "react";
import { formatTnd } from "@/lib/format";
import { paymentLabel, paymentStatusLabel } from "@/lib/tunisia";
import { sellerRequest, type SellerOrder } from "@/lib/seller";
import {
  ORDER_LABELS,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/order-workflow";
import { useToast } from "@/components/Toast";
type Event = {
  at: string;
  actor: string;
  reason: string;
  from: string;
  to: string;
  type: string;
};
export default function SellerOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<SellerOrder[]>([]),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState("");
  const [open, setOpen] = useState(""),
    [events, setEvents] = useState<Record<string, Event[]>>({});
  const [action, setAction] = useState<{
      order: SellerOrder;
      status: OrderStatus;
    } | null>(null),
    [reason, setReason] = useState(""),
    [ack, setAck] = useState(false),
    [busy, setBusy] = useState("");
  useEffect(() => {
    let cancelled = false;
    sellerRequest<SellerOrder[]>("/seller/orders")
      .then((rows) => {
        if (!cancelled) setOrders(rows);
      })
      .catch((err) => toast(err.message));
    return () => {
      cancelled = true;
    };
  }, [toast]);
  const visible = useMemo(
    () =>
      orders.filter(
        (o) =>
          (filter === "all" || o.status === filter) &&
          `${o.id} ${o.customer.name} ${o.customer.phone}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [orders, filter, search],
  );
  async function detail(id: string) {
    if (open === id) {
      setOpen("");
      return;
    }
    setOpen(id);
    try {
      const list = await sellerRequest<Event[]>(`/seller/orders/${id}/history`);
      setEvents((e) => ({ ...e, [id]: list }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Historique indisponible");
    }
  }
  async function checkPayment(id: string) {
    setBusy(id);
    try {
      const updated = await sellerRequest<SellerOrder>(
        `/seller/orders/${id}/payment-check`,
        { method: "POST" },
      );
      setOrders((rows) => rows.map((o) => (o.id === id ? updated : o)));
      toast(
        updated.paymentStatus === "paid"
          ? "Paiement vérifié : commande confirmée"
          : "Paiement non encore confirmé",
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Vérification impossible");
    } finally {
      setBusy("");
    }
  }
  function start(order: SellerOrder, status: OrderStatus) {
    setAction({ order, status });
    setReason("");
    setAck(false);
  }
  async function apply() {
    if (!action) return;
    setBusy(action.order.id);
    try {
      const updated = await sellerRequest<SellerOrder>(
        `/seller/orders/${action.order.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: action.status,
            reason,
            callConfirmed:
              action.status === "confirmee" && action.order.payment === "cod"
                ? ack
                : undefined,
            cashReceived:
              action.status === "livree" && action.order.payment === "cod"
                ? ack
                : undefined,
          }),
        },
      );
      setOrders((rows) => rows.map((o) => (o.id === updated.id ? updated : o)));
      setAction(null);
      if (open === updated.id) {
        const history = await sellerRequest<Event[]>(
          `/seller/orders/${updated.id}/history`,
        );
        setEvents((e) => ({ ...e, [updated.id]: history }));
      }
      toast("Commande mise à jour");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Mise à jour impossible");
    } finally {
      setBusy("");
    }
  }
  const needsAck =
    action?.order.payment === "cod" &&
    ["confirmee", "livree"].includes(action.status);
  const needsReason =
    action && ["retournee", "annulee"].includes(action.status);
  return (
    <div>
      <h1 className="text-3xl font-bold">Commandes</h1>
      <p className="mt-2 text-sm text-[#666]">
        En ligne : confirmation après paiement vérifié. À la livraison :
        confirmation après appel, puis encaissement lors de la livraison. Les
        retours et annulations restent visibles dans l’historique.
      </p>
      <input
        className="field mt-4 max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Nom, téléphone ou numéro…"
        aria-label="Rechercher une commande"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {["all", ...ORDER_STATUSES].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm ${filter === status ? "bg-[#C5A059]" : "bg-white"}`}
          >
            {status === "all" ? "Toutes" : ORDER_LABELS[status]} (
            {
              orders.filter((o) => status === "all" || o.status === status)
                .length
            }
            )
          </button>
        ))}
      </div>
      <ul className="mt-5 space-y-3">
        {visible.map((o) => (
          <li key={o.id} className="rounded border bg-white p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <strong>{o.id}</strong>{o.accessUrl && <a href={o.accessUrl} className="ml-2 text-xs underline">Suivi client sécurisé</a>}
                <p className="text-sm">
                  {o.customer.name} ·{" "}
                  <a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a>
                </p>
                <p className="text-sm text-[#666]">
                  {o.customer.address}, {o.customer.city} · {o.customer.country}
                </p>
                <p className="text-sm">
                  {paymentLabel(o.payment)} ·{" "}
                  {paymentStatusLabel(o.paymentStatus || "", o.payment)}
                </p>
                {o.refundRequired && (
                  <p className="mt-2 text-sm text-red-700">
                    Paiement reçu : remboursement à traiter.
                  </p>
                )}
              </div>
              <div className="text-right">
                <strong>{formatTnd(o.total)}</strong>
                <p className="mt-1 rounded bg-[#F3EFE5] px-3 py-1 text-sm">
                  {ORDER_LABELS[o.status] || o.status}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(o.allowedStatuses || []).map((status) => (
                <button
                  key={status}
                  disabled={busy === o.id}
                  onClick={() => start(o, status)}
                  className={`rounded border px-3 py-2 text-sm ${["annulee", "retournee"].includes(status) ? "text-red-700" : "bg-[#F5F5F5]"}`}
                >
                  {status === "confirmee" && o.payment === "cod"
                    ? "Confirmer après appel"
                    : status === "livree" && o.payment === "cod"
                      ? "Livrée et encaissée"
                      : ORDER_LABELS[status]}
                </button>
              ))}
              {o.status === "livree" &&
                o.payment === "cod" &&
                o.paymentStatus !== "paid" && (
                  <button
                    onClick={() => start(o, "livree")}
                    className="rounded border px-3 py-2"
                  >
                    Confirmer l’encaissement
                  </button>
                )}
              {o.payment !== "cod" &&
                o.paymentStatus !== "paid" &&
                !["annulee", "retournee"].includes(o.status) && (
                  <button
                    disabled={busy === o.id}
                    onClick={() => void checkPayment(o.id)}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    Vérifier le paiement
                  </button>
                )}
              <button
                className="rounded border px-3 py-2 text-sm"
                onClick={() => void detail(o.id)}
              >
                {open === o.id ? "Masquer" : "Détail et historique"}
              </button>
            </div>
            {open === o.id && (
              <div className="mt-4 border-t pt-4 text-sm">
                <ul>
                  {o.items.map((item, i) => (
                    <li key={i}>
                      {item.qty} × {item.name} · {item.size} · {item.color} —{" "}
                      {formatTnd(item.qty * item.price)}
                    </li>
                  ))}
                </ul>
                {o.customer.notes && (
                  <p className="mt-2">Note : {o.customer.notes}</p>
                )}
                <h3 className="mt-4 font-bold">Historique</h3>
                {(events[o.id] || []).map((e, i) => (
                  <p key={i} className="mt-2 text-[#666]">
                    {new Date(e.at).toLocaleString("fr-TN")} · {e.actor} ·{" "}
                    {e.from ? `${ORDER_LABELS[e.from] || e.from} → ` : ""}
                    {ORDER_LABELS[e.to] || e.to} · {e.reason}
                  </p>
                ))}
                {events[o.id]?.length === 0 && (
                  <p className="mt-2 text-[#666]">
                    Aucun changement enregistré depuis l’activation du suivi.
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {!visible.length && <p className="mt-6">Aucune commande.</p>}
      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void apply();
            }}
            className="w-full max-w-lg rounded bg-white p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Changer le statut"
          >
            <h2 className="text-xl font-bold">
              {ORDER_LABELS[action.status]} — {action.order.id}
            </h2>
            {needsAck && (
              <label className="mt-4 flex gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                  required
                />
                {action.status === "confirmee"
                  ? "J’ai appelé le client et il a accepté la commande."
                  : "Le client a reçu la commande et le paiement a réellement été encaissé."}
              </label>
            )}
            <label className="mt-4 block text-sm">
              {needsReason ? "Motif obligatoire" : "Note (facultative)"}
              <textarea
                className="field mt-2"
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required={Boolean(needsReason)}
              />
            </label>
            <div className="mt-5 flex gap-3">
              <button
                disabled={
                  Boolean(busy) ||
                  (needsAck && !ack) ||
                  Boolean(needsReason && !reason.trim())
                }
                className="gold-btn rounded px-4 py-2 disabled:opacity-40"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setAction(null)}
                className="rounded border px-4 py-2"
              >
                Fermer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
