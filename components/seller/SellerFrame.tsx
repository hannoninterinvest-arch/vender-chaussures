"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { clearSellerKey, getSellerKey, sellerLogin, sellerRequest } from "@/lib/seller";

const NAV = [
  { href: "/vendeur", label: "Tableau" },
  { href: "/vendeur/produits", label: "Produits" },
  { href: "/vendeur/categories", label: "Catégories" },
  { href: "/vendeur/commandes", label: "Commandes" },
];

export function SellerFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const stored = getSellerKey();
    if (!stored) {
      Promise.resolve().then(() => {
        if (!cancelled) setReady(true);
      });
      return () => {
        cancelled = true;
      };
    }
    sellerRequest("/seller/stats")
      .then(() => {
        if (!cancelled) setAuthed(true);
      })
      .catch(() => clearSellerKey())
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await sellerLogin(key.trim());
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clé invalide");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <p className="px-6 py-20 text-center text-sm text-[#666]">Chargement…</p>;
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <form
          onSubmit={onLogin}
          className="w-full max-w-md rounded-[20px] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-[#FF8A00]">KICKS</p>
          <h1 className="mt-1 text-3xl font-black">Espace vendeur</h1>
          <p className="mt-2 text-sm text-[#666]">
            Ajoute tes paires, suis les livraisons et vois tes bénéfices. Les clients
            commandent toujours sans compte.
          </p>
          <label className="mt-6 block text-sm font-medium">
            Clé vendeur
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-4 py-3 outline-none focus:border-[#5B6AF6]"
              required
            />
          </label>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-lg bg-[#5B6AF6] py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? "Vérification…" : "Entrer"}
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
              KICKS <span className="text-[#5B6AF6]">vendeur</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="hidden text-[#666] hover:text-[#1A1A1A] sm:inline">
              Voir la boutique
            </Link>
            <button
              type="button"
              className="rounded-full bg-[#F5F5F5] px-3 py-1.5 font-medium"
              onClick={() => {
                clearSellerKey();
                setAuthed(false);
                router.replace("/vendeur");
              }}
            >
              Quitter
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-4 pb-3 md:px-6">
          {NAV.map((item) => {
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
