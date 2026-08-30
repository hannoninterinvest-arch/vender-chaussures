"use client";

import { useState } from "react";
import Link from "next/link";
import { Price, PromoBadge } from "@/components/Price";
import { colorImage, galleryForColor } from "@/lib/product-media";
import { videoPoster } from "@/lib/media";
import type { Product } from "@/lib/products";
import { ColorDots } from "./ColorDots";

export function ProductCard({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [hover, setHover] = useState(false);
  const gallery = galleryForColor(product, color);
  const photo = hover && gallery[1] ? gallery[1] : gallery[0] || colorImage(product, color);
  const has3d = Boolean(product.video);

  return (
    <article className="product-card group">
      <div
        className="gold-frame relative overflow-hidden rounded-[4px] bg-[var(--panel)]"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          <PromoBadge product={product} />
          {product.isNew && (
            <span className="rounded-sm bg-[#C9A45C] px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] uppercase text-[#14110C]">
              New
            </span>
          )}
          {has3d && <span className="badge-3d">Vue 3D</span>}
        </div>
        <Link href={`/products/${product.id}`} className="block aspect-square">
          {hover && product.video ? (
            <video
              src={product.video}
              poster={videoPoster(product.video, photo)}
              className="h-full w-full object-cover"
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
            />
          )}
        </Link>
      </div>
      <Link href={`/products/${product.id}`} className="mt-3 block">
        <p className="text-[11px] tracking-[0.16em] uppercase text-[var(--gold)]">{product.brand}</p>
        <h3 className="mt-1 text-[13px] font-semibold tracking-[0.14em] uppercase text-[var(--fg)]">
          {product.name}
        </h3>
      </Link>
      <Price product={product} className="mt-2" />
      {product.sizes.length > 0 && (
        <div className="mt-2.5">
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--muted)]">
            Tailles disponibles
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {product.sizes.map((s) => (
              <li
                key={s}
                className="min-w-7 rounded-sm border border-[#C5A059]/30 px-1.5 py-0.5 text-center text-[11px] text-[var(--fg)]"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-2.5">
        <ColorDots colors={product.colors} selected={color} onSelect={setColor} size="sm" />
      </div>
      <Link
        href={`/products/${product.id}`}
        className="gold-btn mt-3 flex w-full items-center justify-center rounded-sm px-3 py-3.5 text-xs uppercase"
      >
        Voir le produit
      </Link>
    </article>
  );
}
