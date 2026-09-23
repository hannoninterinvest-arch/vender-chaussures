"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { isAccessoryCategory, type Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

function mixDrops(products: Product[]) {
  const featured = products.filter((p) => p.featured);
  const pool = featured.length ? featured : products.filter((p) => p.isNew);
  const shoes = pool.filter((p) => !isAccessoryCategory(p.category));
  const accs = pool.filter((p) => isAccessoryCategory(p.category));
  const extras = products.filter(
    (p) => isAccessoryCategory(p.category) && !accs.some((a) => a.id === p.id),
  );
  const accessories = accs.length ? accs : extras;
  const mixed = [...shoes.slice(0, 3), ...accessories.slice(0, 1)];
  if (mixed.length < 4) {
    const used = new Set(mixed.map((p) => p.id));
    for (const p of pool) {
      if (mixed.length >= 4) break;
      if (!used.has(p.id)) mixed.push(p);
    }
  }
  return mixed.slice(0, 4);
}

export function NewDrops() {
  const { products } = useCatalog();
  const featured = products.filter((p) => p.featured);
  const drops = mixDrops(products);
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
