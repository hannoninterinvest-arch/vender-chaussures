"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { BrandMark } from "@/components/Logo";
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
    gender
      ? { label: gender === "homme" ? "Homme" : gender === "femme" ? "Femme" : gender, href: href({ gender: null }) }
      : null,
    category
      ? { label: categories.find((c) => c.slug === category)?.label || category, href: href({ category: null }) }
      : null,
    brand ? { label: brand, href: href({ brand: null }) } : null,
    size ? { label: `EU ${size}`, href: href({ size: null }) } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  const pairLabel = ready
    ? `${filtered.length} paire${filtered.length > 1 ? "s" : ""}`
    : "Chargement…";

  const sortControl = (
    <label className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#C5A059]">
      Trier
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as Sort)}
        className="field w-auto min-w-[10rem] py-2 text-xs uppercase"
      >
        <option value="new">Nouveautés</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
      </select>
    </label>
  );

  const filters = (
    <div className="space-y-7">
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
    </div>
  );

  return (
    <div>
      <div className="gold-line" />
      <section className="shop-hero">
        <div className="relative mx-auto max-w-[1280px] px-4 py-12 md:px-6 md:py-16">
          <div className="pointer-events-none absolute right-4 top-4 sm:right-6 sm:top-6">
            <BrandMark size="md" />
          </div>
          <div className="shop-hero-ornament">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-[0.36em] uppercase text-[#C5A059]">Boutique</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.14em] uppercase text-[var(--fg)] md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            Cuir premium, allure de ville et de cérémonie. Choisis ta paire — commande sans compte.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-[#C5A059]/50 bg-[#C5A059]/12 px-3 py-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C5A059]">
              {pairLabel}
            </span>
            <Link href="/shop" className="gold-btn-ghost rounded-sm px-4 py-2 text-[11px] uppercase">
              Toute la collection
            </Link>
          </div>
        </div>
      </section>

      <div className="shop-toolbar">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <p className="hidden text-[11px] font-semibold tracking-[0.22em] uppercase text-[#C5A059] sm:block">
              Boutique
            </p>
            <span className="hidden h-3 w-px bg-[#C5A059]/40 sm:block" />
            <p className="truncate font-[family-name:var(--font-display)] text-sm tracking-[0.16em] uppercase text-[var(--fg)]">
              {title}
            </p>
            <span className="rounded-sm bg-[#C5A059] px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase text-[#1A1612]">
              {pairLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="gold-btn-ghost rounded-sm px-3 py-2 text-[11px] uppercase md:hidden"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              {filtersOpen ? "Fermer" : "Filtres"}
            </button>
            {sortControl}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <aside className={`shop-aside w-full shrink-0 md:w-[17.5rem] ${filtersOpen ? "block" : "hidden md:block"}`}>
            <div className="shop-filters rounded-[4px]">
              <div className="shop-filters-head">
                <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] uppercase text-[#C5A059]">
                  Filtres
                </p>
                <p className="mt-1 text-[11px] tracking-[0.08em] text-[var(--muted)]">
                  Affine ta recherche avec confort.
                </p>
              </div>
              <div className="shop-filters-body">
                {active.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {active.map((chip) => (
                      <Link
                        key={chip.href + chip.label}
                        href={chip.href}
                        className="rounded-sm bg-[#C5A059] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#1A1612]"
                      >
                        {chip.label} ×
                      </Link>
                    ))}
                  </div>
                )}
                {filters}
              </div>
              <div className="shop-filters-foot">
                <Link
                  href="/shop"
                  className="gold-btn-ghost flex w-full items-center justify-center rounded-sm px-4 py-2.5 text-[11px] uppercase"
                >
                  Réinitialiser
                </Link>
              </div>
            </div>
          </aside>

          <div className="grid flex-1 grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {ready && filtered.length === 0 && (
              <div className="gold-frame col-span-full rounded-[4px] bg-[var(--panel)] px-6 py-16 text-center">
                <p className="font-[family-name:var(--font-display)] text-xl tracking-[0.12em] uppercase">
                  Aucune paire pour ces filtres
                </p>
                <Link href="/shop" className="gold-btn mt-5 inline-flex rounded-sm px-6 py-3 text-xs uppercase">
                  Toute la collection
                </Link>
              </div>
            )}
          </div>
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
      <p className="mb-2.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#C5A059]">{title}</p>
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
      className={`rounded-sm px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-[#C5A059] font-semibold text-[#1A1612]"
          : "border border-[#C5A059]/45 text-[var(--fg)] hover:border-[#C5A059] hover:bg-[#C5A059]/12"
      }`}
    >
      {children}
    </Link>
  );
}
