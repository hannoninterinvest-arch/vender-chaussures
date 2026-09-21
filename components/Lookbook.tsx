"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { defaultSite } from "@/lib/site";
import { formatTnd } from "@/lib/format";
import type { Product } from "@/lib/products";

function ProductTile({ product }: { product: Product }) {
  const photo = product.images[0];
  return (
    <Link href={`/products/${product.id}`} className="look-tile">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={product.name} />
      <span className="look-tile-meta">
        <span className="look-tile-name">{product.name}</span>
        <span className="look-tile-price">{formatTnd(product.price)}</span>
      </span>
    </Link>
  );
}

function LifeTile({
  src,
  href,
  label,
  wide,
}: {
  src: string;
  href: string;
  label: string;
  wide?: boolean;
}) {
  return (
    <Link href={href} className={`look-tile look-tile-life ${wide ? "look-tile-wide" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} />
      <span className="look-tile-label">{label}</span>
    </Link>
  );
}

export function Lookbook() {
  const { products } = useCatalog();
  const featured = (products.filter((p) => p.featured).length
    ? products.filter((p) => p.featured)
    : products
  ).slice(0, 4);
  const covers = defaultSite.coverImages;

  if (featured.length < 2) return null;

  const [a, b, c, d] = featured;

  return (
    <section aria-label="Sélection visuel">
      <div className="lookbook-row lookbook-row-a">
        {a ? <ProductTile product={a} /> : null}
        {b ? <ProductTile product={b} /> : null}
        <LifeTile src={covers[0]} href="/shop?drop=new" label="Nouveautés" wide />
      </div>
      <div className="lookbook-row lookbook-row-b">
        <LifeTile src={covers[1] || covers[0]} href="/shop?gender=homme" label="Homme" wide />
        {c ? <ProductTile product={c} /> : null}
        {d ? <ProductTile product={d} /> : <LifeTile src={covers[2]} href="/shop?gender=femme" label="Femme" />}
      </div>
    </section>
  );
}
