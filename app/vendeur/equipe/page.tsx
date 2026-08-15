"use client";

import { FormEvent, useEffect, useState } from "react";
import { isAdmin, sellerRequest, type StaffRole, type StaffUser } from "@/lib/seller";
import { useToast } from "@/components/Toast";

type StaffRow = StaffUser & { active: boolean; createdAt?: string };

const empty = {
  name: "",
  email: "",
  password: "",
  role: "vendeur" as StaffRole,
};

export default function SellerTeamPage() {
  const toast = useToast();
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const admin = isAdmin();

  async function load() {
    setRows(await sellerRequest<StaffRow[]>("/staff"));
  }

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    sellerRequest<StaffRow[]>("/staff")
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err: Error) => {
        if (!cancelled) toast(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [admin, toast]);

  if (!admin) {
    return <p className="text-red-600">Réservé à l’administrateur.</p>;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await sellerRequest("/staff", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(empty);
      toast("Compte créé");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Impossible de créer le compte");
    } finally {
      setBusy(false);
    }
  }

  async function setActive(id: string, active: boolean) {
    try {
      await sellerRequest(`/staff/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      toast(active ? "Compte réactivé" : "Compte désactivé");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Mise à jour impossible");
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce compte ?")) return;
    try {
      await sellerRequest(`/staff/${id}`, { method: "DELETE" });
      toast("Compte supprimé");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4 rounded-[20px] bg-white p-6">
        <h1 className="text-2xl font-black">Nouvel équipier</h1>
        <p className="text-sm text-[#666]">
          <strong>Admin</strong> : boutique + comptes. <strong>Vendeur</strong> : commandes et
          produits, sans supprimer le catalogue ni gérer l’équipe.
        </p>
        <label className="block text-sm font-medium">
          Nom
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#5B6AF6]"
          />
        </label>
        <label className="block text-sm font-medium">
          E-mail
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#5B6AF6]"
          />
        </label>
        <label className="block text-sm font-medium">
          Mot de passe (8 caractères min.)
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#5B6AF6]"
          />
        </label>
        <label className="block text-sm font-medium">
          Rôle
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2"
          >
            <option value="vendeur">Vendeur</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[#5B6AF6] px-5 py-3 font-bold text-white disabled:opacity-60"
        >
          Créer le compte
        </button>
      </form>

      <div>
        <h2 className="text-xl font-black">{rows.length} comptes</h2>
        <ul className="mt-4 space-y-3">
          {rows.map((u) => (
            <li key={u.id} className="rounded-[16px] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{u.name}</p>
                  <p className="text-sm text-[#666]">{u.email}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-[#888]">
                    {u.role === "admin" ? "Admin" : "Vendeur"}
                    {u.active ? "" : " · désactivé"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-sm">
                  <button
                    type="button"
                    className="font-medium text-[#5B6AF6]"
                    onClick={() => void setActive(u.id, !u.active)}
                  >
                    {u.active ? "Désactiver" : "Réactiver"}
                  </button>
                  <button
                    type="button"
                    className="font-medium text-red-600"
                    onClick={() => void remove(u.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
