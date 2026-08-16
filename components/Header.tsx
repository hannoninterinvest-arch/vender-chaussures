"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLockup } from "@/components/Logo";
import { ThemeToggle } from "@/components/Experience";
import { useCart } from "@/lib/cart";
import { useCatalog } from "@/lib/catalog";
import { formatTnd } from "@/lib/format";
import { whatsappHref } from "@/lib/brand";

const NAV = [
  { href: "/shop?drop=new", label: "Nouveautés" },
  { href: "/shop?gender=homme", label: "Hommes" },
  { href: "/shop?gender=femme", label: "Femmes" },
  { href: "/shop", label: "Collection" },
];

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const path = usePathname();
  const { count } = useCart();
  const { products } = useCatalog();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s),
      )
      .slice(0, 8);
  }, [q, products]);

  useEffect(() => {
    if (!open && !menu) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setMenu(false);
      }
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, menu]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-6">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:bg-[#C5A059] focus:px-3 focus:py-2 focus:text-[#1A1A1B]"
      >
        Aller au contenu
      </a>
      <div className="gold-frame mx-auto flex max-w-[1280px] items-center justify-between rounded-[4px] bg-[#0A0A0A]/90 px-4 py-3 backdrop-blur-md md:px-8 md:py-4">
        <nav className="hidden items-center gap-7 text-[11px] font-medium tracking-[0.18em] uppercase text-[#EDE8DE] md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={path.startsWith("/shop") && item.href === "/shop" ? "text-[#C5A059]" : "hover:text-[#C5A059]"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:contents">
          <button
            type="button"
            className="rounded-full p-2 text-[#C5A059] hover:bg-white/5 md:hidden"
            aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              {menu ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
          <Link href="/" aria-label="ELVARO accueil">
            <BrandLockup compact />
          </Link>
        </div>

        <div className="flex items-center gap-1 text-[#C5A059]">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Rechercher"
            onClick={() => setOpen(true)}
            className="rounded-full p-2 hover:bg-white/5"
          >
            <IconSearch />
          </button>
          <Link href="/cart" className="relative rounded-full p-2 hover:bg-white/5" aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}>
            <IconBag />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#C5A059] px-1 text-[10px] font-bold text-[#1A1A1B]">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menu && (
        <div className="gold-frame mx-auto mt-2 flex max-w-[1280px] flex-col gap-3 rounded-[4px] bg-[#0A0A0A] p-4 text-xs font-medium tracking-[0.16em] uppercase text-[#EDE8DE]">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenu(false)} className="hover:text-[#C5A059]">
              {item.label}
            </Link>
          ))}
          <a href={whatsappHref()} target="_blank" rel="noreferrer" className="text-[#C5A059]">
            WhatsApp
          </a>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            className="gold-frame mx-auto mt-16 max-w-xl rounded-[4px] bg-[#141414] p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Recherche"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une paire, une marque…"
              className="w-full rounded-sm border border-[#C5A059]/40 bg-transparent px-4 py-3 text-[#EDE8DE] outline-none focus:border-[#C5A059]"
            />
            <p className="mt-2 text-[11px] text-[#EDE8DE]/45">Échap pour fermer</p>
            <ul className="mt-3 max-h-80 overflow-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-sm px-2 py-2 hover:bg-white/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt="" className="h-12 w-12 rounded-sm object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-[#EDE8DE]">{p.name}</span>
                      <span className="text-xs text-[#EDE8DE]/55">{p.brand}</span>
                    </span>
                    <span className="text-[#C5A059]">{formatTnd(p.price)}</span>
                  </Link>
                </li>
              ))}
              {q.length >= 2 && results.length === 0 && (
                <li className="px-2 py-6 text-center text-sm text-[#EDE8DE]/60">Aucun résultat</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
