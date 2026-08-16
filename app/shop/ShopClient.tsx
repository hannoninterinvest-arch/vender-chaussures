"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { useCatalog } from "@/lib/catalog";
import { allSizes, brandsOf, type Gender } from "@/lib/products";

type Sort = "new" | "price-asc" | "price-desc";

export function ShopClient() {
  const { products, categories, ready } = useCatalog();
  const params = useSearchParams();
  const drop = params.get("drop");
  const gender = params.get("gender") as Gender | null;
  const category = params.get("category");
  const brand = params.get("brand");
  const size = params.get("size");
  const [sort, setSort] = useState<Sort>("new");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const rows = products.filter((p) => {
      if (drop === "new" && !p.isNew) return false;
      if (gender && p.gender !== gender && p.gender !== "unisexe") return false;
      if (category && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;
      if (size && !p.sizes.includes(Number(size))) return false;
      return true;
    });
    return [...rows].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      return Number(b.isNew) - Number(a.isNew);
    });
  }, [drop, gender, category, brand, size, products, sort]);

  function href(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    }
    const q = sp.toString();
    return q ? `/shop?${q}` : "/shop";
  }

  const title =
    drop === "new"
      ? "Nouveautés"
      : gender === "homme"
        ? "Hommes"
        : gender === "femme"
          ? "Femmes"
          : category
            ? categories.find((c) => c.slug === category)?.label
            : "Collection";

  const active = [
    drop === "new" ? { label: "Nouveautés", href: href({ drop: null }) } : null,
    gender ? { label: gender, href: href({ gender: null }) } : null,
    category
      ? { label: categories.find((c) => c.slug === category)?.label || category, href: href({ category: null }) }
      : null,
    brand ? { label: brand, href: href({ brand: null }) } : null,
    size ? { label: `EU ${size}`, href: href({ size: null }) } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Catégorie">
        {categories.map((c) => (
          <Chip
            key={c.slug}
            href={href({ category: category === c.slug ? null : c.slug })}
            active={category === c.slug}
          >
            {c.label}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Marque">
        {brandsOf(products).map((b) => (
          <Chip key={b} href={href({ brand: brand === b ? null : b })} active={brand === b}>
            {b}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Pointure">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <Chip
              key={s}
              href={href({ size: size === String(s) ? null : String(s) })}
              active={size === String(s)}
            >
              {s}
            </Chip>
          ))}
        </div>
      </FilterGroup>
      {active.length > 0 && (
        <Link href="/shop" className="text-sm font-medium text-[#C5A059] underline">
          Réinitialiser
        </Link>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#C5A059]">Boutique</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {ready ? `${filtered.length} paire${filtered.length > 1 ? "s" : ""}` : "Chargement…"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-sm border border-[#C5A059]/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] md:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            {filtersOpen ? "Fermer" : "Filtres"}
          </button>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Trier
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="field w-auto py-2 text-xs uppercase"
            >
              <option value="new">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </label>
        </div>
      </div>

      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {active.map((chip) => (
            <Link
              key={chip.href + chip.label}
              href={chip.href}
              className="rounded-sm bg-[#C5A059] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#1A1A1B]"
            >
              {chip.label} ×
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <aside className={`w-full shrink-0 md:w-56 ${filtersOpen ? "block" : "hidden md:block"}`}>
          {filters}
        </aside>

        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {ready && filtered.length === 0 && (
            <div className="gold-frame col-span-full rounded-[4px] bg-[var(--panel)] px-6 py-16 text-center">
              <p className="font-medium">Aucun produit pour ces filtres.</p>
              <Link href="/shop" className="gold-btn mt-4 inline-flex rounded-sm px-5 py-2.5 text-xs uppercase">
                Voir toute la collection
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C5A059]">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-sm px-3 py-1.5 text-sm ${
        active ? "bg-[#C5A059] text-[#1A1A1B]" : "border border-[#C5A059]/40 text-[var(--fg)]"
      }`}
    >
      {children}
    </Link>
  );
}
