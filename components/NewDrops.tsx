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
        <h2 className="text-4xl font-black tracking-tight text-[#1A1A1A] md:text-5xl">
          NEW DROPS
        </h2>
        <Link
          href="/shop?drop=new"
          className="rounded-lg bg-[#5B6AF6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a58e0]"
        >
          SHOP NEW DROPS
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
