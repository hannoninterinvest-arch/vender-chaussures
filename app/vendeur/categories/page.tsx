"use client";

import { FormEvent, useEffect, useState } from "react";
import { isAdmin, sellerRequest, type SellerCategory } from "@/lib/seller";
import { useToast } from "@/components/Toast";

export default function SellerCategoriesPage() {
  const toast = useToast();
  const [rows, setRows] = useState<SellerCategory[]>([]);
  const [label, setLabel] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const admin = isAdmin();

  async function load() {
    setRows(await sellerRequest<SellerCategory[]>("/seller/categories"));
  }

  useEffect(() => {
    let cancelled = false;
    sellerRequest<SellerCategory[]>("/seller/categories")
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await sellerRequest("/seller/categories", {
        method: "POST",
        body: JSON.stringify({ label, image }),
      });
      setLabel("");
      setImage("");
      toast("Catégorie ajoutée");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Impossible d’ajouter");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette catégorie ? Les produits déjà classés restent en boutique.")) return;
    try {
      await sellerRequest(`/seller/categories/${id}`, { method: "DELETE" });
      toast("Catégorie supprimée");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {admin && (
      <form onSubmit={onSubmit} className="space-y-4 rounded-[20px] bg-white p-6">
        <h1 className="text-2xl font-black">Nouvelle catégorie</h1>
        <p className="text-sm text-[#666]">
          Ex. Running, Basketball, Enfants… Elle apparaît sur l’accueil et dans la boutique.
        </p>
        <label className="block text-sm font-medium">
          Nom
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#5B6AF6]"
          />
        </label>
        <label className="block text-sm font-medium">
          Image (URL)
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://…"
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#5B6AF6]"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[#5B6AF6] px-5 py-3 font-bold text-white disabled:opacity-60"
        >
          Ajouter la catégorie
        </button>
      </form>
      )}

      <div>
        <h2 className="text-xl font-black">{rows.length} catégories</h2>
        <ul className="mt-4 space-y-3">
          {rows.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-[16px] bg-white p-3">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-xl bg-[#F5F5F5] text-xs">—</div>
              )}
              <div className="flex-1">
                <p className="font-bold">{c.label}</p>
                <p className="text-xs text-[#888]">{c.id}</p>
              </div>
              {admin && (
              <button type="button" className="text-sm font-medium text-red-600" onClick={() => remove(c.id)}>
                Supprimer
              </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
