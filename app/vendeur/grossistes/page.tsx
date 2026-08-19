"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import { formatTnd } from "@/lib/format";
import { isAdmin, sellerRequest } from "@/lib/seller";
import { phoneHref, wholesaleStatusLabels, type WholesaleRequest } from "@/lib/wholesale";

const FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "nouveau", label: "À rappeler" },
  { id: "rappele", label: "Rappelées" },
  { id: "negociation", label: "En négociation" },
  { id: "conclu", label: "Conclues" },
  { id: "annule", label: "Annulées" },
];

const BADGES: Record<string, string> = {
  nouveau: "bg-amber-100 text-amber-800",
  rappele: "bg-blue-100 text-blue-800",
  negociation: "bg-violet-100 text-violet-800",
  conclu: "bg-emerald-100 text-emerald-800",
  annule: "bg-red-100 text-red-800",
};

export default function SellerWholesalePage() {
  const toast = useToast();
  const admin = isAdmin();
  const [rows, setRows] = useState<WholesaleRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    sellerRequest<WholesaleRequest[]>("/seller/wholesale")
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setNotes(Object.fromEntries(data.map((row) => [row.id, row.staffNote])));
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.status === filter)),
    [rows, filter],
  );

  async function patch(id: string, body: { status?: string; staffNote?: string }) {
    try {
      const updated = await sellerRequest<WholesaleRequest>(`/seller/wholesale/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setRows((list) => list.map((row) => (row.id === id ? updated : row)));
      toast(body.status ? "Statut mis à jour" : "Note enregistrée");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Mise à jour impossible");
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette demande de gros ?")) return;
    try {
      await sellerRequest(`/seller/wholesale/${id}`, { method: "DELETE" });
      setRows((list) => list.filter((row) => row.id !== id));
      toast("Demande supprimée");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">
        Grossistes
      </h1>
      <p className="mt-1 text-sm text-[#666]">
        Demandes reçues via le formulaire du site. Toutes les coordonnées sont affichées ici :
        appelez le numéro laissé par le grossiste pour négocier le prix, puis notez l’avancement.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count =
            f.id === "all" ? rows.length : rows.filter((row) => row.status === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === f.id ? "bg-[#C5A059] text-[#1A1A1B]" : "bg-white"
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      <ul className="mt-6 space-y-3">
        {visible.map((row) => (
          <li key={row.id} className="rounded-[4px] border border-[#C5A059]/30 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black">
                  {row.id} · {row.company}
                </p>
                <p className="text-sm text-[#666]">
                  Reçue sur le site le {new Date(row.createdAt).toLocaleString("fr-TN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black">{row.totalQty} paires</p>
                <p className="text-sm text-[#666]">{formatTnd(row.retailTotal)} au détail</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
                    BADGES[row.status] || "bg-[#EEE]"
                  }`}
                >
                  {wholesaleStatusLabels[row.status] || row.status}
                </span>
              </div>
            </div>

            <dl className="mt-4 grid gap-x-8 gap-y-2 rounded-lg bg-[#F9F7F2] p-4 sm:grid-cols-2">
              <Info label="Responsable" value={row.contactName} />
              <Info label="Téléphone" value={row.phone} href={phoneHref(row.phone)} strong />
              <Info label="E-mail" value={row.email} href={row.email ? `mailto:${row.email}` : undefined} />
              <Info
                label="Adresse"
                value={[row.city, row.gouvernorat].filter(Boolean).join(", ")}
              />
            </dl>

            {row.message && (
              <p className="mt-3 rounded-lg border border-[#EEE] p-3 text-sm text-[#444]">
                « {row.message} »
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={phoneHref(row.phone)}
                className="gold-btn rounded-sm px-4 py-2 text-xs uppercase"
              >
                Appeler {row.phone}
              </a>
              {row.status === "nouveau" && (
                <button
                  type="button"
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-medium"
                  onClick={() => patch(row.id, { status: "rappele" })}
                >
                  Marquer rappelé
                </button>
              )}
              {row.status !== "conclu" && row.status !== "annule" && (
                <button
                  type="button"
                  className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-sm font-medium"
                  onClick={() => patch(row.id, { status: "negociation" })}
                >
                  En négociation
                </button>
              )}
              {row.status !== "conclu" && (
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                  onClick={() => patch(row.id, { status: "conclu" })}
                >
                  Conclu
                </button>
              )}
              {row.status !== "annule" && (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600"
                  onClick={() => patch(row.id, { status: "annule" })}
                >
                  Annuler
                </button>
              )}
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm text-[#666]"
                onClick={() => setOpen(open === row.id ? null : row.id)}
              >
                {open === row.id ? "Masquer" : `Modèles (${row.items.length}) & note`}
              </button>
              {admin && (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm text-red-600"
                  onClick={() => remove(row.id)}
                >
                  Supprimer
                </button>
              )}
            </div>

            {open === row.id && (
              <div className="mt-4 space-y-4 border-t border-[#EEE] pt-4">
                <ul className="space-y-2 text-sm">
                  {row.items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt=""
                        className="h-12 w-12 rounded bg-[#EEE] object-cover"
                      />
                      <span className="flex-1">
                        {item.qty}× {item.name}
                      </span>
                      <span className="text-[#666]">
                        {formatTnd(item.retailPrice * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <label className="block text-sm font-medium">
                  Note interne (prix négocié, rappel…)
                  <textarea
                    value={notes[row.id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))
                    }
                    className="mt-1 min-h-20 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
                  />
                </label>
                <button
                  type="button"
                  className="rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-bold text-white"
                  onClick={() => patch(row.id, { staffNote: notes[row.id] ?? "" })}
                >
                  Enregistrer la note
                </button>
              </div>
            )}
          </li>
        ))}
        {visible.length === 0 && (
          <li className="rounded-[4px] border border-[#C5A059]/30 bg-white p-10 text-center text-sm text-[#666]">
            Aucune demande dans ce filtre.
          </li>
        )}
      </ul>
    </div>
  );
}

function Info({
  label,
  value,
  href,
  strong,
}: {
  label: string;
  value: string;
  href?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#EDE7D9] py-1.5 last:border-0">
      <dt className="text-xs uppercase tracking-[0.12em] text-[#8A8377]">{label}</dt>
      <dd className={`text-right text-sm ${strong ? "font-bold" : "font-medium"}`}>
        {value ? (
          href ? (
            <a href={href} className="hover:text-[#C5A059]">
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-[#AAA]">—</span>
        )}
      </dd>
    </div>
  );
}
