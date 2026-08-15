"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { useCatalog } from "@/lib/catalog";
import { allSizes, brandsOf, type Gender } from "@/lib/products";

export function ShopClient() {
  const { products, categories } = useCatalog();
  const params = useSearchParams();
  const drop = params.get("drop");
  const gender = params.get("gender") as Gender | null;
  const category = params.get("category");
  const brand = params.get("brand");
  const size = params.get("size");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (drop === "new" && !p.isNew) return false;
      if (gender && p.gender !== gender && p.gender !== "unisexe") return false;
      if (category && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;
      if (size && !p.sizes.includes(Number(size))) return false;
      return true;
    });
  }, [drop, gender, category, brand, size, products]);

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
      ? "New Drops"
      : gender === "homme"
        ? "Hommes"
        : gender === "femme"
          ? "Femmes"
          : category
            ? categories.find((c) => c.slug === category)?.label
            : "Tous les produits";

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-10 md:flex-row md:px-6">
      <aside className="w-full shrink-0 md:w-56">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-1 text-sm text-[#666]">{filtered.length} paires</p>

        <div className="mt-8 space-y-6">
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
              <Chip
                key={b}
                href={href({ brand: brand === b ? null : b })}
                active={brand === b}
              >
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
          {(drop || gender || category || brand || size) && (
            <Link href="/shop" className="text-sm font-medium text-[#5B6AF6] underline">
              Réinitialiser
            </Link>
          )}
        </div>
      </aside>

      <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-20 text-center text-[#666]">
            Aucun produit pour ces filtres.
          </p>
        )}
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
      <p className="mb-2 text-sm font-bold uppercase tracking-wide">{title}</p>
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
      className={`rounded-lg px-3 py-1.5 text-sm ${
        active ? "bg-[#1A1A1A] text-white" : "bg-white text-[#1A1A1A]"
      }`}
    >
      {children}
    </Link>
  );
}
