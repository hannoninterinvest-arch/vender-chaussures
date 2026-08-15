"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

export function NewDrops() {
  const { products } = useCatalog();
  const drops = products.filter((p) => p.isNew).slice(0, 4);
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#C5A059]">Sélection</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.12em] text-[#EDE8DE] md:text-5xl">
            NOUVEAUTÉS
          </h2>
        </div>
        <Link href="/shop?drop=new" className="gold-btn rounded-sm px-5 py-2.5 text-[11px] uppercase">
          Voir tout
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {drops.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
