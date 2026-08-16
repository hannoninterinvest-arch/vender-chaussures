"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function NewDrops() {
  const { products } = useCatalog();
  const featured = products.filter((p) => p.featured);
  const drops = (featured.length ? featured : products.filter((p) => p.isNew)).slice(0, 4);
  const heading = featured.length ? "SÉLECTION" : "NOUVEAUTÉS";
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 md:px-6">
      <Reveal>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#C9A45C]">Sélection</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.12em] text-[var(--fg)] md:text-5xl">
              {heading}
            </h2>
          </div>
          <Link href="/shop?drop=new" className="gold-btn rounded-sm px-5 py-2.5 text-[11px] uppercase">
            Voir tout
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {drops.map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
