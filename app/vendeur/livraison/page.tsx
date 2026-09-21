"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { isAdmin, sellerRequest } from "@/lib/seller";
import { useToast } from "@/components/Toast";

type RateRow = {
  id: string;
  carrier: "ARAMEX" | "LA_POSTE" | string;
  zone: string;
  isLocal: boolean;
  basePriceTND: number;
  weightIncludedKg: number;
  pricePerExtraKgTND: number;
  updatedAt?: string;
};

const ZONE_LABELS: Record<string, string> = {
  TUNISIE: "Tunisie (local)",
  MAGHREB: "Maghreb",
  EUROPE: "Europe",
  MOYEN_ORIENT: "Moyen-Orient",
  AMERIQUE_NORD: "Amérique du Nord",
  RESTE_MONDE: "Reste du monde",
};

const CARRIERS = ["ARAMEX", "LA_POSTE"] as const;
const ZONES = [
  "TUNISIE",
  "MAGHREB",
  "EUROPE",
  "MOYEN_ORIENT",
  "AMERIQUE_NORD",
  "RESTE_MONDE",
] as const;

const empty = {
  carrier: "LA_POSTE" as (typeof CARRIERS)[number],
  zone: "EUROPE" as (typeof ZONES)[number],
  isLocal: false,
  basePriceTND: 45,
  weightIncludedKg: 1,
  pricePerExtraKgTND: 10,
};

const inputClass =
  "w-full rounded-sm border border-[#C5A059]/40 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#C5A059]";

export default function SellerShippingPage() {
  const toast = useToast();
  const admin = isAdmin();
  const [rows, setRows] = useState<RateRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RateRow>>({});
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const data = await sellerRequest<RateRow[]>("/admin/shipping-rates");
    setRows(data);
    setDrafts(Object.fromEntries(data.map((row) => [row.id, { ...row }])));
  }

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    sellerRequest<RateRow[]>("/admin/shipping-rates")
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setDrafts(Object.fromEntries(data.map((row) => [row.id, { ...row }])));
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [admin, toast]);

  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) => a.zone.localeCompare(b.zone) || a.carrier.localeCompare(b.carrier),
      ),
    [rows],
  );

  if (!admin) {
    return <p className="text-red-600">Réservé à l’administrateur.</p>;
  }

  function patchDraft(id: string, patch: Partial<RateRow>) {
    setDrafts((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, ...patch } };
    });
  }

  async function saveRow(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setBusy(id);
    try {
      const updated = await sellerRequest<RateRow>(`/admin/shipping-rates/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          basePriceTND: Number(draft.basePriceTND),
          weightIncludedKg: Number(draft.weightIncludedKg),
          pricePerExtraKgTND: Number(draft.pricePerExtraKgTND),
          isLocal: Boolean(draft.isLocal),
        }),
      });
      setRows((list) => list.map((row) => (row.id === id ? updated : row)));
      setDrafts((prev) => ({ ...prev, [id]: { ...updated } }));
      toast("Tarif enregistré");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setBusy(null);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy("new");
    try {
      await sellerRequest("/admin/shipping-rates", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          isLocal: form.zone === "TUNISIE" || form.isLocal,
          basePriceTND: Number(form.basePriceTND),
          weightIncludedKg: Number(form.weightIncludedKg),
          pricePerExtraKgTND: Number(form.pricePerExtraKgTND),
        }),
      });
      await load();
      toast("Zone ajoutée");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">
        Tarifs de livraison
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-[#666]">
        Les montants affichés sont des <strong>estimations</strong> (Aramex / La Poste). Mets-les
        à jour ici dès que tu as les vrais devis — aucun redéploiement n’est nécessaire. Les
        calculs côté boutique lisent cette table (cache 5 min).
      </p>

      <div className="mt-6 overflow-x-auto rounded-[4px] border border-[#C5A059]/30 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#1A1A1B] text-[#EDE8DE]">
            <tr>
              <th className="px-3 py-3 font-medium">Transporteur</th>
              <th className="px-3 py-3 font-medium">Zone</th>
              <th className="px-3 py-3 font-medium">Local</th>
              <th className="px-3 py-3 font-medium">Base (TND)</th>
              <th className="px-3 py-3 font-medium">Kg inclus</th>
              <th className="px-3 py-3 font-medium">TND / kg extra</th>
              <th className="px-3 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const draft = drafts[row.id] ?? row;
              return (
                <tr key={row.id} className="border-t border-[#C5A059]/20">
                  <td className="px-3 py-2 font-medium">{row.carrier.replace("_", " ")}</td>
                  <td className="px-3 py-2">{ZONE_LABELS[row.zone] ?? row.zone}</td>
                  <td className="px-3 py-2">{row.isLocal ? "Oui" : "Non"}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      className={inputClass}
                      value={draft.basePriceTND}
                      onChange={(e) => patchDraft(row.id, { basePriceTND: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      disabled={row.isLocal}
                      className={inputClass}
                      value={draft.weightIncludedKg}
                      onChange={(e) =>
                        patchDraft(row.id, { weightIncludedKg: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      disabled={row.isLocal}
                      className={inputClass}
                      value={draft.pricePerExtraKgTND}
                      onChange={(e) =>
                        patchDraft(row.id, { pricePerExtraKgTND: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      disabled={busy === row.id}
                      onClick={() => void saveRow(row.id)}
                      className="gold-btn rounded-sm px-3 py-1.5 text-[10px] uppercase disabled:opacity-60"
                    >
                      {busy === row.id ? "…" : "Sauver"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={onCreate}
        className="mt-8 rounded-[4px] border border-[#C5A059]/30 bg-white p-5"
      >
        <h2 className="font-[family-name:var(--font-display)] tracking-[0.12em] uppercase">
          Ajouter une zone
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            Transporteur
            <select
              className={`${inputClass} mt-1`}
              value={form.carrier}
              onChange={(e) =>
                setForm((f) => ({ ...f, carrier: e.target.value as (typeof CARRIERS)[number] }))
              }
            >
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Zone
            <select
              className={`${inputClass} mt-1`}
              value={form.zone}
              onChange={(e) => {
                const zone = e.target.value as (typeof ZONES)[number];
                setForm((f) => ({ ...f, zone, isLocal: zone === "TUNISIE" }));
              }}
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {ZONE_LABELS[z]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Prix de base (TND)
            <input
              type="number"
              min={0}
              step="0.1"
              className={`${inputClass} mt-1`}
              value={form.basePriceTND}
              onChange={(e) => setForm((f) => ({ ...f, basePriceTND: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm">
            Kg inclus
            <input
              type="number"
              min={0}
              step="0.1"
              className={`${inputClass} mt-1`}
              value={form.weightIncludedKg}
              onChange={(e) => setForm((f) => ({ ...f, weightIncludedKg: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm">
            TND / kg extra
            <input
              type="number"
              min={0}
              step="0.1"
              className={`${inputClass} mt-1`}
              value={form.pricePerExtraKgTND}
              onChange={(e) =>
                setForm((f) => ({ ...f, pricePerExtraKgTND: Number(e.target.value) }))
              }
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy === "new"}
          className="gold-btn mt-4 rounded-sm px-5 py-2.5 text-xs uppercase disabled:opacity-60"
        >
          {busy === "new" ? "Ajout…" : "Ajouter"}
        </button>
      </form>
    </div>
  );
}
