"use client";
import { FormEvent, useState } from "react";
import { sellerRequest } from "@/lib/seller";
export default function AccountPage() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage("");
    if (newPassword !== confirmation) { setMessage("Les nouveaux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    try {
      await sellerRequest("/auth/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
      setCurrent(""); setNew(""); setConfirmation("");
      setMessage("Mot de passe modifié. Les autres sessions ont été invalidées.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Modification impossible"); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="max-w-lg space-y-5 rounded border bg-white p-6">
    <h1 className="text-2xl font-semibold">Sécurité du compte</h1>
    <p>Utilise un mot de passe unique d’au moins 12 caractères.</p>
    <label className="block">Mot de passe actuel<input className="mt-2 w-full rounded border p-3" type="password" autoComplete="current-password" required maxLength={72} value={currentPassword} onChange={e => setCurrent(e.target.value)} /></label>
    <label className="block">Nouveau mot de passe<input className="mt-2 w-full rounded border p-3" type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={newPassword} onChange={e => setNew(e.target.value)} /></label>
    <label className="block">Confirmer le nouveau mot de passe<input className="mt-2 w-full rounded border p-3" type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
    <button className="gold-btn rounded px-5 py-3" disabled={busy}>{busy ? "Modification…" : "Changer le mot de passe"}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
