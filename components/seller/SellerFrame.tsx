"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Logo from "@/components/Logo";
import {
  clearSellerSession,
  fetchStaffMe,
  sellerLogin,
  SESSION_EXPIRED_EVENT,
  StaffApiError,
  type StaffUser,
} from "@/lib/seller";
import { Icon, type IconName } from "@/components/seller/icons";

type NavItem = { href: string; label: string; icon: IconName; adminOnly: boolean };
const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/vendeur", label: "Tableau de bord", icon: "dashboard", adminOnly: false },
      { href: "/vendeur/commandes", label: "Commandes", icon: "orders", adminOnly: false },
      { href: "/vendeur/grossistes", label: "Grossistes", icon: "wholesale", adminOnly: false },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/vendeur/produits", label: "Produits", icon: "products", adminOnly: false },
      { href: "/vendeur/categories", label: "Catégories", icon: "categories", adminOnly: false },
      { href: "/vendeur/import", label: "Import CSV", icon: "import", adminOnly: false },
      { href: "/vendeur/vitrine", label: "Page d’accueil", icon: "home", adminOnly: false },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/vendeur/equipe", label: "Équipe", icon: "team", adminOnly: true },
      { href: "/vendeur/livraison", label: "Livraison", icon: "shipping", adminOnly: true },
      { href: "/vendeur/paiement", label: "Paiement", icon: "payment", adminOnly: true },
    ],
  },
  {
    label: "Compte",
    items: [{ href: "/vendeur/compte", label: "Mon compte", icon: "account", adminOnly: false }],
  },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";

export function SellerFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<StaffUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const me = await fetchStaffMe();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (cancelled) return;
        setUser(null);
        if (!(err instanceof StaffApiError) || err.status !== 401)
          setError("Service momentanément indisponible. Réessaie dans un instant.");
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onExpired() {
      setUser(null);
      setError("Session expirée. Reconnecte-toi.");
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const groups = useMemo(
    () =>
      NAV.map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.adminOnly || user?.role === "admin"),
      })).filter((group) => group.items.length),
    [user],
  );
  const isActive = (href: string) => (href === "/vendeur" ? path === "/vendeur" : path.startsWith(href));

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
    return <p className="bo px-6 py-20 text-center text-sm text-[#6f675a]">Chargement…</p>;
  }

  if (!user) {
    return (
      <div className="bo bo-login">
        <aside className="bo-login-art">
          <div className="relative z-10">
            <Logo size="lg" />
          </div>
          <div className="relative z-10 max-w-md">
            <p className="bo-eyebrow" style={{ color: "#d8c48a" }}>
              Espace équipe
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight tracking-[0.04em] uppercase">
              Pilotez la boutique ELVARO
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#efe8d8]/70">
              Commandes, catalogue, équipe et paiements au même endroit. Réservé aux administrateurs et aux vendeurs.
            </p>
          </div>
          <p className="relative z-10 text-xs tracking-[0.18em] text-[#efe8d8]/40 uppercase">Cuir premium · Fabriqué en Tunisie</p>
        </aside>
        <main className="flex items-center justify-center px-5 py-12">
          <form onSubmit={onLogin} className="bo-card w-full max-w-md p-8 sm:p-10">
            <div className="lg:hidden">
              <Logo size="md" />
            </div>
            <p className="bo-eyebrow mt-4 lg:mt-0">Connexion</p>
            <h1 className="bo-title">Espace équipe</h1>
            <p className="bo-sub">Connecte-toi avec ton e-mail et ton mot de passe. Les clients commandent toujours sans compte.</p>
            <label className="bo-field mt-7">
              E-mail
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bo-input"
                placeholder="vous@elvaro.com"
                required
              />
            </label>
            <label className="bo-field mt-4">
              Mot de passe
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bo-input"
                required
                minLength={1}
              />
            </label>
            {error && (
              <p role="alert" className="mt-4 rounded-lg bg-[#fbe6e3] px-3 py-2 text-sm text-[#b3261e]">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="bo-btn bo-btn-primary mt-6 w-full py-3 uppercase tracking-[0.12em]">
              {busy ? "Vérification…" : "Connexion"}
            </button>
            <Link href="/" className="mt-5 block text-center text-sm text-[#6f675a] hover:text-[#1b1813]">
              ← Retour à la boutique
            </Link>
          </form>
        </main>
      </div>
    );
  }

  async function signOut() {
    try {
      await clearSellerSession();
      setUser(null);
      router.replace("/vendeur");
    } catch {
      setError("Déconnexion impossible. Réessaie.");
    }
  }

  return (
    <div className="bo">
      <div className="bo-shell">
        <aside className="bo-side">
          <div className="bo-topbar">
            <Link href="/vendeur" aria-label="ELVARO équipe">
              <Logo size="sm" />
            </Link>
            <span className="bo-badge bo-badge-gold lg:ml-auto">{user.role === "admin" ? "Admin" : "Vendeur"}</span>
          </div>

          <nav className="hidden flex-1 overflow-y-auto pb-4 lg:block" aria-label="Navigation équipe">
            {groups.map((group) => (
              <div key={group.label} className="bo-navgroup">
                <p className="bo-navlabel">{group.label}</p>
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} className="bo-link" aria-current={isActive(item.href) ? "page" : undefined}>
                    <Icon name={item.icon} />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <nav className="bo-mobilenav lg:hidden" aria-label="Navigation équipe">
            {groups
              .flatMap((group) => group.items)
              .map((item) => (
                <Link key={item.href} href={item.href} className="bo-link" aria-current={isActive(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              ))}
          </nav>

          <div className="hidden lg:block">
            <Link href="/" className="bo-link mx-3 mb-1">
              <Icon name="store" />
              Voir la boutique
            </Link>
            <div className="bo-user">
              <span className="bo-avatar">{initials(user.name)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-[#efe8d8]/55">{user.email}</p>
              </div>
              <button type="button" onClick={() => void signOut()} aria-label="Se déconnecter" title="Se déconnecter" className="rounded-lg p-2 text-[#efe8d8]/70 hover:bg-white/10 hover:text-white">
                <Icon name="logout" className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 pb-3 lg:hidden">
            <span className="truncate text-xs text-[#efe8d8]/60">{user.name}</span>
            <button type="button" onClick={() => void signOut()} className="rounded-lg bg-[#d4af37] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#1b1813]">
              Quitter
            </button>
          </div>
        </aside>

        <main className="bo-main">
          <div className="bo-main-inner bo-content">
            {error && (
              <p role="alert" className="mb-4 rounded-lg bg-[#fbe6e3] px-3 py-2 text-sm text-[#b3261e]">
                {error}
              </p>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
