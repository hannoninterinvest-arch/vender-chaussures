"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";

export function Categories() {
  const { categories } = useCatalog();

  return (
    <section className="border-y border-[#C5A059]/20 bg-[#070707] py-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <p className="text-[11px] tracking-[0.28em] uppercase text-[#C5A059]">Univers</p>
        <h2 className="mb-8 mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.12em] text-[#EDE8DE] md:text-5xl">
          CATÉGORIES
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="gold-frame group relative overflow-hidden rounded-[4px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"}
                alt={c.label}
                className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute bottom-5 left-5 text-sm font-semibold tracking-[0.16em] uppercase text-[#EDE8DE]">
                {c.label}
              </span>
              <span className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-[#C5A059] text-[#C5A059]">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
