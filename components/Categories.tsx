"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { BrandSignature } from "./Logo";
import { Reveal } from "./Reveal";

export function Categories() {
  const { categories } = useCatalog();

  return (
    <section className="border-y border-[var(--line)] bg-[var(--panel)] py-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal>
          <div className="mb-8 flex items-center gap-4">
            <BrandSignature size="sm" slogan={false} className="hidden sm:inline-flex" />
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-[var(--gold)]">Univers</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] text-[var(--fg)] sm:text-4xl md:text-5xl">
                CATÉGORIES
              </h2>
            </div>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 70}>
              <Link
                href={`/shop?category=${c.slug}`}
                className="gold-frame group relative block overflow-hidden rounded-[4px]"
              >
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.label}
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="h-64 w-full bg-[var(--panel)]" />
              )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-5 left-5 text-sm font-semibold tracking-[0.16em] uppercase text-[var(--cream)]">
                  {c.label}
                </span>
                <span className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-[var(--gold)] text-[var(--gold)] transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
