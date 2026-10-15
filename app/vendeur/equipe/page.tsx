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
  const [editing, setEditing] = useState<string | null>(null);
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

  function startEdit(user: StaffRow) {
    setEditing(user.id);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(empty);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        const { password, ...rest } = form;
        await sellerRequest(`/staff/${editing}`, {
          method: "PATCH",
          body: JSON.stringify(password ? { ...rest, password } : rest),
        });
        toast("Compte modifié");
      } else {
        await sellerRequest("/staff", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast("Compte créé");
      }
      cancelEdit();
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : editing ? "Modification impossible" : "Impossible de créer le compte");
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
      if (editing === id) cancelEdit();
      toast("Compte supprimé");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4 rounded-[4px] border border-[#C5A059]/35 bg-white p-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-[0.08em] uppercase">{editing ? "Modifier le compte" : "Créer un vendeur ou un admin"}</h1>
        <p className="text-sm text-[#666]">
          <strong>Toi (admin)</strong> ajoutes, modifies et supprimes les comptes ici. Un <strong>vendeur</strong> gère
          commandes et produits. Un <strong>admin</strong> peut aussi gérer l’équipe et supprimer
          le catalogue.
        </p>
        <label className="block text-sm font-medium">
          Nom
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
          />
        </label>
        <label className="block text-sm font-medium">
          E-mail
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
          />
        </label>
        <label className="block text-sm font-medium">
          {editing ? "Nouveau mot de passe (laisser vide pour ne pas le changer)" : "Mot de passe (12 caractères min.)"}
          <input
            required={!editing}
            type="password"
            autoComplete="new-password"
            minLength={editing && !form.password ? 0 : 12} maxLength={72}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 outline-none focus:border-[#C5A059]"
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
          className="gold-btn rounded-sm px-5 py-3 text-xs uppercase disabled:opacity-60"
        >
          {editing ? "Enregistrer les modifications" : "Créer le compte"}
        </button>
        {editing && (
          <button type="button" onClick={cancelEdit} className="ml-3 text-sm underline">
            Annuler
          </button>
        )}
      </form>

      <div>
        <h2 className="text-xl font-black">{rows.length} comptes</h2>
        <ul className="mt-4 space-y-3">
          {rows.map((u) => (
            <li key={u.id} className="rounded-[4px] border border-[#C5A059]/30 bg-white p-4">
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
                    className="font-medium text-[#1A1A1B]"
                    onClick={() => startEdit(u)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="font-medium text-[#C5A059]"
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
