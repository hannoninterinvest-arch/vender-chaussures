"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  clearSellerSession,
  createFirstAdmin,
  fetchSetupNeeded,
  fetchStaffMe,
  getSellerToken,
  sellerLogin,
  type StaffUser,
} from "@/lib/seller";

const NAV = [
  { href: "/vendeur", label: "Tableau", adminOnly: false },
  { href: "/vendeur/produits", label: "Produits", adminOnly: false },
  { href: "/vendeur/categories", label: "Catégories", adminOnly: false },
  { href: "/vendeur/commandes", label: "Commandes", adminOnly: false },
  { href: "/vendeur/import", label: "Import CSV", adminOnly: false },
  { href: "/vendeur/equipe", label: "Équipe", adminOnly: true },
];

export function SellerFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<StaffUser | null>(null);
  const [setup, setSetup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (getSellerToken()) {
        try {
          const me = await fetchStaffMe();
          if (!cancelled) setUser(me);
        } catch {
          clearSellerSession();
        } finally {
          if (!cancelled) setReady(true);
        }
        return;
      }
      try {
        const status = await fetchSetupNeeded();
        if (!cancelled) setSetup(Boolean(status.needed));
      } catch {
        if (!cancelled) setSetup(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const links = useMemo(
    () => NAV.filter((item) => !item.adminOnly || user?.role === "admin"),
    [user],
  );

  async function onSetup(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const me = await createFirstAdmin(name.trim(), email.trim(), password);
      setUser(me);
      setSetup(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setBusy(false);
    }
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const me = await sellerLogin(email.trim(), password);
      setUser(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <p className="px-6 py-20 text-center text-sm text-[#666]">Chargement…</p>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <form
          onSubmit={setup ? onSetup : onLogin}
          className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-[#FF8A00]">KICKS</p>
          <h1 className="mt-1 text-3xl font-black">
            {setup ? "Créer le premier admin" : "Espace équipe"}
          </h1>
          <p className="mt-2 text-sm text-[#666]">
            {setup
              ? "Aucun compte pour l’instant. Crée l’administrateur. Ensuite tu pourras ajouter des vendeurs dans Équipe."
              : "Connecte-toi avec ton e-mail et mot de passe. Les clients commandent toujours sans compte."}
          </p>
          {setup && (
            <label className="mt-6 block text-sm font-medium">
              Ton nom
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-4 py-3 outline-none focus:border-[#5B6AF6]"
                required
                minLength={2}
              />
            </label>
          )}
          <label className={`${setup ? "mt-4" : "mt-6"} block text-sm font-medium`}>
            E-mail
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-4 py-3 outline-none focus:border-[#5B6AF6]"
              required
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Mot de passe {setup ? "(8 caractères min.)" : ""}
            <input
              type="password"
              autoComplete={setup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-4 py-3 outline-none focus:border-[#5B6AF6]"
              required
              minLength={setup ? 8 : 1}
            />
          </label>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-lg bg-[#5B6AF6] py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? "Vérification…" : setup ? "Créer l’admin" : "Connexion"}
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-[#666] underline">
            Retour à la boutique
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="sticky top-0 z-40 border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/vendeur" className="text-xl font-black">
              KICKS <span className="text-[#5B6AF6]">équipe</span>
            </Link>
            <span className="hidden rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-bold uppercase sm:inline">
              {user.role === "admin" ? "Admin" : "Vendeur"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-[#666] md:inline">{user.name}</span>
            <Link href="/" className="hidden text-[#666] hover:text-[#1A1A1A] sm:inline">
              Voir la boutique
            </Link>
            <button
              type="button"
              className="rounded-full bg-[#F5F5F5] px-3 py-1.5 font-medium"
              onClick={() => {
                clearSellerSession();
                setUser(null);
                router.replace("/vendeur");
              }}
            >
              Quitter
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-4 pb-3 md:px-6">
          {links.map((item) => {
            const active = item.href === "/vendeur" ? path === "/vendeur" : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  active ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F5] text-[#1A1A1A]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">{children}</div>
    </div>
  );
}
