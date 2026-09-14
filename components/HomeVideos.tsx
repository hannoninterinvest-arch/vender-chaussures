"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { videoPoster } from "@/lib/media";
import { ProductVideo } from "./ProductVideo";
import { Reveal } from "./Reveal";

export function HomeVideos() {
  const { products } = useCatalog();
  const clips = products.filter((p) => p.video && p.showVideoOnHome).slice(0, 4);
  if (!clips.length) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
      <Reveal>
        <p className="text-[11px] tracking-[0.28em] uppercase text-[#C9A45C]">Looks 3D</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.12em] uppercase text-[var(--fg)]">
          Vidéos produit
        </h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Tourne autour de la paire : chaque modèle peut avoir une vue 3D stockée sur Cloudinary.
        </p>
      </Reveal>
      <div className={`mt-8 grid gap-6 ${clips.length === 1 ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
        {clips.map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <article className="gold-frame overflow-hidden rounded-[4px] bg-[var(--panel)]">
              <ProductVideo
                src={p.video!}
                poster={videoPoster(p.video!, p.images[0])}
                className="aspect-video w-full"
                autoPlay={i === 0}
                controls
                label="Vue 3D"
              />
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-[#C5A059]">{p.brand}</p>
                  <h3 className="font-[family-name:var(--font-display)] text-lg tracking-[0.1em] uppercase">
                    {p.name}
                  </h3>
                </div>
                <Link href={`/products/${p.id}`} className="gold-btn rounded-sm px-4 py-2 text-[11px] uppercase">
                  Voir
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
