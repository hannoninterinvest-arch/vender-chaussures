"use client";
import { useEffect, useMemo, useState } from "react";
import { isAdmin, sellerRequest } from "@/lib/seller";
import type { CountryRate } from "@/lib/country-shipping";
import { useToast } from "@/components/Toast";
const input = "field min-w-[80px] px-2 py-1 text-sm";
export default function SellerShippingPage() {
  const admin = isAdmin(),
    toast = useToast();
  const [rows, setRows] = useState<CountryRate[]>([]);
  const [search, setSearch] = useState("");
  const [carrier, setCarrier] = useState("LA_POSTE");
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    sellerRequest<CountryRate[]>("/admin/country-rates")
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [admin]);
  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.countryCode !== "TN" &&
          row.carrier === carrier &&
          `${row.countryName} ${row.countryCode}`
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(
              search
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase(),
            ),
      ),
    [rows, carrier, search],
  );
  const shown = filtered.slice(page * 15, page * 15 + 15);
  function patch(id: string, values: Partial<CountryRate>) {
    setRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...values } : row)),
    );
  }
  async function save(row: CountryRate) {
    setBusy(row.id);
    try {
      const updated = await sellerRequest<CountryRate>(
        `/admin/country-rates/${encodeURIComponent(row.id)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            enabled: row.enabled,
            basePriceTND: Number(row.basePriceTND),
            weightIncludedKg: Number(row.weightIncludedKg),
            pricePerExtraKgTND: Number(row.pricePerExtraKgTND),
            weightStepKg: Number(row.weightStepKg),
            maxWeightKg: Number(row.maxWeightKg),
            estimated: row.estimated,
          }),
        },
      );
      patch(row.id, updated);
      toast("Tarif du pays enregistré");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setBusy("");
    }
  }
  if (!admin) return <p>Réservé à l’administrateur.</p>;
  return (
    <div>
      <h1 className="text-3xl font-bold">Livraison par pays</h1>
      <p className="mt-3 text-sm text-[#666]">
        Tunisie : <strong>8 DT par commande</strong>. Poids :{" "}
        <strong>1,5 kg par paire</strong>. À l’étranger, paiement en ligne
        uniquement.
      </p>
      <p className="mt-2 text-sm text-[#666]">
        Tous les pays et territoires sont préremplis avec des estimations
        modifiables. Remplacez-les après avoir obtenu les tarifs du
        transporteur, puis cochez « Tarif réel ». Désactivez les destinations
        non desservies.
      </p>
      <p className="mt-2 text-sm text-[#666]">
        Calcul : base + supplément au-delà des kg inclus. Une tranche de 1 kg
        arrondit le supplément au kg supérieur ; 0 permet un calcul
        proportionnel. Pour un prix simple au kg : base 0, kg inclus 0, tranche
        0.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <input
          className="field max-w-xs"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Rechercher un pays…"
          aria-label="Rechercher un pays"
        />
        <select
          className="field max-w-xs"
          value={carrier}
          onChange={(e) => {
            setCarrier(e.target.value);
            setPage(0);
          }}
          aria-label="Transporteur"
        >
          <option value="LA_POSTE">La Poste</option>
          <option value="ARAMEX">Aramex</option>
        </select>
        <span className="self-center text-sm">
          {filtered.length} destinations
        </span>
      </div>
      {error && <p className="mt-3 text-red-700">{error}</p>}
      <div className="mt-5 overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#F4EFE5]">
            <tr>
              {[
                "Pays",
                "Actif",
                "Base DT",
                "Kg inclus",
                "DT/kg extra",
                "Tranche kg",
                "Max kg",
                "Tarif réel",
                "",
              ].map((title, i) => (
                <th key={i} className="p-3">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 min-w-[180px]">
                  <strong>{row.countryName}</strong>
                  <br />
                  <span className="text-xs text-[#777]">
                    {row.countryCode} ·{" "}
                    {row.estimated ? "Estimation" : "Tarif administrateur"}
                  </span>
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    aria-label={`Activer ${row.countryName}`}
                    onChange={(e) =>
                      patch(row.id, { enabled: e.target.checked })
                    }
                  />
                </td>
                {(
                  [
                    "basePriceTND",
                    "weightIncludedKg",
                    "pricePerExtraKgTND",
                    "weightStepKg",
                    "maxWeightKg",
                  ] as const
                ).map((field) => (
                  <td key={field} className="p-2">
                    <input
                      type="number"
                      min={field === "maxWeightKg" ? 1.5 : 0}
                      step="0.1"
                      className={input}
                      aria-label={`${field} ${row.countryName}`}
                      value={row[field]}
                      onChange={(e) =>
                        patch(row.id, { [field]: Number(e.target.value) })
                      }
                    />
                  </td>
                ))}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={!row.estimated}
                    aria-label={`Tarif réel ${row.countryName}`}
                    onChange={(e) =>
                      patch(row.id, { estimated: !e.target.checked })
                    }
                  />
                </td>
                <td className="p-3">
                  <button
                    className="gold-btn px-3 py-2 rounded-sm text-xs"
                    disabled={busy === row.id}
                    onClick={() => void save(row)}
                  >
                    {busy === row.id ? "…" : "Enregistrer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="rounded border px-4 py-2 disabled:opacity-40"
        >
          Précédent
        </button>
        <span>
          Page {page + 1} / {Math.max(1, Math.ceil(filtered.length / 15))}
        </span>
        <button
          disabled={(page + 1) * 15 >= filtered.length}
          onClick={() => setPage((p) => p + 1)}
          className="rounded border px-4 py-2 disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
