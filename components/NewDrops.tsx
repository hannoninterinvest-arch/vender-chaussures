"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function NewDrops() {
  const { products } = useCatalog();
  const featured = products.filter((p) => p.featured);
  const drops = (featured.length ? featured : products.filter((p) => p.isNew)).slice(0, 4);
  const heading = featured.length ? "Sélection" : "Nouveautés";
  return (
    <section className="store-section">
      <Reveal>
        <div className="section-head">
          <div>
            <p className="section-kicker">Boutique</p>
            <h2 className="section-title">{heading}</h2>
          </div>
          <Link href="/shop?drop=new" className="text-link">
            Voir tout
          </Link>
        </div>
      </Reveal>
      <div className="product-grid">
        {drops.map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
