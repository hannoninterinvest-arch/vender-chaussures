"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Logo from "@/components/Logo";
import { BRAND } from "@/constants/branding";
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
  { href: "/vendeur/vitrine", label: "Page d’accueil", adminOnly: false },
  { href: "/vendeur/categories", label: "Catégories", adminOnly: false },
  { href: "/vendeur/commandes", label: "Commandes", adminOnly: false },
  { href: "/vendeur/grossistes", label: "Grossistes", adminOnly: false },
  { href: "/vendeur/import", label: "Import CSV", adminOnly: false },
  { href: "/vendeur/equipe", label: "Équipe", adminOnly: true },
  { href: "/vendeur/livraison", label: "Livraison", adminOnly: true },
];

const inputClass =
  "mt-1 w-full rounded-sm border border-[#C5A059]/40 bg-white px-4 py-3 outline-none focus:border-[#C5A059]";

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
      <div className="flex min-h-screen items-center justify-center bg-[#EDE8DE] px-4">
        <form
          onSubmit={setup ? onSetup : onLogin}
          className="w-full max-w-md rounded-[4px] border border-[#C5A059]/50 bg-white p-8"
        >
          <Logo size="md" wordmark />
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase text-[#1A1A1B]">
            {setup ? "Créer le premier admin" : "Espace équipe"}
          </h1>
          <p className="mt-2 text-sm text-[#666]">
            {setup
              ? "Aucun compte pour l’instant. Crée l’administrateur. Ensuite tu pourras ajouter des vendeurs dans Équipe."
              : "Connecte-toi avec ton e-mail et mot de passe. Les clients commandent toujours sans compte."}
          </p>
          {setup && (
            <label className="mt-6 block text-sm font-medium text-[#1A1A1B]">
              Ton nom
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
                minLength={2}
              />
            </label>
          )}
          <label className={`${setup ? "mt-4" : "mt-6"} block text-sm font-medium text-[#1A1A1B]`}>
            E-mail
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-[#1A1A1B]">
            Mot de passe {setup ? "(8 caractères min.)" : ""}
            <input
              type="password"
              autoComplete={setup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
              minLength={setup ? 8 : 1}
            />
          </label>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="gold-btn mt-5 w-full rounded-sm py-3 text-xs uppercase disabled:opacity-60">
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
    <div className="min-h-screen bg-[#F7F1E4] text-[#1C1812]">
      <div className="sticky top-0 z-40 border-b border-[#C9A227]/35 bg-[#FFFAF1] text-[#1C1812]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/vendeur" aria-label={`${BRAND.name} équipe`}>
              <Logo size="sm" wordmark />
            </Link>
            <span className="hidden rounded-sm border border-[#C9A227]/45 px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase text-[#C9A227] sm:inline">
              {user.role === "admin" ? "Admin" : "Vendeur"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-[#1C1812]/70 md:inline">{user.name}</span>
            <Link href="/" className="hidden text-[#C9A227] hover:underline sm:inline">
              Voir la boutique
            </Link>
            <button
              type="button"
              className="rounded-sm bg-[#C9A227] px-3 py-1.5 text-xs font-bold tracking-[0.08em] uppercase text-[#1C1812]"
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
                className={`rounded-sm px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  active ? "bg-[#C9A227] text-[#1C1812]" : "bg-[#C9A227]/10 text-[#1C1812]"
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
