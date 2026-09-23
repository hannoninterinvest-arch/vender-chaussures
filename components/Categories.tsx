"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
const GENDERS = [
  { href: "/shop?gender=homme", label: "Homme", image: "/chaussures/hero-oxford.jpg" },
  { href: "/shop?gender=femme", label: "Femme", image: "/chaussures/hero-sandale.jpg" },
  { href: "/shop?category=accessoires", label: "Accessoires", image: "/accessoires/porte-cle-cognac.jpg" },
];

export function Categories() {
  const { categories } = useCatalog();

  return (
    <section>
      <div className="cat-banners">
        {GENDERS.map((g) => (
          <Link key={g.href} href={g.href} className="cat-banner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.image} alt={g.label} />
            <span>{g.label}</span>
          </Link>
        ))}
      </div>
      <div className="cat-strip">
        {categories.map((c) => (
          <Link key={c.slug} href={`/shop?category=${c.slug}`} className="cat-chip">
            {c.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image} alt="" />
            ) : null}
            <span>{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
