"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";

export function Categories() {
  const { categories } = useCatalog();

  return (
    <section className="bg-[#1F1F1F] py-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <h2 className="mb-8 text-4xl font-black tracking-tight text-white md:text-5xl">
          CATEGORIES
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group relative overflow-hidden rounded-[16px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"}
                alt={c.label}
                className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-5 left-5 text-xl font-bold uppercase text-white">
                {c.label}
              </span>
              <span className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-black text-white">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
