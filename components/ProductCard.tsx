"use client";

import { useState } from "react";
import Link from "next/link";
import { Price, PromoBadge } from "@/components/Price";
import { colorImage } from "@/lib/product-media";
import type { Product } from "@/lib/products";
import { ColorDots } from "./ColorDots";

export function ProductCard({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const photo = colorImage(product, color);

  return (
    <article className="product-card group">
      <div className="product-shot">
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          <PromoBadge product={product} />
          {product.isNew && <span className="product-badge">New</span>}
        </div>
        <Link href={`/products/${product.id}`} className="block aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt={product.name} />
        </Link>
        <Link href={`/products/${product.id}`} className="product-buy">
          Acheter maintenant
        </Link>
      </div>
      <h3 className="product-name">
        <Link href={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      <Price product={product} className="mt-1" />
      <div className="mt-2">
        <ColorDots colors={product.colors} selected={color} onSelect={setColor} size="sm" />
      </div>
    </article>
  );
}
