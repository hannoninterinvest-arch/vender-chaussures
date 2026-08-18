"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTnd } from "@/lib/format";
import { colorImage } from "@/lib/product-media";
import type { Product } from "@/lib/products";
import { ColorDots } from "./ColorDots";

export function ProductCard({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const photo = colorImage(product, color);

  return (
    <article className="product-card group">
      <div className="gold-frame relative overflow-hidden rounded-[4px] bg-[var(--panel)]">
        {product.isNew && (
          <span className="absolute left-3 top-3 z-10 rounded-sm bg-[#C9A45C] px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] uppercase text-[#14110C]">
            New
          </span>
        )}
        <Link href={`/products/${product.id}`} className="block aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
          />
        </Link>
      </div>
      <h3 className="mt-3 text-[13px] font-semibold tracking-[0.14em] uppercase text-[var(--fg)]">
        {product.name}
      </h3>
      <p className="mt-1 text-[11px] tracking-[0.16em] uppercase text-[var(--gold)]">{product.brand}</p>
      <div className="mt-2.5">
        <ColorDots colors={product.colors} selected={color} onSelect={setColor} size="sm" />
      </div>
      <Link
        href={`/products/${product.id}`}
        className="gold-btn mt-3 flex w-full items-center justify-center gap-2 rounded-sm px-3 py-3.5 text-xs uppercase"
      >
        Voir — <span>{formatTnd(product.price)}</span>
      </Link>
    </article>
  );
}
