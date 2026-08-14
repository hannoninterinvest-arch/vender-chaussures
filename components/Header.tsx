"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { products } from "@/lib/products";
import { formatTnd } from "@/lib/format";

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1 12H7L6 8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V7a3 3 0 0 1 6 0v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-6">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between rounded-[20px] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:px-8 md:py-4">
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#1A1A1A] md:flex">
          <Link href="/shop?drop=new" className="hover:opacity-70">
            New Drops <span className="text-[#FF8A00]">🔥</span>
          </Link>
          <Link href="/shop?gender=homme" className="hover:opacity-70">
            Hommes
          </Link>
          <Link href="/shop?gender=femme" className="hover:opacity-70">
            Femmes
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:contents">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-[#F5F5F5] md:hidden"
            aria-label="Menu"
            onClick={() => setMenu((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        <Link href="/" className="text-[28px] font-black tracking-tight text-[#1A1A1A]">
          KICKS
        </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Rechercher"
            onClick={() => setOpen(true)}
            className="rounded-full p-2 hover:bg-[#F5F5F5]"
          >
            <IconSearch />
          </button>
          <Link href="/cart" className="relative rounded-full p-2 hover:bg-[#F5F5F5]" aria-label="Panier">
            <IconBag />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF8A00] px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menu && (
        <div className="mx-auto mt-2 flex max-w-[1280px] flex-col gap-2 rounded-[20px] bg-white p-4 text-sm font-medium shadow md:hidden">
          <Link href="/shop?drop=new" onClick={() => setMenu(false)}>
            New Drops
          </Link>
          <Link href="/shop?gender=homme" onClick={() => setMenu(false)}>
            Hommes
          </Link>
          <Link href="/shop?gender=femme" onClick={() => setMenu(false)}>
            Femmes
          </Link>
          <Link href="/shop" onClick={() => setMenu(false)}>
            Tous les produits
          </Link>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-20 max-w-xl rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher une paire, une marque…"
              className="w-full rounded-lg border border-[#E5E5E5] px-4 py-3 outline-none focus:border-[#5B6AF6]"
            />
            <ul className="mt-3 max-h-80 overflow-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2 py-3 hover:bg-[#F5F5F5]"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-[#5B6AF6]">{formatTnd(p.price)}</span>
                  </Link>
                </li>
              ))}
              {q.length >= 2 && results.length === 0 && (
                <li className="px-2 py-6 text-center text-sm text-[#666]">Aucun résultat</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
