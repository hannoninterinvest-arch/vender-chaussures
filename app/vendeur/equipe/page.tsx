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

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";

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

  const field = "bo-field";
  return (
    <div>
      <header className="bo-pagehead">
        <div>
          <p className="bo-eyebrow">Administration</p>
          <h1 className="bo-title">Équipe</h1>
          <p className="bo-sub">
            Un <strong>vendeur</strong> gère commandes et produits. Un <strong>admin</strong> gère aussi l’équipe, la livraison et les
            paiements.
          </p>
        </div>
        <span className="bo-badge bo-badge-gold">{rows.length} compte{rows.length > 1 ? "s" : ""}</span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <form onSubmit={onSubmit} className="bo-card bo-card-pad space-y-4 lg:sticky lg:top-8">
          <div>
            <h2>{editing ? "Modifier le compte" : "Nouveau compte"}</h2>
            <p className="mt-1 text-xs text-[#9a917f]">
              {editing ? "Les champs vides restent inchangés." : "Le compte est actif dès sa création."}
            </p>
          </div>
          <label className={field}>
            Nom
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bo-input"
            />
          </label>
          <label className={field}>
            E-mail
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bo-input"
            />
          </label>
          <label className={field}>
            {editing ? "Nouveau mot de passe (facultatif)" : "Mot de passe (12 caractères min.)"}
            <input
              required={!editing}
              type="password"
              autoComplete="new-password"
              minLength={editing && !form.password ? 0 : 12}
              maxLength={72}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bo-input"
            />
          </label>
          <label className={field}>
            Rôle
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}
              className="bo-input"
            >
              <option value="vendeur">Vendeur</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={busy} className="bo-btn bo-btn-primary flex-1">
              {editing ? "Enregistrer" : "Créer le compte"}
            </button>
            {editing && (
              <button type="button" onClick={cancelEdit} className="bo-btn">
                Annuler
              </button>
            )}
          </div>
        </form>

        <div className="bo-card overflow-hidden">
          {rows.length === 0 && <p className="bo-card-pad text-sm text-[#6f675a]">Aucun compte.</p>}
          {rows.map((u) => (
            <div key={u.id} className={`bo-row flex-wrap ${editing === u.id ? "bg-[#fffaf0]" : ""}`}>
              <span className={`bo-avatar bo-avatar-sm ${u.active ? "" : "opacity-40 grayscale"}`}>{initialsOf(u.name)}</span>
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-semibold">{u.name}</p>
                <p className="truncate text-sm text-[#6f675a]">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`bo-badge ${u.role === "admin" ? "bo-badge-gold" : ""}`}>{u.role === "admin" ? "Admin" : "Vendeur"}</span>
                <span className={`bo-badge ${u.active ? "bo-badge-ok" : "bo-badge-bad"}`}>{u.active ? "Actif" : "Désactivé"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="bo-btn bo-btn-sm" onClick={() => startEdit(u)}>
                  Modifier
                </button>
                <button type="button" className="bo-btn bo-btn-sm" onClick={() => void setActive(u.id, !u.active)}>
                  {u.active ? "Désactiver" : "Réactiver"}
                </button>
                <button type="button" className="bo-btn bo-btn-sm bo-btn-danger" onClick={() => void remove(u.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
